import { NextResponse } from 'next/server';
import dotenv from 'dotenv';
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production.local' });
}
export async function GET() {
  return NextResponse.json({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "✅ present" : "❌ missing",
    BACKEND: process.env.NEXT_PUBLIC_BACKEND_URL,
  });
}