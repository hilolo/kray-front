import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { 
    Contact, 
    Country, 
    Tag, 
    ContactType, 
    ContactDto, 
    CreateContactDto, 
    UpdateContactDto,
    GetContactsFilter,
    PaginatedResult,
    ContactTypeEnum,
    mapContactTypeToEnum,
    mapEnumToContactType,
    AttachmentInput
} from 'app/modules/admin/contacts/contacts.types';
import { BehaviorSubject, catchError, EMPTY, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { environment } from 'environments/environment';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';

@Injectable({providedIn: 'root'})
export class ContactsService
{
    // Private
    private _contact: BehaviorSubject<Contact | null> = new BehaviorSubject(null);
    private _contacts: BehaviorSubject<Contact[] | null> = new BehaviorSubject(null);
    private _countries: BehaviorSubject<Country[] | null> = new BehaviorSubject(null);
    private _tags: BehaviorSubject<Tag[] | null> = new BehaviorSubject(null);
    private _currentType: BehaviorSubject<ContactType> = new BehaviorSubject('tenant');
    private _pagination: BehaviorSubject<{ currentPage: number, totalPages: number, totalItems: number }> = new BehaviorSubject({ currentPage: 1, totalPages: 1, totalItems: 0 });

    private apiUrl = `${environment.apiUrl}/api/Contact`;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _errorHandlerService: ErrorHandlerService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for contact
     */
    get contact$(): Observable<Contact>
    {
        return this._contact.asObservable();
    }

    /**
     * Getter for contacts
     */
    get contacts$(): Observable<Contact[]>
    {
        return this._contacts.asObservable();
    }

    /**
     * Getter for countries
     */
    get countries$(): Observable<Country[]>
    {
        return this._countries.asObservable();
    }

    /**
     * Getter for tags
     */
    get tags$(): Observable<Tag[]>
    {
        return this._tags.asObservable();
    }

    /**
     * Getter for current contact type
     */
    get currentType$(): Observable<ContactType>
    {
        return this._currentType.asObservable();
    }

    /**
     * Getter for current contact type value
     */
    get currentType(): ContactType
    {
        return this._currentType.value;
    }

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<{ currentPage: number, totalPages: number, totalItems: number }>
    {
        return this._pagination.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Set the current contact type
     */
    setContactType(type: ContactType): void
    {
        this._currentType.next(type);
    }

    /**
     * Clear the current contact
     */
    clearContact(): void
    {
        this._contact.next(null);
    }

    /**
     * Get contacts with filter (can get all contacts or filter by type)
     */
    getContacts(filter: GetContactsFilter): Observable<PaginatedResult<Contact>>
    {
        return this._httpClient.post<any>(`${this.apiUrl}/list`, filter).pipe(
            map((response) => {
                // Handle the response wrapper
                const data = response.data || response;
                
                // Update pagination
                this._pagination.next({
                    currentPage: data.currentPage || 1,
                    totalPages: data.totalPages || 1,
                    totalItems: data.totalItems || 0
                });

                // Map DTOs to Contact interface
                const contacts = this.mapDtoArrayToContacts(data.result || []);
                this._contacts.next(contacts);
                
                return {
                    currentPage: data.currentPage || 1,
                    totalPages: data.totalPages || 1,
                    totalItems: data.totalItems || 0,
                    result: contacts
                };
            }),
            catchError((error) => {
                this._errorHandlerService.showErrorAlert('Error', 'Failed to load contacts');
                console.error('Error loading contacts:', error);
                return of({
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 0,
                    result: []
                });
            })
        );
    }

    /**
     * Get contacts by type
     */
    getContactsByType(type: ContactType, page: number = 1, pageSize: number = 10, ignorePageSize: boolean = false, searchQuery?: string, isACompany?: boolean): Observable<Contact[]>
    {
        const filter: GetContactsFilter = {
            currentPage: page,
            pageSize: pageSize,
            ignore: ignorePageSize,
            type: mapContactTypeToEnum(type),
            searchQuery: searchQuery || undefined,
            isACompany: isACompany
        };

        return this._httpClient.post<any>(`${this.apiUrl}/list`, filter).pipe(
            map((response) => {
                // Handle the response wrapper
                const data = response.data || response;
                
                // Update pagination
                this._pagination.next({
                    currentPage: data.currentPage || 1,
                    totalPages: data.totalPages || 1,
                    totalItems: data.totalItems || 0
                });

                // Map DTOs to Contact interface
                const contacts = this.mapDtoArrayToContacts(data.result || []);
                this._contacts.next(contacts);
                return contacts;
            }),
            catchError((error) => {
                this._errorHandlerService.showErrorAlert('Error', 'Failed to load contacts');
                console.error('Error loading contacts:', error);
                return of([]);
            })
        );
    }

    /**
     * Get contact by ID
     * @param id Contact ID
     * @param includeRelated If true, includes related entities (Properties, Leases, Banks). Default is false for edit mode, true for detail mode.
     */
    getContactById(id: string, includeRelated: boolean = false): Observable<Contact>
    {
        const params = includeRelated ? { includeRelated: 'true' } : {};
        return this._httpClient.get<any>(`${this.apiUrl}/${id}`, { params }).pipe(
            map((response) => {
                const data = response.data || response;
                const contact = this.mapDtoToContact(data);
                this._contact.next(contact);
                return contact;
            }),
            catchError((error) => {
                this._errorHandlerService.showErrorAlert('Error', 'Failed to load contact');
                console.error('Error loading contact:', error);
                return EMPTY;
            })
        );
    }

    /**
     * Create contact
     */
    createContact(type: ContactType, contactData?: Omit<Partial<Contact>, 'attachments'> & { attachments?: AttachmentInput[] }): Observable<Contact>
    {
        const createDto: CreateContactDto = {
            firstName: contactData?.firstName || '',
            lastName: contactData?.lastName || '',
            companyName: contactData?.companyName || '',
            ice: contactData?.ice || '',
            rc: contactData?.rc || '',
            identifier: contactData?.identifier || '',
            type: mapContactTypeToEnum(type),
            isACompany: contactData?.isACompany || false,
            email: contactData?.email || '',
            phones: contactData?.phones || [],
            avatar: contactData?.avatar || '',
            attachments: contactData?.attachments || undefined,
        };

        return this._httpClient.post<any>(`${this.apiUrl}/create`, createDto).pipe(
            map((response) => {
                const data = response.data || response;
                const newContact = this.mapDtoToContact(data);
                
                // Update contacts list
                const currentContacts = this._contacts.value || [];
                this._contacts.next([newContact, ...currentContacts]);
                
                return newContact;
            }),
            tap(() => {
                this._errorHandlerService.showSuccessAlert('Success', 'Contact created successfully');
            }),
            catchError((error) => {
                this._errorHandlerService.showErrorAlert('Error', 'Failed to create contact');
                console.error('Error creating contact:', error);
                return EMPTY;
            })
        );
    }

    /**
     * Update contact
     */
    updateContact(id: string, contact: Omit<Partial<Contact>, 'attachments'> & { attachmentsToAdd?: AttachmentInput[], attachmentsToDelete?: string[] }): Observable<Contact>
    {
        // Build update DTO, only including avatar if explicitly provided
        const updateDto: UpdateContactDto = {
            id: id,
            firstName: contact.firstName || '',
            lastName: contact.lastName || '',
            companyName: contact.companyName || '',
            ice: contact.ice || '',
            rc: contact.rc || '',
            identifier: contact.identifier || '',
            email: contact.email || '',
            phones: contact.phones || [],
            attachmentsToAdd: contact.attachmentsToAdd || undefined,
            attachmentsToDelete: contact.attachmentsToDelete || undefined,
        };

        // Only include avatar if it's explicitly provided (base64 string or empty string to remove)
        // If undefined, omit it so backend leaves existing avatar unchanged
        if (contact.avatar !== undefined) {
            updateDto.avatar = contact.avatar;
        }

        return this._httpClient.put<any>(`${this.apiUrl}/${id}`, updateDto).pipe(
            map((response) => {
                const data = response.data || response;
                const updatedContact = this.mapDtoToContact(data);
                
                // Update contacts list
                const contacts = this._contacts.value || [];
                const index = contacts.findIndex(item => item.id === id);
                if (index !== -1) {
                    contacts[index] = updatedContact;
                    this._contacts.next([...contacts]);
                }
                
                // Update current contact if it's the one being edited
                if (this._contact.value?.id === id) {
                    this._contact.next(updatedContact);
                }
                
                return updatedContact;
            }),
            tap(() => {
                this._errorHandlerService.showSuccessAlert('Success', 'Contact updated successfully');
            }),
            catchError((error) => {
                this._errorHandlerService.showErrorAlert('Error', 'Failed to update contact');
                console.error('Error updating contact:', error);
                return EMPTY;
            })
        );
    }

    /**
     * Delete the contact
     */
    deleteContact(id: string): Observable<boolean>
    {
        return this._httpClient.delete<any>(`${this.apiUrl}/${id}`).pipe(
            map(() => {
                // Remove from contacts list
                const contacts = this._contacts.value || [];
                const index = contacts.findIndex(item => item.id === id);
                if (index !== -1) {
                    contacts.splice(index, 1);
                    this._contacts.next([...contacts]);
                }
                
                return true;
            }),
            tap(() => {
                this._errorHandlerService.showSuccessAlert('Success', 'Contact deleted successfully');
            }),
            catchError((error) => {
                this._errorHandlerService.showErrorAlert('Error', 'Failed to delete contact');
                console.error('Error deleting contact:', error);
                return of(false);
            })
        );
    }

    /**
     * Upload avatar
     */
    uploadAvatar(id: string, file: File): Observable<Contact>
    {
        return new Observable((observer) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = (reader.result as string).split(',')[1];
                
                // Get the current contact
                const contact = this._contact.value;
                if (contact) {
                    // Exclude attachments when updating avatar only
                    const { attachments, ...contactWithoutAttachments } = contact;
                    contactWithoutAttachments.avatar = base64String;
                    this.updateContact(id, contactWithoutAttachments).subscribe({
                        next: (updatedContact) => {
                            observer.next(updatedContact);
                            observer.complete();
                        },
                        error: (error) => {
                            observer.error(error);
                        }
                    });
                } else {
                    observer.error(new Error('Contact not found'));
                }
            };
            reader.onerror = (error) => {
                observer.error(error);
            };
        });
    }

    /**
     * Create tag (placeholder - implement when backend supports it)
     */
    createTag(tag: Tag): Observable<Tag>
    {
        // TODO: Implement when backend API supports tags
        return of(tag);
    }

    /**
     * Update the tag (placeholder - implement when backend supports it)
     */
    updateTag(id: string, tag: Tag): Observable<Tag>
    {
        // TODO: Implement when backend API supports tags
        return of(tag);
    }

    /**
     * Delete the tag (placeholder - implement when backend supports it)
     */
    deleteTag(id: string): Observable<boolean>
    {
        // TODO: Implement when backend API supports tags
        return of(true);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Map ContactDto to Contact interface
     */
    private mapDtoToContact(dto: ContactDto): Contact
    {
        const fullName = [dto.firstName, dto.lastName].filter(Boolean).join(' ');
        
        // Handle case where API returns type as string instead of enum number
        let typeEnum: ContactTypeEnum;
        const dtoType = dto.type as any; // Cast to any to handle both string and number
        if (typeof dtoType === 'string') {
            const typeLower = dtoType.toLowerCase();
            typeEnum = typeLower === 'owner' ? ContactTypeEnum.Owner :
                      typeLower === 'tenant' ? ContactTypeEnum.Tenant :
                      typeLower === 'service' ? ContactTypeEnum.Service :
                      typeLower === 'pro' ? ContactTypeEnum.Pro :
                      ContactTypeEnum.Tenant;
        } else {
            typeEnum = dtoType as ContactTypeEnum;
        }
        
        const mappedType = mapEnumToContactType(typeEnum);
        
        // Create contact object with all properties including related entities
        const contact: any = {
            id: dto.id,
            type: mappedType,
            name: fullName || dto.companyName || 'Unknown',
            firstName: dto.firstName,
            lastName: dto.lastName,
            companyName: dto.companyName,
            ice: dto.ice,
            rc: dto.rc,
            identifier: dto.identifier,
            email: dto.email,
            emails: dto.email ? [{ email: dto.email, label: 'Work' }] : [],
            phones: dto.phones || [],
            phoneNumbers: (dto.phones || []).map(phone => ({
                country: 'ma',
                phoneNumber: phone,
                label: 'Work'
            })),
            avatar: dto.avatar,
            attachments: dto.attachments || [],
            attachmentCount: dto.attachmentCount || 0,
            isACompany: dto.isACompany,
            company: dto.isACompany ? dto.companyName : '',
            tags: [],
            createdAt: dto.createdAt,
            updatedAt: dto.updatedAt
        };
        
        // Add related entities if they exist (properties, leases, banks)
        if ((dto as any).properties !== undefined) {
            contact.properties = (dto as any).properties;
        }
        if ((dto as any).leases !== undefined) {
            contact.leases = (dto as any).leases;
        }
        if ((dto as any).banks !== undefined) {
            contact.banks = (dto as any).banks;
        }
        
        return contact;
    }

    /**
     * Map array of ContactDto to Contact array
     */
    private mapDtoArrayToContacts(dtos: ContactDto[]): Contact[]
    {
        return dtos.map(dto => this.mapDtoToContact(dto));
    }
}
