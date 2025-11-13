import { ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BanksService } from '../banks.service';
import { Bank, CreateBankDto, UpdateBankDto, BankDialogMode } from '../banks.types';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';
import { ContactsService } from '../../contacts/contacts.service';
import { Contact } from '../../contacts/contacts.types';

@Component({
    selector: 'bank-dialog',
    templateUrl: './bank-dialog.component.html',
    styleUrls: ['./bank-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatSelectModule,
        MatProgressSpinnerModule
    ]
})
export class BankDialogComponent implements OnInit {
    bankForm: FormGroup;
    mode: BankDialogMode;
    bank: Bank;
    isLoading: boolean = false;
    contacts: Contact[] = [];
    filteredContacts: Contact[] = [];
    loadingContacts: boolean = false;
    contactSearchTerm: string = '';
    showContactDropdown: boolean = false;
    selectedContactId: string = '';
    isEditingContact: boolean = false;
    formFieldHelpers: string[] = [''];

    BankDialogMode = BankDialogMode;

    constructor(
        public dialogRef: MatDialogRef<BankDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { mode: BankDialogMode; bank?: Bank },
        private _formBuilder: FormBuilder,
        private _banksService: BanksService,
        private _contactsService: ContactsService,
        private _errorHandlerService: ErrorHandlerService,
        private _changeDetectorRef: ChangeDetectorRef
    ) {
        this.mode = data.mode;
        this.bank = data.bank;
    }

    ngOnInit(): void {
        // Initialize form
        this.bankForm = this._formBuilder.group({
            contactId: [
                { value: this.bank?.contactId || '', disabled: this.mode === BankDialogMode.VIEW },
                [Validators.required]
            ],
            bankName: [
                { value: this.bank?.bankName || '', disabled: this.mode === BankDialogMode.VIEW },
                [Validators.maxLength(200)]
            ],
            rib: [
                { value: this.bank?.rib || '', disabled: this.mode === BankDialogMode.VIEW },
                [Validators.required, Validators.maxLength(100)]
            ],
            iban: [
                { value: this.bank?.iban || '', disabled: this.mode === BankDialogMode.VIEW },
                [Validators.maxLength(100)]
            ],
            swift: [
                { value: this.bank?.swift || '', disabled: this.mode === BankDialogMode.VIEW },
                [Validators.maxLength(50)]
            ]
        });

        // Load contacts if not in view mode
        if (this.mode !== BankDialogMode.VIEW) {
            // Set selected contact if in edit mode (before loading to avoid errors)
            if (this.mode === BankDialogMode.EDIT && this.bank?.contactId) {
                this.selectedContactId = this.bank.contactId;
            }
            
            // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
            setTimeout(() => {
                this.loadContacts();
            });
        }
    }

    /**
     * Load all contacts for selection
     */
    loadContacts(): void {
        this.loadingContacts = true;
        this._changeDetectorRef.detectChanges();
        
        this._contactsService.getContacts({
            currentPage: 1,
            pageSize: 1000,
            searchQuery: '',
            ignore: true // Get all contacts
        }).subscribe({
            next: (result) => {
                this.contacts = result.result || [];
                this.filteredContacts = [...this.contacts];
                this.loadingContacts = false;
                this._changeDetectorRef.detectChanges();
            },
            error: (error) => {
                this._errorHandlerService.showErrorAlert('Error', 'Failed to load contacts');
                console.error('Error loading contacts:', error);
                this.loadingContacts = false;
                this._changeDetectorRef.detectChanges();
            }
        });
    }

    /**
     * Filter contacts based on search term
     */
    filterContacts(searchTerm: string): void {
        if (!searchTerm || searchTerm.trim() === '') {
            this.filteredContacts = [...this.contacts];
            return;
        }

        const term = searchTerm.toLowerCase().trim();
        this.filteredContacts = this.contacts.filter(contact => {
            const matchesFirstName = contact.firstName?.toLowerCase().includes(term);
            const matchesLastName = contact.lastName?.toLowerCase().includes(term);
            const matchesCompanyName = contact.companyName?.toLowerCase().includes(term);
            const matchesEmail = contact.email?.toLowerCase().includes(term);
            const matchesIdentifier = contact.identifier?.toLowerCase().includes(term);
            
            return matchesFirstName || matchesLastName || matchesCompanyName || matchesEmail || matchesIdentifier;
        });
    }

