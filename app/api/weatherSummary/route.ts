"use server"
import { NextResponse } from 'next/server';
import { GetWeatherSummary } from '@/app/action/serveractions'

export async function POST(req: Request) {
  const body = await req.json();
  console.log("KEY? =>", !!process.env.OPENAI_API_KEY);
  const summary = await GetWeatherSummary(body);
  return NextResponse.json({ summary });
}