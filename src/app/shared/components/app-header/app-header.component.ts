import { ChangeDetectionStrategy, Component, computed, HostListener, inject, input, OnInit, signal, ViewContainerRef, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import type { ClassValue } from 'clsx';
import { LayoutModule } from '@shared/components/layout/layout.module';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { DarkModeService } from '@shared/services/darkmode.service';
import { LanguageService } from '@shared/services/language.service';
import { ZardDropdownModule } from '@shared/components/dropdown/dropdown.module';
import { TranslateModule } from '@ngx-translate/core';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { AuthService } from '@shared/services/auth.service';
import { CommandPaletteService } from '@shared/services/command-palette.service';
import { WhatsAppService } from '@shared/services/whatsapp.service';
import { WhatsAppQrComponent } from '@shared/components/whatsapp-qr/whatsapp-qr.component';

@Component({
  selector: 'app-header',
  exportAs: 'appHeader',
  standalone: true,
  imports: [LayoutModule, ZardIconComponent, ZardButtonComponent, ZardDropdownModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './app-header.component.html',
})
export class AppHeaderComponent implements OnInit, OnDestroy {
  private readonly darkmodeService = inject(DarkModeService);
  private readonly languageService = inject(LanguageService);
  private readonly alertDialogService = inject(ZardAlertDialogService);
  private readonly commandPaletteService = inject(CommandPaletteService);
  private readonly authService = inject(AuthService);
  private readonly whatsAppService = inject(WhatsAppService);
  private readonly router = inject(Router);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly destroy$ = new Subject<void>();
  private whatsAppStatusInterval: ReturnType<typeof setInterval> | null = null;
  private connectionStatusCheckInterval: ReturnType<typeof setInterval> | null = null;
  private qrCodeDialogRef: any = null; // Store reference to QR code dialog
  private qrCodeComponentRef: any = null; // Store reference to QR component instance
  private readonly OFFLINE_CHECK_INTERVAL_MS = 1 * 60 * 1000; // 1 minute when offline
  private readonly ONLINE_CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes when online
  private readonly QR_CHECK_INTERVAL_MS = 10 * 1000; // 10 seconds (when QR modal is open)
  private readonly QR_MAX_DURATION_MS = 3 * 60 * 1000; // 3 minutes (max duration for QR modal)

  readonly zOnMobileMenuClick = input<() => void>();
  readonly zOnSidebarToggle = input<(() => void) | null>(null);
  readonly zSidebarCollapsed = input<boolean>(false);
  readonly class = input<ClassValue>('');

  readonly currentLanguage = this.languageService.getCurrentLanguageSignal();
  readonly currentTheme = this.darkmodeService.getCurrentThemeSignal();
  readonly isFullscreen = signal(false);
  readonly whatsappStatus = signal<boolean | null>(null); // null = unknown, false = offline (red), true = online (green)

  ngOnInit(): void {
    // Initialize fullscreen state
    this.isFullscreen.set(!!document.fullscreenElement);
    
    // Check WhatsApp status on initial load if authenticated
    if (this.authService.isAuthenticated()) {
      // Check immediately when component loads
      this.checkWhatsAppStatus();
      
      // Start polling with dynamic interval based on status
      this.startWhatsAppStatusPolling();
    }
  }

  /**
   * Check WhatsApp connection status
   */
  checkWhatsAppStatus(): void {
    // Only check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.whatsAppService.getStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (status) => {
          // State can be "open" or "close"
          const isConnected = status.instance?.state === 'open';
          const previousStatus = this.whatsappStatus();
          this.whatsappStatus.set(isConnected);
          
          // If status changed, restart polling with new interval
          if (previousStatus !== isConnected) {
            this.restartWhatsAppStatusPolling();
          }
          
          // If QR modal is open and status becomes connected, update modal
          if (this.qrCodeDialogRef && isConnected && this.qrCodeComponentRef instanceof WhatsAppQrComponent) {
            this.qrCodeComponentRef.setConnected(true);
            this.qrCodeComponentRef.setLoading(false);
            
            // Close modal after 2 seconds showing success message
            setTimeout(() => {
              if (this.qrCodeDialogRef) {
                this.qrCodeDialogRef.close();
                this.qrCodeDialogRef = null;
                this.qrCodeComponentRef = null;
                this.stopConnectionStatusCheck();
                this.restartWhatsAppStatusPolling();
              }
            }, 2000);
          }
        },
        error: (error) => {
          console.error('Error checking WhatsApp status:', error);
          // Set status to false (offline/red) on error
          const previousStatus = this.whatsappStatus();
          this.whatsappStatus.set(false);
          
          // If status changed, restart polling with new interval
          if (previousStatus !== false) {
            this.restartWhatsAppStatusPolling();
          }
        }
      });
  }

  /**
   * Handle WhatsApp button click
   * If offline, connect and show QR code
   * If online, show connected modal with disconnect button
   */
  onWhatsAppClick(): void {
    const currentStatus = this.whatsappStatus();
    
    // If offline or unknown, try to connect and show QR code
    if (currentStatus === false || currentStatus === null) {
      this.connectWhatsApp();
    } else {
      // If online, show connected modal with disconnect button
      this.showConnectedDialog();
    }
  }

  /**
   * Show connected dialog with disconnect button
   */
  private showConnectedDialog(): void {
    // Close existing dialog if any
    if (this.qrCodeDialogRef) {
      this.qrCodeDialogRef.close();
      this.qrCodeDialogRef = null;
      this.qrCodeComponentRef = null;
    }

    this.qrCodeDialogRef = this.alertDialogService.info({
      zTitle: 'WhatsApp Connection',
      zDescription: '',
      zContent: WhatsAppQrComponent,
      zData: { 
        qrCodeBase64: '',
        isLoading: false,
        isConnected: true
      },
      zOkText: 'Close',
      zCancelText: null,
      zWidth: '400px',
      zViewContainerRef: this.viewContainerRef,
    });

    // Get component reference from dialog ref
    setTimeout(() => {
      if (this.qrCodeDialogRef?.componentInstance instanceof WhatsAppQrComponent) {
        this.qrCodeComponentRef = this.qrCodeDialogRef.componentInstance;
      }
    }, 0);
  }

  /**
   * Connect WhatsApp and show QR code
   */
  private connectWhatsApp(): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    // Stop current polling
    this.stopWhatsAppStatusPolling();
    
    // Show modal with loader immediately
    this.showQrCodeDialogWithLoader();
    
    // Start checking status every 10 seconds
    this.startConnectionStatusCheck();

    this.whatsAppService.connect()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (connectResponse) => {
          // Get component reference if not already stored
          const componentRef = this.qrCodeComponentRef || (this.qrCodeDialogRef?.componentInstance instanceof WhatsAppQrComponent ? this.qrCodeDialogRef.componentInstance : null);
          
          // Update dialog to show QR code
          if (connectResponse.base64 && componentRef) {
            componentRef.setLoading(false);
            componentRef.qrCodeBase64.set(connectResponse.base64);
            // Store reference for future use
            this.qrCodeComponentRef = componentRef;
          }
        },
        error: (error) => {
          console.error('Error connecting WhatsApp:', error);
          
          // Update loader to show error
          if (this.qrCodeComponentRef instanceof WhatsAppQrComponent) {
            this.qrCodeComponentRef.setLoading(false);
          }
          
          // Close modal and show error message
          if (this.qrCodeDialogRef) {
            this.qrCodeDialogRef.close();
            this.qrCodeDialogRef = null;
            this.qrCodeComponentRef = null;
          }
          
          this.stopConnectionStatusCheck();
          this.restartWhatsAppStatusPolling();
          
          // Show error message
          this.alertDialogService.warning({
            zTitle: 'Connection Error',
            zDescription: 'Failed to connect WhatsApp. Please try again.',
            zOkText: 'OK',
            zViewContainerRef: this.viewContainerRef,
          });
        }
      });
  }

  /**
   * Show QR code dialog with loader initially
   */
  private showQrCodeDialogWithLoader(): void {
    this.qrCodeDialogRef = this.alertDialogService.info({
      zTitle: 'Connect WhatsApp',
      zDescription: '',
      zContent: WhatsAppQrComponent,
      zData: { 
        qrCodeBase64: '',
        isLoading: true,
        isConnected: false
      },
      zOkText: 'Close',
      zCancelText: null,
      zWidth: '400px',
      zViewContainerRef: this.viewContainerRef,
    });

    // Get component reference from dialog ref (set synchronously by the service)
    // Use setTimeout to ensure it's available after Angular change detection
    setTimeout(() => {
      if (this.qrCodeDialogRef?.componentInstance instanceof WhatsAppQrComponent) {
        this.qrCodeComponentRef = this.qrCodeDialogRef.componentInstance;
      }
    }, 0);

    // When dialog closes, revert to dynamic polling
    this.qrCodeDialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.qrCodeDialogRef = null;
      this.qrCodeComponentRef = null;
      this.stopConnectionStatusCheck();
      // Revert to dynamic polling
      if (this.authService.isAuthenticated()) {
        this.restartWhatsAppStatusPolling();
      }
      this.checkWhatsAppStatus();
    });
  }

  /**
   * Start checking connection status periodically when QR modal is open
   * Checks immediately, then every 10 seconds, and closes modal after 3 minutes
   * This will detect when the user successfully scans the QR code
   */
  private startConnectionStatusCheck(): void {
    // Clear any existing connection status check
    this.stopConnectionStatusCheck();

    const startTime = Date.now();

    // Function to check status
    const checkStatus = () => {
      const elapsedTime = Date.now() - startTime;
      
      // Check status
      if (this.authService.isAuthenticated()) {
        this.whatsAppService.getStatus()
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (status) => {
              const isConnected = status.instance?.state === 'open';
              const previousStatus = this.whatsappStatus();
              this.whatsappStatus.set(isConnected);
              
              // If status changed, restart polling with new interval
              if (previousStatus !== isConnected) {
                this.restartWhatsAppStatusPolling();
              }
              
              // If connected, hide QR and show success message
              if (isConnected && this.qrCodeDialogRef) {
                // Get component reference if not already stored
                const componentRef = this.qrCodeComponentRef || (this.qrCodeDialogRef.componentInstance instanceof WhatsAppQrComponent ? this.qrCodeDialogRef.componentInstance : null);
                
                if (componentRef) {
                  // Hide QR code and show connected message
                  componentRef.setConnected(true);
                  componentRef.setLoading(false);
                  // Store reference for consistency
                  this.qrCodeComponentRef = componentRef;
                  
                  // Close modal after 3 seconds showing success message
                  setTimeout(() => {
                    if (this.qrCodeDialogRef) {
                      this.qrCodeDialogRef.close();
                      this.qrCodeDialogRef = null;
                      this.qrCodeComponentRef = null;
                      this.stopConnectionStatusCheck();
                      this.restartWhatsAppStatusPolling();
                    }
                  }, 3000);
                }
              } else if (elapsedTime >= this.QR_MAX_DURATION_MS) {
                // 3 minutes passed - stop checking and close modal
                this.stopConnectionStatusCheck();
                if (this.qrCodeDialogRef) {
                  this.qrCodeDialogRef.close();
                  this.qrCodeDialogRef = null;
                  this.qrCodeComponentRef = null;
                }
                // Revert to dynamic polling
                if (this.authService.isAuthenticated()) {
                  this.restartWhatsAppStatusPolling();
                }
              }
            },
            error: (error) => {
              console.error('Error checking WhatsApp status:', error);
              // Set status to false (offline/red) on error
              const previousStatus = this.whatsappStatus();
              this.whatsappStatus.set(false);
              
              // If status changed, restart polling with new interval
              if (previousStatus !== false) {
                this.restartWhatsAppStatusPolling();
              }
              
              // If 3 minutes passed, close modal
              if (elapsedTime >= this.QR_MAX_DURATION_MS) {
                this.stopConnectionStatusCheck();
                if (this.qrCodeDialogRef) {
                  this.qrCodeDialogRef.close();
                  this.qrCodeDialogRef = null;
                  this.qrCodeComponentRef = null;
                }
                if (this.authService.isAuthenticated()) {
                  this.restartWhatsAppStatusPolling();
                }
              }
            }
          });
      }
    };

    // Check status immediately
    checkStatus();

    // Then check every 10 seconds
    this.connectionStatusCheckInterval = setInterval(checkStatus, this.QR_CHECK_INTERVAL_MS);
  }

  /**
   * Stop connection status check
   */
  private stopConnectionStatusCheck(): void {
    if (this.connectionStatusCheckInterval) {
      clearInterval(this.connectionStatusCheckInterval);
      this.connectionStatusCheckInterval = null;
    }
  }

  /**
   * Start polling WhatsApp status with dynamic interval
   * - 1 minute when offline
   * - 5 minutes when online
   */
  private startWhatsAppStatusPolling(): void {
    // Clear any existing interval
    this.stopWhatsAppStatusPolling();

    // Determine interval based on current status
    const currentStatus = this.whatsappStatus();
    const intervalMs = currentStatus === true 
      ? this.ONLINE_CHECK_INTERVAL_MS 
      : this.OFFLINE_CHECK_INTERVAL_MS;

    // Set up new interval
    // The interval will check if user is still authenticated before each call
    this.whatsAppStatusInterval = setInterval(() => {
      // Only check if user is still authenticated
      if (this.authService.isAuthenticated()) {
        this.checkWhatsAppStatus();
      } else {
        // User logged out - stop polling
        this.stopWhatsAppStatusPolling();
        this.whatsappStatus.set(null);
      }
    }, intervalMs);
  }

  /**
   * Restart polling with new interval based on current status
   */
  private restartWhatsAppStatusPolling(): void {
    // Only restart if not in connection check mode (QR modal closed)
    if (!this.connectionStatusCheckInterval) {
      this.stopWhatsAppStatusPolling();
      this.startWhatsAppStatusPolling();
    }
  }

  /**
   * Stop polling WhatsApp status
   */
  private stopWhatsAppStatusPolling(): void {
    if (this.whatsAppStatusInterval) {
      clearInterval(this.whatsAppStatusInterval);
      this.whatsAppStatusInterval = null;
    }
  }

  toggleTheme(): void {
    this.darkmodeService.toggleTheme();
  }

  setLanguage(lang: 'en' | 'fr'): void {
    this.languageService.setLanguage(lang);
  }

  onMobileMenuClick(): void {
    const handler = this.zOnMobileMenuClick();
    if (handler) {
      handler();
    }
  }

  onSidebarToggle(): void {
    const handler = this.zOnSidebarToggle();
    if (handler) {
      handler();
    }
  }

  showLogoutConfirmation(): void {
    const dialogRef = this.alertDialogService.confirm({
      zTitle: 'Log out',
      zDescription: 'Are you sure you want to log out?',
      zOkText: 'Log out',
      zCancelText: 'Cancel',
      zOkDestructive: true,
      zViewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        this.authService.logout();
      }
    });
  }

  /**
   * Open the command palette
   */
  openCommandPalette(): void {
    this.commandPaletteService.open();
  }

  /**
   * Toggle fullscreen mode
   */
  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      document.documentElement.requestFullscreen().then(() => {
        this.isFullscreen.set(true);
      }).catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      // Exit fullscreen
      document.exitFullscreen().then(() => {
        this.isFullscreen.set(false);
      }).catch((err) => {
        console.error('Error attempting to exit fullscreen:', err);
      });
    }
  }

  /**
   * Listen for fullscreen changes (e.g., user presses ESC)
   */
  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    this.isFullscreen.set(!!document.fullscreenElement);
  }

  /**
   * Handle Cmd+K (or Ctrl+K) keyboard shortcut to open command palette
   */
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.openCommandPalette();
    }
  }

  ngOnDestroy(): void {
    // Stop polling
    this.stopWhatsAppStatusPolling();
    
    // Stop connection status check
    this.stopConnectionStatusCheck();
    
    // Complete destroy subject
    this.destroy$.next();
    this.destroy$.complete();
  }
}

