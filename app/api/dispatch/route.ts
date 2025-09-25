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

// app/api/workflow/latest/route.ts
import { NextResponse } from "next/server";

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

// GET /api/workflow/latest?ref=main
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get("ref") || process.env.GH_REF || "main";

    const owner = env("GH_OWNER");
    const repo  = env("GH_REPO");
    const wf    = env("GH_WORKFLOW_ID");
    const token = env("GH_TOKEN");

    const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${wf}/runs?branch=${encodeURIComponent(ref)}&per_page=1`;
    const startedAt = Date.now();
    const r = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    });
    const text = await r.text();
    let json: any = {};
    try { json = JSON.parse(text); } catch { /* keep raw text */ }

    return NextResponse.json({
      ok: r.ok,
      status: r.status,
      url,
      tookMs: Date.now() - startedAt,
      data: json,
      raw: r.ok ? undefined : text,
    }, { status: r.ok ? 200 : r.status });
  } catch (e: any) {
    return NextResponse.json({ ok:false, error:e?.message }, { status: 500 });
  }
}
