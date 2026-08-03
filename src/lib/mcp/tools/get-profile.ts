import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_profile",
  title: "Ver perfil e pontos",
  description:
    "Retorna o perfil do usuário autenticado (nickname, meta de água, incremento) e o saldo de pontos acumulados.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Não autenticado." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();

    const [profileRes, pointsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, water_goal_ml, water_increment_ml, age, height_cm, weight_kg")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("user_points")
        .select("balance, total_earned, total_spent")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

    if (profileRes.error) {
      return { content: [{ type: "text", text: profileRes.error.message }], isError: true };
    }

    const payload = { profile: profileRes.data, points: pointsRes.data ?? null };
    return {
      content: [{ type: "text", text: JSON.stringify(payload) }],
      structuredContent: payload,
    };
  },
});
