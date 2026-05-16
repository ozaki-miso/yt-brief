import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getHistory, deleteHistoryItem } from "@/lib/redis";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  try {
    const history = await getHistory(userId);
    return NextResponse.json({ history });
  } catch {
    return NextResponse.json({ error: "Could not load history." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { id } = await request.json() as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  try {
    await deleteHistoryItem(userId, id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete item." }, { status: 500 });
  }
}
