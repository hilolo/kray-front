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
  output,
  PLATFORM_ID,
  Renderer2,
  signal,
} from '@angular/core';

import { mergeClasses } from '@shared/utils/merge-classes';
import { TOOLTIP_POSITIONS_MAP, ZardTooltipPositions } from './tooltip-positions';
import { tooltipVariants } from './tooltip.variants';
import type { ZardIcon } from '@shared/components/icon/icons';
import { ZardIconComponent } from '@shared/components/icon/icon.component';

export type ZardTooltipTriggers = 'click' | 'hover';

@Directive({
  selector: '[zTooltip]',
  exportAs: 'zTooltip',
  host: {
    style: 'cursor: pointer',
  },
})
export class ZardTooltipDirective implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private overlayPositionBuilder = inject(OverlayPositionBuilder);
  private elementRef = inject(ElementRef);
  private overlay = inject(Overlay);
  private renderer = inject(Renderer2);
  private platformId = inject(PLATFORM_ID);

  private overlayRef?: OverlayRef;
  private componentRef?: ComponentRef<ZardTooltipComponent>;
  private scrollListenerRef?: () => void;
  private mouseMoveListenerRef?: () => void;
  private mouseLeaveListenerRef?: () => void;
  private hideTimeout?: ReturnType<typeof setTimeout>;

  readonly zTooltip = input<string | null>(null);
  readonly zTooltipIcon = input<ZardIcon | null>(null);
  readonly zPosition = input<ZardTooltipPositions>('top');
  readonly zTrigger = input<ZardTooltipTriggers>('hover');
  readonly zFollowMouse = input<boolean>(false);

  readonly zOnShow = output<void>();
  readonly zOnHide = output<void>();

  get nativeElement() {
    return this.elementRef.nativeElement;
  }

  get overlayElement() {
    return this.componentRef?.instance.elementRef.nativeElement;
  }

  ngOnInit() {
    this.setTriggers();

    if (isPlatformBrowser(this.platformId)) {
      if (this.zFollowMouse()) {
        // For mouse following, use a global position strategy
        this.overlayRef = this.overlay.create({
          positionStrategy: this.overlay.position().global(),
        });
      } else {
        const positionStrategy = this.overlayPositionBuilder.flexibleConnectedTo(this.elementRef).withPositions([TOOLTIP_POSITIONS_MAP[this.zPosition()]]);
        this.overlayRef = this.overlay.create({ positionStrategy });
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    if (this.mouseMoveListenerRef) {
      this.mouseMoveListenerRef();
    }
    if (this.mouseLeaveListenerRef) {
      this.mouseLeaveListenerRef();
    }
  }

  show() {
    if (this.componentRef) return;

    const tooltipText = this.zTooltip();
    if (!tooltipText || tooltipText.trim() === '') return;

    const tooltipPortal = new ComponentPortal(ZardTooltipComponent);
    this.componentRef = this.overlayRef?.attach(tooltipPortal);
    if (!this.componentRef) return;

    this.componentRef.instance.setProps(tooltipText, this.zTooltipIcon(), this.zPosition(), this.zTrigger());
    this.componentRef.instance.state.set('opened');

    this.componentRef.instance.onLoad$.pipe(take(1)).subscribe(() => {
      this.zOnShow.emit();

      if (this.zFollowMouse() && this.componentRef) {
        // Set pointer-events: none to prevent tooltip from interfering
        const tooltipElement = this.componentRef.instance.elementRef.nativeElement;
        if (tooltipElement) {
          tooltipElement.style.pointerEvents = 'none';
        }
        
        // Initialize position at current mouse position
        if (this.initialMouseEvent) {
          this.updateTooltipPosition(this.initialMouseEvent);
          this.initialMouseEvent = undefined;
        }
        this.trackMousePosition();
      }

      switch (this.zTrigger()) {
        case 'click':
          if (!this.overlayRef) return;

          this.overlayRef
            .outsidePointerEvents()
            .pipe(takeUntil(merge(this.destroy$, this.overlayRef.detachments())))
            .subscribe(() => this.hide());
          break;
        case 'hover':
          this.setupHoverListeners();
          break;
      }
    });

    this.scrollListenerRef = this.renderer.listen(window, 'scroll', () => {
      this.hide(0);
    });
  }

  hide(animationDuration = 150) {
    if (!this.componentRef) return;

    // Clear any pending hide timeout
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = undefined;
    }

    this.componentRef.instance.state.set('closed');

    setTimeout(() => {
      this.zOnHide.emit();

      this.overlayRef?.detach();
      this.componentRef?.destroy();
      this.componentRef = undefined;

      if (this.scrollListenerRef) this.scrollListenerRef();
      if (this.mouseMoveListenerRef) {
        this.mouseMoveListenerRef();
        this.mouseMoveListenerRef = undefined;
      }
      if (this.mouseLeaveListenerRef) {
        this.mouseLeaveListenerRef();
        this.mouseLeaveListenerRef = undefined;
      }
    }, animationDuration);
  }

  private setupHoverListeners() {
    // For mouse-following tooltips, we need a different approach
    // Keep tooltip visible as long as mouse is over trigger element
    if (this.zFollowMouse()) {
      // Track if mouse is over trigger element
      let isOverTrigger = true;

      // Listen for mouse leave on the trigger element
      this.mouseLeaveListenerRef = this.renderer.listen(
        this.elementRef.nativeElement,
        'mouseleave',
        () => {
          isOverTrigger = false;
          // Add a small delay before hiding
          this.hideTimeout = setTimeout(() => {
            if (!isOverTrigger) {
              this.hide();
            }
          }, 150);
        },
      );

      // Listen for mouse enter on trigger to cancel hide and keep tooltip visible
      this.renderer.listen(
        this.elementRef.nativeElement,
        'mouseenter',
        () => {
          isOverTrigger = true;
          if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = undefined;
          }
        },
      );
    } else {
      // For non-mouse-following tooltips, use standard behavior
      this.mouseLeaveListenerRef = this.renderer.listen(
        this.elementRef.nativeElement,
        'mouseleave',
        () => {
          this.hideTimeout = setTimeout(() => {
            this.hide();
          }, 100);
        },
      );

      // Cancel hide on mouse enter
      this.renderer.listen(
        this.elementRef.nativeElement,
        'mouseenter',
        () => {
          if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = undefined;
          }
        },
      );
    }
  }

  private trackMousePosition() {
    if (!this.componentRef || !this.overlayRef) return;

    this.mouseMoveListenerRef = this.renderer.listen(document, 'mousemove', (event: MouseEvent) => {
      if (!this.componentRef || !this.overlayRef) return;
      this.updateTooltipPosition(event);
    });
  }

  private updateTooltipPosition(event: MouseEvent): void {
    if (!this.componentRef || !this.overlayRef) return;

    const overlayElement = this.componentRef.instance.elementRef.nativeElement;
    if (!overlayElement) return;

    const offset = 15;
    let x = event.clientX + offset;
    let y = event.clientY + offset;

    requestAnimationFrame(() => {
      if (!overlayElement || !this.componentRef) return;

      const rect = overlayElement.getBoundingClientRect();
      const overlayWidth = rect.width || 200;
      const overlayHeight = rect.height || 40;

      const maxX = window.innerWidth - overlayWidth - 10;
      const maxY = window.innerHeight - overlayHeight - 10;

      overlayElement.style.position = 'fixed';
      overlayElement.style.left = `${Math.min(x, Math.max(10, maxX))}px`;
      overlayElement.style.top = `${Math.min(y, Math.max(10, maxY))}px`;
      overlayElement.style.transform = 'none';
      overlayElement.style.margin = '0';
      overlayElement.style.zIndex = '9999';
      overlayElement.style.pointerEvents = 'none'; // Prevent tooltip from interfering with mouse events
    });
  }

  private setTriggers() {
    const showTrigger = this.zTrigger() === 'click' ? 'click' : 'mouseenter';

    this.renderer.listen(this.elementRef.nativeElement, showTrigger, (event: MouseEvent) => {
      event.preventDefault();
      // Store initial mouse position for mouse following
      if (this.zFollowMouse() && event instanceof MouseEvent) {
        this.initialMouseEvent = event;
      }
      this.show();
    });
  }

  private initialMouseEvent?: MouseEvent;
}

