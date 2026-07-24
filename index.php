<?php
/**
 * Android File Manager - PHP Backend
 * Main entry point and routing handler
 */

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Set timezone
date_default_timezone_set('UTC');

// Define constants
define('ROOT_DIR', dirname(__FILE__));
define('UPLOAD_DIR', ROOT_DIR . '/uploads');
define('MAX_UPLOAD_SIZE', 50 * 1024 * 1024); // 50MB
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip']);

// Create upload directory if not exists
if (!is_dir(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

// Initialize response
$response = [
    'success' => false,
    'data' => null,
    'error' => null
];

try {
    // Get request method and path
    $request_method = $_SERVER['REQUEST_METHOD'];
    $request_uri = $_SERVER['REQUEST_URI'];
    $request_path = parse_url($request_uri, PHP_URL_PATH);
    $request_path = str_replace('/api', '', $request_path);

    // Route handling
    if ($request_method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        // File operations
        if (strpos($request_path, '/files/list') === 0) {
            $response = listFiles($input['path'] ?? '/');
        } elseif (strpos($request_path, '/files/info') === 0) {
            $response = getFileInfo($input['path'] ?? '/');
        } elseif (strpos($request_path, '/files/create-folder') === 0) {
            $response = createFolder($input['path'] ?? '/', $input['name'] ?? 'New Folder');
        } elseif (strpos($request_path, '/files/delete') === 0) {
            $response = deleteFile($input['path'] ?? '/');
        } elseif (strpos($request_path, '/files/rename') === 0) {
            $response = renameFile($input['oldPath'] ?? '/', $input['newName'] ?? '');
        } elseif (strpos($request_path, '/files/copy') === 0) {
            $response = copyFile($input['sourcePath'] ?? '/', $input['destPath'] ?? '/');
        } elseif (strpos($request_path, '/files/move') === 0) {
            $response = moveFile($input['sourcePath'] ?? '/', $input['destPath'] ?? '/');
        } elseif (strpos($request_path, '/files/search') === 0) {
            $response = searchFiles($input['query'] ?? '', $input['path'] ?? '/');
        } elseif (strpos($request_path, '/files/upload') === 0) {
            $response = uploadFile($input['path'] ?? '/');
        } elseif (strpos($request_path, '/files/download') === 0) {
            downloadFile($input['path'] ?? '/');
            exit;
        } elseif (strpos($request_path, '/files/size') === 0) {
            $response = getDirectorySize($input['path'] ?? '/');
        } elseif (strpos($request_path, '/files/batch-delete') === 0) {
            $response = batchDelete($input['paths'] ?? []);
        } elseif (strpos($request_path, '/files/batch-move') === 0) {
            $response = batchMove($input['paths'] ?? [], $input['destPath'] ?? '/');
        } elseif (strpos($request_path, '/files/batch-copy') === 0) {
            $response = batchCopy($input['paths'] ?? [], $input['destPath'] ?? '/');
        } elseif (strpos($request_path, '/files/exists') === 0) {
            $response = pathExists($input['path'] ?? '/');
        } else {
            http_response_code(404);
            $response['error'] = 'Endpoint not found';
        }
    } elseif ($request_method === 'GET') {
        if (strpos($request_path, '/storage/info') === 0) {
            $response = getStorageInfo();
        } elseif (strpos($request_path, '/system/info') === 0) {
            $response = getSystemInfo();
        } elseif (strpos($request_path, '/system/version') === 0) {
            $response = getVersion();
        } else {
            http_response_code(404);
            $response['error'] = 'Endpoint not found';
        }
    } else {
        http_response_code(405);
        $response['error'] = 'Method not allowed';
    }
} catch (Exception $e) {
    http_response_code(500);
    $response['error'] = $e->getMessage();
}

echo json_encode($response);

// ==================== File Operations ====================

function listFiles($path) {
    $path = sanitizePath($path);
    $fullPath = UPLOAD_DIR . $path;

    if (!is_dir($fullPath)) {
        return ['success' => false, 'error' => 'Directory not found'];
    }

    $files = [];
    foreach (scandir($fullPath) as $item) {
        if ($item === '.' || $item === '..') continue;

        $itemPath = $fullPath . '/' . $item;
        $isDir = is_dir($itemPath);
        $files[] = [
            'name' => $item,
            'type' => $isDir ? 'folder' : 'file',
            'size' => $isDir ? '-' : formatBytes(filesize($itemPath)),
            'modified' => date('Y-m-d H:i', filemtime($itemPath)),
            'path' => $path . '/' . $item,
            'icon' => getFileIcon($item, $isDir)
        ];
    }

    usort($files, function($a, $b) {
        if ($a['type'] !== $b['type']) {
            return $a['type'] === 'folder' ? -1 : 1;
        }
        return strcmp($a['name'], $b['name']);
    });

    return ['success' => true, 'data' => $files];
}

function getFileInfo($path) {
    $path = sanitizePath($path);
    $fullPath = UPLOAD_DIR . $path;

    if (!file_exists($fullPath)) {
        return ['success' => false, 'error' => 'File not found'];
    }

    $isDir = is_dir($fullPath);
    $info = [
        'name' => basename($path),
        'path' => $path,
        'type' => $isDir ? 'folder' : 'file',
        'size' => $isDir ? '-' : formatBytes(filesize($fullPath)),
        'modified' => date('Y-m-d H:i', filemtime($fullPath)),
        'permissions' => substr(sprintf('%o', fileperms($fullPath)), -4),
        'owner' => function_exists('posix_getpwuid') ? posix_getpwuid(fileowner($fullPath))['name'] : 'unknown'
    ];

    return ['success' => true, 'data' => $info];
}

function createFolder($path, $name) {
    $path = sanitizePath($path);
    $fullPath = UPLOAD_DIR . $path . '/' . $name;

    if (file_exists($fullPath)) {
        return ['success' => false, 'error' => 'Folder already exists'];
    }

    if (@mkdir($fullPath, 0755)) {
        return ['success' => true, 'data' => ['message' => 'Folder created']];
    }

    return ['success' => false, 'error' => 'Failed to create folder'];
}

function deleteFile($path) {
    $path = sanitizePath($path);
    $fullPath = UPLOAD_DIR . $path;

    if (!file_exists($fullPath)) {
        return ['success' => false, 'error' => 'File not found'];
    }

    if (is_dir($fullPath)) {
        if (deleteDirectory($fullPath)) {
            return ['success' => true, 'data' => ['message' => 'Folder deleted']];
        }
    } else {
        if (@unlink($fullPath)) {
            return ['success' => true, 'data' => ['message' => 'File deleted']];
        }
    }

    return ['success' => false, 'error' => 'Failed to delete'];
}

function renameFile($oldPath, $newName) {
    $oldPath = sanitizePath($oldPath);
    $oldFullPath = UPLOAD_DIR . $oldPath;

    if (!file_exists($oldFullPath)) {
        return ['success' => false, 'error' => 'File not found'];
    }

    $dir = dirname($oldFullPath);
    $newFullPath = $dir . '/' . $newName;

    if (@rename($oldFullPath, $newFullPath)) {
        return ['success' => true, 'data' => ['message' => 'File renamed']];
    }

    return ['success' => false, 'error' => 'Failed to rename'];
}

function copyFile($sourcePath, $destPath) {
    $sourcePath = sanitizePath($sourcePath);
    $destPath = sanitizePath($destPath);
    $sourceFullPath = UPLOAD_DIR . $sourcePath;
    $destFullPath = UPLOAD_DIR . $destPath;

    if (!file_exists($sourceFullPath)) {
        return ['success' => false, 'error' => 'Source file not found'];
    }

    if (is_dir($sourceFullPath)) {
        if (copyDirectory($sourceFullPath, $destFullPath)) {
            return ['success' => true, 'data' => ['message' => 'Folder copied']];
        }
    } else {
        if (@copy($sourceFullPath, $destFullPath)) {
            return ['success' => true, 'data' => ['message' => 'File copied']];
        }
    }

    return ['success' => false, 'error' => 'Failed to copy'];
}

function moveFile($sourcePath, $destPath) {
    $sourcePath = sanitizePath($sourcePath);
    $destPath = sanitizePath($destPath);
    $sourceFullPath = UPLOAD_DIR . $sourcePath;
    $destFullPath = UPLOAD_DIR . $destPath;

    if (!file_exists($sourceFullPath)) {
        return ['success' => false, 'error' => 'Source file not found'];
    }

    if (@rename($sourceFullPath, $destFullPath)) {
        return ['success' => true, 'data' => ['message' => 'File moved']];
    }

    return ['success' => false, 'error' => 'Failed to move'];
}

function searchFiles($query, $path) {
    $path = sanitizePath($path);
    $fullPath = UPLOAD_DIR . $path;
    $results = [];

    if (!is_dir($fullPath)) {
        return ['success' => false, 'error' => 'Directory not found'];
    }

    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($fullPath));
    foreach ($iterator as $file) {
        if (stripos($file->getBasename(), $query) !== false) {
            $results[] = [
                'name' => $file->getBasename(),
                'path' => str_replace(UPLOAD_DIR, '', $file->getPathname()),
                'type' => $file->isDir() ? 'folder' : 'file'
            ];
        }
    }

    return ['success' => true, 'data' => $results];
}

function uploadFile($path) {
    if (!isset($_FILES['file'])) {
        return ['success' => false, 'error' => 'No file uploaded'];
    }

    $file = $_FILES['file'];
    $path = sanitizePath($path);
    $fullPath = UPLOAD_DIR . $path;

    if ($file['size'] > MAX_UPLOAD_SIZE) {
        return ['success' => false, 'error' => 'File too large'];
    }

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ALLOWED_EXTENSIONS)) {
        return ['success' => false, 'error' => 'File type not allowed'];
    }

    $destFile = $fullPath . '/' . basename($file['name']);
    if (@move_uploaded_file($file['tmp_name'], $destFile)) {
        return ['success' => true, 'data' => ['message' => 'File uploaded']];
    }

    return ['success' => false, 'error' => 'Upload failed'];
}

