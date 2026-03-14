import type {
  Order,
  CalculatedOrder,
  BeginOrderEditPayload,
  CommitOrderEditPayload,
} from "@customix/shared/types";

const BACKEND_URL = (
  process.env.BACKEND_URL || "http://localhost:8000"
).replace(/\/$/, "");
const BACKEND_TOKEN = process.env.BACKEND_TOKEN || "";

function headers(shopDomain: string): Record<string, string> {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Shop-Domain": shopDomain,
  };
  if (BACKEND_TOKEN) {
    h["Authorization"] = `Bearer ${BACKEND_TOKEN}`;
  }
  return h;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Backend API error ${response.status}: ${body}`,
    );
  }

  const json: { data: T } = await response.json();
  return json.data;
}

export async function getOrder(
  shopDomain: string,
  orderId: string,
): Promise<Order> {
  const response = await fetch(
    `${BACKEND_URL}/api/orders/${encodeURIComponent(orderId)}`,
    {
      method: "GET",
      headers: headers(shopDomain),
    },
  );
  return handleResponse<Order>(response);
}

export async function beginOrderEdit(
  shopDomain: string,
  payload: BeginOrderEditPayload,
): Promise<CalculatedOrder> {
  const response = await fetch(`${BACKEND_URL}/api/orders/edit/begin`, {
    method: "POST",
    headers: headers(shopDomain),
    body: JSON.stringify(payload),
  });
  return handleResponse<CalculatedOrder>(response);
}

export async function commitOrderEdit(
  shopDomain: string,
  payload: CommitOrderEditPayload,
): Promise<Order> {
  const response = await fetch(`${BACKEND_URL}/api/orders/edit/commit`, {
    method: "POST",
    headers: headers(shopDomain),
    body: JSON.stringify(payload),
  });
  return handleResponse<Order>(response);
}
