import { NextResponse } from "next/server";

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export async function POST(req: Request) {
  const steps: string[] = []; // ← ステップログ
  try {
    steps.push("Parse body");
    const body = await req.json().catch(() => ({}));
    const ref = body?.ref || process.env.GH_REF || "main";

    steps.push("Load env vars");
    const owner = env("GH_OWNER");
    const repo  = env("GH_REPO");
    const wf    = env("GH_WORKFLOW_ID");
    const token = env("GH_TOKEN");

    const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${wf}/dispatches`;

    steps.push("Start fetch");
    const startedAt = Date.now();
    const r = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({ ref }),
      cache: "no-store",
    });
    const tookMs = Date.now() - startedAt;

    steps.push("Got response");
    const text = await r.text();

    if (!r.ok) {
      steps.push("Response not ok");
      return NextResponse.json(
        {
          ok: false,
          stage: "dispatch",
          steps,
          debug: { owner, repo, wf, ref, url, status: r.status, tookMs },
          error: text,
        },
        { status: r.status }
      );
    }

    steps.push("Dispatch success");
    return NextResponse.json({
      ok: true,
      stage: "done",
      steps,
      debug: { owner, repo, wf, ref, url, status: r.status, tookMs },
      acceptedAt: new Date().toISOString(),
    });
  } catch (e: any) {
    steps.push("Exception thrown");
    return NextResponse.json(
      { ok: false, stage: "exception", steps, error: e?.message },
      { status: 500 }
    );
  }
}
