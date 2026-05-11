import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    console.log("API Start: Request received");
    const body = await req.json();
    const { url } = body;
    
    if (!url) {
      return NextResponse.json({ error: "URL is missing" }, { status: 400 });
    }

    // 🌟 テスト用：まだAIは呼ばず、まずは「道」がつながっているか確認！
    return NextResponse.json({ 
      message: "API Route is WORKING!", 
      receivedUrl: url 
    }, { status: 200 });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}