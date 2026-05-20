"use client";

export default function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }
  return (
    <button
      type="button"
      onClick={logout}
      style={{
        background: "transparent",
        border: "1px solid #2a2a2a",
        color: "#a0a0a0",
        padding: "6px 14px",
        borderRadius: 6,
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      Sign out
    </button>
  );
}
