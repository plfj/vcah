import { NextRequest, NextResponse } from 'next/server';
import { ObfuscatorController } from '@/src/server/controllers/obfuscator.controller';

const controller = new ObfuscatorController();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = controller.simulateExecution(body.sourceCode, body.payload);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Simulation failed' },
      { status: 400 }
    );
  }
}
