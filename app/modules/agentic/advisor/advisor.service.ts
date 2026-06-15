import { AdvisorConversationModel, type AdvisorConversation } from "./advisor.model";

export interface BuyerContextInput {
  annualAiSpend?: number | null;
  teamSize?: number | null;
  industry?: string | null;
  currentTools?: string | null;
}

function toNumberOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toStringOrNull(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

export async function getOrCreateActiveConversation(
  userId: string,
  userEmail: string,
): Promise<AdvisorConversation> {
  const existing = await AdvisorConversationModel.findOne({ userId }).sort({ updatedAt: -1 });
  if (existing) return existing;
  return AdvisorConversationModel.create({ userId, userEmail, messages: [] });
}

export async function getConversationForUser(
  conversationId: string,
  userId: string,
): Promise<AdvisorConversation | null> {
  return AdvisorConversationModel.findOne({ _id: conversationId, userId });
}

export async function updateBuyerContext(
  conversation: AdvisorConversation,
  input: BuyerContextInput,
): Promise<AdvisorConversation> {
  conversation.buyerContext = {
    annualAiSpend: toNumberOrNull(input.annualAiSpend),
    teamSize: toNumberOrNull(input.teamSize),
    industry: toStringOrNull(input.industry),
    currentTools: toStringOrNull(input.currentTools),
    captured: true,
  };
  await conversation.save();
  return conversation;
}

export async function startNewConversation(
  userId: string,
  userEmail: string,
): Promise<AdvisorConversation> {
  return AdvisorConversationModel.create({ userId, userEmail, messages: [] });
}

export async function listConversationsForUser(userId: string) {
  return AdvisorConversationModel.find({ userId })
    .sort({ updatedAt: -1 })
    .select("title buyerContext updatedAt createdAt messages")
    .lean();
}

// ── Admin/owner views ───────────────────────────────────────────────────────

export async function adminListConversations(options: { limit?: number; skip?: number } = {}) {
  const limit = Math.min(options.limit ?? 50, 200);
  const skip = Math.max(options.skip ?? 0, 0);
  const [items, total] = await Promise.all([
    AdvisorConversationModel.find()
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AdvisorConversationModel.countDocuments(),
  ]);
  return { items, total, limit, skip };
}

export async function adminGetConversation(conversationId: string) {
  return AdvisorConversationModel.findById(conversationId).lean();
}
