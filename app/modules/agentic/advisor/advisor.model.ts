import mongoose, { type Document, type Model, Schema } from "mongoose";

/**
 * The ISI Sales Advisor — persisted conversation per authenticated buyer.
 *
 * One document = one advisor conversation belonging to one user. Each message
 * (when assistant) carries the multi-model orchestration metadata that powers
 * the "3 models consulted" indicator and the live agreement note.
 */

export type AdvisorMessageRole = "user" | "assistant" | "system";

export interface AdvisorModelConsultation {
  /** Persona name surfaced to the user, e.g. "Gemini" | "Claude" | "ChatGPT". */
  model: string;
  /** Whether this model returned a usable answer this turn. */
  ok: boolean;
  /** One-line stance from this model (used to compute agreement). */
  stance: string;
}

/**
 * One visible turn inside the consensus debate. The models challenge each other
 * across rounds until convergence; each entry is a trust-building artifact the
 * buyer can watch — never hidden. We surface stance/challenge text but NEVER the
 * governance internals (the protected method/IP).
 */
export interface AdvisorConsensusTurn {
  /** Round index (0-based) of the cross-examination. */
  round: number;
  /** The participating node, e.g. "Gemini" | "Claude" | "ChatGPT" | "ISI Judge". */
  model: string;
  /** Short stance / position this node holds this round. */
  stance: string;
  /** What this node challenged or conceded vs. the others (the back-and-forth). */
  challenge: string;
  /** This node's confidence this round (0-100). */
  confidence: number;
}

/**
 * The full consensus artifact for one buyer turn: the visible debate plus the
 * converged agreement score and the unified governed verdict.
 */
export interface AdvisorConsensus {
  turns: AdvisorConsensusTurn[];
  /** Final cross-model agreement, e.g. 98 (%). */
  agreementScore: number;
  /** Number of debate rounds it took to converge. */
  rounds: number;
  /** Whether ~98% one-brain convergence was reached. */
  converged: boolean;
}

/** Owner-set, per-buyer price recommendation anchored to existing tiers. */
export interface AdvisorPriceRecommendation {
  /** Tier name this buyer is anchored to (Professional/Enterprise/White-Label). */
  anchorTier: string;
  /** Low end of the owner's recommended annual range (USD). */
  rangeLowUsd: number;
  /** High end of the owner's recommended annual range (USD). */
  rangeHighUsd: number;
  /** One-line rationale (outcome-framed, never exposing IP). */
  rationale: string;
}

export interface AdvisorMessage {
  role: AdvisorMessageRole;
  content: string;
  /** Only present on assistant messages produced via orchestration. */
  modelsConsulted?: AdvisorModelConsultation[];
  /** Human-readable agreement note, e.g. "3 of 3 models agreed". */
  agreementNote?: string;
  /** The visible consensus debate that produced this answer. */
  consensus?: AdvisorConsensus;
  /** Owner-set per-buyer price recommendation surfaced this turn, if any. */
  priceRecommendation?: AdvisorPriceRecommendation | null;
  /** Live ROI computed for this turn, if any. */
  roi?: {
    annualAiSpend: number;
    riskExposure: number;
    failureCost: number;
    dealSize: number;
    netBenefit: number;
    roiMultiple: number;
  } | null;
  createdAt: Date;
}

/** Buyer business context collected at conversation start (personalization defaults). */
export interface AdvisorBuyerContext {
  annualAiSpend: number | null;
  teamSize: number | null;
  industry: string | null;
  currentTools: string | null;
  captured: boolean;
}

export interface AdvisorConversation extends Document {
  userId: string;
  userEmail: string;
  title: string;
  buyerContext: AdvisorBuyerContext;
  messages: AdvisorMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ConsultationSchema = new Schema<AdvisorModelConsultation>(
  {
    model: { type: String, required: true },
    ok: { type: Boolean, required: true },
    stance: { type: String, default: "" },
  },
  { _id: false },
);

const ConsensusTurnSchema = new Schema<AdvisorConsensusTurn>(
  {
    round: { type: Number, required: true },
    model: { type: String, required: true },
    stance: { type: String, default: "" },
    challenge: { type: String, default: "" },
    confidence: { type: Number, default: 0 },
  },
  { _id: false },
);

const ConsensusSchema = new Schema<AdvisorConsensus>(
  {
    turns: { type: [ConsensusTurnSchema], default: [] },
    agreementScore: { type: Number, default: 0 },
    rounds: { type: Number, default: 0 },
    converged: { type: Boolean, default: false },
  },
  { _id: false },
);

const PriceRecommendationSchema = new Schema<AdvisorPriceRecommendation>(
  {
    anchorTier: { type: String, default: "" },
    rangeLowUsd: { type: Number, default: 0 },
    rangeHighUsd: { type: Number, default: 0 },
    rationale: { type: String, default: "" },
  },
  { _id: false },
);

const MessageSchema = new Schema<AdvisorMessage>(
  {
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    modelsConsulted: { type: [ConsultationSchema], default: undefined },
    agreementNote: { type: String, default: undefined },
    consensus: { type: ConsensusSchema, default: undefined },
    priceRecommendation: { type: PriceRecommendationSchema, default: undefined },
    roi: { type: Schema.Types.Mixed, default: null },
    createdAt: { type: Date, default: () => new Date() },
  },
  { _id: false },
);

const BuyerContextSchema = new Schema<AdvisorBuyerContext>(
  {
    annualAiSpend: { type: Number, default: null },
    teamSize: { type: Number, default: null },
    industry: { type: String, default: null },
    currentTools: { type: String, default: null },
    captured: { type: Boolean, default: false },
  },
  { _id: false },
);

const AdvisorConversationSchema = new Schema<AdvisorConversation>(
  {
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, default: "" },
    title: { type: String, default: "New advisory session" },
    buyerContext: { type: BuyerContextSchema, default: () => ({}) },
    messages: { type: [MessageSchema], default: [] },
  },
  { timestamps: true },
);

export const AdvisorConversationModel: Model<AdvisorConversation> =
  (mongoose.models.AdvisorConversation as Model<AdvisorConversation>) ||
  mongoose.model<AdvisorConversation>("AdvisorConversation", AdvisorConversationSchema);
