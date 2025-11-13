import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector       : 'app-video-viewer',
    templateUrl    : './video-viewer.component.html',
    styleUrls      : ['./video-viewer.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule
    ],
})
export class VideoViewerComponent implements OnInit, OnChanges, AfterViewInit
{
    @Input() videoUrl: string = '';
    @Input() videoName: string = '';
    @Input() fileSize: number = 0; // File size in bytes
    @Input() isOpen: boolean = false;
    @Output() close = new EventEmitter<void>();

    // Video state
    isLoading: boolean = false;
    loadError: boolean = false;

    // Video element reference
    @ViewChild('videoElement', { static: false }) videoElementRef: ElementRef<HTMLVideoElement>;
    videoElement: HTMLVideoElement | null = null;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef
    ) 
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.updateVideoUrl();
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void
    {
        // Use setTimeout to ensure the video element is available
        setTimeout(() => {
            if (this.videoElementRef && this.videoElementRef.nativeElement) {
                this.videoElement = this.videoElementRef.nativeElement;
                this.setupVideoEventListeners();
                this._changeDetectorRef.markForCheck();
            }
        }, 100);
    }

    /**
     * On changes
     */
    ngOnChanges(changes: SimpleChanges): void
    {
        if (changes['videoUrl'] && !changes['videoUrl'].firstChange) {
            this.updateVideoUrl();
        }
        
        if (changes['isOpen'] && changes['isOpen'].currentValue && this.videoElementRef) {
            // When the viewer opens, ensure the video element is properly initialized
            setTimeout(() => {
                if (this.videoElementRef && this.videoElementRef.nativeElement) {
                    this.videoElement = this.videoElementRef.nativeElement;
                    this.setupVideoEventListeners();
                }
            }, 50);
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
        if (!this.fileSize || this.fileSize === 0) {
            return '';
        }
        
        const mb = 1024 * 1024;
        const sizeInMB = this.fileSize / mb;
        
        return sizeInMB.toFixed(2) + ' MB';
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Close the video viewer
     */
    closeViewer(): void
    {
        if (this.videoElement) {
            this.videoElement.pause();
            this.videoElement.currentTime = 0;
        }
        this.close.emit();
    }

    /**
     * Download the video
     */
    downloadVideo(): void
    {
        if (!this.videoUrl) {
            return;
        }

        // Fetch the video and trigger download
        fetch(this.videoUrl)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = this.videoName || 'video';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error('Error downloading video:', error);
                // Fallback: try direct download
                const link = document.createElement('a');
                link.href = this.videoUrl;
                link.download = this.videoName || 'video';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
    }


    /**
     * Video loaded
     */
    onVideoLoaded(): void
    {
        this.isLoading = false;
        this.loadError = false;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Video error
     */
    onVideoError(): void
    {
        console.error('Video failed to load:', this.videoUrl);
        this.isLoading = false;
        this.loadError = true;
        this._changeDetectorRef.markForCheck();
    }


    /**
     * Setup video event listeners
     */
    private setupVideoEventListeners(): void
    {
        if (this.videoElement) {
            this.videoElement.addEventListener('loadeddata', () => this.onVideoLoaded());
            this.videoElement.addEventListener('error', () => this.onVideoError());
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Update video URL
     */
    private updateVideoUrl(): void
    {
        if (!this.videoUrl) {
            this.isLoading = false;
            this.loadError = false;
            this._changeDetectorRef.markForCheck();
            return;
        }

        this.isLoading = true;
        this.loadError = false;
        
        // Reset video element if it exists
        if (this.videoElement) {
            this.videoElement.pause();
            this.videoElement.currentTime = 0;
        }
        
        this._changeDetectorRef.markForCheck();
    }

}
