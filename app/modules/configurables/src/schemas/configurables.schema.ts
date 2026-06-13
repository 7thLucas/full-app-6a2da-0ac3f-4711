/* START: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */
export interface FieldSchemaType {
  fieldName?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "color"
    | "url"
    | "enum"
    | "datetime"
    | "file"
    | "files";
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  fields?: FieldSchemaType[];
  item?: FieldSchemaType;
}
/* END: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */

export type ConfigurableSchemas = {
  formSchema: FieldSchemaType[];
};



export const configurableSchemas: ConfigurableSchemas = {
  formSchema: [
    {
      fieldName: "appName",
      type: "string",
      required: true,
      label: "App Name",
    },
    {
      fieldName: "tagline",
      type: "string",
      required: false,
      label: "Tagline",
    },
    {
      fieldName: "logoUrl",
      type: "url",
      required: true,
      label: "Logo URL",
    },
    {
      fieldName: "brandColor",
      type: "object",
      required: true,
      label: "Brand Color",
      fields: [
        {
          fieldName: "primary",
          type: "color",
          required: true,
          label: "Primary",
        },
        {
          fieldName: "secondary",
          type: "color",
          required: true,
          label: "Secondary",
        },
        {
          fieldName: "accent",
          type: "color",
          required: true,
          label: "Accent",
        },
      ],
    },
    {
      fieldName: "heroHeadline",
      type: "string",
      required: false,
      label: "Hero Headline",
    },
    {
      fieldName: "heroSubheadline",
      type: "string",
      required: false,
      label: "Hero Subheadline",
    },
    {
      fieldName: "heroCTALabel",
      type: "string",
      required: false,
      label: "Hero CTA Button Label",
    },
    {
      fieldName: "heroSecondaryCTALabel",
      type: "string",
      required: false,
      label: "Hero Secondary CTA Label",
    },
    {
      fieldName: "contactEmail",
      type: "string",
      required: false,
      label: "Contact Email",
    },
    {
      fieldName: "showPricingPage",
      type: "boolean",
      required: false,
      label: "Show Pricing Page",
    },
    {
      fieldName: "showDashboard",
      type: "boolean",
      required: false,
      label: "Show Governance Dashboard",
    },
    {
      fieldName: "pricingTiers",
      type: "array",
      label: "Pricing Tiers",
      item: {
        type: "object",
        fields: [
          { fieldName: "name", type: "string", required: true, label: "Tier Name" },
          { fieldName: "price", type: "string", required: true, label: "Monthly Price" },
          { fieldName: "annualPrice", type: "string", required: false, label: "Annual Price" },
          { fieldName: "description", type: "string", required: false, label: "Description" },
          { fieldName: "highlighted", type: "boolean", required: false, label: "Highlighted (Recommended)" },
        ],
      },
    },
    {
      fieldName: "footerText",
      type: "string",
      required: false,
      label: "Footer Text",
    },
    {
      fieldName: "socialLinks",
      type: "object",
      required: false,
      label: "Social Links",
      fields: [
        { fieldName: "linkedin", type: "url", required: false, label: "LinkedIn" },
        { fieldName: "twitter", type: "url", required: false, label: "Twitter / X" },
      ],
    },
    {
      fieldName: "adminEmail",
      type: "string",
      required: false,
      label: "Admin Email (for demo requests)",
    },
  ],
};
