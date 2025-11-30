import { ChangeDetectionStrategy, Component, computed, HostListener, inject, input, output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';

export interface ImageItem {
  url: string;
  name: string;
  size: number;
}

@Component({
  selector: 'z-image-viewer',
  exportAs: 'zImageViewer',
  standalone: true,
  imports: [
    CommonModule,
    ZardButtonComponent,
    ZardIconComponent,
  ],
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardImageViewerComponent {
  readonly imageUrl = input<string>('');
  readonly imageName = input<string>('');
  readonly fileSize = input<number>(0);
  readonly isOpen = input<boolean>(false);
  readonly images = input<ImageItem[]>([]);
  readonly currentIndex = input<number>(0);

  readonly close = output<void>();
  readonly imageChanged = output<number>();

  // Touch/swipe handling for mobile
  private touchStartX = 0;
  private touchStartY = 0;
  private touchEndX = 0;
  private touchEndY = 0;

  // Current image
  protected readonly currentImage = computed<ImageItem>(() => {
    const images = this.images();
    const index = this.currentIndex();
    
    if (images && images.length > 0 && index >= 0 && index < images.length) {
      return images[index];
    }
    
    // Fallback to single image inputs
    return {
      url: this.imageUrl(),
      name: this.imageName(),
      size: this.fileSize(),
    };
  });

  // Formatted file size
  protected readonly formattedFileSize = computed(() => {
    const size = this.currentImage().size || this.fileSize();
    if (!size || size === 0) {
      return '';
    }
    
    const mb = 1024 * 1024;
    const sizeInMB = size / mb;
    
    return sizeInMB.toFixed(2) + ' MB';
  });

  // Current image name
  protected readonly currentImageName = computed(() => {
    return this.currentImage().name || this.imageName();
  });

  // Current image URL
  protected readonly currentImageUrl = computed(() => {
    return this.currentImage().url || this.imageUrl();
  });

  // Check if navigation is available
  protected readonly hasMultipleImages = computed(() => {
    const images = this.images();
    return images && images.length > 1;
  });

  // Get all images for mobile gallery
  protected readonly allImages = computed(() => {
    const images = this.images();
    if (images && images.length > 0) {
      return images;
    }
    // Fallback to single image
    return [{
      url: this.imageUrl(),
      name: this.imageName(),
      size: this.fileSize(),
    }];
  });

  // Image counter text
  protected readonly imageCounter = computed(() => {
    if (!this.hasMultipleImages()) {
      return '';
    }
    const images = this.images();
    const index = this.currentIndex();
    return `${index + 1} of ${images.length}`;
  });

  /**
   * Go to previous image (with infinite navigation)
   */
  goToPrevious(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (this.hasMultipleImages()) {
      const images = this.images();
      let index = this.currentIndex();
      
      // Circular navigation: if at first image, go to last image
      if (index <= 0) {
        index = images.length - 1;
      } else {
        index--;
      }
      
      // Emit the new index
      this.imageChanged.emit(index);
    }
  }

  /**
   * Go to next image (with infinite navigation)
   */
  goToNext(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (this.hasMultipleImages()) {
      const images = this.images();
      let index = this.currentIndex();
      
      // Circular navigation: if at last image, go to first image
      if (index >= images.length - 1) {
        index = 0;
      } else {
        index++;
      }
      
      // Emit the new index
      this.imageChanged.emit(index);
    }
  }

  /**
   * Handle keyboard navigation
   */
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.isOpen()) {
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
  closeViewer(): void {
    this.close.emit();
  }

  /**
   * Touch event handlers for mobile swipe
   */
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
    this.touchStartY = event.changedTouches[0].screenY;
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.touchEndY = event.changedTouches[0].screenY;
    this.handleSwipe();
  }

  private handleSwipe(): void {
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;
    
    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // Swipe right - previous image
        this.goToPrevious();
      } else {
        // Swipe left - next image
        this.goToNext();
      }
    }
  }

  /**
   * Download the image
   */
  downloadImage(): void {
    const imageUrl = this.currentImageUrl();
    const imageName = this.currentImageName();

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
