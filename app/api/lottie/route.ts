import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('file');

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    const safeFilename = filename.replace(/\\/g, '/').split('/').pop() || '';
    const filePath = join('C:', 'Users', 'admin', 'Desktop', 'lottifile', safeFilename);

    if (!existsSync(filePath)) {
      console.error("Lottie not found at path:", filePath);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const data = readFileSync(filePath, 'utf-8');
    const json = JSON.parse(data);

    return NextResponse.json(json);
  } catch (error) {
    console.error('Lottie Load Error:', error);
    return NextResponse.json({ error: 'Failed to process Lottie file' }, { status: 500 });
  }
}
