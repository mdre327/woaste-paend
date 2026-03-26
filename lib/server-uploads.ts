import { promises as fs } from "node:fs";
import path from "node:path";

const uploadsDirectory = path.join(process.cwd(), "public", "uploads", "events");
const publicUploadsPath = "/uploads/events";

const allowedImageTypes = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/svg+xml",
  "image/webp",
]);

const mimeTypeToExtension: Record<string, string> = {
  "image/avif": ".avif",
  "image/gif": ".gif",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/svg+xml": ".svg",
  "image/webp": ".webp",
};

const sanitizeBaseName = (value: string) => {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "event-image";
};

const getFileExtension = (file: File) => {
  const originalExtension = path.extname(file.name).toLowerCase();

  if (originalExtension) {
    return originalExtension;
  }

  return mimeTypeToExtension[file.type] ?? ".png";
};

const ensureUploadsDirectory = async () => {
  await fs.mkdir(uploadsDirectory, { recursive: true });
};

export const saveUploadedEventImages = async (files: File[]) => {
  await ensureUploadsDirectory();

  const uploadedPaths = await Promise.all(
    files.map(async (file) => {
      if (!allowedImageTypes.has(file.type)) {
        throw new Error("Unsupported image type");
      }

      const extension = getFileExtension(file);
      const fileName = `${Date.now()}-${crypto.randomUUID()}-${sanitizeBaseName(
        path.basename(file.name, extension),
      )}${extension}`;
      const filePath = path.join(uploadsDirectory, fileName);
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      await fs.writeFile(filePath, fileBuffer);

      return `${publicUploadsPath}/${fileName}`;
    }),
  );

  return uploadedPaths;
};
