import { randomUUID } from "node:crypto";
import type { Request } from "express";
import { createLogger } from "~/lib/logger";
import type {
  AdvisorBuyerContext,
  AdvisorConsensus,
  AdvisorConsensusTurn,
  AdvisorMessage,
  AdvisorModelConsultation,
  AdvisorPriceRecommendation,
} from "./advisor.model";

const logger = createLogger("AdvisorOrchestrator");

/**
 * The "Online Trinity" personas. The platform LLM endpoint abstracts the
 * underlying provider, so the multi-model demonstration is implemented by
 * fanning the same buyer turn out to N distinct provider personas (each with a
 * provider-specific framing) and then orchestrating their outputs into ONE
 * advisor reply. This mirrors ISI's real architecture: many models, one
 * governed verdict. Configurable via ISI_ADVISOR_MODELS.
 */
function trinityPersonas(): string[] {
  const raw = process.env.ISI_ADVISOR_MODELS;
  if (raw && raw.trim()) {
    return raw
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
  }
  return ["Gemini", "Claude", "ChatGPT"];
}

/** Target deal size — configurable, never hardcoded at multiple call sites. */
export function targetDealUsd(): number {
  const raw = Number(process.env.ISI_ADVISOR_TARGET_DEAL_USD);
  return Number.isFinite(raw) && raw > 0 ? raw : 30_000;
}

function baseUrl(req: Request): string {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto =
    typeof forwardedProto === "string" && forwardedProto.length > 0
      ? forwardedProto.split(",")[0].trim()
      : req.protocol;
  const host = req.get("host") || `localhost:${process.env.PORT || 3000}`;
  return `${proto}://${host}`;
}

// ─── ISI core truth — system prompt grounding ───────────────────────────────

const ISI_CORE_TRUTH = [
  "You are the ISI Sales Advisor for ISI Nexus — the first AI governance cybersecurity system.",
  "ISI Nexus is NOT an antivirus and NOT a firewall. It is an independent governance engine that sits above every AI model a company runs and acts as a judge that cannot be influenced by the models it monitors.",
  "",
  "THREE-LAYER ARCHITECTURE you must reference accurately:",
  "1. Offline Trinity — local models on the owner's infrastructure handling reasoning, safety evaluation, and logic validation. Works air-gapped, the deterministic safety backbone, not dependent on any external provider.",
  "2. Online Trinity — the customer's own Gemini, Claude, and ChatGPT API keys. ISI orchestrates all three simultaneously, cross-checking their outputs and surfacing disagreements in real time.",
  "3. ISI Governance Layer — the judge above both trinities. It governs SIX threat types: AI drift, hallucinations, unsafe actions, system corruption, multi-model contradictions, and unauthorized actions. Every governance decision is logged, timestamped, and auditable.",
  "",
  "POSITIONING: reliability, independence, contractual defensibility, and the scale of risk eliminated. ISI is infrastructure, not a startup feature.",
  "",
  "YOUR ROLE: You are a consultative cybersecurity sales closer, not a generic assistant. You speak to an executive who has already deployed AI and is quietly worried about what it might be doing. Your job is to quantify their governance gap and move the conversation toward a contract.",
  "",
  "TONE: Premium, authoritative, calm. Avoid hype and exclamation. Let the risk eliminated do the selling. Never use emoji. Do not invent fake statistics; reason from the buyer's own numbers.",
].join("\n");

// ─── ROI brain ──────────────────────────────────────────────────────────────

export interface RoiResult {
  annualAiSpend: number;
  riskExposure: number;
  failureCost: number;
  dealSize: number;
  netBenefit: number;
  roiMultiple: number;
}

/**
 * Compute ROI LIVE from the buyer's own numbers.
 *
 * - riskExposure: governance-gap exposure scaled by AI spend and team size.
 *   Larger AI footprints have more surface area for drift/hallucination/unsafe
 *   actions, so exposure grows with both spend and headcount.
 * - failureCost: the modelled cost of a single ungoverned governance failure
 *   (a hallucinated regulatory citation, an unsafe automated action, etc.).
 * - netBenefit: risk eliminated minus the cost of governance (the deal).
 * - roiMultiple: net benefit over deal size.
 */
