import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured.");
  return new Stripe(key);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);

  const customerId =
    typeof user.privateMetadata?.stripeCustomerId === "string"
      ? user.privateMetadata.stripeCustomerId
      : null;

  if (!customerId) {
    return NextResponse.json({ error: "No subscription found." }, { status: 404 });
  }

  const stripe = getStripe();
  const origin = request.headers.get("origin") ?? "https://www.yt-brief.com";

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/account`,
  });

  return NextResponse.json({ url: session.url });
}
