import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ZardPageComponent } from '../../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardFormFieldComponent, ZardFormControlComponent, ZardFormLabelComponent } from '@shared/components/form/form.component';
import { ZardInputGroupComponent } from '@shared/components/input-group/input-group.component';
import { ZardCardComponent } from '@shared/components/card/card.component';
import { ZardComboboxComponent, ZardComboboxOption } from '@shared/components/combobox/combobox.component';
import { ZardDialogRef } from '@shared/components/dialog/dialog-ref';
import { Z_MODAL_DATA } from '@shared/components/dialog/dialog.service';
import { BankService } from '@shared/services/bank.service';
import { ContactService } from '@shared/services/contact.service';
import { UserService } from '@shared/services/user.service';
import type { Bank } from '@shared/models/bank/bank.model';
import type { CreateBankRequest } from '@shared/models/bank/create-bank-request.model';
import type { UpdateBankRequest } from '@shared/models/bank/update-bank-request.model';
import type { Contact } from '@shared/models/contact/contact.model';
import { ContactType } from '@shared/models/contact/contact.model';

type BankFormData = {
  bankName: string;
  rib: string;
  iban: string;
  swift: string;
  contactId: string;
};

@Component({
  selector: 'app-edit-bank',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ZardPageComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardIconComponent,
    ZardFormFieldComponent,
    ZardFormControlComponent,
    ZardFormLabelComponent,
    ZardInputGroupComponent,
    ZardCardComponent,
    ZardComboboxComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './edit-bank.component.html',
})
export class EditBankComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly bankService = inject(BankService);
  private readonly contactService = inject(ContactService);
  private readonly userService = inject(UserService);
  readonly dialogRef = inject(ZardDialogRef, { optional: true });
  private readonly dialogData = inject<{ bankId?: string }>(Z_MODAL_DATA, { optional: true });
  private readonly destroy$ = new Subject<void>();

  readonly bankId = signal<string | null>(null);
  readonly isEditMode = computed(() => this.bankId() !== null);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isDialogMode = computed(() => this.dialogRef !== null);
  readonly formSubmitted = signal(false);

  // Form data
  readonly formData = signal<BankFormData>({
    bankName: '',
    rib: '',
    iban: '',
    swift: '',
    contactId: '',
  });

  // Contacts
  readonly contacts = signal<Contact[]>([]);
  readonly contactOptions = signal<ZardComboboxOption[]>([]);
  readonly isLoadingContacts = signal(false);

  // Icon templates for input groups
  readonly bankIconTemplate = viewChild.required<TemplateRef<void>>('bankIconTemplate');
  readonly contactIconTemplate = viewChild.required<TemplateRef<void>>('contactIconTemplate');
  readonly creditCardIconTemplate = viewChild.required<TemplateRef<void>>('creditCardIconTemplate');
  readonly globeIconTemplate = viewChild.required<TemplateRef<void>>('globeIconTemplate');

  // Form validation
  readonly isFormValid = computed(() => {
    const data = this.formData();
    return (
      data.rib.trim() !== '' &&
      data.contactId !== ''
    );
  });

  // Error messages
  readonly ribError = computed(() => {
    if (!this.formSubmitted()) return '';
    const value = this.formData().rib;
    if (!value || value.trim() === '') {
      return 'RIB is required';
    }
    return '';
  });

  readonly contactIdError = computed(() => {
    if (!this.formSubmitted()) return '';
    const value = this.formData().contactId;
    if (!value || value.trim() === '') {
      return 'Contact is required';
    }
    return '';
  });

  // Error states
  readonly ribHasError = computed(() => {
    return this.formSubmitted() && (!this.formData().rib || this.formData().rib.trim() === '');
  });

  readonly contactIdHasError = computed(() => {
    return this.formSubmitted() && (!this.formData().contactId || this.formData().contactId.trim() === '');
  });

  ngOnInit(): void {
    // Check if we're in dialog mode
    if (this.dialogData?.bankId) {
      // Dialog mode - use bankId from dialog data
      this.bankId.set(this.dialogData.bankId);
      this.loadBank(this.dialogData.bankId);
    } else if (!this.isDialogMode()) {
      // Page mode - check route params
      const id = this.route.snapshot.paramMap.get('id');
      if (id && id !== 'add') {
        this.bankId.set(id);
        this.loadBank(id);
      }

      // Listen to route changes (only in page mode)
      this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
        const updatedId = params.get('id');
        if (updatedId && updatedId !== 'add') {
          if (updatedId !== this.bankId()) {
            this.bankId.set(updatedId);
            this.loadBank(updatedId);
          }
        } else {
          this.bankId.set(null);
          this.resetForm();
        }
      });
    }

    // Load contacts
    this.loadContacts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBank(id: string): void {
    this.isLoading.set(true);
    
    this.bankService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bank) => {
          this.populateFormFromBank(bank);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading bank:', error);
          this.isLoading.set(false);
        },
      });
  }

  private populateFormFromBank(bank: Bank): void {
    this.formData.set({
      bankName: bank.bankName || '',
      rib: bank.rib || '',
      iban: bank.iban || '',
      swift: bank.swift || '',
      contactId: bank.contactId || '',
    });
  }

  private resetForm(): void {
    this.formData.set({
      bankName: '',
      rib: '',
      iban: '',
      swift: '',
      contactId: '',
    });
    this.formSubmitted.set(false);
  }

  loadContacts(): void {
    this.isLoadingContacts.set(true);
    const request = {
      currentPage: 1,
      pageSize: 1000,
      ignore: false,
      type: ContactType.Owner, // Default to Owner, but could be extended to load all types
    };
    
    this.contactService.list(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.contacts.set(response.result);
        // Convert contacts to combobox options
        const options: ZardComboboxOption[] = response.result.map(contact => ({
          value: contact.id,
          label: this.getContactDisplayName(contact),
        }));
        this.contactOptions.set(options);
        this.isLoadingContacts.set(false);
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
        this.isLoadingContacts.set(false);
      },
    });
  }

  getContactDisplayName(contact: Contact): string {
    let name = '';
    if (contact.isACompany) {
      name = contact.companyName || 'Unnamed Company';
    } else {
      const firstName = contact.firstName || '';
      const lastName = contact.lastName || '';
      if (firstName || lastName) {
        name = `${firstName} ${lastName}`.trim();
      } else {
        name = 'Unnamed Contact';
      }
    }
    
    // Add identifier if available
    const parts: string[] = [];
    if (name) parts.push(name);
    if (contact.identifier) parts.push(contact.identifier);
    
    return parts.length > 0 ? parts.join(' - ') : 'Unnamed Contact';
  }

  // Form submission
  onSave(): void {
    // Mark form as submitted to show validation errors
    this.formSubmitted.set(true);

    // Guard: prevent execution if form is invalid
    if (!this.isFormValid()) {
      return;
    }

    // Get companyId from current user
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser || !currentUser.companyId) {
      console.error('No company ID found for current user');
      return;
    }

    // Set loading state
    this.isSaving.set(true);

    const data = this.formData();
    const bankId = this.bankId();

    // Check if we're in edit mode
    if (bankId && this.isEditMode()) {
      // Update existing bank
      const request: UpdateBankRequest = {
        id: bankId,
        companyId: currentUser.companyId,
        contactId: data.contactId,
        bankName: data.bankName.trim() || undefined,
        rib: data.rib.trim(),
        iban: data.iban.trim() || undefined,
        swift: data.swift.trim() || undefined,
      };

      this.bankService.update(bankId, request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedBank) => {
            console.log('Bank updated successfully:', updatedBank);
            
            // Reset form submitted state on successful submission
            this.formSubmitted.set(false);
            this.isSaving.set(false);
            
            // If in dialog mode, close dialog
            if (this.dialogRef) {
              this.dialogRef.close({ bankId: updatedBank.id });
            } else {
              // Navigate back to list
              this.router.navigate(['/bank']);
            }
          },
          error: (error) => {
            console.error('Error updating bank:', error);
            this.isSaving.set(false);
            // Error is already handled by ApiService (toast notification)
          },
        });
    } else {
      // Create new bank
      const request: CreateBankRequest = {
        companyId: currentUser.companyId,
        contactId: data.contactId,
        bankName: data.bankName.trim() || undefined,
        rib: data.rib.trim(),
        iban: data.iban.trim() || undefined,
        swift: data.swift.trim() || undefined,
      };

      this.bankService.create(request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (createdBank) => {
            console.log('Bank created successfully:', createdBank);
            
            // Reset form submitted state on successful submission
            this.formSubmitted.set(false);
            this.isSaving.set(false);
            
            // If in dialog mode, close dialog
            if (this.dialogRef) {
              this.dialogRef.close({ bankId: createdBank.id });
            } else {
              // Navigate back to list
              this.router.navigate(['/bank']);
            }
          },
          error: (error) => {
            console.error('Error creating bank:', error);
            this.isSaving.set(false);
            // Error is already handled by ApiService (toast notification)
          },
        });
    }
  }

  onCancel(): void {
    // If in dialog mode, close dialog
    if (this.isDialogMode() && this.dialogRef) {
      this.dialogRef.close();
    } else {
      // Navigate back to list
      this.router.navigate(['/bank']);
    }
  }

  // Update form field helper
  updateField<K extends keyof BankFormData>(field: K, value: BankFormData[K]): void {
    this.formData.update(data => ({
      ...data,
      [field]: value,
    }));
  }
}