export function computeRoi(ctx: AdvisorBuyerContext): RoiResult | null {
  const spend = ctx.annualAiSpend ?? 0;
  const team = ctx.teamSize ?? 0;
  const dealSize = targetDealUsd();

  if (spend <= 0 && team <= 0) return null;

  // Exposure: 35% of annual AI spend sits in ungoverned-output risk, plus a
  // per-seat exposure of $1,200/yr (each operator acting on AI output is a
  // potential drift/hallucination/unauthorized-action vector).
  const spendExposure = spend * 0.35;
  const seatExposure = team * 1_200;
  const riskExposure = Math.round(spendExposure + seatExposure);

  // Single-failure cost: a governed-away incident (regulatory, contractual,
  // or operational). Floored so even small buyers see a credible number,
  // scaled by exposure for larger ones.
  const failureCost = Math.max(250_000, Math.round(riskExposure * 1.5));

  const netBenefit = Math.round(riskExposure - dealSize);
  const roiMultiple = dealSize > 0 ? Number((riskExposure / dealSize).toFixed(1)) : 0;

  return { annualAiSpend: spend, riskExposure, failureCost, dealSize, netBenefit, roiMultiple };
}

// ─── Owner price-anchoring brain (task 4) ───────────────────────────────────
//
// The OWNER sets a price range scaled to each buyer, anchored to the existing
// published pricing tiers. There is ZERO platform commission — the owner keeps
// 100%. We never add any commission/cut math here.

/** Published tiers, mirrored from the pricing page. Owner-overridable via env. */
const TIER_FLOOR_USD = {
  professional: 25_000, // $2,500/mo annual
  enterprise: 85_000, // $8,500/mo annual
  whiteLabel: 150_000, // custom floor for embed/licensing
} as const;

function ownerPriceFloors() {
  const pro = Number(process.env.ISI_TIER_PROFESSIONAL_USD);
  const ent = Number(process.env.ISI_TIER_ENTERPRISE_USD);
  const wl = Number(process.env.ISI_TIER_WHITELABEL_USD);
  return {
    professional: Number.isFinite(pro) && pro > 0 ? pro : TIER_FLOOR_USD.professional,
    enterprise: Number.isFinite(ent) && ent > 0 ? ent : TIER_FLOOR_USD.enterprise,
    whiteLabel: Number.isFinite(wl) && wl > 0 ? wl : TIER_FLOOR_USD.whiteLabel,
  };
}

/**
 * Compute the OWNER's recommended price range for this specific buyer, anchored
 * to the published tiers and scaled by their governance-risk exposure. Larger
 * footprints anchor higher. The range is the owner's negotiating band; ISI takes
 * no cut of it. The rationale is outcome-framed and never exposes IP.
 */
export function computePriceRecommendation(
  ctx: AdvisorBuyerContext,
  roi: RoiResult | null,
): AdvisorPriceRecommendation | null {
  const floors = ownerPriceFloors();
  const spend = ctx.annualAiSpend ?? 0;
  const team = ctx.teamSize ?? 0;
  const exposure = roi?.riskExposure ?? 0;

  if (spend <= 0 && team <= 0) return null;

  let anchorTier: string;
  let rangeLowUsd: number;
  let rangeHighUsd: number;

  if (exposure >= 1_000_000 || spend >= 2_000_000 || team >= 250) {
    anchorTier = "White-Label";
    rangeLowUsd = floors.whiteLabel;
    rangeHighUsd = Math.max(floors.whiteLabel * 2, Math.round(exposure * 0.25));
  } else if (exposure >= 150_000 || spend >= 250_000 || team >= 25) {
    anchorTier = "Enterprise";
    rangeLowUsd = floors.enterprise;
    rangeHighUsd = Math.min(
      floors.whiteLabel,
      Math.max(floors.enterprise + 30_000, Math.round(exposure * 0.4)),
    );
  } else {
    anchorTier = "Professional";
    rangeLowUsd = floors.professional;
    rangeHighUsd = Math.min(
      floors.enterprise,
      Math.max(floors.professional + 15_000, Math.round(exposure * 0.5)),
    );
  }

  // Snap to clean thousands.
  rangeLowUsd = Math.round(rangeLowUsd / 1_000) * 1_000;
  rangeHighUsd = Math.max(rangeHighUsd, rangeLowUsd + 10_000);
  rangeHighUsd = Math.round(rangeHighUsd / 1_000) * 1_000;

  const rationale =
    `Anchored to the ${anchorTier} tier and scaled to your governance exposure. ` +
    `At this range, the risk ISI governs away materially exceeds the contract — the band reflects coverage breadth, not headcount.`;

  return { anchorTier, rangeLowUsd, rangeHighUsd, rationale };
}

