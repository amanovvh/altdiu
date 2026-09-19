import 'server-only';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomBytes } from 'node:crypto';

/**
 * Cloudflare R2 storage driver.
 *
 * R2 is S3-compatible — we use the official AWS SDK with the R2 endpoint.
 * Files are public via the bucket's public dev URL (set up in R2 dashboard)
 * or via a custom domain (e.g. `cdn.lyceum.uz`).
 *
 * The public URL returned here is what we store as `publicId` in the DB,
 * so `buildCloudinaryUrl()` can detect the absolute URL and pass it through
 * unchanged.
 */

export interface R2UploadResult {
  publicId: string;
  url: string;
  bytes: number;
  format: string;
}

interface R2Config {
  client: S3Client;
  bucket: string;
  publicBase: string;
}

function getConfig(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const publicBase = process.env.R2_PUBLIC_BASE_URL;

  if (
    !accountId ||
    !accessKeyId ||
    !secretAccessKey ||
    !bucket ||
    !publicBase ||
    accountId.startsWith('your_') ||
    accessKeyId.startsWith('your_')
  ) {
    return null;
  }

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  return { client, bucket, publicBase: publicBase.replace(/\/$/, '') };
}

function sanitizeFolder(folder?: string): string {
  if (!folder) return 'misc';
  return folder
    .replace(/^[\\/]+/, '')
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9/_-]/g, '_')
    .toLowerCase();
}

function pickExtension(mime: string, fallback = 'bin'): string {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/avif':
      return 'avif';
    case 'image/gif':
      return 'gif';
    default:
      return fallback;
  }
}

/**
 * Upload a buffer to R2. Returns the public URL which we use as `publicId`.
 *
 * The returned `publicId` is an absolute URL (e.g. `https://cdn.example.com/
 * lyceum/news/abc.jpg`), so `buildCloudinaryUrl()` returns it as-is.
 */
export async function saveBufferToR2(
  buffer: Buffer,
  options: { folder?: string; mime: string }
): Promise<R2UploadResult> {
  const cfg = getConfig();
  if (!cfg) {
    throw new Error(
      'Cloudflare R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_BASE_URL.'
    );
  }

  const folder = sanitizeFolder(options.folder);
  const ext = pickExtension(options.mime);
  const id = randomBytes(12).toString('hex');
  const key = `${folder}/${id}.${ext}`;

  await cfg.client.send(
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      Body: buffer,
      ContentType: options.mime,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  const url = `${cfg.publicBase}/${key}`;
  return {
    publicId: url,
    url,
    bytes: buffer.length,
    format: ext,
  };
}

/**
 * Generate a presigned PUT URL so the browser can upload directly to R2,
 * bypassing the Next.js server for large files. (Optional future use.)
 */
export async function presignPutUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 600
): Promise<string> {
  const cfg = getConfig();
  if (!cfg) {
    throw new Error('R2 is not configured');
  }
  const command = new PutObjectCommand({
    Bucket: cfg.bucket,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(cfg.client, command, { expiresIn: expiresInSeconds });
}