import { merge, Subject, take, takeUntil } from 'rxjs';

import { Overlay, OverlayModule, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  NgModule,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  signal,
  ViewEncapsulation,
} from '@angular/core';

import { mergeClasses } from '@shared/utils/merge-classes';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { imageHoverPreviewVariants } from './image-hover-preview.variants';
import { TOOLTIP_POSITIONS_MAP, ZardTooltipPositions } from '../tooltip/tooltip-positions';

@Directive({
  selector: '[zImageHoverPreview]',
  exportAs: 'zImageHoverPreview',
  host: {
    style: 'cursor: pointer',
  },
  standalone: true,
})
export class ZardImageHoverPreviewDirective implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly overlayPositionBuilder = inject(OverlayPositionBuilder);
  private readonly elementRef = inject(ElementRef);
  private readonly overlay = inject(Overlay);
  private readonly renderer = inject(Renderer2);
  private readonly platformId = inject(PLATFORM_ID);

  private overlayRef?: OverlayRef;
  private componentRef?: ComponentRef<ZardImageHoverPreviewComponent>;
  private scrollListenerRef?: () => void;
  private mouseMoveListenerRef?: () => void;
  private showTimeout?: ReturnType<typeof setTimeout>;
  private hideTimeout?: ReturnType<typeof setTimeout>;
  private isMouseOver = false;
  
  readonly zImageHoverPreview = input<string | null>(null);
  readonly zPosition = input<ZardTooltipPositions>('right');
  readonly zMaxWidth = input<string>('300px');
  readonly zMaxHeight = input<string>('300px');
  readonly zAlt = input<string>('');

  get nativeElement() {
    return this.elementRef.nativeElement;
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.createOverlay();
      this.setupTriggers();
    }
  }

  ngOnDestroy(): void {
    this.clearTimeouts();
    this.hide();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private clearTimeouts(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = undefined;
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = undefined;
    }
  }

  show(event?: MouseEvent) {
    // Clear any pending hide timeout
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = undefined;
    }

    // If already showing, just update the position if event provided
    if (this.componentRef) {
      if (event) {
        this.updatePreviewPosition(event);
      }
      return;
    }

    const imageUrl = this.zImageHoverPreview();
    if (!imageUrl || imageUrl.trim() === '') return;

    // Clear any pending show timeout
    this.clearTimeouts();

    // Small delay to prevent flickering when moving quickly between images
    // Reduced delay for better responsiveness
    this.showTimeout = setTimeout(() => {
      // Double-check mouse is still over element
      if (!this.isMouseOver) return;

      const previewPortal = new ComponentPortal(ZardImageHoverPreviewComponent);
      this.componentRef = this.overlayRef?.attach(previewPortal);
      if (!this.componentRef) return;

      this.componentRef.instance.setProps(
        imageUrl,
        this.zPosition(),
        this.zMaxWidth(),
        this.zMaxHeight(),
        this.zAlt(),
      );
      this.componentRef.instance.state.set('opened');

      this.componentRef.instance.onLoad$.pipe(take(1)).subscribe(() => {
        // Track mouse movement to position preview near cursor
        this.trackMousePosition();
        // Set initial position if event provided
        if (event) {
          this.updatePreviewPosition(event);
        }
      });

      this.scrollListenerRef = this.renderer.listen(window, 'scroll', () => {
        this.hide(0);
      });
    }, 50);
  }

  hide(animationDuration = 150) {
    // Clear any pending show timeout
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = undefined;
    }

    // Clear any existing hide timeout
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }

    if (!this.componentRef) return;

    this.componentRef.instance.state.set('closed');

    if (this.mouseMoveListenerRef) {
      this.mouseMoveListenerRef();
      this.mouseMoveListenerRef = undefined;
    }

    this.hideTimeout = setTimeout(() => {
      this.overlayRef?.detach();
      this.componentRef = undefined;
      this.hideTimeout = undefined;
    }, animationDuration);

    if (this.scrollListenerRef) {
      this.scrollListenerRef();
      this.scrollListenerRef = undefined;
    }
  }

  private setupTriggers() {
    this.renderer.listen(this.elementRef.nativeElement, 'mouseenter', (event: MouseEvent) => {
      event.preventDefault();
      this.isMouseOver = true;
      this.show(event);
    });

    this.renderer.listen(this.elementRef.nativeElement, 'mouseleave', (event: Event) => {
      event.preventDefault();
      this.isMouseOver = false;
      this.hide();
    });
  }

  private createOverlay() {
    // Use global position strategy to position near mouse cursor
    const positionStrategy = this.overlay.position().global();

    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
    });
  }

  private trackMousePosition() {
    if (!this.componentRef || !this.overlayRef) return;

    this.mouseMoveListenerRef = this.renderer.listen(document, 'mousemove', (event: MouseEvent) => {
      if (!this.componentRef || !this.overlayRef) return;
      this.updatePreviewPosition(event);
    });
  }

  private updatePreviewPosition(event: MouseEvent): void {
    if (!this.componentRef || !this.overlayRef) return;

    const overlayElement = this.componentRef.instance.elementRef.nativeElement;
    if (!overlayElement) return;

    // Position preview near mouse cursor with offset
    const offset = 15;
    let x = event.clientX + offset;
    let y = event.clientY + offset;

    // Use requestAnimationFrame for smooth positioning
    requestAnimationFrame(() => {
      if (!overlayElement || !this.componentRef) return;

      // Get overlay dimensions
      const rect = overlayElement.getBoundingClientRect();
      const overlayWidth = rect.width || 300;
      const overlayHeight = rect.height || 300;

      // Keep preview within viewport
      const maxX = window.innerWidth - overlayWidth - 10;
      const maxY = window.innerHeight - overlayHeight - 10;

      overlayElement.style.position = 'fixed';
      overlayElement.style.left = `${Math.min(x, Math.max(10, maxX))}px`;
      overlayElement.style.top = `${Math.min(y, Math.max(10, maxY))}px`;
      overlayElement.style.transform = 'none';
      overlayElement.style.margin = '0';
      overlayElement.style.zIndex = '9999';
    });
  }
}

