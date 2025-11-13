                                                                                import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation, HostListener, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector       : 'app-image-viewer',
    templateUrl    : './image-viewer.component.html',
    styleUrls      : ['./image-viewer.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [
        CommonModule,
        MatButtonModule,
        MatIconModule
    ],
})
export class ImageViewerComponent implements OnInit, OnChanges
{
    @Input() imageUrl: string = '';
    @Input() imageName: string = '';
    @Input() fileSize: number = 0; // File size in bytes
    @Input() isOpen: boolean = false;
    @Input() images: Array<{url: string, name: string, size: number}> = []; // Array of images for navigation
    @Input() currentIndex: number = 0; // Current image index
    @Output() close = new EventEmitter<void>();
    @Output() imageChanged = new EventEmitter<number>(); // Emit when image changes

    currentImage: {url: string, name: string, size: number} = {url: '', name: '', size: 0};

    /**
     * Constructor
     */
    constructor() 
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void
    {
        this.updateCurrentImage();
    }

    ngOnChanges(changes: SimpleChanges): void
    {
        if (changes['images'] || changes['currentIndex'] || changes['imageUrl']) {
            this.updateCurrentImage();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get formatted file size (always in MB)
     */
    get formattedFileSize(): string
    {
        const fileSize = this.currentImage.size || this.fileSize;
        if (!fileSize || fileSize === 0) {
            return '';
        }
        
        const mb = 1024 * 1024;
        const sizeInMB = fileSize / mb;
        
        return sizeInMB.toFixed(2) + ' MB';
    }

    /**
     * Get current image name
     */
    get currentImageName(): string
    {
        return this.currentImage.name || this.imageName;
    }

    /**
     * Get current image URL
     */
    get currentImageUrl(): string
    {
        return this.currentImage.url || this.imageUrl;
    }

    /**
     * Check if navigation is available
     */
    get hasMultipleImages(): boolean
    {
        return this.images && this.images.length > 1;
    }

    /**
     * Check if previous button should be enabled (always enabled for infinite navigation)
     */
    get canGoPrevious(): boolean
    {
        return this.hasMultipleImages;
    }

    /**
     * Check if next button should be enabled (always enabled for infinite navigation)
     */
    get canGoNext(): boolean
    {
        return this.hasMultipleImages;
    }

    /**
     * Get image counter text
     */
    get imageCounter(): string
    {
        if (!this.hasMultipleImages) {
            return '';
        }
        return `${this.currentIndex + 1} of ${this.images.length}`;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Update current image based on inputs
     */
    updateCurrentImage(): void
    {
        if (this.images && this.images.length > 0 && this.currentIndex >= 0 && this.currentIndex < this.images.length) {
            this.currentImage = this.images[this.currentIndex];
        } else {
            // Fallback to single image inputs
            this.currentImage = {
                url: this.imageUrl,
                name: this.imageName,
                size: this.fileSize
            };
        }
    }

    /**
     * Go to previous image (with infinite navigation)
     */
    goToPrevious(): void
    {
        if (this.hasMultipleImages) {
            // Circular navigation: if at first image, go to last image
            if (this.currentIndex <= 0) {
                this.currentIndex = this.images.length - 1;
            } else {
                this.currentIndex--;
            }
            this.updateCurrentImage();
            this.imageChanged.emit(this.currentIndex);
        }
    }

    /**
     * Go to next image (with infinite navigation)
     */
    goToNext(): void
    {
        if (this.hasMultipleImages) {
            // Circular navigation: if at last image, go to first image
            if (this.currentIndex >= this.images.length - 1) {
                this.currentIndex = 0;
            } else {
                this.currentIndex++;
            }
            this.updateCurrentImage();
            this.imageChanged.emit(this.currentIndex);
        }
    }

    /**
     * Handle keyboard navigation
     */
    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void
    {
        if (!this.isOpen) {
            return;
        }

        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.goToPrevious();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.goToNext();
                break;
            case 'Escape':
                event.preventDefault();
                this.closeViewer();
                break;
        }
    }

    /**
     * Close the image viewer
     */
    closeViewer(): void
    {
        this.close.emit();
    }

    /**
     * Download the image
     */
    downloadImage(): void
    {
        const imageUrl = this.currentImageUrl;
        const imageName = this.currentImageName;

        if (!imageUrl) {
            return;
        }

        // Fetch the image and trigger download
        fetch(imageUrl)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = imageName || 'image';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error('Error downloading image:', error);
                // Fallback: try direct download
                const link = document.createElement('a');
                link.href = imageUrl;
                link.download = imageName || 'image';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
    }
}

