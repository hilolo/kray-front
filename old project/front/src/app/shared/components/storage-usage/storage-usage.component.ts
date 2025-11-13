import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileManagerService, StorageUsage } from 'app/modules/admin/file-manager/file-manager.service';
import { Observable, take } from 'rxjs';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
    selector: 'app-storage-usage',
    standalone: true,
    imports: [CommonModule, TranslocoModule],
    template: `
        <div class="flex items-center gap-4">
            <div class="relative w-16 h-16">
                <!-- Circular Progress -->
                <svg class="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <!-- Background Circle -->
                    <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-dasharray="100, 100"
                        class="text-gray-300 dark:text-gray-600"/>
                    <!-- Progress Circle -->
                    <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        [attr.stroke-dasharray]="percentage + ', 100'"
                        [class.text-green-500]="percentage < 50"
                        [class.text-yellow-500]="percentage >= 50 && percentage < 80"
                        [class.text-red-500]="percentage >= 80"/>
                </svg>
                <!-- Percentage Text -->
                <div class="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                    {{percentage}}%
                </div>
            </div>
            <!-- Storage Info -->
            <div class="text-sm">
                <div class="font-medium">{{formattedUsed}} / {{formattedLimit}}</div>
                <div class="text-secondary">{{ 'Storage Used' | transloco }}</div>
            </div>
        </div>
    `
})
export class StorageUsageComponent implements OnInit
{
    percentage: number = 0;
    formattedUsed: string = '0 B';
    formattedLimit: string = '1 GB';

    constructor(
        private _fileManagerService: FileManagerService,
        private _cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void
    {
        this.loadStorageUsage();
    }

    private loadStorageUsage(): void
    {
        this._fileManagerService.getStorageUsage()
            .pipe(take(1))
            .subscribe({
                next: (storageUsage: StorageUsage) => {
                    // Handle undefined or null values
                    this.percentage = storageUsage?.usedPercentage ?? 0;
                    this.formattedUsed = this.formatBytes(storageUsage?.usedBytes ?? 0);
                    this.formattedLimit = this.formatBytes(storageUsage?.limitBytes ?? 1073741824);
                    
                    // Force change detection
                    this._cdr.detectChanges();
                },
                error: (error) => {
                    console.error('Error loading storage usage:', error);
                    // Set default values on error
                    this.percentage = 0;
                    this.formattedUsed = '0 B';
                    this.formattedLimit = '1 GB';
                }
            });
    }

    private formatBytes(bytes: number): string
    {
        // Handle undefined, null, or invalid numbers
        if (!bytes || bytes === 0 || isNaN(bytes)) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        // Ensure we don't go beyond the array bounds
        const sizeIndex = Math.min(i, sizes.length - 1);
        
        return parseFloat((bytes / Math.pow(k, sizeIndex)).toFixed(1)) + ' ' + sizes[sizeIndex];
    }
}
