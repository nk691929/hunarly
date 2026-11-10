// Sends a correctly signed, fake Lemon Squeezy webhook to your local app, so you can see a plan
// switch from Free to Pro without a real payment. Run it like this (PowerShell):
//
//   pnpm exec dotenv -e .env.local -- node scripts/send-test-webhook.mjs --email you@example.com --sku pro_yearly
//
// Options:
//   --email   the email of an account that already exists (required)
//   --sku     pro_monthly | pro_yearly | job_hunt_pass   (default pro_yearly)
//   --status  subscription status: active | cancelled | expired   (default active)
//   --refund  send a refund for the order id (with --order)
//   --order   order id to use for a pass or a refund (default: a new one)
//   --url     where the app runs (default http://localhost:3000)
import { createHmac } from "node:crypto";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, i, all) => {
    if (arg.startsWith("--"))
      pairs.push([
        arg.slice(2),
        all[i + 1]?.startsWith("--") || all[i + 1] === undefined ? "true" : all[i + 1],
      ]);
    return pairs;
  }, []),
);

const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
const variants = {
  pro_monthly: process.env.LEMONSQUEEZY_VARIANT_MONTHLY,
  pro_yearly: process.env.LEMONSQUEEZY_VARIANT_YEARLY,
  job_hunt_pass: process.env.LEMONSQUEEZY_VARIANT_PASS,
};
const email = args.email;
const sku = args.sku ?? "pro_yearly";
const baseUrl = args.url ?? "http://localhost:3000";

if (!secret || !variants[sku] || !email) {
  console.error(
    "Need --email, a valid --sku, and the LEMONSQUEEZY_* values in .env.local (run through dotenv, see the top of this file).",
  );
  process.exit(1);
}

const now = new Date();
const iso = now.toISOString();
const plusDays = (d) => new Date(now.getTime() + d * 86_400_000).toISOString();
const orderId = args.order ?? String(Math.floor(Math.random() * 1e9));
let payload;

if (args.refund) {
  payload = {
    meta: { event_name: "order_refunded" },
    data: {
      type: "orders",
      id: orderId,
      attributes: { status: "refunded", user_email: email, updated_at: iso },
    },
  };
} else if (sku === "job_hunt_pass") {
  payload = {
    meta: { event_name: "order_created" },
    data: {
      type: "orders",
      id: orderId,
      attributes: {
        status: "paid",
        total: 1900,
        currency: "USD",
        user_email: email,
        created_at: iso,
        updated_at: iso,
        first_order_item: { variant_id: Number(variants[sku]) },
      },
    },
  };
} else {
  const status = args.status ?? "active";
  const months = sku === "pro_yearly" ? 365 : 30;
  payload = {
    meta: { event_name: status === "active" ? "subscription_created" : `subscription_${status}` },
    data: {
      type: "subscriptions",
      id: args.sub ?? "test-sub-1",
      attributes: {
        status,
        variant_id: Number(variants[sku]),
        user_email: email,
        renews_at: status === "active" ? plusDays(months) : null,
        ends_at: status === "active" ? null : status === "cancelled" ? plusDays(7) : iso,
        cancelled: status === "cancelled",
        created_at: iso,
        updated_at: iso,
        urls: { customer_portal: "https://example.com/portal" },
      },
    },
  };
}

const body = JSON.stringify(payload);
const signature = createHmac("sha256", secret).update(body).digest("hex");
const response = await fetch(`${baseUrl}/api/webhooks/lemonsqueezy`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Signature": signature },
  body,
});
console.log(response.status, await response.text());
