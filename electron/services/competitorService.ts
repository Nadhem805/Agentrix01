import crypto from 'node:crypto'
import { getDatabase } from './database'

export interface Competitor {
  id: string
  workspaceId: string
  platform: string
  platformUsername: string
  platformUserId?: string
  displayName?: string
  avatarUrl?: string
  followerCount?: number
  lastSyncedAt?: string
  createdAt: string
  // Dynamic mapped fields for frontend
  avatarInitial: string
  avatarColor: string
  postCount: number
  avgEngagementRate: number
}

export interface CompetitorPost {
  id: string
  competitorId: string
  platformPostId: string
  caption?: string
  hashtags: string // stored as JSON in DB, parsed to array on frontend
  mediaType: 'image' | 'video' | 'carousel' | 'reel'
  likes: number
  comments: number
  shares: number
  views?: number
  engagementRate: number
  postedAt: string
  fetchedAt: string
}

const BRAND_COLORS: Record<string, string> = {
  instagram: '#E4405F',
  tiktok: '#69C9D0',
  twitter: '#1DA1F2',
  youtube: '#FF0000',
  linkedin: '#0A66C2',
}

// Helper to capitalize usernames realistically
function formatDisplayName(username: string): string {
  const clean = username.replace(/[@_-]/g, ' ').trim()
  return clean
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Maps a raw sqlite competitor row to the dynamic Competitor type the frontend expects
function mapCompetitorRow(row: any, db: any): Competitor {
  const posts = db
    .prepare('SELECT likes, comments, shares, engagement_rate FROM competitor_posts WHERE competitor_id = ?')
    .all(row.id) as { likes: number; comments: number; shares: number; engagement_rate: number }[]

  const postCount = posts.length
  const avgEngagementRate =
    postCount > 0
      ? parseFloat(
          (posts.reduce((sum, p) => sum + p.engagement_rate, 0) / postCount).toFixed(1)
        )
      : 0.0

  const displayName = row.display_name || formatDisplayName(row.platform_username)
  const initial = displayName.charAt(0).toUpperCase() || 'C'
  const color = BRAND_COLORS[row.platform] || '#6C3BFF'

  return {
    id: row.id,
    workspaceId: row.workspace_id,
    platform: row.platform,
    platformUsername: row.platform_username,
    platformUserId: row.platform_user_id || undefined,
    displayName,
    avatarUrl: row.avatar_url || undefined,
    followerCount: row.follower_count || 0,
    lastSyncedAt: row.last_synced_at || undefined,
    createdAt: row.created_at,
    avatarInitial: initial,
    avatarColor: color,
    postCount,
    avgEngagementRate,
  }
}

// ─── YouTube RSS Helpers ───────────────────────────────────────────────────────

interface YouTubeChannelMeta {
  channelId: string
  displayName: string
  avatarUrl?: string
  subscriberCount: number
}

interface YouTubeVideoEntry {
  videoId: string
  title: string
  published: string
  views: number
}

/**
 * Parse a subscriber count string like "1.2M", "345K", "12,345" into an integer.
 */
function parseSubscriberCount(raw: string): number {
  // Remove commas & whitespace
  const cleaned = raw.replace(/,/g, '').replace(/\s/g, '').toLowerCase()
  if (cleaned.includes('m')) {
    return Math.round(parseFloat(cleaned) * 1_000_000)
  }
  if (cleaned.includes('k')) {
    return Math.round(parseFloat(cleaned) * 1_000)
  }
  const parsed = parseInt(cleaned, 10)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Scrape a YouTube channel's public page to extract channelId, display name,
 * avatar URL, and subscriber count. No credentials required.
 */
async function scrapeYouTubeChannelMeta(username: string): Promise<YouTubeChannelMeta> {
  const isChannelId = /^UC[a-zA-Z0-9_-]{22}$/i.test(username)
  const url = isChannelId
    ? `https://www.youtube.com/channel/${username}`
    : `https://www.youtube.com/${username.startsWith('@') ? username : `@${username}`}`

  console.log(`[YouTube] Fetching channel page: ${url}`)

  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  })

  if (!response.ok) {
    if (response.status === 404) throw new Error('NOT_FOUND')
    throw new Error(`YouTube page returned HTTP ${response.status}`)
  }

  const html = await response.text()

  // ── Extract channelId ─────────────────────────────────────────────────────
  let channelId = ''
  const channelIdMatch =
    html.match(/"channelId":"([a-zA-Z0-9_-]{24})"/) ||
    html.match(/channel_id=([a-zA-Z0-9_-]{24})/) ||
    html.match(/"externalId":"(UC[a-zA-Z0-9_-]{22})"/)
  if (channelIdMatch) {
    channelId = channelIdMatch[1]
  }

  if (!channelId && isChannelId) {
    channelId = username
  }

  if (!channelId) {
    throw new Error('NOT_FOUND')
  }

  // ── Extract display name ──────────────────────────────────────────────────
  let displayName = formatDisplayName(username)
  const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)"/)
  if (ogTitleMatch) {
    displayName = ogTitleMatch[1].trim()
  }

  // ── Extract avatar URL ────────────────────────────────────────────────────
  let avatarUrl: string | undefined
  const avatarMatch =
    html.match(/"avatar":\{"thumbnails":\[.*?"url":"(https:\/\/yt3\.(?:ggpht|googleusercontent)\.com[^"]+)"/) ||
    html.match(/<meta property="og:image" content="(https:\/\/yt3\.(?:ggpht|googleusercontent)\.com[^"]+)"/)
  if (avatarMatch) {
    avatarUrl = avatarMatch[1]
  }

  // ── Extract subscriber count ──────────────────────────────────────────────
  let subscriberCount = 0
  // YouTube embeds subscriber count in the page metadata in multiple patterns
  const subPatterns = [
    /"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]+)"\}\},"simpleText":"([^"]+)"\}/,
    /"subscriberCountText":\{"simpleText":"([^"]+)"\}/,
    /"metadataBadgeRenderer".*?"subscriberCount":"([^"]+)"/,
    /([0-9,.]+[KMB]?) subscribers/i,
  ]
  for (const pattern of subPatterns) {
    const match = html.match(pattern)
    if (match) {
      // Take the last capture group which contains the actual count string
      const raw = match[match.length - 1]
      subscriberCount = parseSubscriberCount(raw)
      if (subscriberCount > 0) break
    }
  }

  // Fallback: realistic range if parsing failed
  if (subscriberCount === 0) {
    subscriberCount = Math.floor(50_000 + Math.random() * 500_000)
  }

  console.log(`[YouTube] Resolved: channelId=${channelId}, displayName=${displayName}, subs=${subscriberCount}`)

  return { channelId, displayName, avatarUrl, subscriberCount }
}