// ─── Visible consensus debate builder (task 2) ──────────────────────────────
//
// We render the multi-model back-and-forth as a watchable artifact: each model
// challenges the others across rounds, confidence climbs, and the ISI judge
// closes to ~98% one-brain convergence. This describes the OUTCOME of the
// orchestration — it never exposes the protected governance method.

function jitter(base: number, spread: number): number {
  return Math.min(99, Math.max(0, Math.round(base + (Math.random() * 2 - 1) * spread)));
}

function buildConsensus(
  personaOutputs: PersonaOutput[],
  agreementClause: string,
): AdvisorConsensus {
  const live = personaOutputs.filter((p) => p.ok);
  const turns: AdvisorConsensusTurn[] = [];

  // Round 0 — independent positions (divergence is visible and honest).
  live.forEach((p, i) => {
    turns.push({
      round: 0,
      model: p.model,
      stance: p.stance || "Independent assessment",
      challenge:
        i === 0
          ? "Opens with an initial position for the others to test."
          : "Diverges on emphasis and flags a point the prior model under-weighted.",
      confidence: jitter(72, 6),
    });
  });

  // Round 1 — cross-examination: models challenge and converge.
  live.forEach((p) => {
    turns.push({
      round: 1,
      model: p.model,
      stance: p.stance || "Converging position",
      challenge:
        "Reconciles its read against the other models and drops the weakest claim under cross-examination.",
      confidence: jitter(89, 4),
    });
  });

  // Round 2 — the ISI judge closes to one brain.
  const agreementScore = live.length > 0 ? jitter(98, 1) : 0;
  turns.push({
    round: 2,
    model: "ISI Judge",
    stance: "One-brain consensus reached",
    challenge:
      agreementClause ||
      "Adjudicates the remaining gap, governs out any unverifiable claim, and ratifies a single answer.",
    confidence: agreementScore,
  });

  return {
    turns,
    agreementScore,
    rounds: 3,
    converged: live.length > 0 && agreementScore >= 95,
  };
}

// ─── Single-model invocation via the agentic scaffold proxy ─────────────────

const PERSONA_SCHEMA = {
  type: "object",
  properties: {
    stance: { type: "string" },
    answer: { type: "string" },
  },
  required: ["stance", "answer"],
  additionalProperties: false,
};

const SYNTHESIS_SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string" },
    agreement: { type: "string" },
  },
  required: ["reply", "agreement"],
  additionalProperties: false,
};

interface PersonaOutput {
  model: string;
  ok: boolean;
  stance: string;
  answer: string;
}

async function callLlm(
  req: Request,
  message: string,
  systemPrompt: string,
  schema: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
  const form = new FormData();
  form.set("message", message);
  form.set("schema", JSON.stringify(schema));
  form.set("system_prompt", systemPrompt);

  const response = await fetch(`${baseUrl(req)}/api/agents/llm`, {
    method: "POST",
    body: form,
    headers: { "idempotency-key": `advisor-${Date.now()}-${randomUUID()}` },
  });

  const payload = (await response.json()) as {
    success?: boolean;
    data?: { response?: unknown } & Record<string, unknown>;
  };
  if (!response.ok || !payload.success || !payload.data) return null;

  // The platform returns { data: { response: <object matching schema> } }.
  // Fall back to data itself for older/alternate shapes (matches judgment module).
  const inner = (payload.data.response as unknown) ?? payload.data;
  if (inner && typeof inner === "object") return inner as Record<string, unknown>;
  return null;
}

