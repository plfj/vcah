import { NextResponse } from 'next/server';
import { ObfuscatorController } from '@/src/server/controllers/obfuscator.controller';

const controller = new ObfuscatorController();

export async function GET() {
  const result = controller.getPresets();
  return NextResponse.json(result);
}
