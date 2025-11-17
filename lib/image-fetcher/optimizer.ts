import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

export type OptimizeOptions = {
  maxSize?: number;
  quality?: number;
};

export type OptimizationResult = {
  width?: number;
  height?: number;
  size: number;
  destination: string;
};

export const getImageMetadata = async (buffer: Buffer) => {
  const image = sharp(buffer);
  const metadata = await image.metadata();
  return metadata;
};

export const validateImageDimensions = (
  width?: number,
  height?: number,
  min = 400
) => {
  if (width == null || height == null) return false;
  return width >= min && height >= min;
};

export const optimizeAndSave = async (
  buffer: Buffer,
  destination: string,
  options: OptimizeOptions = {}
): Promise<OptimizationResult> => {
  const maxSize = options.maxSize ?? 800;
  const quality = options.quality ?? 82;

  const resolvedDestination = path.resolve(destination);
  await fs.promises.mkdir(path.dirname(resolvedDestination), {
    recursive: true,
  });

  const pipeline = sharp(buffer)
    .rotate()
    .resize({
      width: maxSize,
      height: maxSize,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({
      quality,
      progressive: true,
      chromaSubsampling: "4:4:4",
    });

  const { width, height, size } = await pipeline.toFile(resolvedDestination);
  return {
    width,
    height,
    size,
    destination: resolvedDestination,
  };
};