    /**
     * Handle contact input
     */
    onContactInput(event: any): void {
        this.contactSearchTerm = event.target.value;
        this.isEditingContact = true;
        this.showContactDropdown = true;
        this.filterContacts(this.contactSearchTerm);
    }

    /**
     * Handle contact focus
     */
    onContactFocus(): void {
        this.isEditingContact = true;
        this.showContactDropdown = true;
        this.contactSearchTerm = '';
        this.filterContacts(this.contactSearchTerm);
    }

    /**
     * Handle contact blur
     */
    onContactBlur(): void {
        setTimeout(() => {
            this.showContactDropdown = false;
            this.isEditingContact = false;
            if (!this.selectedContactId) {
                this.contactSearchTerm = '';
            }
        }, 200);
    }

    /**
     * Select contact
     */
    selectContact(contactId: string): void {
        this.selectedContactId = contactId;
        this.bankForm.patchValue({ contactId: contactId });
        this.showContactDropdown = false;
        this.isEditingContact = false;
        this.contactSearchTerm = '';
    }

    /**
     * Clear contact selection
     */
    clearContactSelection(): void {
        this.selectedContactId = '';
        this.bankForm.patchValue({ contactId: '' });
        this.contactSearchTerm = '';
        this.filterContacts('');
    }

    /**
     * Get selected contact display text
     */
    getSelectedContactDisplay(): string {
        if (!this.selectedContactId) {
            return '';
        }
        const contact = this.contacts.find(c => c.id === this.selectedContactId);
        return contact ? this.getContactDisplayName(contact) : '';
    }

    /**
     * Get contact display name
     */
    getContactDisplayName(contact: Contact): string {
        if (contact.isACompany && contact.companyName) {
            return contact.companyName;
        }
        return `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unnamed';
    }

    /**
     * Get dialog title
     */
    getTitle(): string {
        switch (this.mode) {
            case BankDialogMode.ADD:
                return 'Add New Bank Account';
            case BankDialogMode.EDIT:
                return 'Edit Bank Account';
            case BankDialogMode.VIEW:
                return 'Bank Account Details';
            default:
                return 'Bank Account';
        }
    }

    /**
     * Get contact name by ID
     */
    getContactName(contactId: string): string {
        const contact = this.contacts.find(c => c.id === contactId);
        return contact ? this.getContactDisplayName(contact) : contactId;
    }

    /**
     * Save bank
     */
    save(): void {
        if (this.bankForm.invalid) {
            this._errorHandlerService.showErrorAlert('Validation Error', 'Please fill in all required fields');
            return;
        }

        this.isLoading = true;
        const formValue = this.bankForm.value;

        if (this.mode === BankDialogMode.ADD) {
            const createDto: CreateBankDto = {
                contactId: formValue.contactId,
                bankName: formValue.bankName,
                rib: formValue.rib,
                iban: formValue.iban,
                swift: formValue.swift
            };

            this._banksService.createBank(createDto).subscribe({
                next: (result) => {
                    this._errorHandlerService.showSuccessAlert('Success', 'Bank account created successfully');
                    this.isLoading = false;
                    this.dialogRef.close(true);
                },
                error: (error) => {
                    this._errorHandlerService.showErrorAlert('Error', 'Failed to create bank account');
                    console.error('Error creating bank:', error);
                    this.isLoading = false;
                }
            });
        } else if (this.mode === BankDialogMode.EDIT) {
            const updateDto: UpdateBankDto = {
                id: this.bank.id,
                contactId: formValue.contactId,
                bankName: formValue.bankName,
                rib: formValue.rib,
                iban: formValue.iban,
                swift: formValue.swift
            };

            this._banksService.updateBank(this.bank.id, updateDto).subscribe({
                next: (result) => {
                    this._errorHandlerService.showSuccessAlert('Success', 'Bank account updated successfully');
                    this.isLoading = false;
                    this.dialogRef.close(true);
                },
                error: (error) => {
                    this._errorHandlerService.showErrorAlert('Error', 'Failed to update bank account');
                    console.error('Error updating bank:', error);
                    this.isLoading = false;
                }
            });
        }
    }

    /**
     * Close dialog
     */
    close(): void {
        this.dialogRef.close();
    }
}

