import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { FileManagerResponse } from '../models/attachment/file-manager-item.model';
import type { StorageUsage } from '../models/attachment/storage-usage.model';

/**
 * Service for attachment-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class AttachmentService {
  private readonly apiService = inject(ApiService);

  /**
   * Get file manager items (folders and files)
   * GET api/Attachment/file-manager?root={root}
   * @param root Optional root folder path (e.g., "DSFGDSG")
   * @param searchTerm Optional search term to filter files by name
   * @returns Observable of file manager response
   */
  getFileManagerItems(root?: string, searchTerm?: string): Observable<FileManagerResponse> {
    const params: Record<string, any> = {};
    if (root) {
      params['root'] = root;
    }
    if (searchTerm) {
      params['searchTerm'] = searchTerm;
    }
    return this.apiService.get<FileManagerResponse>('Attachment/file-manager', params);
  }

  /**
   * Bulk delete files by IDs
   * POST api/Attachment/bulk-delete
   * @param fileIds Array of file IDs to delete
   * @returns Observable of delete result
   */
  bulkDelete(fileIds: string[]): Observable<void> {
    const body = {
      fileIds: fileIds,
    };
    return this.apiService.post<void>('Attachment/bulk-delete', body);
  }

  /**
   * Upload files using multipart form data (recommended for multiple files and files > 10MB)
   * POST api/Attachment/upload-multipart
   * @param files Array of File objects to upload
   * @param root Optional root folder path
   * @returns Observable of upload result
   */
  uploadFilesMultipart(files: File[], root?: string): Observable<void> {
    const formData = new FormData();
    
    // Add all files to FormData
    files.forEach((file) => {
      formData.append('files', file, file.name);
    });
    
    // Add root if provided
    if (root) {
      formData.append('root', root);
    }

    // Don't set Content-Type header - let HttpClient set it automatically with boundary for FormData
    return this.apiService.post<void>('Attachment/upload-multipart', formData);
  }

  /**
   * Get storage usage information
   * GET api/Attachment/storage-usage
   * @returns Observable of storage usage information
   */
  getStorageUsage(): Observable<StorageUsage> {
    return this.apiService.get<StorageUsage>('Attachment/storage-usage');
  }
}

