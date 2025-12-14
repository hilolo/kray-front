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
   * Generate receipt PDF for a transaction
   * POST api/Transaction/{id}/receipt
   * @param id Transaction ID
   * @param type Receipt type (Lease, Deposit, Fees, or Maintenance)
   * @returns Observable of processed PDFMake JSON object with placeholders replaced
   */
  generateReceipt(id: string, type: number): Observable<any> {
    return this.apiService.post<any>(`Transaction/${id}/receipt`, { type });
  }

  /**
   * Generate leasing receipt PDF for a transaction with RevenueType = Loyer
   * @deprecated Use generateReceipt(id, DocumentType.Lease) instead
   * POST api/Transaction/{id}/receipt
   * @param id Transaction ID
   * @returns Observable of processed PDFMake JSON object with placeholders replaced
   */
  generateLeasingReceipt(id: string): Observable<any> {
    return this.generateReceipt(id, 2); // DocumentType.Lease = 2
  }

  /**
   * Generate deposit receipt PDF for a transaction with RevenueType = Caution
   * @deprecated Use generateReceipt(id, DocumentType.Deposit) instead
   * POST api/Transaction/{id}/receipt
   * @param id Transaction ID
   * @returns Observable of processed PDFMake JSON object with placeholders replaced
   */
  generateDepositReceipt(id: string): Observable<any> {
    return this.generateReceipt(id, 6); // DocumentType.Deposit = 6
  }

  /**
   * Generate fees receipt PDF for a transaction with RevenueType = FraisAgence
   * @deprecated Use generateReceipt(id, DocumentType.Fees) instead
   * POST api/Transaction/{id}/receipt
   * @param id Transaction ID
   * @returns Observable of processed PDFMake JSON object with placeholders replaced
   */
  generateFeesReceipt(id: string): Observable<any> {
    return this.generateReceipt(id, 5); // DocumentType.Fees = 5
  }

  /**
   * Generate maintenance receipt PDF for a transaction with RevenueType = Maintenance
   * @deprecated Use generateReceipt(id, DocumentType.Maintenance) instead
   * POST api/Transaction/{id}/receipt
   * @param id Transaction ID
   * @returns Observable of processed PDFMake JSON object with placeholders replaced
   */
  generateMaintenanceReceipt(id: string): Observable<any> {
    return this.generateReceipt(id, 7); // DocumentType.Maintenance = 7
  }

  /**
   * Generate public transaction receipt PDF (public access, no authentication required)
   * GET api/public/transactions/{id}/pdf
   * @param id Transaction ID
   * @returns Observable of processed PDFMake JSON object with placeholders replaced
   */
  generatePublicReceipt(id: string): Observable<any> {
    return this.apiService.get<any>(`public/transactions/${id}/pdf`);
  }
}

