import { apiGet, apiRequest } from "~/lib/api.client";

export interface AdvisorModelConsultationView {
  model: string;
  ok: boolean;
  stance: string;
}

export interface AdvisorRoiView {
  annualAiSpend: number;
  riskExposure: number;
  failureCost: number;
  dealSize: number;
  netBenefit: number;
  roiMultiple: number;
}

export interface AdvisorConsensusTurnView {
  round: number;
  model: string;
  stance: string;
  challenge: string;
  confidence: number;
}

export interface AdvisorConsensusView {
  turns: AdvisorConsensusTurnView[];
  agreementScore: number;
  rounds: number;
  converged: boolean;
}

export interface AdvisorPriceRecommendationView {
  anchorTier: string;
  rangeLowUsd: number;
  rangeHighUsd: number;
  rationale: string;
}

export interface AdvisorMessageView {
  role: "user" | "assistant" | "system";
  content: string;
  modelsConsulted?: AdvisorModelConsultationView[];
  agreementNote?: string;
  consensus?: AdvisorConsensusView;
  priceRecommendation?: AdvisorPriceRecommendationView | null;
  roi?: AdvisorRoiView | null;
  createdAt: string;
}

export interface AdvisorBuyerContextView {
  annualAiSpend: number | null;
  teamSize: number | null;
  industry: string | null;
  currentTools: string | null;
  captured: boolean;
}

export interface AdvisorConversationView {
  _id: string;
  userId: string;
  userEmail: string;
  title: string;
  buyerContext: AdvisorBuyerContextView;
  messages: AdvisorMessageView[];
  createdAt: string;
  updatedAt: string;
}

export interface BuyerContextInput {
  annualAiSpend: string;
  teamSize: string;
  industry: string;
  currentTools: string;
}

const SUBSCRIPTION_CODE = "SUBSCRIPTION_REQUIRED";

export class SubscriptionRequiredError extends Error {
  constructor() {
    super("An active ISI Nexus subscription is required.");
    this.name = "SubscriptionRequiredError";
  }
}

function guardSubscription(res: { success: boolean; code?: string }) {
  if (!res.success && (res as any).code === SUBSCRIPTION_CODE) {
    throw new SubscriptionRequiredError();
  }
}

export async function fetchSession(): Promise<{
  conversation: AdvisorConversationView;
  targetDealUsd: number;
}> {
  const res = await apiGet<{ conversation: AdvisorConversationView; targetDealUsd: number }>(
    "/api/advisor/session",
  );
  guardSubscription(res as any);
  if (!res.success || !res.data) throw new Error(res.message ?? "Failed to load advisor session");
  return res.data;
}

export async function saveContext(
  conversationId: string,
  input: BuyerContextInput,
): Promise<{
  conversation: AdvisorConversationView;
  roi: AdvisorRoiView | null;
  priceRecommendation?: AdvisorPriceRecommendationView | null;
}> {
  const res = await apiRequest<{
    conversation: AdvisorConversationView;
    roi: AdvisorRoiView | null;
    priceRecommendation?: AdvisorPriceRecommendationView | null;
  }>(
    "/api/advisor/context",
    {
      method: "POST",
      data: {
        conversationId,
        annualAiSpend: input.annualAiSpend,
        teamSize: input.teamSize,
        industry: input.industry,
        currentTools: input.currentTools,
      },
    },
  );
  guardSubscription(res as any);
  if (!res.success || !res.data) throw new Error(res.message ?? "Failed to save context");
  return res.data;
}

export async function sendMessage(
  conversationId: string,
  message: string,
): Promise<{ conversation: AdvisorConversationView; assistant: AdvisorMessageView }> {
  const res = await apiRequest<{
    conversation: AdvisorConversationView;
    assistant: AdvisorMessageView;
  }>("/api/advisor/message", {
    method: "POST",
    data: { conversationId, message },
  });
  guardSubscription(res as any);
  if (!res.success || !res.data) throw new Error(res.message ?? "The advisor could not respond");
  return res.data;
}

export async function startNew(): Promise<AdvisorConversationView> {
  const res = await apiRequest<{ conversation: AdvisorConversationView }>("/api/advisor/new", {
    method: "POST",
    data: {},
  });
  guardSubscription(res as any);
  if (!res.success || !res.data) throw new Error(res.message ?? "Failed to start a new session");
  return res.data.conversation;
}

// ── Admin/owner ─────────────────────────────────────────────────────────────

export async function adminFetchConversations(): Promise<{
  items: AdvisorConversationView[];
  total: number;
}> {
  const res = await apiGet<{ items: AdvisorConversationView[]; total: number }>(
    "/api/advisor/admin/conversations",
  );
  if (!res.success || !res.data) throw new Error(res.message ?? "Failed to load conversations");
  return res.data;
}

export async function adminFetchConversation(id: string): Promise<AdvisorConversationView> {
  const res = await apiGet<{ conversation: AdvisorConversationView }>(
    `/api/advisor/admin/conversations/${id}`,
  );
  if (!res.success || !res.data) throw new Error(res.message ?? "Failed to load conversation");
  return res.data.conversation;
}
