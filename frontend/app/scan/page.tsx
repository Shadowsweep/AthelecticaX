"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { api } from "../../lib/api";
import { RootState } from "../../lib/store/store";

function ScanForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [state, setState] = useState<"ready" | "loading" | "success" | "error">("ready");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(`/scan?token=${token}`)}`);
    }
  }, [isAuthenticated, router, token]);

  async function submit() {
    setState("loading");
    setMessage("");
    try {
      const body = await api<{ message: string; action: string; employee: { name: string } }>("/attendance/scan", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      setState("success");
      setMessage(body.message);
      setTimeout(() => {
        router.push(`/?welcome=${encodeURIComponent(body.employee.name)}&action=${body.action}`);
      }, 2000);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Network request failed";
      setMessage(detail);
      setState("error");
    }
  }

  return (
    <section className="scan-shell">
      <div className="scan-card">
        <span className="checkmark">{state === "success" ? "✓" : "A"}</span>
        <p className="eyebrow">Attendly check-in</p>
        <h1>{state === "success" ? (message.startsWith("Goodbye") ? "Tap-out complete" : "Tap-in complete") : "Confirm attendance scan"}</h1>
        <p className="muted">{state === "success" ? message : "Your logged-in employee account will be used for this scan."}</p>
        {state !== "success" && (
          <button className="primary" onClick={submit} disabled={!token || state === "loading" || !isAuthenticated}>
            {state === "loading" ? "PROCESSING SCAN..." : "TAP IN / TAP OUT"}
          </button>
        )}
        {state === "error" && <p className="message error">{message}</p>}
      </div>
    </section>
  );
}

export default function ScanPage() {
  return <Suspense><ScanForm /></Suspense>;
}
