"use client";
import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState<"idle"|"running"|"ok"|"ng">("idle");
  const [msg, setMsg] = useState("");
  const [steps, setSteps] = useState<string[]>([]); // ★追加: サーバから返る処理ステップ

  const run = async () => {
    setStatus("running");
    setMsg("");
    setSteps([]);

    try {
      const r = await fetch("/api/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref: "main" })
      });

      const j = await r.json().catch(() => ({}));

      if (j?.steps) {
        setSteps(j.steps); // ★サーバー側で記録した処理ログを保存
        console.log("Steps:", j.steps);
      }

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
        </div>
      )}
    </main>
  );
}
