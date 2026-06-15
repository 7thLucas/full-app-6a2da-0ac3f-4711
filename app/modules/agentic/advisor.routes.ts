/**
 * ISI Sales Advisor routes (auto-discovered by app/api/routes.ts).
 *
 * Surface (all mounted under /api):
 *   GET  /api/advisor/session              — get-or-create the buyer's active conversation
 *   POST /api/advisor/context              — capture buyer business context (spend/team/industry/tools)
 *   POST /api/advisor/message              — send a buyer turn; orchestrates the Online Trinity + ROI
 *   POST /api/advisor/new                  — start a fresh advisory session
 *   GET  /api/advisor/conversations        — list the buyer's own conversations
 *
 *   GET  /api/advisor/admin/conversations      — (admin) list all advisor conversations
 *   GET  /api/advisor/admin/conversations/:id  — (admin) open one conversation
 *
 * Auth: requireAuth + subscription gating for buyer routes; requireAdmin for admin routes.
 */

import { Router, type Request, type Response, type NextFunction } from "express";
import { createLogger } from "~/lib/logger";
import { requireAuth, requireAdmin } from "~/modules/authentication/authentication.middleware";
import { UserRole } from "~/modules/authentication/authentication.types";
import { AdvisorConversationModel } from "./advisor/advisor.model";
import { orchestrateTurn, targetDealUsd, computeRoi } from "./advisor/advisor.orchestrator";
import {
  adminGetConversation,
  adminListConversations,
  getConversationForUser,
  getOrCreateActiveConversation,
  listConversationsForUser,
  startNewConversation,
  updateBuyerContext,
} from "./advisor/advisor.service";

const logger = createLogger("AdvisorRoutes");
const router = Router();

/**
 * Subscription gating. ISI has no real billing table yet, so subscription
 * status lives in the extensible user.profile bag (profile.subscription.active).
 * Admins are always allowed. This mirrors the auth module's documented
 * profile-bag pattern and keeps gating in one place.
 */
function requireSubscription(req: Request, res: Response, next: NextFunction): void {
  const user = req.user;
  if (!user) {
    res.status(401).json({ success: false, message: "Authentication required" });
    return;
  }
  if (user.role === UserRole.Admin) {
    next();
    return;
  }
  const sub = (user.profile as Record<string, any>)?.subscription;
  const active = sub?.active === true || sub?.status === "active";
  if (!active) {
    res.status(403).json({
      success: false,
      message: "An active ISI Nexus subscription is required to use the Sales Advisor.",
      code: "SUBSCRIPTION_REQUIRED",
    });
    return;
  }
  next();
}

const buyerGate = [requireAuth, requireSubscription];

// ── Buyer: active session ───────────────────────────────────────────────────

router.get("/advisor/session", ...buyerGate, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const convo = await getOrCreateActiveConversation(user.id, user.email);
    return res.json({
      success: true,
      data: { conversation: convo.toObject(), targetDealUsd: targetDealUsd() },
    });
  } catch (err) {
    logger.error("GET /advisor/session failed", err as Error);
    return res.status(500).json({ success: false, message: "Failed to load advisor session" });
  }
});

// ── Buyer: capture business context ─────────────────────────────────────────

router.post("/advisor/context", ...buyerGate, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const conversationId = String(req.body?.conversationId ?? "");
    const convo = conversationId
      ? await getConversationForUser(conversationId, user.id)
      : await getOrCreateActiveConversation(user.id, user.email);
    if (!convo) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }
    const updated = await updateBuyerContext(convo, {
      annualAiSpend: req.body?.annualAiSpend,
      teamSize: req.body?.teamSize,
      industry: req.body?.industry,
      currentTools: req.body?.currentTools,
    });
    return res.json({
      success: true,
      data: {
        conversation: updated.toObject(),
        roi: computeRoi(updated.buyerContext),
      },
    });
  } catch (err) {
    logger.error("POST /advisor/context failed", err as Error);
    return res.status(500).json({ success: false, message: "Failed to save context" });
  }
});

// ── Buyer: send a message (multi-model orchestration) ───────────────────────

router.post("/advisor/message", ...buyerGate, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const content = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    if (!content) {
      return res.status(400).json({ success: false, message: "message is required" });
    }
    if (content.length > 8_000) {
      return res.status(413).json({ success: false, message: "message is too long" });
    }

    const conversationId = String(req.body?.conversationId ?? "");
    const convo = conversationId
      ? await getConversationForUser(conversationId, user.id)
      : await getOrCreateActiveConversation(user.id, user.email);
    if (!convo) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    const history = [...convo.messages];

    // Persist the buyer turn.
    convo.messages.push({ role: "user", content, createdAt: new Date() });
    if (convo.title === "New advisory session" || !convo.title) {
      convo.title = content.slice(0, 60);
    }
    await convo.save();

    // Orchestrate the Online Trinity → one governed advisor reply.
    const result = await orchestrateTurn({
      req,
      userMessage: content,
      ctx: convo.buyerContext,
      history,
    });

    const assistantMessage = {
      role: "assistant" as const,
      content: result.reply,
      modelsConsulted: result.modelsConsulted,
      agreementNote: result.agreementNote,
      roi: result.roi,
      createdAt: new Date(),
    };
    convo.messages.push(assistantMessage);
    await convo.save();

    return res.json({
      success: true,
      data: { conversation: convo.toObject(), assistant: assistantMessage },
    });
  } catch (err) {
    logger.error("POST /advisor/message failed", err as Error);
    return res.status(500).json({ success: false, message: "The advisor could not respond" });
  }
});

// ── Buyer: new session + list own ───────────────────────────────────────────

router.post("/advisor/new", ...buyerGate, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const convo = await startNewConversation(user.id, user.email);
    return res.json({ success: true, data: { conversation: convo.toObject() } });
  } catch (err) {
    logger.error("POST /advisor/new failed", err as Error);
    return res.status(500).json({ success: false, message: "Failed to start a new session" });
  }
});

router.get("/advisor/conversations", ...buyerGate, async (req: Request, res: Response) => {
  try {
    const items = await listConversationsForUser(req.user!.id);
    return res.json({ success: true, data: { items } });
  } catch (err) {
    logger.error("GET /advisor/conversations failed", err as Error);
    return res.status(500).json({ success: false, message: "Failed to list conversations" });
  }
});

// ── Admin/owner: view advisor conversations ─────────────────────────────────

router.get("/advisor/admin/conversations", requireAdmin, async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const skip = Number(req.query.skip) || 0;
    const data = await adminListConversations({ limit, skip });
    return res.json({ success: true, data });
  } catch (err) {
    logger.error("GET /advisor/admin/conversations failed", err as Error);
    return res.status(500).json({ success: false, message: "Failed to list conversations" });
  }
});

router.get("/advisor/admin/conversations/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const convo = await adminGetConversation(req.params.id);
    if (!convo) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }
    return res.json({ success: true, data: { conversation: convo } });
  } catch (err) {
    logger.error("GET /advisor/admin/conversations/:id failed", err as Error);
    return res.status(500).json({ success: false, message: "Failed to load conversation" });
  }
});

// Keep a direct model import reference so tree-shakers retain the schema
// registration even if no buyer route is hit before admin queries.
void AdvisorConversationModel;

export default router;
