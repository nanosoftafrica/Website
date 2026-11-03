/**
 * Africa's Talking SMS Service
 * Handles dispatching SMS alerts and transactional notifications.
 */

export interface SendSmsOptions {
  to: string;
  message: string;
  senderId?: string;
  username?: string;
  apiKey?: string;
}

export interface SmsResult {
  success: boolean;
  messageId?: string;
  status: string;
  error?: string;
  simulated?: boolean;
}

export async function sendSMS({
  to,
  message,
  senderId,
  username,
  apiKey,
}: SendSmsOptions): Promise<SmsResult> {
  const atUsername = username || process.env.AT_USERNAME || "sandbox";
  const atApiKey = apiKey || process.env.AT_API_KEY || "";
  const atSenderId = senderId || process.env.AT_SENDER_ID || "";

  // Normalize phone number (must be international with plus or country code)
  let cleanPhone = to.replace(/\s+/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "+254" + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith("+")) {
    cleanPhone = "+" + cleanPhone;
  }

  // If no API key is provided, simulate and log gracefully
  if (!atApiKey) {
    console.log(`[SMS Simulation] To: ${cleanPhone} | Message: ${message}`);
    return {
      success: true,
      simulated: true,
      status: "Simulated (No Africa's Talking API key set)",
      messageId: `sim_${Date.now()}`,
    };
  }

  const isSandbox = atUsername.toLowerCase() === "sandbox";
  const endpoint = isSandbox
    ? "https://api.sandbox.africastalking.com/version1/messaging"
    : "https://api.africastalking.com/version1/messaging";

  const formBody = new URLSearchParams();
  formBody.append("username", atUsername);
  formBody.append("to", cleanPhone);
  formBody.append("message", message);
  if (atSenderId && !isSandbox) {
    formBody.append("from", atSenderId);
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        apiKey: atApiKey,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: formBody.toString(),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        status: `HTTP ${res.status}`,
        error: data.errorMessage || data.message || "Failed to dispatch SMS",
      };
    }

    const recipient = data?.SMSMessageData?.Recipients?.[0];
    const status = recipient?.status || "Success";
    const success = status === "Success" || status === "Pending";

    return {
      success,
      status,
      messageId: recipient?.messageId,
      error: !success ? recipient?.status : undefined,
    };
  } catch (err) {
    return {
      success: false,
      status: "Network Error",
      error: (err as Error).message,
    };
  }
}
