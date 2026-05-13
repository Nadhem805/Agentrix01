import fs   from 'node:fs'
import path from 'node:path'
import { app } from 'electron'
import { randomUUID } from 'node:crypto'

/**
 * Returns the workspace media directory, creating it if it doesn't exist.
 */
export function getMediaDir(workspaceId: string): string {
  const base = path.join(app.getPath('userData'), 'media', workspaceId)
  fs.mkdirSync(base, { recursive: true })
  return base
}

/**
 * Copies a file from sourcePath into the workspace media directory.
 * Returns the new absolute path.
 */
export function saveMediaFile(workspaceId: string, sourcePath: string): string {
  const dir  = getMediaDir(workspaceId)
  const ext  = path.extname(sourcePath)
  const dest = path.join(dir, `${randomUUID()}${ext}`)
  fs.copyFileSync(sourcePath, dest)
  return dest
}

/**
 * Deletes a media file from disk.
 */
export function deleteMediaFile(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
}

/**
 * Returns basic file metadata (size, mime guess) for a given path.
 */
export function getFileMetadata(filePath: string): {
  fileName: string
  fileSizeBytes: number
  mimeType: string
} {
  const stat     = fs.statSync(filePath)
  const fileName = path.basename(filePath)
  const ext      = path.extname(filePath).toLowerCase()

  const mimeMap: Record<string, string> = {
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png':  'image/png',
    '.webp': 'image/webp',
    '.gif':  'image/gif',
    '.mp4':  'video/mp4',
    '.mov':  'video/quicktime',
    '.avi':  'video/x-msvideo',
    '.webm': 'video/webm',
  }

  return {
    fileName,
    fileSizeBytes: stat.size,
    mimeType: mimeMap[ext] ?? 'application/octet-stream',
  }
}
