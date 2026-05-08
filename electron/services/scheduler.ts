// node-cron scheduler — runs in Electron main process
// Manages scheduled post publishing and daily analytics sync

// TODO: install node-cron in Phase 5
// import cron from 'node-cron'

// Active cron jobs map: postId -> cron.ScheduledTask
const activeJobs = new Map<string, unknown>()

export function schedulePostJob(postId: string, _scheduledAt: Date, _onFire: () => void): string {
  // TODO: implement with node-cron
  // const task = cron.schedule(dateToCronExpression(scheduledAt), onFire, { scheduled: true })
  // activeJobs.set(postId, task)
  console.log(`[Scheduler] Job registered for post ${postId} at ${_scheduledAt.toISOString()}`)
  return postId
}

export function cancelPostJob(postId: string): void {
  const job = activeJobs.get(postId)
  if (job) {
    // (job as cron.ScheduledTask).stop()
    activeJobs.delete(postId)
  }
}

export function restoreScheduledJobs(): void {
  // Called on app start — reads all scheduled posts from SQLite and re-registers cron jobs
  // TODO: implement in Phase 5
}

export function scheduleDailyAnalyticsSync(_onFire: () => void): void {
  // Runs at 3 AM every day
  // cron.schedule('0 3 * * *', onFire)
  console.log('[Scheduler] Daily analytics sync registered')
}
