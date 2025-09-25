import { NextResponse } from "next/server";

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const ref = body?.ref || process.env.GH_REF || "main";

    const owner = env("GH_OWNER");
    const repo  = env("GH_REPO");
    const wf    = env("GH_WORKFLOW_ID"); // 例: 数値ID or ymlファイル名
    const token = env("GH_TOKEN");

    const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${wf}/dispatches`;
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
    const text = await r.text();

    if (!r.ok) {
      return NextResponse.json(
        { ok: false, debug: { owner, repo, wf, ref, url, status: r.status, tookMs }, error: text },
        { status: r.status }
      );
    }

    return NextResponse.json({
      ok: true,
      debug: { owner, repo, wf, ref, url, status: r.status, tookMs },
      acceptedAt: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
