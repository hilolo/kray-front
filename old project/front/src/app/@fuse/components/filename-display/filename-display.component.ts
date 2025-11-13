import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'fuse-filename-display',
    templateUrl: './filename-display.component.html',
    styleUrls: ['./filename-display.component.scss'],
    standalone: true,
    imports: [CommonModule, MatTooltipModule]
})
export class FilenameDisplayComponent implements OnInit {
    @Input() filename: string = '';
    @Input() maxLength: number = 30;
    @Input() showExtension: boolean = true;
    @Input() truncateMode: 'middle' | 'end' | 'none' = 'end';
    @Input() tooltipPosition: 'above' | 'below' | 'left' | 'right' = 'above';
    @Input() cssClass: string = '';

    displayName: string = '';
    fullName: string = '';
    fileExtension: string = '';
    fileNameWithoutExtension: string = '';

    ngOnInit(): void {
        this.processFilename();
    }

    private processFilename(): void {
        this.fullName = this.filename;
        
        if (!this.filename) {
            this.displayName = '';
            return;
        }

        // Extract file extension
        const lastDotIndex = this.filename.lastIndexOf('.');
        if (lastDotIndex > 0 && this.showExtension) {
            this.fileExtension = this.filename.substring(lastDotIndex);
            this.fileNameWithoutExtension = this.filename.substring(0, lastDotIndex);
        } else {
            this.fileExtension = '';
            this.fileNameWithoutExtension = this.filename;
        }

        // Determine display name based on truncate mode
        if (this.truncateMode === 'none' || this.filename.length <= this.maxLength) {
            this.displayName = this.filename;
        } else {
            this.displayName = this.truncateFilename();
        }
    }

    private truncateFilename(): string {
        const totalLength = this.maxLength;
        const extensionLength = this.fileExtension.length;
        const nameLength = totalLength - extensionLength - 3; // 3 for "..."

        if (this.truncateMode === 'middle') {
            if (this.fileNameWithoutExtension.length <= nameLength) {
                return this.filename;
            }

            const startLength = Math.floor(nameLength / 2);
            const endLength = nameLength - startLength;
            
            const startPart = this.fileNameWithoutExtension.substring(0, startLength);
            const endPart = this.fileNameWithoutExtension.substring(
                this.fileNameWithoutExtension.length - endLength
            );
            
            return `${startPart}...${endPart}${this.fileExtension}`;
        } else {
            // 'end' mode
            const namePart = this.fileNameWithoutExtension.substring(0, nameLength);
            return `${namePart}...${this.fileExtension}`;
        }
    }

    get shouldShowTooltip(): boolean {
        return this.filename.length > this.maxLength;
    }
}
