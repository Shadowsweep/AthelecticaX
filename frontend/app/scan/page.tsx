"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getApiUrl } from "../../lib/api";

function ScanForm() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [code, setCode] = useState("");
  const [state, setState] = useState<"ready" | "loading" | "success" | "error">("ready");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setState("loading");
    setMessage("");
    try {
      const response = await fetch(`${getApiUrl()}/attendance/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_code: code, token }),
        signal: AbortSignal.timeout(10000),
      });
      const body = await response.json().catch(() => ({}));
      setMessage(body.message || body.detail || "The server returned an unexpected response.");
      setState(response.ok ? "success" : "error");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Network request failed";
      setMessage(`Cannot reach the attendance server at ${getApiUrl()}. ${detail}`);
      setState("error");
    }
  }

  return (
    <section className="scan-shell">
      <div className="scan-card">
        <span className="checkmark">{state === "success" ? "✓" : "A"}</span>
        <p className="eyebrow">Attendly check-in</p>
        <h1>{state === "success" ? "You're checked in!" : "Confirm your attendance"}</h1>
        <p className="muted">{state === "success" ? message : "Enter your employee code to record today's attendance."}</p>
        {state !== "success" && (
          <form className="form" onSubmit={submit}>
            <label>Employee code<input autoFocus value={code} onChange={(e) => setCode(e.target.value)} placeholder="EMP001" required /></label>
            <button className="primary" disabled={!token || state === "loading"}>{state === "loading" ? "Checking in..." : "Check in"}</button>
          </form>
        )}
        {state === "error" && <p className="message error">{message}</p>}
      </div>
    </section>
  );
}

export default function ScanPage() {
  return <Suspense><ScanForm /></Suspense>;
}
