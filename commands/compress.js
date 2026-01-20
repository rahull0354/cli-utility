import { createReadStream, createWriteStream } from 'fs';
import { createGzip, createUnzip } from 'zlib';
import { promises as fs } from 'fs';
import path from 'path';
import logger from '../utils/logger.js';
import { fileExists, getFileSize, formatFileSize } from '../utils/helpers.js';

export async function compressCommand(filePath) {
  // Validate that file path was provided
  if (!filePath) {
    logger.error('Please provide a file to compress.');
    logger.info('Usage: node index.js compress <filename>');
    return;
  }

  // Check if the file exists
  if (!fileExists(filePath)) {
    logger.error(`File not found: ${filePath}`);
    return;
  }

  // Create output file path by adding .gz extension
  const outputPath = `${filePath}.gz`;

  // Check if output file already exists
  if (fileExists(outputPath)) {
    logger.warning(`Output file already exists: ${outputPath}`);
    logger.info('The existing file will be overwritten.');
  }

  try {
    // Get original file size for comparison
    const originalSize = await getFileSize(filePath);

    logger.info(`Compressing: ${filePath}`);

    // Create streams:
    // - readStream: Reads the input file
    // - gzip: Compresses the data using gzip algorithm
    // - writeStream: Writes the compressed data to output file
    const readStream = createReadStream(filePath);
    const writeStream = createWriteStream(outputPath);
    const gzip = createGzip();

    // Use promises to handle stream completion
    // We need to wait for the write stream to finish
    await new Promise((resolve, reject) => {
      // Pipe the streams together:
      // readStream -> gzip -> writeStream
      readStream
        .pipe(gzip)
        .pipe(writeStream)
        .on('finish', resolve)  // Called when writing is complete
        .on('error', reject);   // Called if an error occurs

      // Handle errors on the read stream
      readStream.on('error', reject);
      // Handle errors on the gzip stream
      gzip.on('error', reject);
    });

    // Get compressed file size
    const compressedSize = await getFileSize(outputPath);
    const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(2);

    logger.success('Compression complete!');
    logger.log(`Original:    ${formatFileSize(originalSize)} (${filePath})`);
    logger.log(`Compressed:  ${formatFileSize(compressedSize)} (${outputPath})`);
    logger.log(`Saved:       ${compressionRatio}%`);

  } catch (err) {
    logger.error(`Compression failed: ${err.message}`);
  }
}

export async function decompressCommand(filePath) {
  // Validate that file path was provided
  if (!filePath) {
    logger.error('Please provide a file to decompress.');
    logger.info('Usage: node index.js decompress <filename.gz>');
    return;
  }

  // Check if the file exists
  if (!fileExists(filePath)) {
    logger.error(`File not found: ${filePath}`);
    return;
  }

  // Validate that the file has .gz extension
  if (!filePath.endsWith('.gz')) {
    logger.warning('File does not have a .gz extension.');
    logger.info('Attempting to decompress anyway...');
  }

  // Create output file path by removing .gz extension
  let outputPath = filePath.endsWith('.gz') ? filePath.slice(0, -3) : filePath;

  // If original file exists, append .decompressed to avoid overwriting
  if (fileExists(outputPath)) {
    outputPath = `${outputPath}.decompressed`;
    logger.warning(`Original file exists. Using: ${outputPath}`);
  }

  try {
    logger.info(`Decompressing: ${filePath}`);

    // Create streams:
    // - readStream: Reads the compressed file
    // - unzip: Decompresses the data
    // - writeStream: Writes the decompressed data to output file
    const readStream = createReadStream(filePath);
    const writeStream = createWriteStream(outputPath);
    const unzip = createUnzip();

    // Use promises to handle stream completion
    await new Promise((resolve, reject) => {
      // Pipe the streams together:
      // readStream -> unzip -> writeStream
      readStream
        .pipe(unzip)
        .pipe(writeStream)
        .on('finish', resolve)   // Called when writing is complete
        .on('error', reject);    // Called if an error occurs

      // Handle errors on the read stream
      readStream.on('error', reject);
      // Handle errors on the unzip stream
      unzip.on('error', reject);
    });

    // Get decompressed file size
    const decompressedSize = await getFileSize(outputPath);

    logger.success('Decompression complete!');
    logger.log(`Output file: ${outputPath}`);
    logger.log(`Size:        ${formatFileSize(decompressedSize)}`);

  } catch (err) {
    // If the error is about invalid gzip data, provide helpful message
    if (err.code === 'Z_DATA_ERROR') {
      logger.error('Invalid gzip file. The file may be corrupted.');
    } else {
      logger.error(`Decompression failed: ${err.message}`);
    }
  }
}

export async function infoCommand(filePath) {
  if (!filePath) {
    logger.error('Please provide a file path.');
    logger.info('Usage: node index.js compress-info <filename>');
    return;
  }

  if (!fileExists(filePath)) {
    logger.error(`File not found: ${filePath}`);
    return;
  }

  try {
    const stats = await fs.stat(filePath);
    const size = formatFileSize(stats.size);

    logger.header('File Information');
    logger.log(`Path:        ${filePath}`);
    logger.log(`Size:        ${size}`);
    logger.log(`Type:        ${filePath.endsWith('.gz') ? 'Compressed (gzip)' : 'Regular'}`);
    logger.log(`Modified:    ${stats.mtime.toLocaleString()}`);

  } catch (err) {
    logger.error(`Failed to get file info: ${err.message}`);
  }
}

export function registerCompressCommands(program) {
  // Compress command
  program
    .command('compress <filename>')
    .description('Compress a file to .gz format')
    .action(compressCommand);

  // Decompress command
  program
    .command('decompress <filename>')
    .description('Decompress a .gz file')
    .action(decompressCommand);

  // File info command
  program
    .command('compress-info <filename>')
    .description('Show information about a file')
    .action(infoCommand);
}