// src/utils/fileUtils.js

// Crée l'URL complète vers un fichier à partir de son chemin
export function getFileUrl(filePath) {
    return filePath ? `/storage/${filePath}` : null;
  }
  
  // Formate une taille de fichier en une unité lisible (ex: 1.5 MB)
  export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // Devine le type de fichier en fonction de son extension
  export function getFileType(fileName) {
    if (!fileName) return 'unknown';
    const extension = fileName.split('.').pop().toLowerCase();
  
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
    const audioTypes = ['mp3', 'wav', 'ogg', 'aac', 'flac'];
    const documentTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
  
    if (imageTypes.includes(extension)) return 'image';
    if (videoTypes.includes(extension)) return 'video';
    if (audioTypes.includes(extension)) return 'audio';
    if (documentTypes.includes(extension)) return 'document';
  
    return 'file';
  }
  
  // Valide un fichier avant de l'envoyer à l'API
  export function validateFile(file, maxSize = 10 * 1024 * 1024) {
    if (!file) {
      throw new Error('Aucun fichier sélectionné');
    }
  
    if (file.size > maxSize) {
      throw new Error(`Le fichier est trop volumineux (max: ${formatFileSize(maxSize)})`);
    }
  
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
      'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv'
    ];
  
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Type de fichier non autorisé');
    }
  
    return true;
  }
  