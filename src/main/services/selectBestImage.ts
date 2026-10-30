import fs = require('node:fs/promises');
import path = require('node:path');
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import os = require('node:os');
import sharp from 'sharp';

// Configuration

const USER_AGENT = 'Mozilla/5.0 (compatible; ImageSelector/1.0)';
const CONCURRENCY = 4;

// Types

export interface SelectBestImageOptions {
    keepDir?: string;
    filename?: string;
}

export interface ImageAnalysis {
    path: string;
    url: string;
    width: number;
    height: number;
    pixels: number;
    format?: string;
    hasAlpha: boolean;
    density: number;
    fileSize: number;
    sharpness: number;
    space?: string;
}

export interface SelectBestImageResult {
    best: ImageAnalysis;
    all: ImageAnalysis[];
    keptPath: string;
}

interface DownloadResult {
    url: string;
    path: string | null;
    ok: boolean;
    error?: string;
}

// Helpers

/**
 * Converts Bluesky blob identifiers into downloadable URLs.
 *
 * Accepts either a bare blob identifier:
 *   did:plc:example123/bafkreiexample
 *
 * Or a URL ending with that identifier:
 *   https://example.com/did:plc:example123/bafkreiexample
 *
 * URLs that do not match the expected pattern are returned unchanged.
 */
