import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { ContactListRequest } from '../models/contact/contact-list-request.model';
import type { ContactListResponse } from '../models/contact/contact-list-response.model';
import type { CreateContactRequest } from '../models/contact/create-contact-request.model';
import type { UpdateContactRequest } from '../models/contact/update-contact-request.model';
import type { Contact } from '../models/contact/contact.model';

/**
 * Service for contact-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private readonly apiService = inject(ApiService);

  /**
   * Get paginated list of contacts
   * @param request Contact list request parameters
   * @returns Observable of paginated contact list response
   */
  list(request: ContactListRequest): Observable<ContactListResponse> {
    return this.apiService.post<ContactListResponse>('Contact/list', request);
  }

  /**
   * Create a new contact
   * POST api/Contact/create
   * @param request Contact creation data
   * @returns Observable of created contact
   */
  create(request: CreateContactRequest): Observable<Contact> {
    return this.apiService.post<Contact>('Contact/create', request);
  }

  /**
   * Get a contact by ID
   * GET api/Contact/{id}?includeRelated=false
   * @param id Contact ID
   * @param includeRelated Whether to include related entities (default: false)
   * @returns Observable of contact
   */
  getById(id: string, includeRelated: boolean = false): Observable<Contact> {
    return this.apiService.get<Contact>(`Contact/${id}?includeRelated=${includeRelated}`);
  }

  /**
   * Update an existing contact
   * PUT api/Contact/{id}
   * @param id Contact ID
   * @param request Contact update data
   * @returns Observable of updated contact
   */
  update(id: string, request: UpdateContactRequest): Observable<Contact> {
    return this.apiService.put<Contact>(`Contact/${id}`, request);
  }

  /**
   * Delete a contact (soft delete)
   * DELETE api/Contact/{id}
   * @param id Contact ID
   * @returns Observable of result
   */
  delete(id: string): Observable<void> {
    return this.apiService.delete<void>(`Contact/${id}`);
  }
}

