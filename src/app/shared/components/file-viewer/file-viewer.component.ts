import { ChangeDetectionStrategy, Component, computed, input, output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardDocumentViewerComponent } from '@shared/document-viewer/document-viewer.component';
import { ZardImageViewerComponent, ImageItem } from '@shared/image-viewer/image-viewer.component';
import { ZardPdfViewerComponent } from '@shared/pdf-viewer/pdf-viewer.component';
import { ZardVideoViewerComponent } from '@shared/video-viewer/video-viewer.component';
import { getFileViewerType, getDocumentType } from '@shared/utils/file-type.util';

@Component({
  selector: 'z-file-viewer',
  exportAs: 'zFileViewer',
  standalone: true,
  imports: [
    CommonModule,
    ZardDocumentViewerComponent,
    ZardImageViewerComponent,
    ZardPdfViewerComponent,
    ZardVideoViewerComponent,
  ],
  templateUrl: './file-viewer.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardFileViewerComponent {
  readonly fileUrl = input.required<string>();
  readonly fileName = input<string>('');
  readonly fileSize = input<number>(0);
  readonly isOpen = input<boolean>(false);
  readonly images = input<ImageItem[]>([]); // Array of images for navigation
  readonly currentIndex = input<number>(0); // Current image index

  readonly close = output<void>();
  readonly imageChanged = output<number>(); // Emit when image changes

  // Determine which viewer type to use
  protected readonly viewerType = computed(() => {
    return getFileViewerType(this.fileUrl());
  });

  // Document type for document viewer
  protected readonly documentType = computed(() => {
    return getDocumentType(this.fileUrl());
  });

  // Computed signals for each viewer
  protected readonly showImageViewer = computed(() => {
    return this.isOpen() && this.viewerType() === 'image';
  });

  protected readonly showPdfViewer = computed(() => {
    return this.isOpen() && this.viewerType() === 'pdf';
  });

  protected readonly showDocumentViewer = computed(() => {
    return this.isOpen() && (this.viewerType() === 'document' || this.viewerType() === 'unknown');
  });

  protected readonly showVideoViewer = computed(() => {
    return this.isOpen() && this.viewerType() === 'video';
  });

  // Get images array for image viewer
  protected readonly imageItems = computed(() => {
    return this.images();
  });

  // Get current index for image viewer
  protected readonly currentImageIndex = computed(() => {
    const index = this.currentIndex();
    const images = this.images();
    if (images && images.length > 0) {
      // Ensure index is within bounds
      if (index >= 0 && index < images.length) {
        return index;
      }
      return 0;
    }
    return 0;
  });

  /**
   * Handle close event from any viewer
   */
  onClose(): void {
    this.close.emit();
  }

  /**
   * Handle image change event from image viewer
   */
  onImageChanged(index: number): void {
    this.imageChanged.emit(index);
  }
}

