// Android File Manager - Configuration

const CONFIG = {
  // App Settings
  APP_NAME: 'Android File Manager',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'A powerful file management application',

  // API Configuration
  API: {
    BASE_URL: '/api',
    TIMEOUT: 5000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
  },

  // File Operations
  FILES: {
    MAX_UPLOAD_SIZE: 50 * 1024 * 1024, // 50MB
    MAX_FOLDER_DEPTH: 10,
    ALLOWED_EXTENSIONS: [
      'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg',
      'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
      'txt', 'md', 'json', 'xml', 'csv',
      'zip', 'rar', '7z', 'tar', 'gz',
      'mp3', 'wav', 'flac', 'mp4', 'avi', 'mkv', 'mov',
      'js', 'ts', 'jsx', 'tsx', 'php', 'html', 'css', 'scss', 'sass',
      'java', 'py', 'rb', 'go', 'rs', 'c', 'cpp', 'h', 'hpp'
    ],
    BLOCKED_EXTENSIONS: ['exe', 'bat', 'cmd', 'com', 'scr'],
    HIDDEN_FILES_PATTERN: /^\./
  },

  // Display Settings
  DISPLAY: {
    DEFAULT_VIEW_MODE: 'list', // 'list', 'grid', 'compact'
    DEFAULT_SORT_BY: 'name', // 'name', 'size', 'date', 'type'
    DEFAULT_SORT_ORDER: 'asc', // 'asc', 'desc'
    ITEMS_PER_PAGE: 50,
    SHOW_HIDDEN_FILES: false,
    SHOW_FILE_EXTENSIONS: true,
    DATE_FORMAT: 'YYYY-MM-DD HH:mm',
    FILE_SIZE_FORMAT: 'auto' // 'auto', 'bytes', 'kb', 'mb', 'gb'
  },

  // Theme Configuration
  THEME: {
    DEFAULT_THEME: 'light',
    AVAILABLE_THEMES: ['light', 'dark', 'ocean', 'forest', 'sunset', 'midnight'],
    ENABLE_CUSTOM_THEMES: true,
    AUTO_SWITCH_DARK_MODE: false
  },

  // Storage Configuration
  STORAGE: {
    USE_INDEXEDDB: true,
    USE_LOCALSTORAGE: true,
    USE_SESSION_STORAGE: false,
    CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
    MAX_CACHE_SIZE: 100 * 1024 * 1024 // 100MB
  },

  // Search Configuration
  SEARCH: {
    MIN_QUERY_LENGTH: 2,
    MAX_RESULTS: 100,
    SEARCH_TIMEOUT: 10000,
    INCLUDE_FILE_CONTENT: false
  },

  // Context Menu
  CONTEXT_MENU: {
    ENABLED: true,
    CUSTOM_ITEMS: [
      'open',
      'copy',
      'cut',
      'paste',
      'rename',
      'delete',
      'properties',
      'download'
    ]
  },

  // Keyboard Shortcuts
  SHORTCUTS: {
    CTRL_A: 'selectAll',
    CTRL_C: 'copy',
    CTRL_X: 'cut',
    CTRL_V: 'paste',
    DELETE: 'delete',
    F2: 'rename',
    F5: 'refresh',
    CTRL_F: 'search',
    ESCAPE: 'clearSelection',
    CTRL_Z: 'undo',
    CTRL_Y: 'redo'
  },

  // Notifications
  NOTIFICATIONS: {
    ENABLED: true,
    POSITION: 'bottom-right', // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
    DURATION: 3000,
    SHOW_SUCCESS: true,
    SHOW_ERROR: true,
    SHOW_WARNING: true,
    SHOW_INFO: true
  },

  // Logging
  LOGGING: {
    ENABLED: true,
    LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    STORE_LOGS: true,
    MAX_LOG_SIZE: 1000,
    LOG_TO_CONSOLE: true
  },

  // Security
  SECURITY: {
    ENABLE_HTTPS_ONLY: false,
    ENABLE_CORS: true,
    ENABLE_CSP: true,
    ENABLE_XFRAME_OPTIONS: true,
    SANITIZE_FILENAMES: true,
    BLOCK_SYSTEM_FILES: true
  },

  // Performance
  PERFORMANCE: {
    ENABLE_VIRTUAL_SCROLL: true,
    VIRTUAL_SCROLL_BUFFER: 10,
    DEBOUNCE_DELAY: 300,
    THROTTLE_DELAY: 100,
    LAZY_LOAD_IMAGES: true,
    ENABLE_SERVICE_WORKER: true
  },

  // Accessibility
  ACCESSIBILITY: {
    ENABLE_KEYBOARD_NAVIGATION: true,
    ENABLE_SCREEN_READER: true,
    HIGH_CONTRAST_MODE: false,
    FOCUS_VISIBLE: true
  },

  // Undo/Redo
  UNDO_REDO: {
    ENABLED: true,
    MAX_HISTORY: 50,
    HISTORY_STORAGE: 'session'
  },

  // Bookmarks/Favorites
  BOOKMARKS: {
    ENABLED: true,
    MAX_BOOKMARKS: 100,
    STORAGE: 'local'
  },

  // Recent Files
  RECENT_FILES: {
    ENABLED: true,
    MAX_ITEMS: 20,
    STORAGE: 'local'
  },

  // Export/Import
  EXPORT_IMPORT: {
    ENABLED: true,
    SUPPORTED_FORMATS: ['json', 'csv', 'xlsx']
  },

  // Plugins/Extensions
  PLUGINS: {
    ENABLED: true,
    PLUGIN_DIR: '/plugins',
    AUTO_LOAD_PLUGINS: true
  },

  // Development
  DEVELOPMENT: {
    DEBUG_MODE: false,
    MOCK_API: false,
    SHOW_PERFORMANCE_METRICS: false,
    ENABLE_DEVTOOLS: true
  },

  // Default File Manager Paths
  DEFAULT_PATHS: {
    HOME: '/home',
    DOWNLOADS: '/downloads',
    DOCUMENTS: '/documents',
    PICTURES: '/pictures',
    VIDEOS: '/videos',
    MUSIC: '/music',
    DESKTOP: '/desktop'
  },

  // File Type Icons
  FILE_ICONS: {
    'pdf': '📄',
    'doc': '📝',
    'docx': '📝',
    'xls': '📊',
    'xlsx': '📊',
    'ppt': '🎯',
    'pptx': '🎯',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'png': '🖼️',
    'gif': '🖼️',
    'bmp': '🖼️',
    'svg': '🖼️',
    'mp3': '🎵',
    'wav': '🎵',
    'flac': '🎵',
    'mp4': '🎬',
    'avi': '🎬',
    'mkv': '🎬',
    'mov': '🎬',
    'zip': '📦',
    'rar': '📦',
    '7z': '📦',
    'tar': '📦',
    'gz': '📦',
    'txt': '📄',
    'md': '📝',
    'json': '⚙️',
    'xml': '⚙️',
    'csv': '📊',
    'js': '💻',
    'ts': '💻',
    'jsx': '💻',
    'tsx': '💻',
    'php': '💻',
    'html': '💻',
    'css': '🎨',
    'scss': '🎨',
    'sass': '🎨',
    'java': '☕',
    'py': '🐍',
    'rb': '💎',
    'go': '🐹',
    'rs': '🦀',
    'c': '©️',
    'cpp': '©️',
    'h': '©️',
    'hpp': '©️',
    'folder': '📁',
    'default': '📄'
  }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
