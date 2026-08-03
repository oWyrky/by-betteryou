import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_days",
  title: "Listar histórico de hábitos",
  description:
    "Lista os registros diários de hábitos do usuário autenticado dentro de um intervalo de datas (YYYY-MM-DD).",
  inputSchema: {
    start_date: z.string().describe("Data inicial no formato YYYY-MM-DD."),
    end_date: z.string().describe("Data final no formato YYYY-MM-DD."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ start_date, end_date }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("daily_habits")
      .select("*")
      .eq("user_id", ctx.getUserId())
      .gte("date", start_date)
      .lte("date", end_date)
      .order("date", { ascending: true })
      .limit(400);

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { days: data ?? [] },
    };
  },
});