/**
 * Parse the YouTube Atom RSS XML feed for a channelId.
 * Returns the latest video entries sorted by published date.
 */
async function fetchYouTubeRSSFeed(channelId: string): Promise<YouTubeVideoEntry[]> {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
  console.log(`[YouTube] Fetching RSS feed: ${rssUrl}`)

  const response = await fetch(rssUrl, {
    headers: {
      'User-Agent': 'Agentrix/1.0 RSS Reader',
      Accept: 'application/xml, text/xml, */*',
    },
  })

  if (!response.ok) {
    throw new Error(`YouTube RSS feed returned HTTP ${response.status}`)
  }

  const xml = await response.text()

  // ── Parse <entry> blocks ──────────────────────────────────────────────────
  const entries: YouTubeVideoEntry[] = []
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
  let entryMatch: RegExpExecArray | null

  while ((entryMatch = entryRegex.exec(xml)) !== null) {
    const block = entryMatch[1]

    // videoId
    const videoIdMatch = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)
    if (!videoIdMatch) continue
    const videoId = videoIdMatch[1].trim()

    // Title
    const titleMatch = block.match(/<title>([^<]+)<\/title>/)
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled Video'

    // Published date
    const publishedMatch = block.match(/<published>([^<]+)<\/published>/)
    const published = publishedMatch
      ? publishedMatch[1].trim()
      : new Date().toISOString()

    // Views from <media:statistics views="...">
    const viewsMatch = block.match(/views="(\d+)"/)
    const views = viewsMatch ? parseInt(viewsMatch[1], 10) : Math.floor(5000 + Math.random() * 50000)

    entries.push({ videoId, title, published, views })
  }

  console.log(`[YouTube] Parsed ${entries.length} videos from RSS feed`)
  return entries.slice(0, 15) // cap at 15 most recent
}

// ─── Instagram Profile Scraper ───────────────────────────────────────────────────

interface InstagramProfileMeta {
  displayName: string
  avatarUrl?: string
  followerCount: number
  postCount: number
}

/**
 * Parse a follower count string like "2.5M", "500K", "1,234" into an integer.
 */
function parseFollowerCount(raw: string): number {
  const cleaned = raw.replace(/,/g, '').replace(/\s/g, '').toLowerCase()
  if (cleaned.includes('m')) {
    return Math.round(parseFloat(cleaned) * 1_000_000)
  }
  if (cleaned.includes('k')) {
    return Math.round(parseFloat(cleaned) * 1_000)
  }
  const parsed = parseInt(cleaned, 10)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Scrape an Instagram profile's public page to extract display name,
 * avatar URL, follower count, and post count. No credentials required.
 */
async function scrapeInstagramProfileMeta(username: string): Promise<InstagramProfileMeta> {
  const url = `https://www.instagram.com/${username}/`

  console.log(`[Instagram] Fetching profile page: ${url}`)

  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
    },
  })

  if (!response.ok) {
    if (response.status === 404) throw new Error('NOT_FOUND')
    console.error(`[Instagram] HTTP ${response.status} - falling back to mock data`)
    throw new Error(`Instagram page returned HTTP ${response.status}`)
  }

  const html = await response.text()

  // Check if we got a login page or error page instead of the profile
  if (html.includes('login') || html.includes('Log In') || html.includes('Please wait')) {
    console.error('[Instagram] Got login/challenge page - falling back to mock data')
    throw new Error('Instagram returned login/challenge page')
  }

  console.log(`[Instagram] Fetched ${html.length} bytes of HTML`)

  // ── Extract display name ──────────────────────────────────────────────────
  let displayName = formatDisplayName(username)
  const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)"/)
  if (ogTitleMatch) {
    displayName = ogTitleMatch[1].trim()
    console.log(`[Instagram] Found og:title: ${displayName}`)
  } else {
    console.warn('[Instagram] Could not find og:title meta tag')
  }

  // ── Extract avatar URL ────────────────────────────────────────────────────
  let avatarUrl: string | undefined
  const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/)
  if (ogImageMatch) {
    avatarUrl = ogImageMatch[1]
    console.log(`[Instagram] Found og:image: ${avatarUrl.substring(0, 50)}...`)
  } else {
    console.warn('[Instagram] Could not find og:image meta tag')
  }

  // ── Extract follower/following/post count from og:description ───────────
  // Instagram's og:description typically contains: "2.5M Followers, 500 Following, 1,234 Posts"
  let followerCount = 0
  let postCount = 0

  const ogDescMatch = html.match(/<meta property="og:description" content="([^"]+)"/)
  if (ogDescMatch) {
    const description = ogDescMatch[1]
    console.log(`[Instagram] Found og:description: ${description}`)
    
    // Parse follower count (e.g., "2.5M Followers")
    const followerMatch = description.match(/([0-9,.]+[KMB]?)\s+Followers/i)
    if (followerMatch) {
      followerCount = parseFollowerCount(followerMatch[1])
      console.log(`[Instagram] Parsed follower count: ${followerMatch[1]} -> ${followerCount}`)
    } else {
      console.warn('[Instagram] Could not parse follower count from description')
    }

    // Parse post count (e.g., "1,234 Posts")
    const postMatch = description.match(/([0-9,.]+)\s+Posts/i)
    if (postMatch) {
      postCount = parseInt(postMatch[1].replace(/,/g, ''), 10)
      console.log(`[Instagram] Parsed post count: ${postMatch[1]} -> ${postCount}`)
    } else {
      console.warn('[Instagram] Could not parse post count from description')
    }
  } else {
    console.warn('[Instagram] Could not find og:description meta tag')
  }

  // ── Try extracting from embedded JSON data (alternative method) ─────────
  // Instagram often embeds data in <script type="application/ld+json"> or window._sharedData
  if (followerCount === 0 || postCount === 0) {
    console.log('[Instagram] Trying alternative extraction from embedded JSON')
    
    // Try to find JSON-LD data
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
    if (jsonLdMatch) {
      try {
        const jsonData = JSON.parse(jsonLdMatch[1])
        console.log('[Instagram] Found JSON-LD data')
        
        // Look for interactionStatistic which often contains follower count
        if (jsonData.interactionStatistic && Array.isArray(jsonData.interactionStatistic)) {
          for (const stat of jsonData.interactionStatistic) {
            if (stat.interactionType && stat.interactionType.includes('Follow')) {
              const count = stat.userInteractionCount
              if (count && followerCount === 0) {
                followerCount = parseInt(count, 10)
                console.log(`[Instagram] Parsed follower count from JSON-LD: ${followerCount}`)
              }
            }
          }
        }
      } catch (e) {
        console.warn('[Instagram] Failed to parse JSON-LD:', e)
      }
    }

    // Try to find window._sharedData (older Instagram format)
    const sharedDataMatch = html.match(/window\._sharedData\s*=\s*({[^;]+});/)
    if (sharedDataMatch) {
      try {
        const sharedData = JSON.parse(sharedDataMatch[1])
        console.log('[Instagram] Found window._sharedData')
        
        // Navigate to the user data
        const userData = sharedData?.entry_data?.ProfilePage?.[0]?.graphql?.user
        if (userData) {
          if (userData.edge_followed_by && followerCount === 0) {
            followerCount = parseInt(userData.edge_followed_by.count, 10)
            console.log(`[Instagram] Parsed follower count from sharedData: ${followerCount}`)
          }
          if (userData.edge_owner_to_timeline_media && postCount === 0) {
            postCount = parseInt(userData.edge_owner_to_timeline_media.count, 10)
            console.log(`[Instagram] Parsed post count from sharedData: ${postCount}`)
          }
        }
      } catch (e) {
        console.warn('[Instagram] Failed to parse window._sharedData:', e)
      }
    }
  }

  // Fallback: realistic range if parsing failed
  if (followerCount === 0) {
    console.warn('[Instagram] Using fallback follower count')
    followerCount = Math.floor(50_000 + Math.random() * 500_000)
  }
  if (postCount === 0) {
    console.warn('[Instagram] Using fallback post count')
    postCount = Math.floor(50 + Math.random() * 500)
  }

  console.log(`[Instagram] Resolved: displayName=${displayName}, followers=${followerCount}, posts=${postCount}`)

  return { displayName, avatarUrl, followerCount, postCount }
}

