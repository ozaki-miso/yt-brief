import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function currentMonth(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  starter: 30,
  pro: 100,
};

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);

  const plan = (user.publicMetadata?.plan as string | undefined) ?? "free";
  const limit = PLAN_LIMITS[plan] ?? 3;
  const isFree = plan === "free";

  const privateMeta = user.privateMetadata as {
    usageCount?: number;
    usageMonth?: string;
    stripeCustomerId?: string;
  };

  const month = currentMonth();
  const storedMonth = privateMeta.usageMonth ?? "";
  const usageCount = !isFree && storedMonth !== month ? 0 : (privateMeta.usageCount ?? 0);
  const remaining = Math.max(0, limit - usageCount);

  return NextResponse.json({ plan, usageCount, remaining, limit });
}
