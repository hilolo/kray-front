import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, input, output, ViewChild, ViewEncapsulation, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'z-video-viewer',
  exportAs: 'zVideoViewer',
  standalone: true,
  imports: [
    CommonModule,
    ZardButtonComponent,
    ZardIconComponent,
  ],
  templateUrl: './video-viewer.component.html',
  styleUrls: ['./video-viewer.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardVideoViewerComponent implements AfterViewInit {
  private readonly cdr = inject(ChangeDetectorRef);

  readonly videoUrl = input<string>('');
  readonly videoName = input<string>('');
  readonly fileSize = input<number>(0);
  readonly isOpen = input<boolean>(false);

  readonly close = output<void>();

  // Video element reference
  @ViewChild('videoElement', { static: false }) videoElementRef?: ElementRef<HTMLVideoElement>;

  protected readonly isLoading = computed(() => false);
  protected readonly loadError = computed(() => false);

  // Formatted file size
  protected readonly formattedFileSize = computed(() => {
    const size = this.fileSize();
    if (!size || size === 0) {
      return '';
    }
    
    const mb = 1024 * 1024;
    const sizeInMB = size / mb;
    
    return sizeInMB.toFixed(2) + ' MB';
  });

  /**
   * After view init
   */
  ngAfterViewInit(): void {
    // Use setTimeout to ensure the video element is available
    setTimeout(() => {
      if (this.videoElementRef?.nativeElement) {
        this.setupVideoEventListeners();
        this.cdr.markForCheck();
      }
    }, 100);
  }

  /**
   * Close the video viewer
   */
  closeViewer(): void {
    const videoElement = this.videoElementRef?.nativeElement;
    if (videoElement) {
      videoElement.pause();
      videoElement.currentTime = 0;
    }
    this.close.emit();
  }

  /**
   * Download the video
   */
  downloadVideo(): void {
    if (!this.videoUrl()) {
      return;
    }

    // Fetch the video and trigger download
    fetch(this.videoUrl())
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.videoName() || 'video';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Error downloading video:', error);
        // Fallback: try direct download
        const link = document.createElement('a');
        link.href = this.videoUrl();
        link.download = this.videoName() || 'video';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  }

  /**
   * Setup video event listeners
   */
  private setupVideoEventListeners(): void {
    const videoElement = this.videoElementRef?.nativeElement;
    if (videoElement) {
      videoElement.addEventListener('loadeddata', () => {
        this.cdr.markForCheck();
      });
      videoElement.addEventListener('error', () => {
        this.cdr.markForCheck();
      });
    }
  }
}
