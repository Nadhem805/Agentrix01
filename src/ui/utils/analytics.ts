interface RawMetrics {
  likes: number
  comments: number
  shares: number
  saves: number
  reach: number
  impressions: number
}

/**
 * Calculates engagement rate as a percentage.
 * Preconditions: all metric values are non-negative numbers
 * Postconditions: returns a number between 0 and 100 (inclusive), rounded to 2 decimal places
 */
export function calculateEngagementRate(metrics: RawMetrics): number {
  const engagements = metrics.likes + metrics.comments + metrics.shares + metrics.saves

  let rate: number
  if (metrics.reach > 0) {
    rate = (engagements / metrics.reach) * 100
  } else if (metrics.impressions > 0) {
    rate = (engagements / metrics.impressions) * 100
  } else {
    rate = 0
  }

  return Math.round(Math.min(rate, 100) * 100) / 100
}
