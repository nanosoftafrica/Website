"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const d = await res.json();
      if (res.ok) {
        trackEvent("newsletter_signup", { category: "Engagement", label: "Footer Newsletter" });
        setStatus({ kind: "ok", text: "✓ " + (d.message || "Subscribed!") });
        setEmail("");
      } else throw new Error(d.error || "Failed");
    } catch (err) {
      setStatus({ kind: "err", text: (err as Error).message || "Something went wrong — please try again." });
    }
  };

  return (
    <>
      <form className="footer-newsletter" onSubmit={submit}>
        <input
          type="email"
          placeholder="Your email address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="submit"
          data-analytics-event="newsletter_signup"
          data-analytics-category="Newsletter"
          data-analytics-label="Footer Subscribe Button"
        >
          Subscribe
        </button>
      </form>
      {status && <div className={`footer-newsletter-msg ${status.kind}`}>{status.text}</div>}
    </>
  );
}
