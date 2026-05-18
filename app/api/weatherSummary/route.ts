import { NextResponse } from 'next/server';
import { getWeatherSummary } from '@/lib/weatherSummary';

export async function POST(req: Request) {
  const body = await req.json();
  console.log("KEY? =>", !!process.env.OPENAI_API_KEY);
  const summary = await getWeatherSummary(body);
  return NextResponse.json({ summary });
}
