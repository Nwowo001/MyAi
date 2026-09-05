/**
 * @fileoverview File & Image Upload Controller.
 *
 * Handles uploading product images to Supabase Storage and returning public CDN URLs.
 */

import type { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/index.js';
import { logger } from '../utils/logger.js';
import crypto from 'node:crypto';

const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const BUCKET_NAME = 'offerings';
let bucketEnsured = false;

async function ensureBucket() {
  if (bucketEnsured) return;
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === BUCKET_NAME);
    if (!exists) {
      await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'],
      });
    }
    bucketEnsured = true;
  } catch (err) {
    logger.warn({ err }, 'Could not ensure offerings storage bucket');
  }
}

export async function uploadImage(req: Request, res: Response): Promise<void> {
  const { data, filename } = req.body as { data?: string; filename?: string };

  if (!data || typeof data !== 'string') {
    res.status(400).json({ error: 'data (Base64 data URL) is required' });
    return;
  }

  try {
    await ensureBucket();

    // Match data URI e.g. data:image/png;base64,iVBORw0KGgo...
    const matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let mimeType = 'image/jpeg';
    let ext = 'jpg';

    if (matches && matches[1] && matches[2]) {
      mimeType = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
      ext = mimeType.split('/')[1] ?? 'jpg';
      if (ext === 'jpeg') ext = 'jpg';
    } else {
      // Direct base64 string
      buffer = Buffer.from(data, 'base64');
    }

    const uniqueId = crypto.randomUUID();
    const safeName = filename
      ? filename.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase()
      : `image_${Date.now()}.${ext}`;
    const storagePath = `products/${uniqueId}_${safeName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      logger.error({ err: uploadError }, 'Supabase Storage upload error');
      // If Supabase Storage is not set up on user's project, return the data URL directly so it works seamlessly
      res.json({
        success: true,
        url: data,
        fallback: true,
      });
      return;
    }

    const { data: publicData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    logger.info({ path: storagePath, url: publicData.publicUrl }, 'Product image uploaded');

    res.json({
      success: true,
      url: publicData.publicUrl,
    });
  } catch (err) {
    logger.error({ err }, 'Image upload failed');
    res.status(500).json({ error: 'Failed to upload image' });
  }
}
