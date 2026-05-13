// IPC handler registry — registers all channel handlers in main process
import { ipcMain } from 'electron'
import { registerProfileHandlers }      from './profileHandlers'
import { registerAgentHandlers }        from './agentHandlers'
import { registerPostHandlers }         from './postHandlers'
import { registerCompetitorHandlers }   from './competitorHandlers'
import { registerAnalyticsHandlers }    from './analyticsHandlers'
import { registerOllamaHandlers }       from './ollamaHandlers'
import { registerNotificationHandlers } from './notificationHandlers'
import { registerMediaHandlers }        from './mediaHandlers'
import { registerIntegrationHandlers }  from './integrationHandlers'

export function registerAllIpcHandlers() {
  registerProfileHandlers(ipcMain)
  registerAgentHandlers(ipcMain)
  registerPostHandlers(ipcMain)
  registerCompetitorHandlers(ipcMain)
  registerAnalyticsHandlers(ipcMain)
  registerOllamaHandlers(ipcMain)
  registerNotificationHandlers()
  registerMediaHandlers()
  registerIntegrationHandlers()
}
