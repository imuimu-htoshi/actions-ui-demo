import { NextResponse } from "next/server";

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export async function POST(req: Request) {
  try {
    const { ref = "main" } = await req.json().catch(() => ({}));

    const owner = env("GH_OWNER");
    const repo  = env("GH_REPO");
    const wf    = env("GH_WORKFLOW_ID"); // 例: news.yml
    const token = env("GH_TOKEN");

    const r = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${wf}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({ ref }), // inputsは最小なので無し
        cache: "no-store",
      }
    );

    if (!r.ok) {
      return NextResponse.json({ ok: false, error: await r.text() }, { status: r.status });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