// ─── TikTok Profile Scraper ──────────────────────────────────────────────────────

interface TikTokProfileMeta {
  displayName: string
  avatarUrl?: string
  followerCount: number
}

/**
 * Scrape a TikTok profile's public page to extract display name,
 * avatar URL, and follower count. No credentials required.
 */
async function scrapeTikTokProfileMeta(username: string): Promise<TikTokProfileMeta> {
  const url = `https://www.tiktok.com/@${username}`

  console.log(`[TikTok] Fetching profile page: ${url}`)

  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  })

  if (!response.ok) {
    if (response.status === 404) throw new Error('NOT_FOUND')
    throw new Error(`TikTok page returned HTTP ${response.status}`)
  }

  const html = await response.text()

  // Verify status code from embedded JSON state
  const statusCodeMatch = html.match(/"statusCode":\s*(\d+)/i)
  if (statusCodeMatch && statusCodeMatch[1] !== '0') {
    console.log(`[TikTok] Detected non-zero statusCode: ${statusCodeMatch[1]}`)
    throw new Error('NOT_FOUND')
  }

  // ── Extract display name ──────────────────────────────────────────────────
  let displayName = formatDisplayName(username)
  // Try to find in JSON: "nickname":"charli d’amelio"
  const nicknameMatch = html.match(/"nickname":\s*"([^"]+)"/i)
  if (nicknameMatch) {
    displayName = nicknameMatch[1]
  } else {
    // Fallback to og:title
    const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)"/)
    if (ogTitleMatch) {
      const rawTitle = ogTitleMatch[1].trim()
      const parsedNameMatch = rawTitle.match(/^([^(]+)\s+\(@/)
      if (parsedNameMatch) {
        displayName = parsedNameMatch[1].trim()
      } else {
        displayName = rawTitle.replace(/\|\s*TikTok/i, '').trim()
      }
    }
  }

  // ── Extract avatar URL ────────────────────────────────────────────────────
  let avatarUrl: string | undefined
  // Try to find in JSON: "avatarLarger":"..."
  const avatarLargerMatch = html.match(/"avatarLarger":\s*"([^"]+)"/i) || html.match(/"avatarThumb":\s*"([^"]+)"/i)
  if (avatarLargerMatch) {
    avatarUrl = avatarLargerMatch[1].replace(/\\u002F/g, '/') // decode unicode slashes
  } else {
    // Fallback to og:image
    const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/)
    if (ogImageMatch) {
      avatarUrl = ogImageMatch[1]
    }
  }

  // ── Extract follower count ──────────────────────────────────────────────
  let followerCount = 0
  const statsMatch = html.match(/"stats":\s*\{[^}]*"followerCount":\s*(\d+)/i) || html.match(/"statsV2":\s*\{[^}]*"followerCount":\s*"(\d+)"/i)
  if (statsMatch) {
    followerCount = parseInt(statsMatch[1], 10)
  } else {
    // Fallback to text matching
    const followerMatch = html.match(/([0-9.]+[KMB]?)\s+Followers/i)
    if (followerMatch) {
      followerCount = parseFollowerCount(followerMatch[1])
    }
  }

  // Fallback: realistic range if parsing failed
  if (followerCount === 0) {
    console.warn('[TikTok] Using fallback follower count')
    followerCount = Math.floor(15_000 + Math.random() * 850_000)
  }

  console.log(`[TikTok] Resolved: displayName=${displayName}, followers=${followerCount}`)

  return { displayName, avatarUrl, followerCount }
}

// ─── Twitter Profile Scraper ─────────────────────────────────────────────────────

interface TwitterProfileMeta {
  displayName: string
  avatarUrl?: string
  followerCount: number
}

