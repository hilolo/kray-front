/**
 * File Manager Item model from backend
 */
export interface FileManagerItem {
  id: string;
  folderId: string;
  name: string;
  createdAt: string;
  modifiedAt: string;
  size: string;
  type: string; // 'folder' or 'file'
  contents: string;
  description: string;
  url: string;
}

/**
 * File Manager Response model from backend
 */
export interface FileManagerResponse {
  folders: FileManagerItem[];
  files: FileManagerItem[];
  path: FileManagerItem[];
}

