import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

// Default model per Anthropic guidance; override with ANTHROPIC_MODEL if you
// want a cheaper model for a budget-constrained deploy (e.g. Haiku).
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5";

function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic();
}

export type LlmResult<T> = { ok: true; data: T } | { ok: false; error: string };

// ── Pre-visit summary ────────────────────────────────────────────────────
// Prompt text is exactly the spec's "LLM Usage Guidance" wording so the
// submission's documented prompt matches what actually runs.

const PreVisitSummarySchema = z.object({
  urgency: z.enum(["Low", "Medium", "High"]),
  chiefComplaint: z.string(),
  suggestedQuestions: z.array(z.string()).length(3),
});
export type PreVisitSummary = z.infer<typeof PreVisitSummarySchema>;

export async function generatePreVisitSummary(symptoms: string): Promise<LlmResult<PreVisitSummary>> {
  const client = getClient();
  if (!client) return { ok: false, error: "LLM not configured (ANTHROPIC_API_KEY missing)" };

  try {
    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Analyse these symptoms and return: urgency level (Low / Medium / High), chief complaint, and three suggested questions for the doctor. Symptoms: ${symptoms}`,
        },
      ],
      output_config: { format: zodOutputFormat(PreVisitSummarySchema) },
    });

    if (!response.parsed_output) {
      return { ok: false, error: "Model returned output that didn't match the expected schema" };
    }
    return { ok: true, data: response.parsed_output };
  } catch (err) {
    console.error("generatePreVisitSummary failed:", err);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ── Post-visit summary ───────────────────────────────────────────────────
// Structured medicationSchedule (with a normalized intervalHours) doubles as
// the direct data source for MedicationReminder rows in Phase 8 — no second
// parsing pass over the prescription text.

const MedicationScheduleItemSchema = z.object({
  medicationName: z.string(),
  dosage: z.string().optional(),
  frequency: z.string(), // human-readable, e.g. "twice daily"
  intervalHours: z.number().int().min(1).max(168), // normalized reminder cadence
  durationDays: z.number().int().min(1).max(90).optional(), // omit if ongoing/unspecified
});
export type MedicationScheduleItem = z.infer<typeof MedicationScheduleItemSchema>;

const PostVisitSummarySchema = z.object({
  patientSummary: z.string(),
  medicationSchedule: z.array(MedicationScheduleItemSchema),
  followUpSteps: z.array(z.string()),
});
export type PostVisitSummary = z.infer<typeof PostVisitSummarySchema>;

export async function generatePostVisitSummary(notes: string): Promise<LlmResult<PostVisitSummary>> {
  const client = getClient();
  if (!client) return { ok: false, error: "LLM not configured (ANTHROPIC_API_KEY missing)" };

  try {
    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 1536,
      messages: [
        {
          role: "user",
          content: `Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps: ${notes}\n\nFor each medication, also give a normalized reminder interval in hours (e.g. "twice daily" -> 12, "every 8 hours" -> 8, "once daily" -> 24) and, if a course length is mentioned, its duration in days.`,
        },
      ],
      output_config: { format: zodOutputFormat(PostVisitSummarySchema) },
    });

    if (!response.parsed_output) {
      return { ok: false, error: "Model returned output that didn't match the expected schema" };
    }
    return { ok: true, data: response.parsed_output };
  } catch (err) {
    console.error("generatePostVisitSummary failed:", err);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
