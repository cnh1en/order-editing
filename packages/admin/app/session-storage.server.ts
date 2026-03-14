import { Session } from "@shopify/shopify-api";
import type { SessionStorage } from "@shopify/shopify-app-session-storage";

interface SessionRow {
  id: string;
  shop: string;
  state: string;
  is_online: boolean;
  scope: string | null;
  expires: string | null;
  access_token: string;
  refresh_token: string | null;
  refresh_token_expires: string | null;
  user_id: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  account_owner: boolean;
  locale: string | null;
  collaborator: boolean;
  email_verified: boolean;
}

interface ApiResponse<T> {
  data: T;
}

export class RemoteSessionStorage implements SessionStorage {
  private readonly baseUrl: string;
  private readonly token: string;

  constructor(baseUrl: string, token?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.token = token ?? "";
  }

  async storeSession(session: Session): Promise<boolean> {
    const body = this.sessionToPayload(session);

    const response = await fetch(`${this.baseUrl}/api/sessions`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(
        `[RemoteSessionStorage] Failed to store session ${session.id}: ${response.status}`,
      );
      return false;
    }

    return true;
  }

  async loadSession(id: string): Promise<Session | undefined> {
    const response = await fetch(
      `${this.baseUrl}/api/sessions/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: this.headers(),
      },
    );

    if (response.status === 404) {
      return undefined;
    }

    if (!response.ok) {
      console.error(
        `[RemoteSessionStorage] Failed to load session ${id}: ${response.status}`,
      );
      return undefined;
    }

    const json: ApiResponse<SessionRow> = await response.json();
    return this.rowToSession(json.data);
  }

  async deleteSession(id: string): Promise<boolean> {
    const response = await fetch(
      `${this.baseUrl}/api/sessions/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: this.headers(),
      },
    );

    return response.ok || response.status === 404;
  }

  async deleteSessions(ids: string[]): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/api/sessions/bulk-delete`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ ids }),
    });

    return response.ok;
  }

  async findSessionsByShop(shop: string): Promise<Session[]> {
    const response = await fetch(
      `${this.baseUrl}/api/sessions?shop=${encodeURIComponent(shop)}`,
      {
        method: "GET",
        headers: this.headers(),
      },
    );

    if (!response.ok) {
      return [];
    }

    const json: ApiResponse<SessionRow[]> = await response.json();
    return json.data.map((row) => this.rowToSession(row));
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (this.token) {
      h["Authorization"] = `Bearer ${this.token}`;
    }
    return h;
  }

  private sessionToPayload(session: Session): Record<string, unknown> {
    const params = session.toObject();
    return {
      id: session.id,
      shop: session.shop,
      state: session.state,
      is_online: session.isOnline,
      scope: session.scope ?? null,
      expires: session.expires ? session.expires.toISOString() : null,
      access_token: session.accessToken ?? "",
      refresh_token: session.refreshToken ?? null,
      refresh_token_expires: session.refreshTokenExpires
        ? session.refreshTokenExpires.toISOString()
        : null,
      user_id: params.onlineAccessInfo?.associated_user?.id
        ? String(params.onlineAccessInfo.associated_user.id)
        : null,
      first_name: params.onlineAccessInfo?.associated_user?.first_name ?? null,
      last_name: params.onlineAccessInfo?.associated_user?.last_name ?? null,
      email: params.onlineAccessInfo?.associated_user?.email ?? null,
      account_owner:
        params.onlineAccessInfo?.associated_user?.account_owner ?? false,
      locale: params.onlineAccessInfo?.associated_user?.locale ?? null,
      collaborator:
        params.onlineAccessInfo?.associated_user?.collaborator ?? false,
      email_verified:
        params.onlineAccessInfo?.associated_user?.email_verified ?? false,
    };
  }

  private rowToSession(row: SessionRow): Session {
    const entries: [string, string | number | boolean][] = [
      ["id", row.id],
      ["shop", row.shop],
      ["state", row.state],
      ["isOnline", row.is_online],
    ];

    if (row.scope) entries.push(["scope", row.scope]);
    if (row.access_token) entries.push(["accessToken", row.access_token]);
    if (row.expires) entries.push(["expires", new Date(row.expires).getTime()]);
    if (row.refresh_token) entries.push(["refreshToken", row.refresh_token]);
    if (row.refresh_token_expires) {
      entries.push([
        "refreshTokenExpires",
        new Date(row.refresh_token_expires).getTime(),
      ]);
    }
    if (row.user_id) entries.push(["userId", row.user_id]);
    if (row.first_name) entries.push(["firstName", row.first_name]);
    if (row.last_name) entries.push(["lastName", row.last_name]);
    if (row.email) entries.push(["email", row.email]);
    if (row.locale) entries.push(["locale", row.locale]);
    if (row.account_owner !== null)
      entries.push(["accountOwner", row.account_owner]);
    if (row.collaborator !== null)
      entries.push(["collaborator", row.collaborator]);
    if (row.email_verified !== null)
      entries.push(["emailVerified", row.email_verified]);

    return Session.fromPropertyArray(entries, true);
  }
}
