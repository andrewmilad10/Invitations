import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { onRequestError } from "./instrumentation";

const req = { path: "/w/some-couple?g=SECRETTOKEN", method: "GET", headers: { cookie: "sb=secret" } };
const ctx = {
  routerKind: "App Router" as const,
  routePath: "/w/[slug]",
  routeType: "render" as const,
  renderSource: "server-rendering" as const,
  revalidateReason: undefined,
  renderType: "dynamic" as const,
};

describe("onRequestError", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    fetchMock = vi.fn(async () => new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.ERROR_WEBHOOK_URL;
  });

  it("does nothing when no webhook is configured", async () => {
    await onRequestError(new Error("boom unset"), req, ctx);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports a safe payload: no query string, headers, or cookies", async () => {
    process.env.ERROR_WEBHOOK_URL = "https://hooks.example/err";
    await onRequestError(new Error("kaboom unique-1"), req, ctx);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body.path).toBe("/w/some-couple"); // query dropped
    expect(body.message).toBe("kaboom unique-1");
    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain("SECRETTOKEN");
    expect(serialized).not.toContain("cookie");
    expect(serialized).not.toContain("secret");
  });

  it("collapses repeats of the same error within the window", async () => {
    process.env.ERROR_WEBHOOK_URL = "https://hooks.example/err";
    await onRequestError(new Error("repeated unique-2"), req, ctx);
    await onRequestError(new Error("repeated unique-2"), req, ctx);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("never throws when the webhook call fails", async () => {
    process.env.ERROR_WEBHOOK_URL = "https://hooks.example/err";
    fetchMock.mockRejectedValueOnce(new Error("network down"));
    await expect(onRequestError(new Error("swallowed unique-3"), req, ctx)).resolves.toBeUndefined();
  });
});
