import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID ?? "",
  pro: process.env.STRIPE_PRO_PRICE_ID ?? "",
};

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured.");
  return new Stripe(key);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in to subscribe." }, { status: 401 });
  }

  let planId: string;
  try {
    const body = await request.json() as { plan?: unknown };
    planId = typeof body.plan === "string" ? body.plan : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const priceId = PRICE_IDS[planId];
  if (!priceId) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const stripe = getStripe();
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);

  // Clerkのmetadataに保存済みのStripe顧客IDを再利用する
  const existingCustomerId =
    typeof user.privateMetadata?.stripeCustomerId === "string"
      ? user.privateMetadata.stripeCustomerId
      : null;

  let customerId = existingCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.emailAddresses[0]?.emailAddress ?? undefined,
      name:
        [user.firstName, user.lastName].filter(Boolean).join(" ") || undefined,
      metadata: { clerkUserId: userId },
    });
    customerId = customer.id;

    await clerk.users.updateUserMetadata(userId, {
      privateMetadata: { stripeCustomerId: customerId },
    });
  }

  const origin = request.headers.get("origin") ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/?checkout=success`,
    cancel_url: `${origin}/pricing?checkout=canceled`,
    metadata: { clerkUserId: userId, plan: planId },
    subscription_data: {
      metadata: { clerkUserId: userId, plan: planId },
    },
  });

  return NextResponse.json({ url: session.url });
}
