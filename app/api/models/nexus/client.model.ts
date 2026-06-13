import { prop, getModelForClass } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

export class NexusClient extends CommonTypegooseEntity {
  @prop({ required: true })
  companyName!: string;

  @prop({ required: true })
  contactName!: string;

  @prop({ required: true })
  contactEmail!: string;

  @prop({ required: false })
  contactPhone?: string;

  @prop({ enum: ["professional", "enterprise", "white-label"], default: "professional" })
  licenseTier!: string;

  @prop({ enum: ["active", "trial", "suspended", "inactive"], default: "trial" })
  status!: string;

  @prop({ default: false })
  geminiConnected!: boolean;

  @prop({ default: false })
  claudeConnected!: boolean;

  @prop({ default: false })
  openaiConnected!: boolean;

  @prop({ default: 0 })
  governanceCalls!: number;

  @prop({ default: 0 })
  threatsBlocked!: number;

  @prop({ required: false })
  activationKey?: string;

  @prop({ required: false })
  notes?: string;

  @prop({ default: Date.now })
  trialEndsAt?: Date;
}

export const NexusClientModel = getModelForClass(NexusClient, {
  schemaOptions: { collection: "tbl_nexus_clients", timestamps: true },
});
