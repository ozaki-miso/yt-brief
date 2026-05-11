import { NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    
    // 1. YouTube IDを抽出
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[7].length === 11) ? match[7] : null;

    if (!videoId) return NextResponse.json({ error: "Invalid URL" }, { status: 400 });

    // 2. RapidAPI (youtube-transcripts) を叩く
    // 最も成功率の高い「フルURLをエンコードして渡す」方式に固定します
    const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const apiUrl = `https://youtube-transcripts.p.rapidapi.com/youtube/transcript?url=${encodeURIComponent(targetUrl)}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
        'X-RapidAPI-Host': 'youtube-transcripts.p.rapidapi.com'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("API Error Response:", data);
      return NextResponse.json({ error: "字幕取得APIが失敗しました", detail: data }, { status: response.status });
    }

    // データの受け取り口を広げる（content, transcript, または配列形式すべてに対応）
    let transcriptText = "";
    if (data.content) transcriptText = data.content;
    else if (data.transcript) transcriptText = data.transcript;
    else if (Array.isArray(data)) transcriptText = data.map(i => i.text).join(" ");

    if (!transcriptText) {
      return NextResponse.json({ error: "字幕データが空でした" }, { status: 404 });
    }

    // 3. OpenAIで要約
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Summarize in English with 3 bullet points." },
        { role: "user", content: transcriptText.slice(0, 7000) }
      ],
    });

    const points = completion.choices[0].message.content?.split('\n').filter(p => p.trim()) || [];
    return NextResponse.json({ points });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}