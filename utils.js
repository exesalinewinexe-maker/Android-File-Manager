// Android File Manager - Utility Functions

class Utils {
  /**
   * Format bytes to human readable format
   */
  static formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Format timestamp to readable date
   */
  static formatDate(timestamp, format = 'YYYY-MM-DD HH:mm') {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  /**
   * Get file extension
   */
  static getFileExtension(filename) {
    return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
  }

  /**
   * Get file name without extension
   */
  static getFileNameWithoutExtension(filename) {
    return filename.substring(0, filename.lastIndexOf('.'));
  }

  /**
   * Check if file is image
   */
  static isImage(filename) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
    return imageExtensions.includes(this.getFileExtension(filename));
  }

  /**
   * Check if file is video
   */
  static isVideo(filename) {
    const videoExtensions = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'];
    return videoExtensions.includes(this.getFileExtension(filename));
  }

  /**
   * Check if file is audio
   */
  static isAudio(filename) {
    const audioExtensions = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'];
    return audioExtensions.includes(this.getFileExtension(filename));
  }

  /**
   * Check if file is document
   */
  static isDocument(filename) {
    const docExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md'];
    return docExtensions.includes(this.getFileExtension(filename));
  }

  /**
   * Check if file is archive
   */
  static isArchive(filename) {
    const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'];
    return archiveExtensions.includes(this.getFileExtension(filename));
  }

  /**
   * Get file icon based on type
   */
  static getFileIcon(filename) {
    return CONFIG.FILE_ICONS[this.getFileExtension(filename)] || CONFIG.FILE_ICONS['default'];
  }

  /**
   * Debounce function
   */
  static debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Throttle function
   */
  static throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func.apply(this, args);
      }
    };
  }

  /**
   * Deep clone object
   */
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (obj instanceof Object) {
      const clonedObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
  }

  /**
   * Merge objects
   */
  static mergeObjects(target, source) {
    const output = this.deepClone(target);
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.mergeObjects(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }

  /**
   * Check if value is object
   */
  static isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * Escape HTML
   */
  static escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Sanitize filename
   */
  static sanitizeFilename(filename) {
    return filename
      .replace(/[^a-z0-9_\-\.]/gi, '_')
      .replace(/^\.+/, '')
      .replace(/\.+$/, '')
      .substring(0, 255);
  }

  /**
   * Generate unique ID
   */
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Generate UUID v4
   */
  static generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Validate email
   */
  static isValidEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  }

  /**
   * Validate URL
   */
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Copy to clipboard
   */
  static async copyToClipboard(text) {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
      }
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
      return false;
    }
  }

  /**
   * Read file as text
   */
  static readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  /**
   * Read file as data URL
   */
  static readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Read file as array buffer
   */
  static readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Download file
   */
  static downloadFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /**
   * Sort array by property
   */
  static sortBy(array, property, order = 'asc') {
    const sorted = [...array];
    sorted.sort((a, b) => {
      if (a[property] < b[property]) return order === 'asc' ? -1 : 1;
      if (a[property] > b[property]) return order === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }

  /**
   * Filter array by property
   */
  static filterBy(array, property, value) {
    return array.filter(item => item[property] === value);
  }

  /**
   * Group array by property
   */
  static groupBy(array, property) {
    return array.reduce((groups, item) => {
      const key = item[property];
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    }, {});
  }

  /**
   * Flatten array
   */
  static flatten(array, depth = 1) {
    return depth > 0
      ? array.reduce((acc, val) => acc.concat(Array.isArray(val) ? this.flatten(val, depth - 1) : val), [])
      : array;
  }

  /**
   * Unique array
   */
  static unique(array) {
    return [...new Set(array)];
  }

  /**
   * Check if arrays are equal
   */
  static arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((val, idx) => val === arr2[idx]);
  }

  /**
   * Get query parameter
   */
  static getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  /**
   * Set query parameter
   */
  static setQueryParam(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.replaceState({}, '', url);
  }

  /**
   * Remove query parameter
   */
  static removeQueryParam(name) {
    const url = new URL(window.location);
    url.searchParams.delete(name);
    window.history.replaceState({}, '', url);
  }

  /**
   * Get URL parameters as object
   */
  static getUrlParams() {
    const params = {};
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }

  /**
   * Capitalize string
   */
  static capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Convert camelCase to kebab-case
   */
  static camelToKebab(str) {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  /**
   * Convert kebab-case to camelCase
   */
  static kebabToCamel(str) {
    return str.replace(/-./g, x => x[1].toUpperCase());
  }

  /**
   * Convert snake_case to camelCase
   */
  static snakeToCamel(str) {
    return str.replace(/_./g, x => x[1].toUpperCase());
  }

  /**
   * Truncate string
   */
  static truncate(str, length, suffix = '...') {
    if (str.length > length) {
      return str.substring(0, length - suffix.length) + suffix;
    }
    return str;
  }

  /**
   * Repeat string
   */
  static repeat(str, count) {
    return str.repeat(count);
  }

  /**
   * Pad string
   */
  static padStart(str, length, padString = ' ') {
    return str.padStart(length, padString);
  }

  /**
   * Pad end
   */
  static padEnd(str, length, padString = ' ') {
    return str.padEnd(length, padString);
  }

  /**
   * Remove duplicates from array
   */
  static removeDuplicates(array) {
    return [...new Set(array)];
  }

  /**
   * Sleep/delay
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry function
   */
  static async retry(fn, maxAttempts = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxAttempts) throw error;
        await this.sleep(delay * attempt);
      }
    }
  }

  /**
   * Calculate MD5 hash (simple)
   */
  static async calculateHash(file) {
    const buffer = await this.readFileAsArrayBuffer(file);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Compress image
   */
  static async compressImage(file, quality = 0.8) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(resolve, 'image/jpeg', quality);
        };
      };
    });
  }
}

// Export Utils
const utils = Utils;