function downloadFile($path) {
    $path = sanitizePath($path);
    $fullPath = UPLOAD_DIR . $path;

    if (!file_exists($fullPath) || !is_file($fullPath)) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'File not found']);
        return;
    }

    header('Content-Disposition: attachment; filename="' . basename($fullPath) . '"');
    header('Content-Type: application/octet-stream');
    header('Content-Length: ' . filesize($fullPath));
    readfile($fullPath);
}

function getDirectorySize($path) {
    $path = sanitizePath($path);
    $fullPath = UPLOAD_DIR . $path;

    if (!is_dir($fullPath)) {
        return ['success' => false, 'error' => 'Directory not found'];
    }

    $size = getDirectorySizeRecursive($fullPath);
    return ['success' => true, 'data' => ['size' => formatBytes($size)]];
}

function getStorageInfo() {
    $disk_total = disk_total_space(UPLOAD_DIR);
    $disk_free = disk_free_space(UPLOAD_DIR);
    $disk_used = $disk_total - $disk_free;

    return ['success' => true, 'data' => [
        'total' => formatBytes($disk_total),
        'used' => formatBytes($disk_used),
        'free' => formatBytes($disk_free),
        'percentage' => round(($disk_used / $disk_total) * 100, 2)
    ]];
}

function getSystemInfo() {
    return ['success' => true, 'data' => [
        'os' => php_uname(),
        'php_version' => phpversion(),
        'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'
    ]];
}

