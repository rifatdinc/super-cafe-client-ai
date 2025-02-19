export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  CONNECT_TIMEOUT: 'connect_timeout',
  REGISTER: 'register',
  REGISTERED: 'registered',
  COMMAND: 'command',
  COMMAND_RESPONSE: 'command_response',
  SYSTEM_METRICS: 'system_metrics',
  SYSTEM_METRICS_RESPONSE: 'system_metrics_response'
} as const;

export const COMPUTER_STATUS = {
  AVAILABLE: 'available',
  IN_USE: 'in-use',
  MAINTENANCE: 'maintenance',
  OFFLINE: 'offline'
} as const;

export type ComputerStatus = typeof COMPUTER_STATUS[keyof typeof COMPUTER_STATUS];

export const IPC_CHANNELS = {
  GET_MACHINE_ID: 'get-machine-id',
  GET_SYSTEM_INFO: 'get-system-info',
  SYSTEM_SHUTDOWN: 'system-shutdown',
  SYSTEM_RESTART: 'system-restart',
  SYSTEM_LOGOUT: 'system-logout',
  MINIMIZE_WINDOW: 'minimize-window',
  MAXIMIZE_WINDOW: 'maximize-window',
  CLOSE_WINDOW: 'close-window',
  SOCKET_ERROR: 'socket-error',
  WINDOW_STATE_CHANGE: 'window-state-change',
  SHOW_NOTIFICATION: 'show-notification'
} as const;

export const UPDATE_INTERVALS = {
  STATUS: 30000, // 30 seconds
  METRICS: 60000, // 1 minute
  OFFLINE_CHECK: 300000 // 5 minutes
} as const;

export const RETRY_CONFIG = {
  MAX_RETRIES: 5,
  RETRY_DELAY: 5000,
  DEV_SERVER_RETRIES: 3,
  DEV_SERVER_RETRY_DELAY: 1000
} as const;

export const ERROR_MESSAGES = {
  MACHINE_ID_NOT_AVAILABLE: 'Machine ID is not available',
  CONNECTION_FAILED: 'Connection failed',
  SHUTDOWN_FAILED: 'Failed to shutdown system',
  RESTART_FAILED: 'Failed to restart system',
  LOGOUT_FAILED: 'Failed to logout user',
  REGISTRATION_FAILED: 'Failed to register computer',
  UPDATE_FAILED: 'Failed to update computer status',
  OFFLINE_FAILED: 'Failed to set computer offline',
  SPECS_UPDATE_FAILED: 'Failed to update computer specifications'
} as const;