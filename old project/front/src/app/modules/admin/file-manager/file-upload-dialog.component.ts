import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileManagerService, FileUploadFile } from 'app/modules/admin/file-manager/file-manager.service';
import { ErrorHandlerService } from '@fuse/services/error-handler/error-handler.service';

@Component({
    selector: 'file-upload-dialog',
    templateUrl: './file-upload-dialog.component.html',
    standalone: true,
    imports: [MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, NgFor, NgIf, FormsModule]
})
export class FileUploadDialogComponent implements OnInit
{
    @ViewChild('fileInput') fileInput: ElementRef;
    
    currentRoot: string;
    parentFolderName: string;
    folderName: string = ''; // User input for folder name
    filesToUpload: FileUploadFile[] = [];
    isUploading: boolean = false;

    constructor(
        public dialogRef: MatDialogRef<FileUploadDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _fileManagerService: FileManagerService,
        private _errorHandlerService: ErrorHandlerService
    )
    {
        this.currentRoot = data.currentRoot || '/';
        this.parentFolderName = data.folderName || 'Root';
    }

    ngOnInit(): void
    {
    }

    /**
     * Trigger file input click
     */
    triggerFileInput(): void
    {
        if (this.fileInput) {
            this.fileInput.nativeElement.click();
        }
    }

    /**
     * Handle file selection
     */
    onFileSelected(event: any): void
    {
        const files: FileList = event.target.files;
        if (!files || files.length === 0) {
            return;
        }

        // Check file size (100MB limit)
        Array.from(files).forEach(file => {
            const fileSizeInMB = file.size / (1024 * 1024);
            if (fileSizeInMB > 100) {
                this._errorHandlerService.showErrorAlert(
                    'File Too Large',
                    `File "${file.name}" is ${fileSizeInMB.toFixed(2)} MB. Please choose files smaller than 100 MB.`
                );
                return;
            }

            // Convert file to base64
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = (reader.result as string).split(',')[1];
                this.filesToUpload.push({
                    fileName: file.name,
                    base64Content: base64String
                });
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * Upload files
     */
    uploadFiles(): void
    {
        if (!this.folderName || this.folderName.trim() === '') {
            this._errorHandlerService.showErrorAlert('Folder Name Required', 'Please enter a folder name');
            return;
        }

        if (this.filesToUpload.length === 0) {
            this._errorHandlerService.showErrorAlert('No Files', 'Please select files to upload');
            return;
        }

        this.isUploading = true;

        // Construct the target folder path
        const targetFolder = this.currentRoot === '/' 
            ? this.folderName.trim()
            : `${this.currentRoot}/${this.folderName.trim()}`;

        this._fileManagerService.uploadFiles(this.filesToUpload, targetFolder).subscribe({
            next: () => {
                this._errorHandlerService.showSuccessAlert(
                    'Upload Successful',
                    `Successfully uploaded ${this.filesToUpload.length} file(s) to folder "${this.folderName}"`
                );
                this.dialogRef.close(true);
            },
            error: (error) => {
                console.error('[UploadDialog] Upload failed:', error);
                this._errorHandlerService.showErrorAlert(
                    'Upload Failed',
                    'Failed to upload files. Please try again.'
                );
                this.isUploading = false;
            }
        });
    }

    /**
     * Remove file from upload list
     */
    removeFile(index: number): void
    {
        this.filesToUpload.splice(index, 1);
    }

    /**
     * Close dialog
     */
    cancel(): void
    {
        this.dialogRef.close(false);
    }
}

