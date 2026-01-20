import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import path from 'path';

export function fileExists(filePath) {
  try {
    return existsSync(filePath);
  } catch (err) {
    return false;
  }
}

export async function readFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (err) {
    throw new Error(`Failed to read file: ${err.message}`);
  }
}

export async function writeFile(filePath, content) {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (err) {
    throw new Error(`Failed to write file: ${err.message}`);
  }
}

export function getFileExtension(filePath) {
  return path.extname(filePath);
}

export function getBaseName(filePath) {
  return path.basename(filePath, path.extname(filePath));
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (err) {
    throw new Error(`Failed to get file size: ${err.message}`);
  }
}

export async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (err) {
    throw new Error(`Failed to delete file: ${err.message}`);
  }
}