import { NextResponse } from "next/server";
import OpenAI from "openai";
import { YoutubeTranscript } from "youtube-transcript";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();

    let transcriptText = "";
    
    try {
      // 言語を指定せず、利用可能な字幕をすべて取得しにいく
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      transcriptText = transcript.map(t => t.text).join(" ").slice(0, 4000);
    } catch (e: any) {
      console.error("Fetch Error:", e);
      // ここでエラーが出るなら、YouTube側がサーバーからのアクセスを拒否しています
      return NextResponse.json({ 
        error: "YOUTUBE_BLOCK",
        message: "YouTube blocked the request. Please try again or use a different video." 
      }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "Summarize the following transcript in English with 3 key takeaways. Format as a bulleted list." 
        },
        { role: "user", content: transcriptText }
      ],
    });

    return NextResponse.json({ 
      points: completion.choices[0].message.content?.split('\n').filter(p => p.trim()) || [] 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}