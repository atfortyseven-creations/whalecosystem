import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'NO SECURE DOCUMENT PROVIDED' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Cryptographic Hashing for Zero-Collision & Integrity
    const hash = createHash('sha256').update(buffer).digest('hex');
    const extension = file.name.split('.').pop() || 'bin';
    const secureFileName = `${hash.substring(0, 16)}.${extension}`;

    // Define Vault Path
    const vaultDir = join(process.cwd(), 'public', 'uploads', 'secure_vault');
    const filePath = join(vaultDir, secureFileName);

    // Ensure directory exists
    try {
      await mkdir(vaultDir, { recursive: true });
    } catch (e) {
      console.error('[VAULT] Could not create directory', e);
    }

    // Persist File
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/secure_vault/${secureFileName}`,
      hash: hash,
      fileName: file.name
    });

  } catch (error) {
    console.error('[VAULT] Ingestion Error:', error);
    return NextResponse.json({ error: 'VAULT INGESTION FAILED' }, { status: 500 });
  }
}