export function remapBlueskyImageUrl(url: string): string {
    const match = url.match(
        /(did:plc:[a-zA-Z0-9]+)\/([^/?#]+)$/
    );

    if (!match) {
        return url;
    }

    const [, did, cid] = match;

    const endpoint = new URL(
        'https://bsky.social/xrpc/com.atproto.sync.getBlob'
    );

    endpoint.searchParams.set('did', did);
    endpoint.searchParams.set('cid', cid);

    return endpoint.toString();
}

/**
 * Downloads an image to a local file.
 */
async function downloadImage(
    url: string,
    destPath: string
): Promise<string> {
    const response = await fetch(url, {
        headers: {
            'User-Agent': USER_AGENT
        },
        redirect: 'follow'
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
    }

    const contentType =
        response.headers.get('content-type') || '';

    if (!contentType.startsWith('image/')) {
        throw new Error(`Not an image: ${contentType}`);
    }

    if (!response.body) {
        throw new Error(`Empty response body for ${url}`);
    }

    await pipeline(
        Readable.fromWeb(response.body as any),
        createWriteStream(destPath)
    );

    return destPath;
}

/**
 * Analyzes an image's dimensions, file size, format, and sharpness.
 */
async function analyzeImage(
    filePath: string
): Promise<Omit<ImageAnalysis, 'url'>> {
    const stat = await fs.stat(filePath);
    const meta = await sharp(filePath).metadata();

    // Convert the image to grayscale for sharpness analysis.
    const { data, info } = await sharp(filePath)
        .greyscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const width = info.width;
    const height = info.height;

    let sum = 0;
    let sumSq = 0;
    let count = 0;

    // Sample every other pixel to reduce computation.
    for (let y = 1; y < height - 1; y += 2) {
        for (let x = 1; x < width - 1; x += 2) {
            const i = y * width + x;

            // Laplacian kernel.
            const lap =
                -data[i - width - 1] -
                data[i - width] -
                data[i - width + 1] -
                data[i - 1] +
                8 * data[i] -
                data[i + 1] -
                data[i + width - 1] -
                data[i + width] -
                data[i + width + 1];

            sum += lap;
            sumSq += lap * lap;
            count++;
        }
    }

    const mean = count > 0 ? sum / count : 0;

    const variance =
        count > 0
            ? sumSq / count - mean * mean
            : 0;

    const sharpness = Math.max(0, variance);

    const imageWidth = meta.width ?? 0;
    const imageHeight = meta.height ?? 0;

    return {
        path: filePath,
        width: imageWidth,
        height: imageHeight,
        pixels: imageWidth * imageHeight,
        format: meta.format,
        hasAlpha: !!meta.hasAlpha,
        density: meta.density ?? 0,
        fileSize: stat.size,
        sharpness,
        space: meta.space
    };
}

/**
 * Calculates a ranking score for an image.
 * Higher scores are considered better.
 */
function score(img: ImageAnalysis): number {
    const formatBonus: Record<string, number> = {
        png: 1.15,
        webp: 1.1,
        avif: 1.12,
        tiff: 1.1,
        jpeg: 1.0,
        jpg: 1.0
    };

    const format = img.format
        ? formatBonus[img.format] ?? 1.0
        : 1.0;

    return (
        img.pixels +
        img.sharpness * 50 +
        img.fileSize * 0.00001 * format
    );
}

/**
 * Runs asynchronous tasks with a maximum concurrency limit.
 */
async function mapLimit<T, R>(
    items: T[],
    limit: number,
    fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let nextIndex = 0;

    async function worker(): Promise<void> {
        while (true) {
            const index = nextIndex++;

            if (index >= items.length) {
                return;
            }

            results[index] = await fn(items[index], index);
        }
    }

    const workerCount = Math.min(
        limit,
        items.length
    );

    await Promise.all(
        Array.from(
            { length: workerCount },
            () => worker()
        )
    );

    return results;
}

// Main function

/**
 * Downloads, analyzes, and ranks images from a list of URLs.
 *
 * The highest-ranked image is copied into the destination directory.
 * By default, the destination is the current working directory.
 *
 * Bluesky blob identifiers are automatically remapped before downloading.
 *
 * @param urls URLs or Bluesky blob identifiers to evaluate.
 * @param options Optional output directory and filename.
 * @returns The best image, all ranked candidates, and the final file path.
 */
export async function selectBestImage(
    urls: string[],
    options: SelectBestImageOptions = {}
): Promise<SelectBestImageResult> {
    const {
        keepDir = process.cwd(),
        filename = 'best-image'
    } = options;

    if (urls.length === 0) {
        throw new Error('At least one image URL is required');
    }

    // Normalize Bluesky blob identifiers and URLs.
    const normalizedUrls = urls.map(remapBlueskyImageUrl);

    // Create a unique temporary directory for this invocation.
    const downloadDir = await fs.mkdtemp(
        path.join(os.tmpdir(), 'img-select-')
    );

    try {
        console.log(
            `Downloading ${normalizedUrls.length} images...`
        );

        // Download images concurrently.
        const downloads = await mapLimit(
            normalizedUrls,
            CONCURRENCY,
            async (
                url,
                index
            ): Promise<DownloadResult> => {
                let ext = '.img';

                try {
                    ext =
                        path.extname(new URL(url).pathname) ||
                        '.img';
                } catch {
                    // Leave the default extension in place.
                }

                const dest = path.join(
                    downloadDir,
                    `img-${index}${ext}`
                );

                try {
                    await downloadImage(url, dest);

                    return {
                        url,
                        path: dest,
                        ok: true
                    };
                } catch (error: unknown) {
                    const message =
                        error instanceof Error
                            ? error.message
                            : String(error);

                    console.warn(
                        `Failed ${url}: ${message}`
                    );

                    return {
                        url,
                        path: null,
                        ok: false,
                        error: message
                    };
                }
            }
        );

        const validDownloads = downloads.filter(
            (
                download
            ): download is DownloadResult & {
                path: string;
            } => download.ok && download.path !== null
        );

        if (validDownloads.length === 0) {
            throw new Error(
                'No images downloaded successfully'
            );
        }

        console.log('Analyzing...');

        // Analyze the downloaded images.
        const analyses = await Promise.all(
            validDownloads.map(
                async (download): Promise<ImageAnalysis | null> => {
                    try {
                        const analysis = await analyzeImage(
                            download.path
                        );

                        return {
                            ...analysis,
                            url: download.url
                        };
                    } catch (error: unknown) {
                        const message =
                            error instanceof Error
                                ? error.message
                                : String(error);

                        console.warn(
                            `Analyze failed ${download.path}: ${message}`
                        );

                        return null;
                    }
                }
            )
        );

        const candidates = analyses.filter(
            (analysis): analysis is ImageAnalysis =>
                analysis !== null
        );

        if (candidates.length === 0) {
            throw new Error(
                'No valid images after analysis'
            );
        }

        // Rank candidates from best to worst.
        candidates.sort(
            (a, b) => score(b) - score(a)
        );

        const best = candidates[0];

        console.log('\nRanking (best first):');

        candidates.forEach((candidate, index) => {
            console.log(
                `${index + 1}. ` +
                `${candidate.width}x${candidate.height} ` +
                `${candidate.format ?? 'unknown'} ` +
                `${(candidate.fileSize / 1024).toFixed(1)} KB ` +
                `sharpness≈${candidate.sharpness.toFixed(0)} ` +
                `→ ${candidate.url.slice(0, 60)}...`
            );
        });

        // Determine the output extension from the actual image format.
        const finalExt = best.format
            ? `.${best.format}`
            : path.extname(best.path) || '.img';

        const finalPath = path.join(
            keepDir,
            `${filename}${finalExt}`
        );

        // Ensure the destination directory exists.
        await fs.mkdir(keepDir, { recursive: true });

        // Copy the winning image to its final location.
        await fs.copyFile(best.path, finalPath);

        console.log(`\nKept: ${finalPath}`);

        return {
            best,
            all: candidates,
            keptPath: finalPath
        };
    } finally {
        // Clean up temporary downloads, including on failure.
        await fs.rm(downloadDir, {
            recursive: true,
            force: true
        });
    }
}

// CommonJS exports

module.exports = {
    selectBestImage,
    remapBlueskyImageUrl
};