import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { BankListRequest } from '../models/bank/bank-list-request.model';
import type { BankListResponse } from '../models/bank/bank-list-response.model';
import type { CreateBankRequest } from '../models/bank/create-bank-request.model';
import type { UpdateBankRequest } from '../models/bank/update-bank-request.model';
import type { Bank } from '../models/bank/bank.model';

/**
 * Service for bank-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class BankService {
  private readonly apiService = inject(ApiService);

  /**
   * Get paginated list of banks
   * POST api/Bank/list
   * @param request Bank list request parameters
   * @returns Observable of paginated bank list response
   */
  list(request: BankListRequest): Observable<BankListResponse> {
    return this.apiService.post<BankListResponse>('Bank/list', request);
  }

  /**
   * Create a new bank
   * POST api/Bank/create
   * @param request Bank creation data
   * @returns Observable of created bank
   */
  create(request: CreateBankRequest): Observable<Bank> {
    return this.apiService.post<Bank>('Bank/create', request);
  }

  /**
   * Get a bank by ID
   * GET api/Bank/{id}
   * @param id Bank ID
   * @returns Observable of bank
   */
  getById(id: string): Observable<Bank> {
    return this.apiService.get<Bank>(`Bank/${id}`);
  }

  /**
   * Update an existing bank
   * PUT api/Bank/{id}
   * @param id Bank ID
   * @param request Bank update data
   * @returns Observable of updated bank
   */
  update(id: string, request: UpdateBankRequest): Observable<Bank> {
    return this.apiService.put<Bank>(`Bank/${id}`, request);
  }

  /**
   * Delete a bank (soft delete)
   * DELETE api/Bank/{id}
   * @param id Bank ID
   * @returns Observable of void
   */
  delete(id: string): Observable<void> {
    return this.apiService.delete<void>(`Bank/${id}`);
  }
}

