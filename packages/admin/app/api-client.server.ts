import type {
  Order,
  CalculatedOrder,
  BeginOrderEditPayload,
  CommitOrderEditPayload,
} from "@customix/shared/types";

const BACKEND_URL = (
  process.env.BACKEND_URL || "http://localhost:8000"
).replace(/\/$/, "");

/**
 * Create headers for Laravel API calls using the Shopify session token (JWT).
 * No more static BACKEND_TOKEN — auth is done via the JWT that Shopify provides.
 */
function headers(sessionToken: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${sessionToken}`,
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Backend API error ${response.status}: ${body}`);
  }

  const json: { data: T } = await response.json();
  return json.data;
}

/**
 * Extract the session token from a Request.
 * Checks `id_token` query param first (initial Shopify iframe load),
 * then falls back to the Authorization header.
 */
export function extractToken(request: Request): string {
  const url = new URL(request.url);
  const idToken = url.searchParams.get("id_token");
  if (idToken) return idToken;

  const authHeader = request.headers.get("Authorization");
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match) return match[1];
  }

  throw new Error("No session token available");
}

export async function getOrder(
  token: string,
  orderId: string
): Promise<Order> {
  const response = await fetch(
    `${BACKEND_URL}/api/orders/${encodeURIComponent(orderId)}`,
    {
      method: "GET",
      headers: headers(token),
    }
  );
  return handleResponse<Order>(response);
}

export async function beginOrderEdit(
  token: string,
  payload: BeginOrderEditPayload
): Promise<CalculatedOrder> {
  const response = await fetch(`${BACKEND_URL}/api/orders/edit/begin`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify(payload),
  });
  return handleResponse<CalculatedOrder>(response);
}

export async function commitOrderEdit(
  token: string,
  payload: CommitOrderEditPayload
): Promise<Order> {
  const response = await fetch(`${BACKEND_URL}/api/orders/edit/commit`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify(payload),
  });
  return handleResponse<Order>(response);
}
