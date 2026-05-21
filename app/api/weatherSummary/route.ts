import { NextResponse } from 'next/server';
import { getWeatherSummary } from '@/lib/weatherSummary';

export async function POST(req: Request) {
  const body = await req.json();
  const summary = await getWeatherSummary(body);
  return NextResponse.json({ summary });
}
