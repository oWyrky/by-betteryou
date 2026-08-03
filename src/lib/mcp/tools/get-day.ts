import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_day",
  title: "Ver hábitos do dia",
  description:
    "Retorna os hábitos registrados (água, exercício, estudo, leitura) do usuário autenticado em uma data específica (YYYY-MM-DD).",
  inputSchema: {
    date: z.string().describe("Data no formato YYYY-MM-DD."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ date }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("daily_habits")
      .select("*")
      .eq("user_id", ctx.getUserId())
      .eq("date", date)
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) {
      return {
        content: [{ type: "text", text: `Nenhum registro para ${date}.` }],
        structuredContent: { date, record: null },
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { date, record: data },
    };
  },
});
