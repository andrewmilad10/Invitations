"use client";

// Shown only if the root layout itself fails; it replaces the whole document.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100dvh", display: "grid", placeItems: "center", fontFamily: "Georgia, serif", background: "#f6f2ec", color: "#1f2a24", textAlign: "center", padding: 24 }}>
        <div>
          <h1 style={{ fontWeight: 400, fontSize: 40, margin: 0 }}>Something went wrong</h1>
          <p style={{ marginTop: 12, opacity: 0.75 }}>Please try again in a moment.</p>
          <button type="button" onClick={reset} style={{ marginTop: 24, padding: "10px 20px", borderRadius: 999, border: "1px solid currentColor", background: "transparent", font: "inherit", cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
