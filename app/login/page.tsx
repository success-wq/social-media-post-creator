"use client";

import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Login failed");
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const next = params.get("next") || "/";
      window.location.href = next;
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <form onSubmit={onSubmit} style={styles.card}>
        <h1 style={styles.title}>Social Media Post Creator</h1>
        <p style={styles.sub}>Enter the access password to continue.</p>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={styles.input}
        />
        {error ? <div style={styles.err}>{error}</div> : null}
        <button type="submit" disabled={loading || !password} style={styles.btn}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    minHeight: "100vh",
    background: "#000",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  card: {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: 12,
    padding: 32,
    width: "100%",
    maxWidth: 380,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  title: { fontSize: 22, fontWeight: 700, margin: 0 },
  sub: { fontSize: 14, color: "#a0a0a0", margin: 0 },
  input: {
    background: "#0a0a0a",
    border: "1px solid #2a2a2a",
    color: "#fff",
    padding: "14px 16px",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
  },
  btn: {
    background: "#808080",
    color: "#000",
    border: "none",
    padding: "14px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: 0.5,
    cursor: "pointer",
  },
  err: {
    background: "#3a1010",
    border: "1px solid #ff4444",
    color: "#ff8888",
    padding: "10px 12px",
    borderRadius: 6,
    fontSize: 13,
  },
};
