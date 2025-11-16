import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { KeyListRequest } from '../models/key/key-list-request.model';
import type { KeyListResponse } from '../models/key/key-list-response.model';
import type { CreateKeyRequest } from '../models/key/create-key-request.model';
import type { UpdateKeyRequest } from '../models/key/update-key-request.model';
import type { Key } from '../models/key/key.model';

/**
 * Service for key-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class KeyService {
  private readonly apiService = inject(ApiService);

  /**
   * Get paginated list of keys
   * POST api/Key/list
   * @param request Key list request parameters
   * @returns Observable of paginated key list response
   */
  list(request: KeyListRequest): Observable<KeyListResponse> {
    return this.apiService.post<KeyListResponse>('Key/list', request);
  }

  /**
   * Create a new key
   * POST api/Key/create
   * @param request Key creation data
   * @returns Observable of created key
   */
  create(request: CreateKeyRequest): Observable<Key> {
    return this.apiService.post<Key>('Key/create', request);
  }

  /**
   * Get a key by ID
   * GET api/Key/{id}
   * @param id Key ID
   * @returns Observable of key
   */
  getById(id: string): Observable<Key> {
    return this.apiService.get<Key>(`Key/${id}`);
  }

  /**
   * Update an existing key
   * PUT api/Key/{id}
   * @param id Key ID
   * @param request Key update data
   * @returns Observable of updated key
   */
  update(id: string, request: UpdateKeyRequest): Observable<Key> {
    return this.apiService.put<Key>(`Key/${id}`, request);
  }

  /**
   * Delete a key (soft delete)
   * DELETE api/Key/{id}
   * @param id Key ID
   * @returns Observable of void
   */
  delete(id: string): Observable<void> {
    return this.apiService.delete<void>(`Key/${id}`);
  }
}

