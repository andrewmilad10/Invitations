# AI features

For features inside Vellum that use AI (suggested invitation wording,
translating wording to Arabic, palette suggestions).

- Built on the Claude API. The API key is a server-only environment variable
  (e.g. `ANTHROPIC_API_KEY`, no `NEXT_PUBLIC_` prefix), read in one
  server-only module. Never sent to the browser, never committed.
- Calls happen in server actions or route handlers, after checking the
  user's session, with rate limits per user.
- Send the model only what the feature needs: no guest lists, phone numbers
  or addresses.
- The couple always reviews AI output before it appears on a card or page.
  Nothing generated is published automatically.
- Treat model output as untrusted text: validate length and content, render
  as text, never as HTML.
- If the AI call fails, the feature degrades to the normal editor; the
  couple is never blocked.
