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

export interface AdvisorMessage {
  role: AdvisorMessageRole;
  content: string;
  /** Only present on assistant messages produced via orchestration. */
  modelsConsulted?: AdvisorModelConsultation[];
  /** Human-readable agreement note, e.g. "3 of 3 models agreed". */
  agreementNote?: string;
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

const MessageSchema = new Schema<AdvisorMessage>(
  {
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    modelsConsulted: { type: [ConsultationSchema], default: undefined },
    agreementNote: { type: String, default: undefined },
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
