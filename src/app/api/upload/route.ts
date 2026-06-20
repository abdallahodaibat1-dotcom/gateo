import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, stat } from 'fs/promises';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { spawn } from 'child_process';
import { auth } from '@/auth';
import { unauthorized, badRequest, serverError } from '@/lib/api-utils';

// Lazy load sharp (it's heavy)
let sharpModule: any = null;
async function getSharp() {
  if (!sharpModule) {
    sharpModule = (await import('sharp')).default;
  }
  return sharpModule;
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/avi', 'video/x-matroska'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB for reels support
const MAX_REEL_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_WIDTH = 1200;
const MAX_IMAGE_HEIGHT = 1600;
const IMAGE_QUALITY = 85;

interface UploadResult {
  url: string;
  filename: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnailUrl?: string;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const variant = formData.get('variant') as string | null; // 'post', 'avatar', 'cover'

    if (!file) {
      return badRequest('No file provided');
    }

    const isImage = IMAGE_TYPES.includes(file.type);
    const isVideo = VIDEO_TYPES.includes(file.type);
    const isReel = variant === 'reel';

    if (!isImage && !isVideo) {
      return badRequest(
        'نوع الملف غير مدعوم. الصور: JPEG, PNG, WebP, GIF. الفيديوهات: MP4, MOV, WebM'
      );
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return badRequest('حجم الصورة كبير جداً. الحد الأقصى 10 ميجابايت');
    }

    if (isVideo && isReel && file.size > MAX_REEL_SIZE) {
      return badRequest('حجم الريل كبير جداً. الحد الأقصى 100 ميجابايت');
    }

    if (isVideo && !isReel && file.size > MAX_VIDEO_SIZE) {
      return badRequest('حجم الفيديو كبير جداً. الحد الأقصى 100 ميجابايت');
    }

    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);

    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    let result: UploadResult;

    if (isImage) {
      const sharp = await getSharp();
      let sharpInstance = sharp(buffer, {
        animated: file.type === 'image/gif',
      });

      // Get original metadata
      const metadata = await sharpInstance.metadata();
      const origWidth = metadata.width || 0;
      const origHeight = metadata.height || 0;

      // Determine max dimensions based on variant (always preserve aspect ratio)
      const maxWidth =
        variant === 'avatar'
          ? 400
          : variant === 'cover'
          ? 1600
          : MAX_IMAGE_WIDTH;
      const maxHeight =
        variant === 'avatar'
          ? 400
          : variant === 'cover'
          ? 900
          : MAX_IMAGE_HEIGHT;

      // Resize if larger than the target bounding box, without cropping
      if (origWidth > maxWidth || origHeight > maxHeight) {
        sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
          withoutEnlargement: true,
          fit: 'inside',
        });
      }

      // Convert to WebP (or keep GIF animated)
      let outputBuffer: Buffer;
      let ext: string;

      if (file.type === 'image/gif') {
        outputBuffer = await sharpInstance.gif({ quality: IMAGE_QUALITY }).toBuffer();
        ext = 'gif';
      } else {
        outputBuffer = await sharpInstance.webp({ quality: IMAGE_QUALITY }).toBuffer();
        ext = 'webp';
      }

      const filename = `${timestamp}-${random}.${ext}`;
      const filePath = join(uploadsDir, filename);
      await writeFile(filePath, outputBuffer);

      const processedMeta = await sharp(outputBuffer).metadata();

      result = {
        url: `/uploads/${filename}`,
        filename,
        size: outputBuffer.length,
        type: file.type === 'image/gif' ? 'image/gif' : 'image/webp',
        width: processedMeta.width || origWidth,
        height: processedMeta.height || origHeight,
      };
    } else {
      // Video upload (regular or reel)
      const origExt = file.name.split('.').pop()?.toLowerCase() || 'mp4';
      const rawFilename = `${timestamp}-${random}-raw.${origExt}`;
      const rawPath = join(uploadsDir, rawFilename);
      await writeFile(rawPath, buffer);

      // Determine output settings based on variant
      const outFilename = `${timestamp}-${random}.mp4`;
      const outPath = join(uploadsDir, outFilename);
      const thumbFilename = `${timestamp}-${random}-thumb.jpg`;
      const thumbPath = join(uploadsDir, thumbFilename);

      // Video filter: 720p landscape for posts, 720p portrait (9:16) for reels
      const videoFilter = isReel
        ? 'scale=720:-2:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2:black'
        : 'scale=-2:720:force_original_aspect_ratio=decrease';

      await new Promise<void>((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
          '-y',
          '-i', rawPath,
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-crf', '28',
          '-maxrate', isReel ? '4M' : '2M',
          '-bufsize', isReel ? '8M' : '4M',
          '-vf', videoFilter,
          '-c:a', 'aac',
          '-b:a', '128k',
          '-movflags', '+faststart',
          '-f', 'mp4',
          outPath,
        ]);

        let stderr = '';
        ffmpeg.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        ffmpeg.on('close', async (code) => {
          if (code === 0) {
            resolve();
          } else {
            // cleanup
            try { await unlink(rawPath); } catch {}
            try { await unlink(outPath); } catch {}
            reject(new Error(`ffmpeg failed with code ${code}: ${stderr.slice(-200)}`));
          }
        });

        ffmpeg.on('error', (err) => {
          // cleanup
          try { unlink(rawPath); } catch {}
          try { unlink(outPath); } catch {}
          reject(err);
        });
      });

      // Generate thumbnail at 1s mark
      try {
        await new Promise<void>((resolve, reject) => {
          const ffmpegThumb = spawn('ffmpeg', [
            '-y',
            '-i', outPath,
            '-ss', '00:00:01.000',
            '-vframes', '1',
            '-q:v', '2',
            thumbPath,
          ]);
          ffmpegThumb.on('close', (code) => {
            if (code === 0) resolve(); else reject(new Error('thumb failed'));
          });
          ffmpegThumb.on('error', reject);
        });
      } catch {
        // thumbnail is optional
      }

      // Delete raw file
      try { await unlink(rawPath); } catch {}

      // Get video duration
      let duration = 0;
      try {
        const ffprobe = spawn('ffprobe', [
          '-v', 'error',
          '-show_entries', 'format=duration',
          '-of', 'default=noprint_wrappers=1:nokey=1',
          outPath,
        ]);
        duration = await new Promise<number>((resolve) => {
          let output = '';
          ffprobe.stdout.on('data', (d) => { output += d.toString(); });
          ffprobe.on('close', () => resolve(parseFloat(output) || 0));
        });
      } catch {}

      // Get video dimensions
      let width = 0;
      let height = 0;
      try {
        const ffprobeDim = spawn('ffprobe', [
          '-v', 'error',
          '-select_streams', 'v:0',
          '-show_entries', 'stream=width,height',
          '-of', 'csv=s=x:p=0',
          outPath,
        ]);
        const dimOutput = await new Promise<string>((resolve) => {
          let output = '';
          ffprobeDim.stdout.on('data', (d) => { output += d.toString(); });
          ffprobeDim.on('close', () => resolve(output.trim()));
        });
        const [w, h] = dimOutput.split('x').map(Number);
        width = w || 0;
        height = h || 0;
      } catch {}

      const stats = await stat(outPath).catch(() => ({ size: 0 }));
      const finalSize = stats.size || 0;

      const thumbExists = await stat(thumbPath).then(() => true).catch(() => false);

      result = {
        url: `/uploads/${outFilename}`,
        filename: outFilename,
        size: finalSize,
        type: 'video/mp4',
        width,
        height,
        duration: Math.round(duration),
        thumbnailUrl: thumbExists ? `/uploads/${thumbFilename}` : undefined,
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    return serverError(error);
  }
}
