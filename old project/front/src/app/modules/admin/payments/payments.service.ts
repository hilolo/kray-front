import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Payment, CreatePaymentDto, UpdatePaymentDto, GetPaymentsFilter, PaginatedResult, PaymentType, RevenueCategory, ExpenseCategory } from './payments.types';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';

@Injectable({
    providedIn: 'root'
})
export class PaymentsService {
    private _errorHandlerService = inject(ErrorHandlerService);
    
    // In-memory storage (frontend only)
    private payments: Payment[] = [];
    private nextId: number = 1;

    /**
     * Get paginated payments
     */
    getPayments(filter: GetPaymentsFilter): Observable<PaginatedResult<Payment>> {
        try {
            let filteredPayments = [...this.payments];

            // Apply search filter
            if (filter.searchQuery && filter.searchQuery.trim()) {
                const searchLower = filter.searchQuery.toLowerCase();
                filteredPayments = filteredPayments.filter(p => 
                    p.description?.toLowerCase().includes(searchLower) ||
                    p.items.some(item => item.description?.toLowerCase().includes(searchLower))
                );
            }

            // Apply type filter
            if (filter.type !== undefined && filter.type !== null) {
                filteredPayments = filteredPayments.filter(p => p.type === filter.type);
            }

            // Apply status filter
            if (filter.status !== undefined && filter.status !== null) {
                filteredPayments = filteredPayments.filter(p => p.status === filter.status);
            }

            // Apply company filter
            if (filter.companyId) {
                filteredPayments = filteredPayments.filter(p => p.companyId === filter.companyId);
            }

            // Calculate pagination
            const totalItems = filteredPayments.length;
            const totalPages = Math.ceil(totalItems / filter.pageSize);
            const startIndex = (filter.currentPage - 1) * filter.pageSize;
            const endIndex = startIndex + filter.pageSize;
            const paginatedResults = filteredPayments.slice(startIndex, endIndex);

            return of({
                currentPage: filter.currentPage,
                totalPages: totalPages,
                totalItems: totalItems,
                result: paginatedResults
            }).pipe(delay(300)); // Simulate network delay
        } catch (error) {
            this._errorHandlerService.showErrorAlert('Error', 'Failed to load payments');
            return throwError(() => error);
        }
    }

    /**
     * Get payment by ID
     */
    getPayment(id: string): Observable<Payment> {
        try {
            const payment = this.payments.find(p => p.id === id);
            if (!payment) {
                this._errorHandlerService.showErrorAlert('Error', 'Payment not found');
                return throwError(() => new Error('Payment not found'));
            }
            return of(payment).pipe(delay(200));
        } catch (error) {
            this._errorHandlerService.showErrorAlert('Error', 'Failed to load payment');
            return throwError(() => error);
        }
    }

    /**
     * Create new payment
     */
    createPayment(dto: CreatePaymentDto): Observable<Payment> {
        try {
            // Calculate totals
            const subtotal = dto.items.reduce((sum, item) => sum + item.amount, 0);
            const vatTotal = dto.items.reduce((sum, item) => sum + (item.amount * item.vat / 100), 0);
            const total = subtotal + vatTotal;

            const payment: Payment = {
                id: `payment-${this.nextId++}`,
                type: dto.type,
                category: dto.category,
                status: dto.status,
                items: dto.items,
                description: dto.description,
                subtotal: subtotal,
                vatTotal: vatTotal,
                total: total,
                companyId: dto.companyId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            this.payments.push(payment);
            this._errorHandlerService.showSuccessAlert('Success', 'Payment created successfully');
            return of(payment).pipe(delay(300));
        } catch (error) {
            this._errorHandlerService.showErrorAlert('Error', 'Failed to create payment');
            return throwError(() => error);
        }
    }

    /**
     * Update payment
     */
    updatePayment(dto: UpdatePaymentDto): Observable<Payment> {
        try {
            const index = this.payments.findIndex(p => p.id === dto.id);
            if (index === -1) {
                this._errorHandlerService.showErrorAlert('Error', 'Payment not found');
                return throwError(() => new Error('Payment not found'));
            }

            // Calculate totals
            const subtotal = dto.items.reduce((sum, item) => sum + item.amount, 0);
            const vatTotal = dto.items.reduce((sum, item) => sum + (item.amount * item.vat / 100), 0);
            const total = subtotal + vatTotal;

            const payment: Payment = {
                ...this.payments[index],
                type: dto.type,
                category: dto.category,
                status: dto.status,
                items: dto.items,
                description: dto.description,
                subtotal: subtotal,
                vatTotal: vatTotal,
                total: total,
                updatedAt: new Date().toISOString()
            };

            this.payments[index] = payment;
            this._errorHandlerService.showSuccessAlert('Success', 'Payment updated successfully');
            return of(payment).pipe(delay(300));
        } catch (error) {
            this._errorHandlerService.showErrorAlert('Error', 'Failed to update payment');
            return throwError(() => error);
        }
    }

    /**
     * Delete payment
     */
    deletePayment(id: string): Observable<void> {
        try {
            const index = this.payments.findIndex(p => p.id === id);
            if (index === -1) {
                this._errorHandlerService.showErrorAlert('Error', 'Payment not found');
                return throwError(() => new Error('Payment not found'));
            }

            this.payments.splice(index, 1);
            this._errorHandlerService.showSuccessAlert('Success', 'Payment deleted successfully');
            return of(void 0).pipe(delay(300));
        } catch (error) {
            this._errorHandlerService.showErrorAlert('Error', 'Failed to delete payment');
            return throwError(() => error);
        }
    }
}