@Component({
  selector: 'z-image-hover-preview',
  standalone: true,
  imports: [ZardIconComponent],
  templateUrl: './image-hover-preview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
    '[attr.data-state]': 'state()',
    '[style.max-width]': 'maxWidth()',
    '[style.max-height]': 'maxHeight()',
  },
})
export class ZardImageHoverPreviewComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  readonly elementRef = inject(ElementRef);

  protected position = signal<ZardTooltipPositions>('right');
  protected imageUrl = signal<string>('');
  protected maxWidth = signal<string>('300px');
  protected maxHeight = signal<string>('300px');
  protected alt = signal<string>('');
  protected isLoading = signal(false);
  protected hasError = signal(false);

  state = signal<'closed' | 'opened'>('closed');

  private onLoadSubject$ = new Subject<void>();
  onLoad$ = this.onLoadSubject$.asObservable();

  protected readonly classes = computed(() =>
    mergeClasses(imageHoverPreviewVariants(), this.class()),
  );
  readonly class = input<string>('');

  ngOnInit(): void {
    // Preload image
    if (this.imageUrl()) {
      this.preloadImage(this.imageUrl());
    }
    this.onLoadSubject$.next();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.onLoadSubject$.complete();
  }

  setProps(
    imageUrl: string | null,
    position: ZardTooltipPositions,
    maxWidth: string,
    maxHeight: string,
    alt: string,
  ) {
    if (imageUrl) {
      this.imageUrl.set(imageUrl);
      this.preloadImage(imageUrl);
    }
    this.position.set(position);
    this.maxWidth.set(maxWidth);
    this.maxHeight.set(maxHeight);
    this.alt.set(alt);
  }

  onImageError(): void {
    this.hasError.set(true);
    this.isLoading.set(false);
  }

  private preloadImage(url: string): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    const img = new Image();
    img.onload = () => {
      this.isLoading.set(false);
      this.hasError.set(false);
    };
    img.onerror = () => {
      this.isLoading.set(false);
      this.hasError.set(true);
    };
    img.src = url;
  }
}

@NgModule({
  imports: [OverlayModule, ZardImageHoverPreviewComponent, ZardImageHoverPreviewDirective],
  exports: [ZardImageHoverPreviewComponent, ZardImageHoverPreviewDirective],
})
export class ZardImageHoverPreviewModule {}

