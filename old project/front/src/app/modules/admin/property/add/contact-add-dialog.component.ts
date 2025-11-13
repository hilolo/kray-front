import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ContactsDetailsComponent } from 'app/modules/admin/contacts/details/details.component';
import { Contact, ContactType } from 'app/modules/admin/contacts/contacts.types';

@Component({
    selector: 'contact-add-dialog',
    templateUrl: './contact-add-dialog.component.html',
    styleUrls: ['./contact-add-dialog.component.scss'],
    standalone: true,
    imports: [
        ContactsDetailsComponent
    ]
})
export class ContactAddDialogComponent implements OnInit {
    dialogMode = true;
    contactType: ContactType;

    constructor(
        public dialogRef: MatDialogRef<ContactAddDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { type: ContactType }
    ) {
        this.contactType = data.type;
    }

    ngOnInit(): void {
    }

    onContactSaved(contact: Contact): void {
        this.dialogRef.close(contact);
    }

    onDialogClosed(): void {
        this.dialogRef.close();
    }
}
