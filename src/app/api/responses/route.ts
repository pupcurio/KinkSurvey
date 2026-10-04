import { getDb } from "@/db";
import { responses } from "@/db/schema";
import { validateSubmission } from "@/survey/submission";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "json" }, { status: 400 });
  }

  const result = validateSubmission(body);
  if (result.kind === "invalid") return Response.json({ ok: false, error: result.error }, { status: 400 });
  if (result.kind === "store") await getDb().insert(responses).values(result.response);

  return Response.json({ ok: true });
}
