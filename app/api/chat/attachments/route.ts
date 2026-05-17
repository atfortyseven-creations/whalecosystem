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

    const publicUrl = `/api/chat/attachments?file=${uniqueFilename}`;

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('file');
    if (!filename) {
      return NextResponse.json({ error: 'Missing file parameter' }, { status: 400 });
    }

    // Secure: prevent directory traversal
    const safeFilename = path.basename(filename);
    const uploadDir = path.join(process.cwd(), 'public', 'chat-uploads');
    const filepath = path.join(uploadDir, safeFilename);

    if (!fs.existsSync(filepath)) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }

    const buffer = await fs.promises.readFile(filepath);

    // Determine precise MIME type from file extension
    const ext = path.extname(safeFilename).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.mp4') contentType = 'video/mp4';
    else if (ext === '.webm') contentType = 'video/webm';
    else if (ext === '.mov') contentType = 'video/quicktime';
    else if (ext === '.pdf') contentType = 'application/pdf';

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('[Upload] Error retrieving attachment:', error);
    return NextResponse.json({ error: 'Failed to retrieve attachment' }, { status: 500 });
  }
}

