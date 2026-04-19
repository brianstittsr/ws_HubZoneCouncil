import { ClientSecretCredential } from "@azure/identity";
import { Client, GraphError } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js";

/**
 * Shared email utility using Microsoft Graph API for HubZone Council.
 * Sends emails as admin@hubzonecouncil.org via Azure AD app registration.
 *
 * Required environment variables:
 *   AZURE_TENANT_ID     - Azure AD tenant (directory) ID
 *   AZURE_CLIENT_ID     - App registration application (client) ID
 *   AZURE_CLIENT_SECRET - App registration client secret value
 *   SMTP_FROM_EMAIL     - Sender email address (default: admin@hubzonecouncil.org)
 *   SMTP_FROM_NAME      - Sender display name (default: "HubZone Council")
 *
 * Azure app registration requirements:
 *   - API permission: Microsoft Graph → Application permission → Mail.Send
 *   - Admin consent granted for the tenant
 */

interface EmailAttachment {
  name: string;
  contentType: string;
  contentBytes: string;
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ─── In-process client cache ──────────────────────────────────────────────────
// Caches the Graph client for the lifetime of the serverless instance.
// ClientSecretCredential internally caches and refreshes the OAuth2 token,
// so re-using this instance avoids redundant token fetches to Azure AD on
// every email send (which can trigger throttling and intermittent 429 failures).
let _cachedClient: Client | null = null;
let _cachedClientKey = "";

/**
 * Returns a cached Microsoft Graph client, or creates a new one if credentials changed.
 */
function getGraphClient(): Client | null {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    console.warn(
      "[email] Azure credentials not configured. Set AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET."
    );
    return null;
  }

  // Only recreate the client if the credentials have changed
  const cacheKey = `${tenantId}:${clientId}:${clientSecret.length}`;
  if (_cachedClient && _cachedClientKey === cacheKey) {
    return _cachedClient;
  }

  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ["https://graph.microsoft.com/.default"],
  });

  _cachedClient = Client.initWithMiddleware({ authProvider });
  _cachedClientKey = cacheKey;
  return _cachedClient;
}

/**
 * Extract a human-readable error message from a Graph API error.
 * GraphError carries statusCode + body that plain Error.message loses.
 */
function extractGraphError(error: unknown): string {
  if (error instanceof GraphError) {
    const body = error.body
      ? (typeof error.body === "string" ? error.body : JSON.stringify(error.body))
      : "";
    let detail = "";
    try {
      const parsed = JSON.parse(body);
      detail = parsed?.error?.message || parsed?.message || body;
    } catch {
      detail = body;
    }
    return `Graph API ${error.statusCode ?? "error"}: ${error.message}${detail ? ` — ${detail}` : ""}`;
  }
  if (error instanceof Error) return error.message;
  return "Unknown email error";
}

/** Transient HTTP status codes that are safe to retry once */
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

/**
 * Get the configured "from" address for outgoing emails.
 */
export function getFromAddress(): string {
  const name = process.env.SMTP_FROM_NAME || "HubZone Council";
  const email = process.env.SMTP_FROM_EMAIL || "admin@hubzonecouncil.org";
  return `${name} <${email}>`;
}

/**
 * Check if email sending is configured.
 */
export function isEmailConfigured(): boolean {
  return !!(
    process.env.AZURE_TENANT_ID &&
    process.env.AZURE_CLIENT_ID &&
    process.env.AZURE_CLIENT_SECRET
  );
}

/**
 * Send an email using Microsoft Graph API (app-only / client credentials flow).
 * Automatically retries once on transient errors (429, 5xx).
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const graphClient = getGraphClient();

  if (!graphClient) {
    return {
      success: false,
      error: "Azure credentials not configured. Set AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET.",
    };
  }

  const fromEmail = process.env.SMTP_FROM_EMAIL || "admin@hubzonecouncil.org";

  // Build recipient list
  const toRecipients = (Array.isArray(options.to) ? options.to : [options.to]).map(
    (addr) => ({ emailAddress: { address: addr } })
  );

  // Build the Graph API message payload.
  // NOTE: Do NOT include a 'from' field when using app-only Mail.Send permission —
  // the sending mailbox is already specified in the /users/{email}/sendMail URL path.
  // Including 'from' can cause ErrorSendAsDenied (403) on some tenant configurations.
  const payload: Record<string, unknown> = {
    message: {
      subject: options.subject,
      body: {
        contentType: "HTML",
        content: options.html,
      },
      toRecipients,
      ...(options.replyTo
        ? { replyTo: [{ emailAddress: { address: options.replyTo } }] }
        : {}),
      ...(options.attachments && options.attachments.length > 0
        ? {
            attachments: options.attachments.map((a) => ({
              "@odata.type": "#microsoft.graph.fileAttachment",
              name: a.name,
              contentType: a.contentType,
              contentBytes: a.contentBytes,
            })),
          }
        : {}),
    },
    saveToSentItems: true,
  };

  const attemptSend = async (): Promise<void> => {
    await graphClient
      .api(`/users/${fromEmail}/sendMail`)
      .post(payload);
  };

  try {
    await attemptSend();
    console.log(`[email] Sent via Graph API to ${Array.isArray(options.to) ? options.to.join(", ") : options.to}`);
    return { success: true, messageId: `graph_${Date.now()}` };
  } catch (firstError) {
    const statusCode = firstError instanceof GraphError ? firstError.statusCode : 0;
    const isTransient = statusCode != null && RETRYABLE_STATUSES.has(statusCode);

    if (isTransient) {
      // Wait 1 second then retry once for transient errors
      console.warn(`[email] Transient error (${statusCode}), retrying in 1s…`);
      await new Promise((r) => setTimeout(r, 1000));
      try {
        await attemptSend();
        console.log(`[email] Retry succeeded — sent to ${options.to}`);
        return { success: true, messageId: `graph_retry_${Date.now()}` };
      } catch (retryError) {
        const errMessage = extractGraphError(retryError);
        console.error("[email] Retry also failed:", errMessage);
        return { success: false, error: `Retry failed: ${errMessage}` };
      }
    }

    const errMessage = extractGraphError(firstError);
    console.error("[email] Graph API send failed:", errMessage);
    return { success: false, error: errMessage };
  }
}
