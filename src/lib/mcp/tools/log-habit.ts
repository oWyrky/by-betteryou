import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "log_habit",
  title: "Registrar hábito do dia",
  description:
    "Registra ou atualiza os hábitos do usuário autenticado numa data: água (ml), exercício, estudo e leitura (concluído ou justificado).",
  inputSchema: {
    date: z.string().describe("Data no formato YYYY-MM-DD."),
    water_ml: z.number().optional().describe("Total de água bebida no dia, em ml."),
    exercise_done: z.boolean().optional(),
    exercise_justified: z.boolean().optional(),
    study_done: z.boolean().optional(),
    study_justified: z.boolean().optional(),
    reading_done: z.boolean().optional(),
    reading_justified: z.boolean().optional(),
    day_completed: z.boolean().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ date, ...fields }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado." }], isError: true };
    }
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([, value]) => value !== undefined),
    );
    if (Object.keys(updates).length === 0) {
      throw new ToolError("Informe ao menos um campo de hábito para registrar.");
    }

    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("daily_habits")
      .upsert({ user_id: ctx.getUserId(), date, ...updates }, { onConflict: "user_id,date" })
      .select()
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { record: data },
    };
  },
});
