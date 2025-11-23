import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  generate: boolean;
  isLogo: boolean;
  isCachet: boolean;
  htmlBody: string;
  example: Record<string, string> | null;
  leaseeId: string | null;
  transactionId: string | null;
  companyId: string;
  createdOn: string;
  lastModifiedOn: string | null;
}

export enum DocumentType {
  LeaseAgreement = 0,
  ReservationAgreement = 1,
  Lease = 2,
  ReservationFull = 3,
  ReservationPart = 4,
  Fees = 5,
  Deposit = 6
}

export interface DocumentListRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  name?: string;
  type?: DocumentType;
  generate?: boolean;
  isLogo?: boolean;
  isCachet?: boolean;
  isLocked?: boolean;
  leaseeId?: string;
  transactionId?: string;
}

export interface DocumentListResponse {
  result: Document[]; // Changed from items to result to match API response
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize?: number;
}

export interface CreateDocumentRequest {
  name: string;
  type: DocumentType;
  generate: boolean;
  isLogo: boolean;
  isCachet: boolean;
  htmlBody?: string;
  example?: Record<string, string>;
  leaseeId?: string;
  transactionId?: string;
}

export interface UpdateDocumentRequest {
  id: string;
  name?: string;
  type?: DocumentType;
  generate?: boolean;
  isLogo?: boolean;
  isCachet?: boolean;
  htmlBody?: string;
  example?: Record<string, string>;
  leaseeId?: string;
  transactionId?: string;
}

/**
 * Service for document-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private readonly apiService = inject(ApiService);

  /**
   * Get paginated list of documents
   * @param request Document list request parameters
   * @returns Observable of paginated document list response
   */
  list(request: DocumentListRequest): Observable<DocumentListResponse> {
    return this.apiService.post<DocumentListResponse>('Document/list', request);
  }

  /**
   * Create a new document
   * POST api/Document/create
   * @param request Document creation data
   * @returns Observable of created document
   */
  create(request: CreateDocumentRequest): Observable<Document> {
    return this.apiService.post<Document>('Document/create', request);
  }

  /**
   * Get a document by ID
   * GET api/Document/{id}
   * @param id Document ID
   * @returns Observable of document
   */
  getById(id: string): Observable<Document> {
    return this.apiService.get<Document>(`Document/${id}`);
  }

  /**
   * Update an existing document
   * PUT api/Document/{id}
   * @param id Document ID
   * @param request Document update data
   * @returns Observable of updated document
   */
  update(id: string, request: UpdateDocumentRequest): Observable<Document> {
    return this.apiService.put<Document>(`Document/${id}`, request);
  }

  /**
   * Delete a document (soft delete)
   * DELETE api/Document/{id}
   * @param id Document ID
   * @returns Observable of result
   */
  delete(id: string): Observable<void> {
    return this.apiService.delete<void>(`Document/${id}`);
  }
}

