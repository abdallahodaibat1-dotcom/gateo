/**
 * Client-side media compression utilities.
 *
 * Images are resized/compressed in the browser before upload so users don't
 * hit size limits. Videos are left mostly untouched because browser-based
 * video compression is limited; the server handles video transcoding with
 * FFmpeg after upload.
 */

export interface ImageCompressionOptions {
  /** Maximum width in pixels. */
  maxWidth?: number;
  /** Maximum height in pixels. */
  maxHeight?: number;
  /** JPEG/WebP quality between 0 and 1. */
  quality?: number;
  /** Target maximum file size in bytes. The utility will lower quality to try to fit. */
  maxSizeBytes?: number;
  /** Output MIME type. Defaults to image/webp with JPEG fallback. */
  outputType?: 'image/webp' | 'image/jpeg' | 'image/png';
}

const DEFAULT_IMAGE_OPTIONS: Required<
  Pick<ImageCompressionOptions, 'maxWidth' | 'maxHeight' | 'quality'>
> = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.85,
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('فشل تحميل الصورة'));
    };
    img.src = URL.createObjectURL(file);
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

function computeDimensions(
  origWidth: number,
  origHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = origWidth;
  let height = origHeight;

  if (width > maxWidth || height > maxHeight) {
    const widthRatio = maxWidth / width;
    const heightRatio = maxHeight / height;
    const ratio = Math.min(widthRatio, heightRatio);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  return { width, height };
}

function blobToFile(blob: Blob, name: string, type: string): File {
  return new File([blob], name, { type });
}

/**
 * Compress/resize an image file in the browser.
 * Returns a new File. Aspect ratio is always preserved.
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<File> {
  const maxWidth = options.maxWidth ?? DEFAULT_IMAGE_OPTIONS.maxWidth;
  const maxHeight = options.maxHeight ?? DEFAULT_IMAGE_OPTIONS.maxHeight;
  let quality = options.quality ?? DEFAULT_IMAGE_OPTIONS.quality;
  const maxSizeBytes = options.maxSizeBytes;
  const requestedType = options.outputType;

  if (!file.type.startsWith('image/')) {
    throw new Error('الملف ليس صورة');
  }

  // SVGs and very small images don't need compression.
  if (file.type === 'image/svg+xml' || file.size < 200 * 1024) {
    return file;
  }

  const img = await loadImage(file);
  const { width, height } = computeDimensions(
    img.naturalWidth,
    img.naturalHeight,
    maxWidth,
    maxHeight
  );

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('فشل إنشاء سياق الرسم');
  }

  // Avoid iOS canvas memory issues by clearing before draw.
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const outputType =
    requestedType ??
    (canvas.toDataURL('image/webp').startsWith('data:image/webp') && file.type !== 'image/gif'
      ? 'image/webp'
      : 'image/jpeg');

  let blob = await canvasToBlob(canvas, outputType, quality);

  // If a max size is requested, reduce quality until we fit (or hit minimum quality).
  if (maxSizeBytes && blob && blob.size > maxSizeBytes) {
    const minQuality = 0.4;
    let attempts = 0;
    while (blob && blob.size > maxSizeBytes && quality > minQuality && attempts < 6) {
      quality = Math.max(minQuality, quality - 0.1);
      const newBlob = await canvasToBlob(canvas, outputType, quality);
      if (!newBlob) break;
      blob = newBlob;
      attempts++;
    }
  }

  if (!blob) {
    throw new Error('فشل ضغط الصورة');
  }

  const extension = outputType === 'image/png' ? 'png' : outputType === 'image/webp' ? 'webp' : 'jpg';
  const fileName = file.name.replace(/\.[^/.]+$/, '') + `.${extension}`;
  return blobToFile(blob, fileName, outputType);
}

/**
 * Quick check: should this image be compressed before upload?
 */
export function shouldCompressImage(file: File, thresholdBytes = 1024 * 1024): boolean {
  return file.type.startsWith('image/') && file.size > thresholdBytes;
}

export interface VideoCompressionOptions {
  /** Target maximum width in pixels. */
  maxWidth?: number;
  /** Target maximum height in pixels. */
  maxHeight?: number;
  /** Constant rate factor (quality). Lower is better quality. Default 28. */
  crf?: number;
  /** Max video bitrate, e.g. '2M' for posts, '4M' for reels. */
  maxRate?: string;
  /** Audio bitrate, e.g. '128k'. */
  audioBitrate?: string;
  /** True for portrait 9:16 reels output. */
  isReel?: boolean;
  /** Optional callback for compression progress (0-1). */
  onProgress?: (progress: number) => void;
}

let ffmpegInstance: any = null;
let ffmpegLoadingPromise: Promise<any> | null = null;

async function getFFmpeg(): Promise<any> {
  if (ffmpegInstance) return ffmpegInstance;
  if (ffmpegLoadingPromise) return ffmpegLoadingPromise;

  ffmpegLoadingPromise = (async () => {
    const [{ FFmpeg }, { fetchFile, toBlobURL }] = await Promise.all([
      import('@ffmpeg/ffmpeg'),
      import('@ffmpeg/util'),
    ]);
    const ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    ffmpegInstance = ffmpeg;
    return ffmpeg;
  })();

  return ffmpegLoadingPromise;
}

function getVideoExtension(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext && ['mp4', 'mov', 'webm', 'avi', 'mkv'].includes(ext)) return ext;
  return 'mp4';
}

