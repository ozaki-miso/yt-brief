import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

// Stripeはリクエストボディを生のバイト列で検証するため、パースを無効化
export const dynamic = "force-dynamic";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured.");
  return new Stripe(key);
}

async function updateUserPlan(
  clerkUserId: string,
  plan: "free" | "starter" | "pro",
  subscriptionId: string | null,
) {
  const clerk = await clerkClient();
  await clerk.users.updateUserMetadata(clerkUserId, {
    publicMetadata: { plan },
    privateMetadata: { subscriptionId },
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature." }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed." }, { status: 400 });
  }

  try {
    switch (event.type) {
      // 支払い完了 → プランを有効化
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkUserId = session.metadata?.clerkUserId;
        const plan = session.metadata?.plan as "starter" | "pro" | undefined;
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : null;

        if (clerkUserId && plan) {
          await updateUserPlan(clerkUserId, plan, subscriptionId);
        }
        break;
      }

      // サブスクリプション更新（プラン変更など）
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const clerkUserId = sub.metadata?.clerkUserId;
        const plan = sub.metadata?.plan as "starter" | "pro" | undefined;

        if (clerkUserId && plan && sub.status === "active") {
          await updateUserPlan(clerkUserId, plan, sub.id);
        }
        break;
      }

      // サブスクリプション停止 → Freeに戻す
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const clerkUserId = sub.metadata?.clerkUserId;

        if (clerkUserId) {
          await updateUserPlan(clerkUserId, "free", null);
        }
        break;
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook handler error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