function getVersion() {
    return ['success' => true, 'data' => ['version' => '1.0.0']];
}

function batchDelete($paths) {
    $deleted = [];
    foreach ($paths as $path) {
        $result = deleteFile($path);
        if ($result['success']) {
            $deleted[] = $path;
        }
    }
    return ['success' => true, 'data' => ['deleted' => $deleted]];
}

function batchMove($paths, $destPath) {
    $moved = [];
    foreach ($paths as $path) {
        $result = moveFile($path, $destPath . '/' . basename($path));
        if ($result['success']) {
            $moved[] = $path;
        }
    }
    return ['success' => true, 'data' => ['moved' => $moved]];
}

function batchCopy($paths, $destPath) {
    $copied = [];
    foreach ($paths as $path) {
        $result = copyFile($path, $destPath . '/' . basename($path));
        if ($result['success']) {
            $copied[] = $path;
        }
    }
    return ['success' => true, 'data' => ['copied' => $copied]];
}

function pathExists($path) {
    $path = sanitizePath($path);
    $fullPath = UPLOAD_DIR . $path;
    return ['success' => true, 'data' => ['exists' => file_exists($fullPath)]];
}

// ==================== Helper Functions ====================

function sanitizePath($path) {
    $path = str_replace('\\', '/', $path);
    $path = preg_replace('#/+#', '/', $path);
    $path = trim($path, '/');
    if (strpos($path, '..') !== false) {
        $path = '/';
    }
    return '/' . $path;
}

function formatBytes($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    $bytes /= (1 << (10 * $pow));
    return round($bytes, $precision) . ' ' . $units[$pow];
}

function getFileIcon($filename, $isDir) {
    if ($isDir) return '📁';
    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    $icons = [
        'pdf' => '📄', 'doc' => '📝', 'docx' => '📝',
        'xls' => '📊', 'xlsx' => '📊', 'ppt' => '🎯',
        'jpg' => '🖼️', 'jpeg' => '🖼️', 'png' => '🖼️', 'gif' => '🖼️',
        'mp3' => '🎵', 'mp4' => '🎬', 'avi' => '🎬',
        'zip' => '📦', 'rar' => '📦', '7z' => '📦',
        'txt' => '📄', 'js' => '💻', 'php' => '💻', 'html' => '💻'
    ];
    return $icons[$ext] ?? '📄';
}

function deleteDirectory($dir) {
    if (!is_dir($dir)) return false;
    $items = scandir($dir);
    foreach ($items as $item) {
        if ($item !== '.' && $item !== '..') {
            $path = $dir . '/' . $item;
            is_dir($path) ? deleteDirectory($path) : @unlink($path);
        }
    }
    return @rmdir($dir);
}

function copyDirectory($src, $dst) {
    if (!is_dir($dst)) @mkdir($dst, 0755, true);
    $dir = opendir($src);
    while ($file = readdir($dir)) {
        if ($file !== '.' && $file !== '..') {
            $srcPath = $src . '/' . $file;
            $dstPath = $dst . '/' . $file;
            is_dir($srcPath) ? copyDirectory($srcPath, $dstPath) : @copy($srcPath, $dstPath);
        }
    }
    closedir($dir);
    return true;
}

function getDirectorySizeRecursive($dir) {
    $size = 0;
    foreach (scandir($dir) as $file) {
        if ($file !== '.' && $file !== '..') {
            $path = $dir . '/' . $file;
            $size += is_file($path) ? filesize($path) : getDirectorySizeRecursive($path);
        }
    }
    return $size;
}
?>
