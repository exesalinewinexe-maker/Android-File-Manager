// Android File Manager - Storage Management

class StorageManager {
  constructor() {
    this.dbName = 'FileManagerDB';
    this.storeName = 'files';
    this.db = null;
    this.init();
  }

  /**
   * Initialize IndexedDB
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
          store.createIndex('path', 'path', { unique: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Save file to storage
   */
  async saveFile(file) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add({
        ...file,
        timestamp: Date.now()
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Get file from storage
   */
  async getFile(path) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('path');
      const request = index.get(path);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Update file in storage
   */
  async updateFile(id, updates) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const file = request.result;
        if (file) {
          const updated = { ...file, ...updates, timestamp: Date.now() };
          store.put(updated);
          resolve(updated);
        } else {
          reject(new Error('File not found'));
        }
      };
    });
  }

  /**
   * Delete file from storage
   */
  async deleteFile(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get all files
   */
  async getAllFiles() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Clear all storage
   */
  async clearAll() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get storage size
   */
  async getStorageSize() {
    const files = await this.getAllFiles();
    let size = 0;
    files.forEach(file => {
      size += file.size || 0;
    });
    return size;
  }

  /**
   * Save to localStorage
   */
  saveLocalStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('LocalStorage save error:', error);
      return false;
    }
  }

  /**
   * Get from localStorage
   */
  getLocalStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('LocalStorage get error:', error);
      return defaultValue;
    }
  }

  /**
   * Remove from localStorage
   */
  removeLocalStorage(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('LocalStorage remove error:', error);
      return false;
    }
  }

  /**
   * Clear localStorage
   */
  clearLocalStorage() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('LocalStorage clear error:', error);
      return false;
    }
  }

  /**
   * Save user preferences
   */
  savePreferences(preferences) {
    return this.saveLocalStorage('fileManagerPreferences', preferences);
  }

  /**
   * Get user preferences
   */
  getPreferences() {
    return this.getLocalStorage('fileManagerPreferences', {
      theme: 'light',
      viewMode: 'list',
      sortBy: 'name',
      sortOrder: 'asc',
      showHidden: false
    });
  }

  /**
   * Save recent files
   */
  saveRecentFiles(files) {
    return this.saveLocalStorage('fileManagerRecent', files.slice(0, 10));
  }

  /**
   * Get recent files
   */
  getRecentFiles() {
    return this.getLocalStorage('fileManagerRecent', []);
  }

  /**
   * Add to recent files
   */
  addToRecentFiles(file) {
    const recent = this.getRecentFiles();
    recent.unshift(file);
    this.saveRecentFiles(recent);
  }

  /**
   * Save bookmarks/favorites
   */
  saveBookmarks(bookmarks) {
    return this.saveLocalStorage('fileManagerBookmarks', bookmarks);
  }

  /**
   * Get bookmarks/favorites
   */
  getBookmarks() {
    return this.getLocalStorage('fileManagerBookmarks', []);
  }

  /**
   * Add bookmark
   */
  addBookmark(path, name) {
    const bookmarks = this.getBookmarks();
    bookmarks.push({ path, name, id: Date.now() });
    this.saveBookmarks(bookmarks);
    return bookmarks;
  }

  /**
   * Remove bookmark
   */
  removeBookmark(id) {
    const bookmarks = this.getBookmarks();
    const filtered = bookmarks.filter(b => b.id !== id);
    this.saveBookmarks(filtered);
    return filtered;
  }

  /**
   * Save clipboard
   */
  saveClipboard(data) {
    return this.saveLocalStorage('fileManagerClipboard', data);
  }

  /**
   * Get clipboard
   */
  getClipboard() {
    return this.getLocalStorage('fileManagerClipboard', null);
  }

  /**
   * Clear clipboard
   */
  clearClipboard() {
    return this.removeLocalStorage('fileManagerClipboard');
  }

  /**
   * Check if IndexedDB is available
   */
  isIndexedDBAvailable() {
    return !!this.db;
  }

  /**
   * Check if localStorage is available
   */
  isLocalStorageAvailable() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Export all data as JSON
   */
  async exportData() {
    const data = {
      files: await this.getAllFiles(),
      preferences: this.getPreferences(),
      bookmarks: this.getBookmarks(),
      recent: this.getRecentFiles(),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import data from JSON
   */
  async importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);

      // Clear existing data
      await this.clearAll();
      this.clearLocalStorage();

      // Import files
      if (data.files && Array.isArray(data.files)) {
        for (const file of data.files) {
          await this.saveFile(file);
        }
      }

      // Import preferences
      if (data.preferences) {
        this.savePreferences(data.preferences);
      }

      // Import bookmarks
      if (data.bookmarks) {
        this.saveBookmarks(data.bookmarks);
      }

      // Import recent files
      if (data.recent) {
        this.saveRecentFiles(data.recent);
      }

      return { success: true, message: 'Data imported successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get storage quota usage
   */
  async getQuotaUsage() {
    if (!navigator.storage || !navigator.storage.estimate) {
      return null;
    }

    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage,
      quota: estimate.quota,
      percentage: Math.round((estimate.usage / estimate.quota) * 100)
    };
  }

  /**
   * Request persistent storage
   */
  async requestPersistentStorage() {
    if (!navigator.storage || !navigator.storage.persist) {
      return false;
    }

    try {
      const persistent = await navigator.storage.persist();
      return persistent;
    } catch (error) {
      console.error('Error requesting persistent storage:', error);
      return false;
    }
  }

  /**
   * Cache file data
   */
  async cacheFile(path, data, metadata = {}) {
    const file = {
      path,
      data,
      metadata,
      cached: true,
      cacheTime: Date.now()
    };

    try {
      await this.saveFile(file);
      return true;
    } catch (error) {
      console.error('Cache error:', error);
      return false;
    }
  }

  /**
   * Get cached file
   */
  async getCachedFile(path) {
    try {
      const file = await this.getFile(path);
      if (file && file.cached) {
        return file;
      }
      return null;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  }

  /**
   * Clear old cache
   */
  async clearOldCache(maxAge = 7 * 24 * 60 * 60 * 1000) {
    try {
      const files = await this.getAllFiles();
      const now = Date.now();

      for (const file of files) {
        if (file.cached && (now - file.cacheTime) > maxAge) {
          await this.deleteFile(file.id);
        }
      }

      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }
}

// Export storage manager instance
const storageManager = new StorageManager();
