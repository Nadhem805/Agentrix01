import type { MediaAsset, SocialPlatform } from '@/types/post'

interface MediaConstraints {
  maxSizeBytes: number
  allowedTypes: string[]
  maxDurationSeconds?: number
}

interface PlatformConstraints {
  image: MediaConstraints
  video: MediaConstraints
}

const PLATFORM_CONSTRAINTS: Record<SocialPlatform, PlatformConstraints> = {
  instagram: {
    image: { maxSizeBytes: 8_388_608,    allowedTypes: ['image/jpeg', 'image/png'] },
    video: { maxSizeBytes: 104_857_600,  allowedTypes: ['video/mp4'], maxDurationSeconds: 60 },
  },
  tiktok: {
    image: { maxSizeBytes: 10_485_760,   allowedTypes: ['image/jpeg', 'image/png'] },
    video: { maxSizeBytes: 524_288_000,  allowedTypes: ['video/mp4'], maxDurationSeconds: 600 },
  },
  twitter: {
    image: { maxSizeBytes: 5_242_880,    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'] },
    video: { maxSizeBytes: 536_870_912,  allowedTypes: ['video/mp4'], maxDurationSeconds: 140 },
  },
  youtube: {
    image: { maxSizeBytes: 10_485_760,   allowedTypes: ['image/jpeg', 'image/png'] },
    video: { maxSizeBytes: 137_438_953_472, allowedTypes: ['video/mp4', 'video/mov'], maxDurationSeconds: 43200 },
  },
  linkedin: {
    image: { maxSizeBytes: 10_485_760,   allowedTypes: ['image/jpeg', 'image/png'] },
    video: { maxSizeBytes: 5_368_709_120, allowedTypes: ['video/mp4'], maxDurationSeconds: 600 },
  },
}

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export function validateMediaForPlatform(
  media: Pick<MediaAsset, 'mimeType' | 'fileSizeBytes' | 'durationSeconds'>,
  platform: SocialPlatform
): ValidationResult {
  const constraints = PLATFORM_CONSTRAINTS[platform]
  const isVideo = media.mimeType.startsWith('video/')
  const constraint = isVideo ? constraints.video : constraints.image

  if (!constraint.allowedTypes.includes(media.mimeType)) {
    return { isValid: false, error: `${platform} does not support ${media.mimeType}` }
  }
  if (media.fileSizeBytes > constraint.maxSizeBytes) {
    const maxMB = (constraint.maxSizeBytes / 1_048_576).toFixed(0)
    return { isValid: false, error: `File exceeds ${platform} limit of ${maxMB}MB` }
  }
  if (isVideo && media.durationSeconds && constraint.maxDurationSeconds) {
    if (media.durationSeconds > constraint.maxDurationSeconds) {
      return {
        isValid: false,
        error: `Video exceeds ${platform} duration limit of ${constraint.maxDurationSeconds}s`,
      }
    }
  }
  return { isValid: true }
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)
}
