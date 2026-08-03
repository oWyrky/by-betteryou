import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getDayTool from "./tools/get-day";
import listDaysTool from "./tools/list-days";
import logHabitTool from "./tools/log-habit";
import getProfileTool from "./tools/get-profile";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "by",
  title: "BY",
  version: "0.1.0",
  instructions:
    "Ferramentas do BY (Better You), um app de acompanhamento de hábitos em português. Use `get_profile` para o perfil e pontos, `get_day` e `list_days` para consultar hábitos (água, exercício, estudo, leitura) e `log_habit` para registrar ou atualizar o dia. Datas sempre no formato YYYY-MM-DD, no fuso local do usuário.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getProfileTool, getDayTool, listDaysTool, logHabitTool],
});
