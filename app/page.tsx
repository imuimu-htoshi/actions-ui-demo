"use client";
import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState<"idle"|"running"|"ok"|"ng">("idle");
  const [msg, setMsg] = useState("");

  const run = async () => {
    setStatus("running");
    setMsg("");
    const r = await fetch("/api/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref: "main" })
    });
    if (r.ok) {
      setStatus("ok");
      setMsg("Dispatched to GitHub Actions.");
    } else {
      const j = await r.json().catch(()=>({error:"Failed"}));
      setStatus("ng");
      setMsg(j?.error || "Failed");
    }
  };

  return (
    <main style={{maxWidth:720, margin:"40px auto", padding:16, fontFamily:"system-ui"}}>
      <h1>Run GitHub Actions</h1>
      <button onClick={run} disabled={status==="running"}
        style={{padding:"10px 16px", borderRadius:8, border:"1px solid #ddd", cursor:"pointer"}}>
        {status==="running" ? "Running..." : "Run now"}
      </button>
      {status !== "idle" && (
        <p style={{marginTop:12}}>
          <b>Status:</b> {status === "ok" ? "Success" : status === "ng" ? "Error" : "Running"}
          {msg ? ` — ${msg}` : ""}
        </p>
      )}
    </main>
  );
}
