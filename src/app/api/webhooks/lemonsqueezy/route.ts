import { billingService } from "@/server/billing";
import { InvalidWebhookSignatureError } from "@/server/providers/payments";
import { getPaymentProvider } from "@/server/providers/payments/instance";

export const runtime = "nodejs";

/**
 * Lemon Squeezy sends payment events here. The signature is checked before anything else, and
 * applying an event is safe to repeat. A 500 makes Lemon Squeezy retry later.
 */
export async function POST(request: Request) {
  const provider = getPaymentProvider();
  if (!provider) return new Response("Not found", { status: 404 });

  const rawBody = await request.text();

  let event;
  try {
    event = provider.verifyAndParseWebhook(rawBody, request.headers.get("x-signature"));
  } catch (error) {
    if (error instanceof InvalidWebhookSignatureError)
      return new Response("Invalid signature", { status: 401 });
    return new Response("Bad request", { status: 400 });
  }

  try {
    const result = await billingService.applyEvent(provider.id, event);
    return Response.json({ received: true, result: result.status });
  } catch {
    console.error("Webhook processing failed");
    return new Response("Processing error", { status: 500 });
  }
}