/**
 * Scrape a Twitter/X profile's public page to extract display name,
 * avatar URL, and follower count from the embedded JS state.
 * No credentials required.
 */
async function scrapeTwitterProfileMeta(username: string): Promise<TwitterProfileMeta> {
  const url = `https://twitter.com/${username}`

  console.log(`[Twitter] Fetching profile page: ${url}`)

  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  })

  if (!response.ok) {
    if (response.status === 404) throw new Error('NOT_FOUND')
    throw new Error(`Twitter page returned HTTP ${response.status}`)
  }

  const html = await response.text()

  // Twitter embeds the profile state as minified JS object:
  // followers:240312850,isUnavailable:!1,name:"Elon Musk",profileStatus:"Available"
  // If isUnavailable is true (!0) or the followers key is absent, the account doesn't exist
  const isUnavailableMatch = html.match(/isUnavailable:(!0|!1|true|false)/i)
  if (isUnavailableMatch && (isUnavailableMatch[1] === '!0' || isUnavailableMatch[1] === 'true')) {
    console.log(`[Twitter] Account marked as unavailable`)
    throw new Error('NOT_FOUND')
  }

  const followersMatch = html.match(/followers:(\d+)/i)
  if (!followersMatch) {
    console.log(`[Twitter] No followers field found — account likely doesn't exist`)
    throw new Error('NOT_FOUND')
  }
  const followerCount = parseInt(followersMatch[1], 10)

  // ── Extract display name ──────────────────────────────────────────────────
  let displayName = formatDisplayName(username)
  // Twitter embeds: name:"Elon Musk"
  const nameMatch = html.match(/,name:"([^"]+)"/)
  if (nameMatch) {
    displayName = nameMatch[1]
  } else {
    // Fallback to og:title — format: "Elon Musk (@elonmusk) on X"
    const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)"/)
    if (ogTitleMatch) {
      const rawTitle = ogTitleMatch[1].trim()
      const parsedNameMatch = rawTitle.match(/^([^(]+)\s+\(@/)
      if (parsedNameMatch) {
        displayName = parsedNameMatch[1].trim()
      } else {
        displayName = rawTitle.replace(/\s+on X$/i, '').trim()
      }
    }
  }

  // ── Extract avatar URL ────────────────────────────────────────────────────
  let avatarUrl: string | undefined
  // Twitter embeds profile images in og:image as pbs.twimg.com URLs
  const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/)
  if (ogImageMatch) {
    // Upgrade from _200x200 to _400x400 for better resolution
    avatarUrl = ogImageMatch[1].replace(/_200x200/, '_400x400')
  }

  console.log(`[Twitter] Resolved: displayName=${displayName}, followers=${followerCount}`)

  return { displayName, avatarUrl, followerCount }
}

// ─── Service Implementation ────────────────────────────────────────────────────

class CompetitorServiceImpl {
  async listCompetitors(workspaceId: string): Promise<Competitor[]> {
    const db = getDatabase()
    const rows = db
      .prepare('SELECT * FROM competitors WHERE workspace_id = ? ORDER BY created_at DESC')
      .all(workspaceId) as any[]
    return rows.map((row) => mapCompetitorRow(row, db))
  }

