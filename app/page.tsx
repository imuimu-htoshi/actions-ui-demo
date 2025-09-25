"use client";
import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState<"idle"|"running"|"ok"|"ng">("idle");
  const [msg, setMsg] = useState("");
  const [steps, setSteps] = useState<string[]>([]); // サーバから返る処理ステップ
  const [debug, setDebug] = useState<any>(null);    // ★追加: debug 情報

  const run = async () => {
    setStatus("running");
    setMsg("");
    setSteps([]);
    setDebug(null);

    try {
      const r = await fetch("/api/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref: "main" })
      });

      const j = await r.json().catch(() => ({}));

      if (j?.steps) setSteps(j.steps);
      if (j?.debug) setDebug(j.debug); // ★debug 情報を保存

      if (r.ok && j?.ok) {
        setStatus("ok");
        setMsg("Dispatched to GitHub Actions.");
      } else {
        setStatus("ng");
        setMsg(j?.error || `Failed (HTTP ${r.status})`);
      }
    } catch (e: any) {
      setStatus("ng");
      setMsg(e?.message || "Unexpected error");
    }
  };

  return (
    <main>
      <h1>Run GitHub Actions</h1>
      <button onClick={run} disabled={status==="running"}>
        {status==="running" ? "Running..." : "Run now"}
      </button>
      {status !== "idle" && (
        <div>
          <p>
            <b>Status:</b>{" "}
            {status === "ok"
              ? "Success"
              : status === "ng"
              ? "Error"
              : "Running"}
            {msg ? ` — ${msg}` : ""}
          </p>

          {steps.length > 0 && (
            <div>
              <b>Steps log:</b>
              <ul>
                {steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {debug && (
            <div>
              <b>Debug info:</b>
              <pre>{JSON.stringify(debug, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
