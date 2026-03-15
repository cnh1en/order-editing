export interface ShopSession {
  shop: string;
  scope: string;
  installed_at: string;
}

interface ErrorResponse {
  error: {
    message: string;
    code: string;
  };
}

interface InstallResponse {
  data: {
    shop: ShopSession;
    shop_info: Record<string, string> | null;
  };
}

const BACKEND_URL = (
  process.env.BACKEND_URL || "http://localhost:63109"
).replace(/\/$/, "");

/**
 * Authenticate an SSR request by extracting the Shopify session token.
 *
 * On first load from Shopify iframe, the token arrives as `id_token` query param.
 * On subsequent client-side navigations, App Bridge includes it in the
 * `Authorization` header automatically.
 *
 * The token is forwarded to Laravel for verification and shop lookup.
 * If the shop is not yet installed (SHOP_NOT_FOUND), triggers the install flow.
 */
export async function authenticate(
  request: Request,
): Promise<{ session: ShopSession }> {
  const url = new URL(request.url);
  const idToken =
    url.searchParams.get("id_token") ||
    extractBearerToken(request.headers.get("Authorization"));

  if (!idToken) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const verifyResponse = await fetch(`${BACKEND_URL}/api/auth/verify`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
      Accept: "application/json",
    },
  });

  if (verifyResponse.ok) {
    const json: { data: ShopSession } = await verifyResponse.json();
    return { session: json.data };
  }

  // Parse the error response to decide next action
  const errorJson: ErrorResponse = await verifyResponse.json();

  // Only trigger install when shop doesn't exist yet
  if (errorJson.error.code === "SHOP_NOT_FOUND") {
    return installShop(idToken);
  }

  // Any other auth error (invalid token, expired session) — reject
  throw new Response(errorJson.error.message, { status: 401 });
}

async function installShop(
  sessionToken: string,
): Promise<{ session: ShopSession }> {
  const installResponse = await fetch(`${BACKEND_URL}/api/shop/install`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ session_token: sessionToken }),
  });

  if (!installResponse.ok) {
    const body = await installResponse.text();
    console.error(`Install failed (${installResponse.status}): ${body}`);
    throw new Response("Installation failed", { status: 401 });
  }

  const installJson: InstallResponse = await installResponse.json();
  return { session: installJson.data.shop };
}

function extractBearerToken(header: string | null): string | null {
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

/**
 * Add Shopify-required response headers (frame-ancestors for embedded apps).
 * Replaces the shopify-app-react-router's addDocumentResponseHeaders.
 */
export function addDocumentResponseHeaders(
  request: Request,
  headers: Headers,
): void {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (shop) {
    headers.set(
      "Content-Security-Policy",
      `frame-ancestors https://${shop} https://admin.shopify.com;`,
    );
  } else {
    headers.set(
      "Content-Security-Policy",
      "frame-ancestors https://admin.shopify.com;",
    );
  }
}
