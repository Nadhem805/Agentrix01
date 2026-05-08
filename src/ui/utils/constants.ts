import type { SocialPlatform } from '@/types/post'

export const PLATFORM_CHAR_LIMITS: Record<SocialPlatform, number> = {
  instagram: 2200,
  tiktok:    2200,
  twitter:   280,
  youtube:   5000,
  linkedin:  3000,
}

export const PLATFORM_MAX_HASHTAGS: Record<SocialPlatform, number> = {
  instagram: 30,
  tiktok:    30,
  twitter:   5,
  youtube:   15,
  linkedin:  5,
}

export const MIN_SCHEDULE_AHEAD_MINUTES = 5
