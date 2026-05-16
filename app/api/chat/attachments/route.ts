import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename while preserving extension
    const originalName = file.name || 'attachment';
    const ext = path.extname(originalName) || '';
    const hash = crypto.randomUUID().slice(0, 8);
    const uniqueFilename = `${hash}-${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Define public upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'chat-uploads');
    
    // Ensure directory exists synchronously/safely
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, uniqueFilename);
    await fs.promises.writeFile(filepath, buffer);

    const publicUrl = `/chat-uploads/${uniqueFilename}`;

    return NextResponse.json({
      url: publicUrl,
      name: originalName,
      type: file.type || 'application/octet-stream',
      size: buffer.length
    });

  } catch (error: any) {
    console.error('[Upload] Error processing attachment:', error);
    return NextResponse.json({ error: 'Failed to process attachment' }, { status: 500 });
  }
}
