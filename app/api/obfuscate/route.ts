import { NextRequest, NextResponse } from 'next/server';
import { ObfuscatorController } from '@/src/server/controllers/obfuscator.controller';

const controller = new ObfuscatorController();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await controller.obfuscate({
      sourceCode: body.sourceCode,
      config: body.config,
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to obfuscate Python code' },
      { status: 400 }
    );
  }
}
