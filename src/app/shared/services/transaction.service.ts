import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { TransactionListRequest } from '../models/transaction/transaction-list-request.model';
import type { TransactionListResponse } from '../models/transaction/transaction-list-response.model';
import type { CreateTransactionRequest } from '../models/transaction/create-transaction-request.model';
import type { UpdateTransactionRequest } from '../models/transaction/update-transaction-request.model';
import type { Transaction } from '../models/transaction/transaction.model';
import { TransactionStatus } from '../models/transaction/transaction.model';

/**
 * Service for transaction-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private readonly apiService = inject(ApiService);

  /**
   * Get paginated list of transactions
   * POST api/Transaction/list
   * @param request Transaction list request parameters
   * @returns Observable of paginated transaction list response
   */
  list(request: TransactionListRequest): Observable<TransactionListResponse> {
    return this.apiService.post<TransactionListResponse>('Transaction/list', request);
  }

  /**
   * Create a new transaction
   * POST api/Transaction/create
   * @param request Transaction creation data
   * @returns Observable of created transaction
   */
  create(request: CreateTransactionRequest): Observable<Transaction> {
    return this.apiService.post<Transaction>('Transaction/create', request);
  }

  /**
   * Get a transaction by ID
   * GET api/Transaction/{id}
   * @param id Transaction ID
   * @returns Observable of transaction
   */
  getById(id: string): Observable<Transaction> {
    return this.apiService.get<Transaction>(`Transaction/${id}`);
  }

  /**
   * Update an existing transaction
   * PUT api/Transaction/{id}
   * @param id Transaction ID
   * @param request Transaction update data
   * @returns Observable of updated transaction
   */
  update(id: string, request: UpdateTransactionRequest): Observable<Transaction> {
    return this.apiService.put<Transaction>(`Transaction/${id}`, request);
  }

  /**
   * Delete a transaction (soft delete)
   * DELETE api/Transaction/{id}
   * @param id Transaction ID
   * @returns Observable of result
   */
  delete(id: string): Observable<void> {
    return this.apiService.delete<void>(`Transaction/${id}`);
  }

  /**
   * Update transaction status
   * PUT api/Transaction/{id}/status
   * @param id Transaction ID
   * @param status New status
   * @returns Observable of updated transaction
   */
  updateStatus(id: string, status: TransactionStatus): Observable<Transaction> {
    return this.apiService.put<Transaction>(`Transaction/${id}/status`, { status });
  }

  /**
   * Generate leasing receipt PDF for a transaction with RevenueType = Loyer
   * POST api/Transaction/{id}/leasingreceipt
   * @param id Transaction ID
   * @returns Observable of processed PDFMake JSON object with placeholders replaced
   */
  generateLeasingReceipt(id: string): Observable<any> {
    return this.apiService.post<any>(`Transaction/${id}/leasingreceipt`, {});
  }

  /**
   * Generate deposit receipt PDF for a transaction with RevenueType = Caution
   * POST api/Transaction/{id}/depositreceipt
   * @param id Transaction ID
   * @returns Observable of processed PDFMake JSON object with placeholders replaced
   */
  generateDepositReceipt(id: string): Observable<any> {
    return this.apiService.post<any>(`Transaction/${id}/depositreceipt`, {});
  }
}

