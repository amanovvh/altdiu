import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

export const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'lyceum';

// Re-export client-safe URL builder (does NOT pull in the Node SDK).
export { buildCloudinaryUrl } from './cloudinary-url';

export interface UploadResult {
  publicId: string;
  url: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

/**
 * Upload a file buffer or remote URL to Cloudinary.
 */
export async function uploadToCloudinary(
  source: string | Buffer,
  options: {
    folder?: string;
    publicId?: string;
    tags?: string[];
    transformation?: Record<string, unknown>;
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
  } = {}
): Promise<UploadResult> {
  const uploadOptions: Record<string, unknown> = {
    folder: options.folder || CLOUDINARY_FOLDER,
    tags: options.tags,
    resource_type: options.resourceType || 'image',
    unique_filename: true,
    overwrite: false,
    transformation: options.transformation,
  };

  if (options.publicId) {
    uploadOptions.public_id = options.publicId;
  }

  const result = await cloudinary.uploader.upload(source as string, uploadOptions);

  return {
    publicId: result.public_id,
    url: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

/**
 * Delete a Cloudinary asset by public_id.
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { invalidate: true });
}

/**
 * Validate a file before uploading.
 * Returns null on success or an error message.
 */
export function validateImageFile(file: {
  size?: number;
  mimeType?: string;
  name?: string;
}): string | null {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size && file.size > MAX_SIZE) {
    return 'Файл слишком большой. Максимум 10 МБ.';
  }
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
  if (file.mimeType && !allowed.includes(file.mimeType)) {
    return 'Недопустимый формат файла. Разрешены: JPG, PNG, WEBP, AVIF, GIF.';
  }
  return null;
}