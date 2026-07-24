// Android File Manager - Main Application Logic

class FileManager {
  constructor() {
    this.currentPath = '/sdcard/Documents';
    this.files = [];
    this.clipboard = null;
    this.clipboardMode = null; // 'copy' or 'cut'
    this.selectedFile = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.registerServiceWorker();
    this.loadFiles();
  }

  setupEventListeners() {
    // Header buttons
    document.getElementById('backBtn').addEventListener('click', () => this.goBack());
    document.getElementById('searchBtn').addEventListener('click', () => this.toggleSearch());

    // Search panel
    document.getElementById('searchExecuteBtn').addEventListener('click', () => this.performSearch());
    document.getElementById('closeSearchBtn').addEventListener('click', () => this.closeSearch());
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.performSearch();
    });

    // Modal buttons
    document.getElementById('confirmYesBtn').addEventListener('click', () => this.confirmAction());
    document.getElementById('confirmNoBtn').addEventListener('click', () => this.closeConfirmDialog());
    document.getElementById('renameSaveBtn').addEventListener('click', () => this.saveRename());
    document.getElementById('renameCancelBtn').addEventListener('click', () => this.closeRenameDialog());

    // Paste button
    document.getElementById('pasteBtnFloat').addEventListener('click', () => this.pasteFile());

    // Context menu items
    document.getElementById('copyBtn').addEventListener('click', () => this.copyFile());
    document.getElementById('renameBtn').addEventListener('click', () => this.openRenameDialog());
    document.getElementById('deleteBtn').addEventListener('click', () => this.deleteFile());
    document.getElementById('propertiesBtn').addEventListener('click', () => this.showProperties());
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('service-worker.js')
        .then(reg => console.log('Service Worker registered'))
        .catch(err => console.log('Service Worker registration failed:', err));
    }
  }

  loadFiles() {
    // Simulate loading files from the current path
    // In a real app, this would access the actual file system via an API
    
    this.files = this.mockFileSystem[this.currentPath] || [];
    this.renderFiles();
    this.updatePathDisplay();
  }

  renderFiles() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';

    if (this.files.length === 0) {
      fileList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📁</div>
          <div class="empty-state-text">No files found</div>
        </div>
      `;
      return;
    }

    this.files.forEach((file, index) => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.innerHTML = `
        <div class="file-icon">${file.icon}</div>
        <div class="file-info">
          <div class="file-name">${file.name}</div>
          <div class="file-details">${file.size} • ${file.modified}</div>
        </div>
      `;

      fileItem.addEventListener('click', () => this.selectFile(file, index));
      fileItem.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.selectFile(file, index);
        this.showContextMenu(e);
      });
      fileItem.addEventListener('dblclick', () => this.openFile(file));

      fileList.appendChild(fileItem);
    });
  }

  selectFile(file, index) {
    this.selectedFile = { file, index };
    
    // Remove previous selection
    document.querySelectorAll('.file-item').forEach(item => {
      item.classList.remove('selected');
    });
    
    // Add selection to current item
    document.querySelectorAll('.file-item')[index].classList.add('selected');
  }

  openFile(file) {
    if (file.type === 'folder') {
      this.currentPath = file.path;
      this.loadFiles();
    } else {
      this.showToast(`Opening ${file.name}...`);
    }
  }

  goBack() {
    const parts = this.currentPath.split('/').filter(p => p);
    if (parts.length > 1) {
      parts.pop();
      this.currentPath = '/' + parts.join('/');
      this.loadFiles();
    } else {
      this.showToast('Already at root directory');
    }
  }

  updatePathDisplay() {
    const pathParts = this.currentPath.split('/').filter(p => p);
    const displayPath = pathParts.length > 0 
      ? pathParts[pathParts.length - 1] 
      : 'File Manager';
    
    document.getElementById('currentPath').textContent = displayPath;
  }

  showContextMenu(event) {
    const menu = document.getElementById('contextMenu');
    menu.style.left = event.clientX + 'px';
    menu.style.top = event.clientY + 'px';
    menu.classList.remove('hidden');

    // Close menu when clicking elsewhere
    const closeMenu = () => {
      menu.classList.add('hidden');
      document.removeEventListener('click', closeMenu);
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 0);
  }

  copyFile() {
    if (!this.selectedFile) {
      this.showToast('No file selected');
      return;
    }

    this.clipboard = this.selectedFile.file;
    this.clipboardMode = 'copy';
    this.showPasteButton();
    this.showToast(`Copied: ${this.selectedFile.file.name}`);
  }

  pasteFile() {
    if (!this.clipboard) {
      this.showToast('Nothing to paste');
      return;
    }

    const newFile = { ...this.clipboard };
    
    if (this.clipboardMode === 'copy') {
      newFile.name = `Copy of ${newFile.name}`;
      this.files.push(newFile);
      this.showToast(`Pasted: ${newFile.name}`);
    }

    this.renderFiles();
    this.hidePasteButton();
  }

  openRenameDialog() {
    if (!this.selectedFile) {
      this.showToast('No file selected');
      return;
    }

    const renameInput = document.getElementById('renameInput');
    renameInput.value = this.selectedFile.file.name;
    document.getElementById('renameDialog').classList.remove('hidden');
  }

  saveRename() {
    if (!this.selectedFile) return;

    const newName = document.getElementById('renameInput').value.trim();
    
    if (!newName) {
      this.showToast('Name cannot be empty');
      return;
    }

    const oldName = this.selectedFile.file.name;
    this.selectedFile.file.name = newName;
    this.files[this.selectedFile.index] = this.selectedFile.file;
    
    this.closeRenameDialog();
    this.renderFiles();
    this.showToast(`Renamed: ${oldName} → ${newName}`);
  }

  closeRenameDialog() {
    document.getElementById('renameDialog').classList.add('hidden');
  }

  deleteFile() {
    if (!this.selectedFile) {
      this.showToast('No file selected');
      return;
    }

    this.showConfirmDialog(
      'Delete File?',
      `Are you sure you want to delete "${this.selectedFile.file.name}"?`,
      () => this.confirmDelete()
    );
  }

  confirmDelete() {
    if (!this.selectedFile) return;

    const fileName = this.selectedFile.file.name;
    this.files.splice(this.selectedFile.index, 1);
    this.selectedFile = null;
    
    this.closeConfirmDialog();
    this.renderFiles();
    this.showToast(`Deleted: ${fileName}`);
  }

  showProperties() {
    if (!this.selectedFile) {
      this.showToast('No file selected');
      return;
    }

    const file = this.selectedFile.file;
    const props = `
      Name: ${file.name}
      Type: ${file.type === 'folder' ? 'Folder' : 'File'}
      Size: ${file.size}
      Modified: ${file.modified}
    `;
    
    this.showToast(`${file.name}: ${file.size}`);
  }

  toggleSearch() {
    const searchPanel = document.getElementById('searchPanel');
    searchPanel.classList.toggle('hidden');
    
    if (!searchPanel.classList.contains('hidden')) {
      document.getElementById('searchInput').focus();
    }
  }

  performSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!query) {
      this.showToast('Enter a search term');
      return;
    }

    const results = this.searchFiles(query);
    this.displaySearchResults(results, query);
  }

  searchFiles(query) {
    // Simulate searching through files
    const allFiles = [];
    
    for (const path in this.mockFileSystem) {
      allFiles.push(...this.mockFileSystem[path].map(f => ({
        ...f,
        path: path
      })));
    }

    return allFiles.filter(file => 
      file.name.toLowerCase().includes(query)
    );
  }

  displaySearchResults(results, query) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';

    if (results.length === 0) {
      resultsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-text">No results for "${query}"</div>
        </div>
      `;
      return;
    }

    results.forEach(file => {
      const resultItem = document.createElement('div');
      resultItem.className = 'search-result-item';
      resultItem.innerHTML = `
        <div style="font-weight: 500;">${file.name}</div>
        <div class="search-result-path">${file.path}</div>
      `;

      resultItem.addEventListener('click', () => {
        this.currentPath = file.path;
        this.loadFiles();
        this.closeSearch();
      });

      resultsContainer.appendChild(resultItem);
    });
  }

  closeSearch() {
    document.getElementById('searchPanel').classList.add('hidden');
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('searchInput').value = '';
  }

  showConfirmDialog(title, message, callback) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmDialog').classList.remove('hidden');

    this.pendingConfirmCallback = callback;
  }

  confirmAction() {
    if (this.pendingConfirmCallback) {
      this.pendingConfirmCallback();
    }
    this.closeConfirmDialog();
  }

  closeConfirmDialog() {
    document.getElementById('confirmDialog').classList.add('hidden');
    this.pendingConfirmCallback = null;
  }

  showPasteButton() {
    document.getElementById('pasteButton').classList.remove('hidden');
  }

  hidePasteButton() {
    document.getElementById('pasteButton').classList.add('hidden');
  }

  showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }

  // Mock file system for demonstration
  mockFileSystem = {
    '/sdcard/Documents': [
      { name: 'Resume.pdf', type: 'file', size: '2.5 MB', modified: 'Today', icon: '📄', path: '/sdcard/Documents' },
      { name: 'Projects', type: 'folder', size: '—', modified: 'Yesterday', icon: '📁', path: '/sdcard/Documents/Projects' },
      { name: 'Report.docx', type: 'file', size: '1.2 MB', modified: '2 days ago', icon: '📝', path: '/sdcard/Documents' }
    ],
    '/sdcard/Documents/Projects': [
      { name: 'App-Design.psd', type: 'file', size: '45 MB', modified: '3 days ago', icon: '🎨', path: '/sdcard/Documents/Projects' },
      { name: 'Code', type: 'folder', size: '—', modified: 'Today', icon: '📁', path: '/sdcard/Documents/Projects/Code' }
    ],
    '/sdcard/Documents/Projects/Code': [
      { name: 'index.js', type: 'file', size: '12 KB', modified: 'Today', icon: '💻', path: '/sdcard/Documents/Projects/Code' },
      { name: 'style.css', type: 'file', size: '8 KB', modified: 'Today', icon: '🎨', path: '/sdcard/Documents/Projects/Code' }
    ],
    '/sdcard/Downloads': [
      { name: 'installer.apk', type: 'file', size: '25 MB', modified: 'Today', icon: '📦', path: '/sdcard/Downloads' },
      { name: 'image.jpg', type: 'file', size: '3.8 MB', modified: 'Yesterday', icon: '🖼️', path: '/sdcard/Downloads' }
    ]
  };
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.fileManager = new FileManager();
});
