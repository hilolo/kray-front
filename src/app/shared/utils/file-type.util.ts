/**
 * File type detection utility
 */

export type FileViewerType = 'image' | 'pdf' | 'document' | 'video' | 'unknown';

export interface FileTypeInfo {
  viewerType: FileViewerType;
  extension: string;
  mimeType?: string;
}

/**
 * Get file extension from URL or filename
 */
export function getFileExtension(urlOrFilename: string): string {
  if (!urlOrFilename) return '';
  
  // Remove query parameters and hash
  const cleanUrl = urlOrFilename.split('?')[0].split('#')[0];
  
  // Extract extension
  const parts = cleanUrl.split('.');
  if (parts.length < 2) return '';
  
  return parts[parts.length - 1].toLowerCase();
}

/**
 * Determine file viewer type from URL or filename
 */
export function getFileViewerType(urlOrFilename: string): FileViewerType {
  const extension = getFileExtension(urlOrFilename);
  
  // Image extensions
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
  if (imageExtensions.includes(extension)) {
    return 'image';
  }
  
  // PDF extension
  if (extension === 'pdf') {
    return 'pdf';
  }
  
  // Video extensions
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'];
  if (videoExtensions.includes(extension)) {
    return 'video';
  }
  
  // Document extensions (Word, Excel, PowerPoint)
  const documentExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp'];
  if (documentExtensions.includes(extension)) {
    return 'document';
  }
  
  return 'unknown';
}

/**
 * Get file type info from URL or filename
 */
export function getFileTypeInfo(urlOrFilename: string): FileTypeInfo {
  const extension = getFileExtension(urlOrFilename);
  const viewerType = getFileViewerType(urlOrFilename);
  
  return {
    viewerType,
    extension,
  };
}

/**
 * Get document type for document viewer (doc, xl, ppt, pdf)
 */
export function getDocumentType(urlOrFilename: string): 'doc' | 'xl' | 'ppt' | 'pdf' {
  const extension = getFileExtension(urlOrFilename);
  
  // Word documents
  if (extension === 'doc' || extension === 'docx' || extension === 'odt') {
    return 'doc';
  }
  
  // Excel spreadsheets
  if (extension === 'xls' || extension === 'xlsx' || extension === 'ods') {
    return 'xl';
  }
  
  // PowerPoint presentations
  if (extension === 'ppt' || extension === 'pptx' || extension === 'odp') {
    return 'ppt';
  }
  
  // PDF
  if (extension === 'pdf') {
    return 'pdf';
  }
  
  // Default to doc
  return 'doc';
}