@Component({
  selector: 'z-tooltip',
  template: `
    <div class="flex items-center gap-2">
      @if (icon()) {
        <z-icon [zType]="icon()!" zSize="sm" />
      }
      <span>{{ text() }}</span>
    </div>
  `,
  host: {
    '[class]': 'classes()',
    '[attr.data-side]': 'position()',
    '[attr.data-state]': 'state()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZardIconComponent],
  standalone: true,
})
export class ZardTooltipComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  readonly elementRef = inject(ElementRef);

  protected position = signal<ZardTooltipPositions>('top');
  private trigger = signal<ZardTooltipTriggers>('hover');
  protected text = signal<string>('');
  protected icon = signal<ZardIcon | null>(null);

  state = signal<'closed' | 'opened'>('closed');

  private onLoadSubject$ = new Subject<void>();
  onLoad$ = this.onLoadSubject$.asObservable();

  protected readonly classes = computed(() => mergeClasses(tooltipVariants()));

  ngOnInit(): void {
    this.onLoadSubject$.next();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.onLoadSubject$.complete();
  }

  setProps(text: string | null, icon: ZardIcon | null, position: ZardTooltipPositions, trigger: ZardTooltipTriggers) {
    if (text) this.text.set(text);
    if (icon) this.icon.set(icon);
    this.position.set(position);
    this.trigger.set(trigger);
  }
}

@NgModule({
  imports: [OverlayModule, ZardTooltipComponent, ZardTooltipDirective],
  exports: [ZardTooltipComponent, ZardTooltipDirective],
})
export class ZardTooltipModule {}