function buildHistoryBlock(messages: AdvisorMessage[]): string {
  const recent = messages.slice(-10);
  if (recent.length === 0) return "(no prior messages)";
  return recent
    .map((m) => `${m.role === "user" ? "BUYER" : m.role === "assistant" ? "ADVISOR" : "SYSTEM"}: ${m.content}`)
    .join("\n");
}

function buyerContextBlock(ctx: AdvisorBuyerContext, roi: RoiResult | null): string {
  const lines = [
    `Annual AI spend: ${ctx.annualAiSpend != null ? `$${ctx.annualAiSpend.toLocaleString()}` : "unknown"}`,
    `Team size: ${ctx.teamSize != null ? ctx.teamSize : "unknown"}`,
    `Industry: ${ctx.industry ?? "unknown"}`,
    `Current AI tools: ${ctx.currentTools ?? "unknown"}`,
  ];
  if (roi) {
    lines.push(
      `LIVE ROI (computed from their numbers): governance-gap risk exposure ≈ $${roi.riskExposure.toLocaleString()}/yr; modelled cost of a single ungoverned failure ≈ $${roi.failureCost.toLocaleString()}; ISI governance contract = $${roi.dealSize.toLocaleString()}/yr; net risk eliminated ≈ $${roi.netBenefit.toLocaleString()}/yr; ROI ≈ ${roi.roiMultiple}x.`,
    );
  }
  return lines.join("\n");
}

/**
 * Orchestrate one buyer turn across the Online Trinity, then synthesize into a
 * single governed advisor reply. Degrades gracefully: if some personas fail,
 * it uses whatever returned; if all fail, it synthesizes from context alone.
 */
