import {app} from 'electron'
import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs/promises';

interface DownloadedImage {
    path: string,
    format: string,
    extension: string,
    width: number,
    height: number
}

const DEFAULT_DOWNLOAD_LOCATION = app.getPath('downloads')

export async function downloadImage(
    url: string,
    fileName: string,
    outputDirectory: string = DEFAULT_DOWNLOAD_LOCATION,
): Promise<DownloadedImage> {

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Image download failed: HTTP ${response.status}`)

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length === 0) throw new Error('The downloaded file is empty.')
    
    let metadata: sharp.Metadata;

    try {
        metadata = await sharp(buffer).metadata();
    } catch (error) {
        throw new Error('The downloaded data is not a supported image.')
    }

    if (!metadata.format || !metadata.width || !metadata.height) {
        throw new Error('Could not determine the image format or dimensions.')
    }

    const extensions: Record<string, string> = {
        jpeg: '.jpg',
        png: '.png',
        webp: '.webp',
        gif: '.gif',
        avif: '.avif',
        tiff: '.tiff',
        heif: '.heif'
    };

    const extension = extensions[metadata.format]
    if (!extension) throw new Error(`Unsupported image format: ${metadata.format}`)

    await fs.mkdir(outputDirectory, {recursive: true})

    const outputPath = path.join(
        outputDirectory,
        `${path.basename(fileName, path.extname(fileName))}${extension}`
    )

    await fs.writeFile(outputPath, buffer);

    return {
        path: outputPath,
        format: metadata.format,
        extension,
        width: metadata.width,
        height: metadata.height
    }
}