/**
 * Compress/resize a video file in the browser using FFmpeg.
 * Returns an MP4 file. Falls back to the original file if FFmpeg fails.
 */
export async function compressVideo(
  file: File,
  options: VideoCompressionOptions = {}
): Promise<File> {
  if (!file.type.startsWith('video/')) {
    throw new Error('الملف ليس فيديو');
  }

  // Skip browser-side compression for MP4 files under the server limit.
  // Server-side remuxing/transcoding with native ffmpeg is much faster than
  // FFmpeg.wasm in the browser, and it avoids long waits before upload.
  const SERVER_MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
  if (file.type === 'video/mp4' && file.size <= SERVER_MAX_VIDEO_SIZE) {
    return file;
  }

  const {
    maxWidth = 1280,
    maxHeight = 1280,
    crf = 28,
    maxRate = '2M',
    audioBitrate = '128k',
    isReel = false,
    onProgress,
  } = options;

  const ffmpeg = await getFFmpeg();
  const inputExt = getVideoExtension(file);
  const inputName = `input-${Date.now()}.${inputExt}`;
  const outputName = `output-${Date.now()}.mp4`;

  const progressCallback = ({ progress }: { progress: number }) => {
    onProgress?.(Math.min(1, Math.max(0, progress)));
  };
  ffmpeg.on('progress', progressCallback);

  try {
    const { fetchFile } = await import('@ffmpeg/util');
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    const scaleFilter = isReel
      ? `scale=${maxWidth}:-2:force_original_aspect_ratio=decrease,pad=${maxWidth}:${maxHeight}:(ow-iw)/2:(oh-ih)/2:black`
      : `scale=-2:${maxHeight}:force_original_aspect_ratio=decrease`;

    await ffmpeg.exec([
      '-y',
      '-i', inputName,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', String(crf),
      '-maxrate', maxRate,
      '-bufsize', String(parseInt(maxRate) * 2) + 'M',
      '-vf', scaleFilter,
      '-c:a', 'aac',
      '-b:a', audioBitrate,
      '-movflags', '+faststart',
      '-f', 'mp4',
      outputName,
    ]);

    const data = await ffmpeg.readFile(outputName);
    const blob = new Blob([data], { type: 'video/mp4' });
    const outputFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.mp4', {
      type: 'video/mp4',
    });

    // Cleanup
    try { await ffmpeg.deleteFile(inputName); } catch {}
    try { await ffmpeg.deleteFile(outputName); } catch {}

    return outputFile;
  } catch (err) {
    // Cleanup on failure
    try { await ffmpeg.deleteFile(inputName); } catch {}
    try { await ffmpeg.deleteFile(outputName); } catch {}
    console.warn('Browser video compression failed, falling back to original:', err);
    return file;
  } finally {
    ffmpeg.off('progress', progressCallback);
  }
}

/**
 * Generic helper: compress a file based on its type.
 */
export async function compressMedia(
  file: File,
  options?: ImageCompressionOptions & VideoCompressionOptions
): Promise<File> {
  if (file.type.startsWith('image/')) {
    return compressImage(file, options);
  }
  if (file.type.startsWith('video/')) {
    return compressVideo(file, options);
  }
  return file;
}
