// Android File Manager - API Handler

class FileAPI {
  constructor() {
    this.baseURL = '/api';
    this.timeout = 5000;
  }

  /**
   * Make a generic API request
   */
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body = null,
      headers = {}
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(path) {
    return this.request('/files/list', {
      method: 'POST',
      body: { path }
    });
  }

  /**
   * Get file details
   */
  async getFileInfo(path) {
    return this.request('/files/info', {
      method: 'POST',
      body: { path }
    });
  }

  /**
   * Create a new folder
   */
  async createFolder(path, name) {
    return this.request('/files/create-folder', {
      method: 'POST',
      body: { path, name }
    });
  }

  /**
   * Delete a file or folder
   */
  async deleteFile(path) {
    return this.request('/files/delete', {
      method: 'POST',
      body: { path }
    });
  }

  /**
   * Rename a file
   */
  async renameFile(oldPath, newName) {
    return this.request('/files/rename', {
      method: 'POST',
      body: { oldPath, newName }
    });
  }

  /**
   * Copy a file
   */
  async copyFile(sourcePath, destPath) {
    return this.request('/files/copy', {
      method: 'POST',
      body: { sourcePath, destPath }
    });
  }

  /**
   * Move a file
   */
  async moveFile(sourcePath, destPath) {
    return this.request('/files/move', {
      method: 'POST',
      body: { sourcePath, destPath }
    });
  }

  /**
   * Search files
   */
  async searchFiles(query, path = '/') {
    return this.request('/files/search', {
      method: 'POST',
      body: { query, path }
    });
  }

  /**
   * Upload a file
   */
  async uploadFile(file, path) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    try {
      const response = await fetch(`${this.baseURL}/files/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Upload Error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Download a file
   */
  async downloadFile(path) {
    try {
      const response = await fetch(`${this.baseURL}/files/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      return { success: true, data: blob };
    } catch (error) {
      console.error('Download Error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get file preview
   */
  async getFilePreview(path) {
    return this.request('/files/preview', {
      method: 'POST',
      body: { path }
    });
  }

  /**
   * Get directory size
   */
  async getDirectorySize(path) {
    return this.request('/files/size', {
      method: 'POST',
      body: { path }
    });
  }

  /**
   * Get storage info
   */
  async getStorageInfo() {
    return this.request('/storage/info');
  }

  /**
   * Get recent files
   */
  async getRecentFiles() {
    return this.request('/files/recent');
  }

  /**
   * Get favorites
   */
  async getFavorites() {
    return this.request('/files/favorites');
  }

  /**
   * Add file to favorites
   */
  async addFavorite(path) {
    return this.request('/files/add-favorite', {
      method: 'POST',
      body: { path }
    });
  }

  /**
   * Remove file from favorites
   */
  async removeFavorite(path) {
    return this.request('/files/remove-favorite', {
      method: 'POST',
      body: { path }
    });
  }

  /**
   * Compress files
   */
  async compressFiles(paths, archiveName) {
    return this.request('/files/compress', {
      method: 'POST',
      body: { paths, archiveName }
    });
  }

  /**
   * Extract archive
   */
  async extractArchive(archivePath, destPath) {
    return this.request('/files/extract', {
      method: 'POST',
      body: { archivePath, destPath }
    });
  }

  /**
   * Get file permissions
   */
  async getPermissions(path) {
    return this.request('/files/permissions', {
      method: 'POST',
      body: { path }
    });
  }

  /**
   * Set file permissions
   */
  async setPermissions(path, permissions) {
    return this.request('/files/set-permissions', {
      method: 'POST',
      body: { path, permissions }
    });
  }

  /**
   * Get file mime type
   */
  async getMimeType(path) {
    return this.request('/files/mime-type', {
      method: 'POST',
      body: { path }
    });
  }

  /**
   * Batch operations
   */
  async batchDelete(paths) {
    return this.request('/files/batch-delete', {
      method: 'POST',
      body: { paths }
    });
  }

  async batchMove(paths, destPath) {
    return this.request('/files/batch-move', {
      method: 'POST',
      body: { paths, destPath }
    });
  }

  async batchCopy(paths, destPath) {
    return this.request('/files/batch-copy', {
      method: 'POST',
      body: { paths, destPath }
    });
  }

  /**
   * Get thumbnail
   */
  async getThumbnail(path, size = 'small') {
    return this.request('/files/thumbnail', {
      method: 'POST',
      body: { path, size }
    });
  }

  /**
   * Check if path exists
   */
  async pathExists(path) {
    return this.request('/files/exists', {
      method: 'POST',
      body: { path }
    });
  }

  /**
   * Get system info
   */
  async getSystemInfo() {
    return this.request('/system/info');
  }

  /**
   * Get version
   */
  async getVersion() {
    return this.request('/system/version');
  }
}

// Export API instance
const fileAPI = new FileAPI();