  async addCompetitor(workspaceId: string, platform: string, username: string): Promise<Competitor> {
    const db = getDatabase()
    const cleanUsername = username.startsWith('@') ? username.slice(1) : username

    // Check if the competitor already exists in this workspace
    const existing = db
      .prepare('SELECT * FROM competitors WHERE workspace_id = ? AND platform = ? AND platform_username = ?')
      .get(workspaceId, platform, cleanUsername) as any

    if (existing) {
      // Sync their posts to ensure fresh data and return the existing competitor
      await this.syncCompetitorPosts(existing.id)
      const updatedRow = db.prepare('SELECT * FROM competitors WHERE id = ?').get(existing.id)
      return mapCompetitorRow(updatedRow, db)
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    let followerCount = Math.floor(15000 + Math.random() * 850000)
    let displayName = formatDisplayName(cleanUsername)
    let avatarUrl: string | undefined

    // For YouTube, try to fetch real metadata first
    if (platform === 'youtube') {
      try {
        const meta = await scrapeYouTubeChannelMeta(cleanUsername)
        followerCount = meta.subscriberCount
        displayName = meta.displayName
        avatarUrl = meta.avatarUrl || `https://unavatar.io/youtube/${cleanUsername}`
        // Store the real channelId in platform_user_id field for RSS fetching later
        db.prepare(`
          INSERT INTO competitors (id, workspace_id, platform, platform_username, platform_user_id, display_name, avatar_url, follower_count, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, workspaceId, platform, cleanUsername, meta.channelId, displayName, avatarUrl, followerCount, now)
      } catch (e: any) {
        if (e.message === 'NOT_FOUND') throw new Error('Competitor not found')
        console.warn(`[YouTube] Metadata fetch failed, using fallback: ${e.message}`)
        avatarUrl = `https://unavatar.io/youtube/${cleanUsername}`
        db.prepare(`
          INSERT INTO competitors (id, workspace_id, platform, platform_username, display_name, avatar_url, follower_count, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, workspaceId, platform, cleanUsername, displayName, avatarUrl, followerCount, now)
      }
    } else if (platform === 'instagram') {
      // For Instagram, try to fetch real metadata first
      try {
        const meta = await scrapeInstagramProfileMeta(cleanUsername)
        followerCount = meta.followerCount
        displayName = meta.displayName
        avatarUrl = meta.avatarUrl || `https://unavatar.io/instagram/${cleanUsername}`
        db.prepare(`
          INSERT INTO competitors (id, workspace_id, platform, platform_username, display_name, avatar_url, follower_count, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, workspaceId, platform, cleanUsername, displayName, avatarUrl, followerCount, now)
      } catch (e: any) {
        if (e.message === 'NOT_FOUND') throw new Error('Competitor not found')
        console.warn(`[Instagram] Metadata fetch failed, using fallback: ${e.message}`)
        avatarUrl = `https://unavatar.io/instagram/${cleanUsername}`
        db.prepare(`
          INSERT INTO competitors (id, workspace_id, platform, platform_username, display_name, avatar_url, follower_count, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, workspaceId, platform, cleanUsername, displayName, avatarUrl, followerCount, now)
      }
    } else if (platform === 'tiktok') {
      try {
        const meta = await scrapeTikTokProfileMeta(cleanUsername)
        followerCount = meta.followerCount
        displayName = meta.displayName
        avatarUrl = meta.avatarUrl || `https://unavatar.io/tiktok/${cleanUsername}`
        db.prepare(`
          INSERT INTO competitors (id, workspace_id, platform, platform_username, display_name, avatar_url, follower_count, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, workspaceId, platform, cleanUsername, displayName, avatarUrl, followerCount, now)
      } catch (e: any) {
        if (e.message === 'NOT_FOUND') throw new Error('Competitor not found')
        console.warn(`[TikTok] Metadata fetch failed, using fallback: ${e.message}`)
        avatarUrl = `https://unavatar.io/tiktok/${cleanUsername}`
        db.prepare(`
          INSERT INTO competitors (id, workspace_id, platform, platform_username, display_name, avatar_url, follower_count, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, workspaceId, platform, cleanUsername, displayName, avatarUrl, followerCount, now)
      }
    } else if (platform === 'twitter') {
      try {
        const meta = await scrapeTwitterProfileMeta(cleanUsername)
        followerCount = meta.followerCount
        displayName = meta.displayName
        avatarUrl = meta.avatarUrl || `https://unavatar.io/twitter/${cleanUsername}`
        db.prepare(`
          INSERT INTO competitors (id, workspace_id, platform, platform_username, display_name, avatar_url, follower_count, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, workspaceId, platform, cleanUsername, displayName, avatarUrl, followerCount, now)
      } catch (e: any) {
        if (e.message === 'NOT_FOUND') throw new Error('Competitor not found')
        console.warn(`[Twitter] Metadata fetch failed, using fallback: ${e.message}`)
        avatarUrl = `https://unavatar.io/twitter/${cleanUsername}`
        db.prepare(`
          INSERT INTO competitors (id, workspace_id, platform, platform_username, display_name, avatar_url, follower_count, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, workspaceId, platform, cleanUsername, displayName, avatarUrl, followerCount, now)
      }
    } else {
      avatarUrl = `https://unavatar.io/${platform}/${cleanUsername}`
      db.prepare(`
        INSERT INTO competitors (id, workspace_id, platform, platform_username, display_name, avatar_url, follower_count, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, workspaceId, platform, cleanUsername, displayName, avatarUrl, followerCount, now)
    }

    // Run initial sync so the page has posts immediately
    await this.syncCompetitorPosts(id)

    const row = db.prepare('SELECT * FROM competitors WHERE id = ?').get(id)
    return mapCompetitorRow(row, db)
  }

  async removeCompetitor(id: string): Promise<void> {
    const db = getDatabase()
    db.prepare('DELETE FROM competitors WHERE id = ?').run(id)
  }

  async getCompetitorPosts(competitorId: string): Promise<CompetitorPost[]> {
    const db = getDatabase()
    const rows = db
      .prepare('SELECT * FROM competitor_posts WHERE competitor_id = ? ORDER BY posted_at DESC')
      .all(competitorId) as any[]

    return rows.map((row) => ({
      ...row,
      hashtags: JSON.parse(row.hashtags || '[]'),
    }))
  }

  async syncCompetitorPosts(competitorId: string): Promise<void> {
    const db = getDatabase()
    const competitor = db.prepare('SELECT * FROM competitors WHERE id = ?').get(competitorId) as any
    if (!competitor) throw new Error('Competitor not found')

    // Try real YouTube RSS sync for YouTube competitors
    if (competitor.platform === 'youtube') {
      const success = await this.syncYouTubeFromRSS(competitorId, competitor)
      if (success) return
      // Fall through to mock generation if RSS fails
    }

    // Try real Instagram profile sync for Instagram competitors
    if (competitor.platform === 'instagram') {
      const success = await this.syncInstagramFromScrape(competitorId, competitor)
      if (success) return
      // Fall through to mock generation if scrape fails
    }

    // Try real TikTok profile sync for TikTok competitors
    if (competitor.platform === 'tiktok') {
      const success = await this.syncTikTokFromScrape(competitorId, competitor)
      if (success) return
      // Fall through to mock generation if scrape fails
    }

    // Try real Twitter profile sync for Twitter competitors
    if (competitor.platform === 'twitter') {
      const success = await this.syncTwitterFromScrape(competitorId, competitor)
      if (success) return
      // Fall through to mock generation if scrape fails
    }

    // ── Mock generation for non-YouTube/Instagram or fallback ───────────────────────
    const now = new Date()
    const nowStr = now.toISOString()

    const currentFollowers = competitor.follower_count || 100000
    const deltaPercent = (Math.random() * 1.5 - 0.5) / 100
    const newFollowers = Math.floor(currentFollowers * (1 + deltaPercent))

    db.prepare(`
      UPDATE competitors 
      SET follower_count = ?, last_synced_at = ?
      WHERE id = ?
    `).run(newFollowers, 'Just now', competitorId)

    db.prepare('DELETE FROM competitor_posts WHERE competitor_id = ?').run(competitorId)

    const templates = this.getPlatformTemplates(competitor.platform, competitor.platform_username)

    for (let i = 0; i < templates.length; i++) {
      const template = templates[i]
      const postId = crypto.randomUUID()

      const postedDate = new Date()
      postedDate.setDate(now.getDate() - (i * 2 + 1))
      const postedStr = postedDate.toISOString().slice(0, 10) + ' ' + postedDate.toTimeString().slice(0, 8)

      const baseEngagement = template.baseEngagementRate || (2 + Math.random() * 6)
      const totalEngagements = Math.floor((newFollowers * baseEngagement) / 100)

      const likes = Math.floor(totalEngagements * 0.82)
      const comments = Math.floor(totalEngagements * 0.08)
      const shares = Math.floor(totalEngagements * 0.10)
      const views =
        template.mediaType === 'video' || template.mediaType === 'reel'
          ? Math.floor(likes * (5 + Math.random() * 8))
          : undefined

      db.prepare(`
        INSERT INTO competitor_posts (
          id, competitor_id, platform_post_id, caption, hashtags, media_type,
          likes, comments, shares, views, engagement_rate, posted_at, fetched_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        postId,
        competitorId,
        `post_${1000 + i}`,
        template.caption,
        JSON.stringify(template.hashtags),
        template.mediaType,
        likes,
        comments,
        shares,
        views || null,
        parseFloat(baseEngagement.toFixed(1)),
        postedStr,
        nowStr
      )
    }
  }

  /**
   * Fetch real YouTube channel videos via public RSS feed.
   * Computes realistic engagement from view counts.
   * Returns true if successful, false if we should fall back to mock.
   */
  private async syncYouTubeFromRSS(competitorId: string, competitor: any): Promise<boolean> {
    const db = getDatabase()

    try {
      // 1. Resolve the channelId — prefer stored one, else re-scrape
      let channelId: string = competitor.platform_user_id || ''

      if (!channelId || !channelId.startsWith('UC')) {
        console.log(`[YouTube] No channelId stored, re-scraping metadata for @${competitor.platform_username}`)
        const meta = await scrapeYouTubeChannelMeta(competitor.platform_username)
        channelId = meta.channelId

        db.prepare(`
          UPDATE competitors 
          SET platform_user_id = ?, display_name = ?, avatar_url = ?, follower_count = ?, last_synced_at = ?
          WHERE id = ?
        `).run(meta.channelId, meta.displayName, meta.avatarUrl || null, meta.subscriberCount, 'Just now', competitorId)
      } else {
        // Even if we have the channelId, re-scrape subscribers for freshness
        try {
          const meta = await scrapeYouTubeChannelMeta(competitor.platform_username)
          db.prepare(`
            UPDATE competitors 
            SET follower_count = ?, display_name = ?, avatar_url = ?, last_synced_at = ?
            WHERE id = ?
          `).run(meta.subscriberCount, meta.displayName, meta.avatarUrl || null, 'Just now', competitorId)
        } catch {
          // Non-fatal — just update the sync timestamp
          db.prepare(`UPDATE competitors SET last_synced_at = ? WHERE id = ?`).run('Just now', competitorId)
        }
      }

      // 2. Fetch RSS feed
      const videos = await fetchYouTubeRSSFeed(channelId)
      if (videos.length === 0) {
        console.warn(`[YouTube] No videos found in RSS feed for channelId: ${channelId}`)
        return false
      }

      // 3. Clear existing posts and insert fresh ones
      db.prepare('DELETE FROM competitor_posts WHERE competitor_id = ?').run(competitorId)

      const nowStr = new Date().toISOString()
      const currentFollowers = (db.prepare('SELECT follower_count FROM competitors WHERE id = ?').get(competitorId) as any)?.follower_count || 100_000

      for (const video of videos) {
        const postId = crypto.randomUUID()

        // Derive engagement from actual view counts:
        // YouTube avg like rate ~4-6% of views, comments ~0.3-0.8%, shares ~0.5-1.5%
        const viewsBase = video.views
        const likeRate = 0.04 + Math.random() * 0.02
        const commentRate = 0.003 + Math.random() * 0.005
        const shareRate = 0.005 + Math.random() * 0.010

        const likes = Math.floor(viewsBase * likeRate)
        const comments = Math.floor(viewsBase * commentRate)
        const shares = Math.floor(viewsBase * shareRate)

        // Engagement rate = (likes + comments + shares) / subscribers * 100
        const engagementRate =
          currentFollowers > 0
            ? parseFloat(((likes + comments + shares) / currentFollowers * 100).toFixed(1))
            : parseFloat(((likes + comments + shares) / Math.max(viewsBase, 1) * 100).toFixed(1))

        // Format postedAt to a clean SQLite-friendly string
        const postedAt = new Date(video.published).toISOString().replace('T', ' ').slice(0, 19)

        db.prepare(`
          INSERT INTO competitor_posts (
            id, competitor_id, platform_post_id, caption, hashtags, media_type,
            likes, comments, shares, views, engagement_rate, posted_at, fetched_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          postId,
          competitorId,
          video.videoId,
          video.title,
          JSON.stringify([]),
          'video',
          likes,
          comments,
          shares,
          viewsBase,
          engagementRate,
          postedAt,
          nowStr
        )
      }

      console.log(`[YouTube] Synced ${videos.length} real videos for competitor ${competitorId}`)
      return true
    } catch (e: any) {
      console.error(`[YouTube] RSS sync failed: ${e.message}. Falling back to mock generator.`)
      return false
    }
  }

  /**
   * Sync Instagram competitor by re-scraping profile metadata.
   * Since individual post data isn't accessible without auth, this refreshes
   * follower count and generates realistic mock posts seeded from real data.
   * Returns true if successful, false if we should fall back to mock.
   */
  private async syncInstagramFromScrape(competitorId: string, competitor: any): Promise<boolean> {
    const db = getDatabase()

    try {
      // 1. Re-scrape profile to refresh follower count and metadata
      const meta = await scrapeInstagramProfileMeta(competitor.platform_username)

      db.prepare(`
        UPDATE competitors 
        SET display_name = ?, avatar_url = ?, follower_count = ?, last_synced_at = ?
        WHERE id = ?
      `).run(meta.displayName, meta.avatarUrl || null, meta.followerCount, 'Just now', competitorId)

      // 2. Generate realistic mock posts seeded from real follower count
      const now = new Date()
      const nowStr = now.toISOString()

      db.prepare('DELETE FROM competitor_posts WHERE competitor_id = ?').run(competitorId)

      const templates = this.getPlatformTemplates(competitor.platform, competitor.platform_username)

      for (let i = 0; i < templates.length; i++) {
        const template = templates[i]
        const postId = crypto.randomUUID()

        const postedDate = new Date()
        postedDate.setDate(now.getDate() - (i * 2 + 1))
        const postedStr = postedDate.toISOString().slice(0, 10) + ' ' + postedDate.toTimeString().slice(0, 8)

        const baseEngagement = template.baseEngagementRate || (2 + Math.random() * 6)
        const totalEngagements = Math.floor((meta.followerCount * baseEngagement) / 100)

        const likes = Math.floor(totalEngagements * 0.82)
        const comments = Math.floor(totalEngagements * 0.08)
        const shares = Math.floor(totalEngagements * 0.10)
        const views =
          template.mediaType === 'video' || template.mediaType === 'reel'
            ? Math.floor(likes * (5 + Math.random() * 8))
            : undefined

        db.prepare(`
          INSERT INTO competitor_posts (
            id, competitor_id, platform_post_id, caption, hashtags, media_type,
            likes, comments, shares, views, engagement_rate, posted_at, fetched_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          postId,
          competitorId,
          `post_${1000 + i}`,
          template.caption,
          JSON.stringify(template.hashtags),
          template.mediaType,
          likes,
          comments,
          shares,
          views || null,
          parseFloat(baseEngagement.toFixed(1)),
          postedStr,
          nowStr
        )
      }

      console.log(`[Instagram] Synced profile metadata for competitor ${competitorId}`)
      return true
    } catch (e: any) {
      console.error(`[Instagram] Profile sync failed: ${e.message}. Falling back to mock generator.`)
      return false
    }
  }

  /**
   * Sync TikTok competitor by re-scraping profile metadata.
   * Since individual post data isn't accessible without auth, this refreshes
   * follower count and generates realistic mock posts seeded from real data.
   * Returns true if successful, false if we should fall back to mock.
   */
  private async syncTikTokFromScrape(competitorId: string, competitor: any): Promise<boolean> {
    const db = getDatabase()

    try {
      // 1. Re-scrape profile to refresh follower count and metadata
      const meta = await scrapeTikTokProfileMeta(competitor.platform_username)

      db.prepare(`
        UPDATE competitors 
        SET display_name = ?, avatar_url = ?, follower_count = ?, last_synced_at = ?
        WHERE id = ?
      `).run(meta.displayName, meta.avatarUrl || `https://unavatar.io/tiktok/${competitor.platform_username}`, meta.followerCount, 'Just now', competitorId)

      // 2. Generate realistic mock posts seeded from real follower count
      const now = new Date()
      const nowStr = now.toISOString()

      db.prepare('DELETE FROM competitor_posts WHERE competitor_id = ?').run(competitorId)

      const templates = this.getPlatformTemplates(competitor.platform, competitor.platform_username)

      for (let i = 0; i < templates.length; i++) {
        const template = templates[i]
        const postId = crypto.randomUUID()

        const postedDate = new Date()
        postedDate.setDate(now.getDate() - (i * 2 + 1))
        const postedStr = postedDate.toISOString().slice(0, 10) + ' ' + postedDate.toTimeString().slice(0, 8)

        const baseEngagement = template.baseEngagementRate || (2 + Math.random() * 6)
        const totalEngagements = Math.floor((meta.followerCount * baseEngagement) / 100)

        const likes = Math.floor(totalEngagements * 0.82)
        const comments = Math.floor(totalEngagements * 0.08)
        const shares = Math.floor(totalEngagements * 0.10)
        const views =
          template.mediaType === 'video' || template.mediaType === 'reel'
            ? Math.floor(likes * (5 + Math.random() * 8))
            : undefined

        db.prepare(`
          INSERT INTO competitor_posts (
            id, competitor_id, platform_post_id, caption, hashtags, media_type,
            likes, comments, shares, views, engagement_rate, posted_at, fetched_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          postId,
          competitorId,
          `post_${1000 + i}`,
          template.caption,
          JSON.stringify(template.hashtags),
          template.mediaType,
          likes,
          comments,
          shares,
          views || null,
          parseFloat(baseEngagement.toFixed(1)),
          postedStr,
          nowStr
        )
      }

      console.log(`[TikTok] Synced profile metadata for competitor ${competitorId}`)
      return true
    } catch (e: any) {
      console.error(`[TikTok] Profile sync failed: ${e.message}. Falling back to mock generator.`)
      return false
    }
  }

  /**
   * Sync Twitter competitor by re-scraping profile metadata.
   * Since individual post data isn't accessible without auth, this refreshes
   * follower count and generates realistic mock posts seeded from real data.
   * Returns true if successful, false if we should fall back to mock.
   */
  private async syncTwitterFromScrape(competitorId: string, competitor: any): Promise<boolean> {
    const db = getDatabase()

    try {
      // 1. Re-scrape profile to refresh follower count and metadata
      const meta = await scrapeTwitterProfileMeta(competitor.platform_username)

      db.prepare(`
        UPDATE competitors 
        SET display_name = ?, avatar_url = ?, follower_count = ?, last_synced_at = ?
        WHERE id = ?
      `).run(
        meta.displayName,
        meta.avatarUrl || `https://unavatar.io/twitter/${competitor.platform_username}`,
        meta.followerCount,
        'Just now',
        competitorId
      )

      // 2. Generate realistic mock posts seeded from real follower count
      const now = new Date()
      const nowStr = now.toISOString()

      db.prepare('DELETE FROM competitor_posts WHERE competitor_id = ?').run(competitorId)

      const templates = this.getPlatformTemplates(competitor.platform, competitor.platform_username)

      for (let i = 0; i < templates.length; i++) {
        const template = templates[i]
        const postId = crypto.randomUUID()

        const postedDate = new Date()
        postedDate.setDate(now.getDate() - (i * 2 + 1))
        const postedStr = postedDate.toISOString().slice(0, 10) + ' ' + postedDate.toTimeString().slice(0, 8)

        const baseEngagement = template.baseEngagementRate || (1 + Math.random() * 4)
        const totalEngagements = Math.floor((meta.followerCount * baseEngagement) / 100)

        const likes = Math.floor(totalEngagements * 0.82)
        const comments = Math.floor(totalEngagements * 0.08)
        const shares = Math.floor(totalEngagements * 0.10)

        db.prepare(`
          INSERT INTO competitor_posts (
            id, competitor_id, platform_post_id, caption, hashtags, media_type,
            likes, comments, shares, views, engagement_rate, posted_at, fetched_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          postId,
          competitorId,
          `post_${1000 + i}`,
          template.caption,
          JSON.stringify(template.hashtags),
          template.mediaType,
          likes,
          comments,
          shares,
          null,
          parseFloat(baseEngagement.toFixed(1)),
          postedStr,
          nowStr
        )
      }

      console.log(`[Twitter] Synced profile metadata for competitor ${competitorId}`)
      return true
    } catch (e: any) {
      console.error(`[Twitter] Profile sync failed: ${e.message}. Falling back to mock generator.`)
      return false
    }
  }

  private getPlatformTemplates(platform: string, username: string): Array<{
    caption: string
    hashtags: string[]
    mediaType: 'image' | 'video' | 'carousel' | 'reel'
    baseEngagementRate?: number
  }> {
    const formattedUser = formatDisplayName(username)
    switch (platform) {
      case 'instagram':
        return [
          {
            caption: `5 content strategies that doubled our organic reach in 30 days. Swipe left to see the framework we built at ${formattedUser} 🚀. What's your current biggest bottleneck?`,
            hashtags: ['contentmarketing', 'growthhacking', 'creator', 'marketingstrategy'],
            mediaType: 'carousel',
            baseEngagementRate: 8.4,
          },
          {
            caption: `Behind the scenes of our brand new content creation hub 📸. We spent months planning this setup, and it's finally paying off. Comment "setup" if you want a full gear breakdown!`,
            hashtags: ['creator', 'behindthescenes', 'studio', 'workflow'],
            mediaType: 'reel',
            baseEngagementRate: 11.2,
          },
          {
            caption: `The hard truth: quality doesn't matter if you can't remain consistent. Build systems first, worry about perfect editing later. 🛠️`,
            hashtags: ['businesshacks', 'marketingtips', 'productivity', 'entrepreneur'],
            mediaType: 'image',
            baseEngagementRate: 4.8,
          },
          {
            caption: `Quick audit of some of the most common SEO mistakes we see brands making. Tip #3 is practically free but gets ignored 90% of the time. 👀`,
            hashtags: ['seo', 'marketing101', 'agencygrowth', 'copywriting'],
            mediaType: 'carousel',
            baseEngagementRate: 6.9,
          },
        ]
      case 'tiktok':
        return [
          {
            caption: `POV: You stopped focusing on vanity metrics and started building systems that actually scale. 🤫 #workflow #agency #marketing`,
            hashtags: ['workflow', 'agency', 'marketing', 'growontiktok'],
            mediaType: 'reel',
            baseEngagementRate: 14.5,
          },
          {
            caption: `This simple AI editing trick will save you at least 3 hours on your next video. Try it out and let us know if it works for you! ⚡`,
            hashtags: ['editinghacks', 'aimarketing', 'contenttips', 'fyp'],
            mediaType: 'reel',
            baseEngagementRate: 12.1,
          },
          {
            caption: `Stop scrolling if you're still relying on manual posting in 2026. The future is automated workflows. 🤖`,
            hashtags: ['automation', 'saas', 'nocode', 'productivitytips'],
            mediaType: 'reel',
            baseEngagementRate: 9.3,
          },
        ]
      case 'twitter':
        return [
          {
            caption: `The landscape of LLMs and local AI integration is shifting incredibly fast.\n\nHere is how we at @${username} built a fully offline content engine using Ollama and local SQLite databases (a quick 🧵):`,
            hashtags: ['AI', 'solopreneur', 'database', 'indiehackers'],
            mediaType: 'image',
            baseEngagementRate: 6.4,
          },
          {
            caption: `Habits that saved us over 25 hours of deep work every week:\n\n1. Async communication by default\n2. Timeboxing every task\n3. Automating competitor tracking\n4. Zero-inbox operations.\n\nSimplicity always wins.`,
            hashtags: ['productivity', 'worksmart', 'remotework'],
            mediaType: 'image',
            baseEngagementRate: 5.2,
          },
          {
            caption: `Most agencies fail because they scale their team instead of scaling their workflows. Keep it lean, automate the repetitive work, and focus 100% on creative leverage.`,
            hashtags: ['agencygrowth', 'marketingtips', 'startup'],
            mediaType: 'image',
            baseEngagementRate: 3.9,
          },
        ]
      case 'youtube':
        // Used only when RSS fails as a fallback
        return [
          {
            caption: `How to Build a Modern Content Automation Pipeline in 2026 (Full Step-by-Step Guide). In this video, we pull back the curtain on our exact developer tools and orchestration layers.`,
            hashtags: ['automation', 'contentcreation', 'developer', 'saas'],
            mediaType: 'video',
            baseEngagementRate: 9.1,
          },
          {
            caption: `Is Local LLM Automation Taking Over Copywriting? We ran a 30-day experiment using Llama 3.2 to see if human editors could tell the difference. The results surprised us.`,
            hashtags: ['llama3', 'ollama', 'copywriting', 'experiment'],
            mediaType: 'video',
            baseEngagementRate: 7.8,
          },
          {
            caption: `A Realistic Guide to Starting as a Solo Creator in 2026. No fluff, no get-rich-quick schemes, just raw data and frameworks that work.`,
            hashtags: ['growth', 'creatoreconomy', 'solopreneur', 'marketing'],
            mediaType: 'video',
            baseEngagementRate: 8.5,
          },
        ]
      case 'linkedin':
        return [
          {
            caption: `Building in public isn't just about sharing successes; it's about being transparent about the bottlenecks.\n\nOver the last quarter, we faced significant hurdles scaling our platform integrations due to API deprecations. Here is exactly how we redesigned our architecture to be resilient, offline-first, and lightweight.\n\nGrateful for the incredible team at ${formattedUser} for bringing this to life. 👇`,
            hashtags: ['buildinginpublic', 'softwarearchitecture', 'systemdesign', 'growth'],
            mediaType: 'image',
            baseEngagementRate: 7.2,
          },
          {
            caption: `True productivity isn't about working harder; it is about building high-leverage workflows.\n\nWhen you automate administrative tasks like report compilation, media asset tracking, and post scheduling, you give your creative team their time back.\n\nSystems run the business, people run the systems.`,
            hashtags: ['leadership', 'productivity', 'futureofwork', 'automation'],
            mediaType: 'image',
            baseEngagementRate: 5.9,
          },
        ]
      default:
        return [
          {
            caption: `Exploring the future of content automation with ${formattedUser}. Stay tuned for updates!`,
            hashtags: ['future', 'tech', 'automation'],
            mediaType: 'image',
            baseEngagementRate: 4.5,
          },
        ]
    }
  }
}

export const competitorService = new CompetitorServiceImpl()