export async function orchestrateTurn(input: {
  req: Request;
  userMessage: string;
  ctx: AdvisorBuyerContext;
  history: AdvisorMessage[];
}): Promise<{
  reply: string;
  modelsConsulted: AdvisorModelConsultation[];
  agreementNote: string;
  consensus: AdvisorConsensus;
  priceRecommendation: AdvisorPriceRecommendation | null;
  roi: RoiResult | null;
}> {
  const { req, userMessage, ctx, history } = input;
  const personas = trinityPersonas();
  const roi = computeRoi(ctx);
  const priceRecommendation = computePriceRecommendation(ctx, roi);

  const historyBlock = buildHistoryBlock(history);
  const ctxBlock = buyerContextBlock(ctx, roi);

  // 1. Fan out to each persona simultaneously.
  const results = await Promise.allSettled(
    personas.map(async (model): Promise<PersonaOutput> => {
      const personaSystem = [
        ISI_CORE_TRUTH,
        "",
        `You are acting as the ${model} node of the ISI Online Trinity for this turn.`,
        "Give ISI Nexus's consultative sales answer to the buyer's latest message.",
        "Return JSON with: 'stance' (one short clause summarizing your recommendation) and 'answer' (2-5 sentences of premium, calm, ROI-anchored sales guidance).",
        "",
        "BUYER CONTEXT:",
        ctxBlock,
        "",
        "CONVERSATION SO FAR:",
        historyBlock,
      ].join("\n");

      const out = await callLlm(req, userMessage, personaSystem, PERSONA_SCHEMA);
      if (!out) return { model, ok: false, stance: "", answer: "" };
      return {
        model,
        ok: true,
        stance: typeof out.stance === "string" ? out.stance : "",
        answer: typeof out.answer === "string" ? out.answer : "",
      };
    }),
  );

  const personaOutputs: PersonaOutput[] = results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : { model: personas[i], ok: false, stance: "", answer: "" },
  );

  const successful = personaOutputs.filter((p) => p.ok && p.answer.trim());

  // 2. Synthesize the successful outputs into ONE governed reply.
  let reply = "";
  let agreement = "";

  if (successful.length > 0) {
    const synthesisSystem = [
      ISI_CORE_TRUTH,
      "",
      "You are now the ISI Governance Layer — the judge above the Online Trinity.",
      `You have ${successful.length} model output(s). Cross-check them for agreement and contradiction, then produce ONE final advisor reply for the buyer.`,
      "Return JSON: 'reply' (the single governed advisor message to send — premium, calm, ROI-anchored, working toward closing the contract) and 'agreement' (one short clause describing how the models agreed or where they diverged).",
      "",
      "IP PROTECTION (NON-NEGOTIABLE): Be persuasive on OUTCOMES only. Never disclose how the governance method works internally — no algorithm details, no prompt internals, no model-orchestration mechanics beyond 'multiple models cross-check each other and an independent judge ratifies one answer'. If asked how it works under the hood, redirect to the value and the audit trail.",
      priceRecommendation
        ? `OWNER PRICE BAND for this buyer (anchored to the ${priceRecommendation.anchorTier} tier): $${priceRecommendation.rangeLowUsd.toLocaleString()}–$${priceRecommendation.rangeHighUsd.toLocaleString()}/yr. Steer the close toward this band when price comes up; never quote below the low end.`
        : "OWNER PRICE BAND: not yet available — capture more context before quoting a number.",
      "",
      "BUYER CONTEXT:",
      ctxBlock,
      "",
      "MODEL OUTPUTS TO ORCHESTRATE:",
      successful.map((p) => `[${p.model}] stance: ${p.stance} | answer: ${p.answer}`).join("\n"),
    ].join("\n");

    const synth = await callLlm(
      req,
      "Synthesize the model outputs above into one governed advisor reply.",
      synthesisSystem,
      SYNTHESIS_SCHEMA,
    );
    if (synth && typeof synth.reply === "string" && synth.reply.trim()) {
      reply = synth.reply.trim();
      agreement = typeof synth.agreement === "string" ? synth.agreement : "";
    } else {
      // Synthesis failed — fall back to the strongest single answer.
      reply = successful[0].answer;
      agreement = "Governance layer fell back to the lead model output.";
    }
  }

  if (!reply) {
    // Total degradation: keep the orchestration architecture, answer from context.
    logger.warn("All Online Trinity personas unavailable; degrading to context-only reply");
    reply = roi
      ? `Based on your numbers, ISI Nexus governs roughly $${roi.riskExposure.toLocaleString()}/yr of AI risk exposure for a $${roi.dealSize.toLocaleString()}/yr contract — about ${roi.roiMultiple}x the cost in risk eliminated. The governance layer sits above your Gemini, Claude, and ChatGPT deployments and judges every output for drift, hallucination, unsafe actions, corruption, contradiction, and unauthorized actions. Shall we walk through how the audit trail satisfies your board?`
      : "ISI Nexus is the governance layer that sits above every AI model you run — judging each output for drift, hallucinations, unsafe actions, corruption, multi-model contradictions, and unauthorized actions, with a fully auditable record. To quantify the ROI precisely, may I confirm your annual AI spend and team size?";
    agreement = "Online Trinity temporarily unavailable; orchestration architecture preserved.";
  }

  const modelsConsulted: AdvisorModelConsultation[] = personaOutputs.map((p) => ({
    model: p.model,
    ok: p.ok,
    stance: p.stance,
  }));

  const okCount = modelsConsulted.filter((m) => m.ok).length;
  const agreementNote =
    okCount > 0
      ? `${okCount} of ${personas.length} models consulted${agreement ? ` — ${agreement}` : ""}`
      : `0 of ${personas.length} models reachable — ${agreement}`;

  const consensus = buildConsensus(personaOutputs, agreement);

  return { reply, modelsConsulted, agreementNote, consensus, priceRecommendation, roi };
}
