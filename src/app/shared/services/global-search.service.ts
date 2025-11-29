import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ContactService } from './contact.service';
import { PropertyService } from './property.service';
import { ContactType } from '../models/contact/contact.model';
import type { Contact } from '../models/contact/contact.model';
import type { Property } from '../models/property/property.model';

export interface SearchResult {
  id: string;
  type: 'tenant' | 'owner' | 'service' | 'property';
  label: string;
  subtitle?: string;
  route: string;
  icon?: string;
}

export interface GlobalSearchResponse {
  tenants: SearchResult[];
  owners: SearchResult[];
  services: SearchResult[];
  properties: SearchResult[];
}

@Injectable({
  providedIn: 'root',
})
export class GlobalSearchService {
  private readonly contactService = inject(ContactService);
  private readonly propertyService = inject(PropertyService);

  /**
   * Search across tenants, owners, services, and properties
   * @param query Search query (minimum 3 characters)
   * @returns Observable of search results grouped by type
   */
  search(query: string): Observable<GlobalSearchResponse> {
    const trimmedQuery = query.trim();
    
    if (trimmedQuery.length < 3) {
      return of({
        tenants: [],
        owners: [],
        services: [],
        properties: [],
      });
    }

    // Search tenants
    const tenantsSearch = this.contactService.list({
      currentPage: 1,
      pageSize: 10,
      ignore: false,
      type: ContactType.Tenant,
      searchQuery: trimmedQuery,
      isArchived: false,
    }).pipe(
      map(response => this.mapContactsToSearchResults(response.result || [], 'tenant', '/contact/tenants')),
      catchError(() => of([]))
    );

    // Search owners
    const ownersSearch = this.contactService.list({
      currentPage: 1,
      pageSize: 10,
      ignore: false,
      type: ContactType.Owner,
      searchQuery: trimmedQuery,
      isArchived: false,
    }).pipe(
      map(response => this.mapContactsToSearchResults(response.result || [], 'owner', '/contact/owners')),
      catchError(() => of([]))
    );

    // Search services
    const servicesSearch = this.contactService.list({
      currentPage: 1,
      pageSize: 10,
      ignore: false,
      type: ContactType.Service,
      searchQuery: trimmedQuery,
      isArchived: false,
    }).pipe(
      map(response => this.mapContactsToSearchResults(response.result || [], 'service', '/contact/services')),
      catchError(() => of([]))
    );

    // Search properties
    const propertiesSearch = this.propertyService.list({
      currentPage: 1,
      pageSize: 10,
      ignore: false,
      searchQuery: trimmedQuery,
      isArchived: false,
    }).pipe(
      map(response => this.mapPropertiesToSearchResults(response.result || [])),
      catchError(() => of([]))
    );

    return forkJoin({
      tenants: tenantsSearch,
      owners: ownersSearch,
      services: servicesSearch,
      properties: propertiesSearch,
    });
  }

  /**
   * Map contacts to search results
   */
  private mapContactsToSearchResults(
    contacts: Contact[],
    type: 'tenant' | 'owner' | 'service',
    baseRoute: string
  ): SearchResult[] {
    return contacts.map(contact => {
      const name = contact.isACompany && contact.companyName
        ? contact.companyName
        : `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
      
      const subtitle = contact.identifier ? `Ref: ${contact.identifier}` : undefined;
      
      return {
        id: contact.id,
        type,
        label: name,
        subtitle,
        route: `${baseRoute}/${contact.id}/detail`,
        icon: 'user',
      };
    });
  }

  /**
   * Map properties to search results
   */
  private mapPropertiesToSearchResults(properties: Property[]): SearchResult[] {
    return properties.map(property => {
      const label = property.name || property.identifier || 'Property';
      const subtitle = property.address ? `Address: ${property.address}` : property.identifier ? `Ref: ${property.identifier}` : undefined;
      
      return {
        id: property.id,
        type: 'property',
        label,
        subtitle,
        route: `/property/detail/${property.id}`,
        icon: 'house',
      };
    });
  }
}

