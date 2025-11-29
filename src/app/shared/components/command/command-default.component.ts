import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  OnInit,
  signal,
  ViewEncapsulation,
  viewChild,
  OnDestroy,
} from '@angular/core';
import type { ClassValue } from 'clsx';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, of } from 'rxjs';
import { ZardCommandComponent, ZardCommandOption } from './command.component';
import { ZardCommandInputComponent } from './command-input.component';
import { ZardCommandListComponent } from './command-list.component';
import { ZardCommandOptionComponent } from './command-option.component';
import { ZardCommandEmptyComponent } from './command-empty.component';
import { CommandPaletteService } from '@shared/services/command-palette.service';
import { GlobalSearchService, type SearchResult } from '@shared/services/global-search.service';
import { mergeClasses } from '@shared/utils/merge-classes';
import { ZardIcon } from '../icon/icons';
import { MODULES } from '@shared/constants/modules.constant';

export interface ZardCommandDefaultOption {
  value: string;
  label: string;
  subtitle?: string;
  icon?: ZardIcon;
  shortcut?: string;
  action?: () => void;
  route?: string;
}

@Component({
  selector: 'z-command-default',
  exportAs: 'zCommandDefault',
  standalone: true,
  imports: [
    ZardCommandComponent,
    ZardCommandInputComponent,
    ZardCommandListComponent,
    ZardCommandOptionComponent,
    ZardCommandEmptyComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      (click)="close()"
    ></div>
    
    <!-- Command Palette -->
    <div class="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 transform">
      <div class="w-full max-w-2xl mx-auto">
        <z-command [size]="size()" (zOnSelect)="onSelect($event)" #commandRef class="w-full">
          <z-command-input [placeholder]="placeholder()" />
          
          <z-command-list>
            <z-command-empty>
              <div class="text-center py-6">
                <p class="text-sm text-muted-foreground">No results found.</p>
              </div>
            </z-command-empty>

            @for (group of filteredGroups(); track group.label) {
              @if (group.label && group.options.length > 0) {
                <div class="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  {{ group.label }}
                </div>
              }
              @for (option of group.options; track option.value) {
                <z-command-option
                  [zValue]="option.value"
                  [zLabel]="option.label"
                  [zSubtitle]="option.subtitle || ''"
                  [zIcon]="option.icon"
                  [zShortcut]="option.shortcut || ''"
                />
              }
            }
          </z-command-list>
        </z-command>
      </div>
    </div>
  `,
  host: {
    '[class]': 'classes()',
  },
})
export class ZardCommandDefaultComponent implements OnInit, OnDestroy {
  private readonly commandPaletteService = inject(CommandPaletteService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly globalSearchService = inject(GlobalSearchService);
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  readonly commandRef = viewChild.required<ZardCommandComponent>('commandRef');
  readonly size = input<'sm' | 'default' | 'lg' | 'xl'>('default');
  readonly placeholder = input<string>('Type a command or search...');
  readonly class = input<ClassValue>('');
  readonly options = input<ZardCommandDefaultOption[]>([]);
  
  readonly searchResults = signal<SearchResult[]>([]);
  readonly isSearching = signal(false);

  protected readonly classes = computed(() =>
    mergeClasses('fixed inset-0 z-50 flex items-center justify-center p-4', this.class())
  );

  // Route mapping for modules - includes all sidebar items
  private static readonly moduleRoutes: Record<string, string> = {
    dashboard: '/',
    properties: '/property',
    buildings: '/building',
    leasing: '/leasing',
    reservations: '/reservation',
    maintenance: '/maintenance',
    keys: '/keys',
    banks: '/bank',
    payments: '/transaction',
    'file-manager': '/file-manager',
    reports: '/reports',
    settings: '/settings',
    'ai-chat': '/ai-chat',
    documents: '/document',
    tasks: '/tasks',
    transactions: '/transaction',
  };

  // Generate default options from MODULES constant - includes all sidebar items
  private readonly defaultOptions: ZardCommandDefaultOption[] = MODULES.filter(module => module.key !== 'contacts')
    .map(module => ({
      value: module.key,
      label: module.label,
      icon: module.icon as ZardIcon,
      route: ZardCommandDefaultComponent.moduleRoutes[module.key],
    }))
    .concat([
      // Contact sub-modules
      {
        value: 'tenants',
        label: 'Tenants',
        icon: 'user',
        route: '/contact/tenants',
      },
      {
        value: 'owners',
        label: 'Owners',
        icon: 'users',
        route: '/contact/owners',
      },
      {
        value: 'services',
        label: 'Services',
        icon: 'building',
        route: '/contact/services',
      },
      // Additional options from sidebar
      {
        value: 'ai-chat',
        label: 'AI Chat',
        icon: 'sparkles',
        route: '/ai-chat',
      },
      {
        value: 'documents',
        label: 'Documents',
        icon: 'file',
        route: '/document',
      },
      {
        value: 'tasks',
        label: 'Tasks',
        icon: 'clipboard',
        route: '/tasks',
      },
      {
        value: 'transactions',
        label: 'Transactions',
        icon: 'banknote',
        route: '/transaction',
      },
    ]);

  // Grouped options - filter based on search term from command component
  protected readonly filteredGroups = computed(() => {
    const commandComponent = this.commandRef();
    const searchTerm = commandComponent?.searchTerm() || '';
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    const searchResults = this.searchResults();
    const isSearching = this.isSearching();
    
    // If searching and we have results, show search results
    if (lowerSearchTerm.length >= 3 && (isSearching || searchResults.length > 0)) {
      const groups: Array<{ label: string; options: ZardCommandDefaultOption[] }> = [];
      
      // Group search results by type
      const tenants = searchResults.filter(r => r.type === 'tenant');
      const owners = searchResults.filter(r => r.type === 'owner');
      const services = searchResults.filter(r => r.type === 'service');
      const properties = searchResults.filter(r => r.type === 'property');
      
      if (tenants.length > 0) {
        groups.push({
          label: 'Tenants',
          options: tenants.map(r => ({
            value: r.id,
            label: r.label,
            subtitle: r.subtitle,
            icon: r.icon as ZardIcon,
            route: r.route,
          })),
        });
      }
      
      if (owners.length > 0) {
        groups.push({
          label: 'Owners',
          options: owners.map(r => ({
            value: r.id,
            label: r.label,
            subtitle: r.subtitle,
            icon: r.icon as ZardIcon,
            route: r.route,
          })),
        });
      }
      
      if (services.length > 0) {
        groups.push({
          label: 'Services',
          options: services.map(r => ({
            value: r.id,
            label: r.label,
            subtitle: r.subtitle,
            icon: r.icon as ZardIcon,
            route: r.route,
          })),
        });
      }
      
      if (properties.length > 0) {
        groups.push({
          label: 'Properties',
          options: properties.map(r => ({
            value: r.id,
            label: r.label,
            subtitle: r.subtitle,
            icon: r.icon as ZardIcon,
            route: r.route,
          })),
        });
      }
      
      return groups;
    }
    
    // Otherwise, show navigation options filtered by search term
    const allOptions = [...this.defaultOptions, ...this.options()];
    
    // Filter options based on search term
    const filteredOptions = lowerSearchTerm === '' 
      ? allOptions 
      : allOptions.filter(opt => {
          const label = opt.label.toLowerCase();
          return label.includes(lowerSearchTerm);
        });
    
    // Group by category (only include filtered options)
    const navigationOptions = filteredOptions.filter(opt => opt.route);
    const actionOptions = filteredOptions.filter(opt => opt.action && !opt.route);

    const groups: Array<{ label: string; options: ZardCommandDefaultOption[] }> = [];

    if (navigationOptions.length > 0) {
      groups.push({
        label: 'Navigation',
        options: navigationOptions,
      });
    }

    if (actionOptions.length > 0) {
      groups.push({
        label: 'Actions',
        options: actionOptions,
      });
    }

    // If no groups, return all filtered options in one group (without label)
    if (groups.length === 0 && filteredOptions.length > 0) {
      groups.push({
        label: '',
        options: filteredOptions,
      });
    }

    return groups;
  });

  constructor() {
    // Set up search subscription first
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => {
          const trimmedQuery = query.trim();
          if (trimmedQuery.length < 3) {
            this.searchResults.set([]);
            this.isSearching.set(false);
            return of({
              tenants: [],
              owners: [],
              services: [],
              properties: [],
            });
          }
          
          this.isSearching.set(true);
          return this.globalSearchService.search(trimmedQuery);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (results) => {
          const allResults: SearchResult[] = [
            ...results.tenants,
            ...results.owners,
            ...results.services,
            ...results.properties,
          ];
          this.searchResults.set(allResults);
          this.isSearching.set(false);
        },
        error: (error) => {
          console.error('Search error:', error);
          this.searchResults.set([]);
          this.isSearching.set(false);
        },
      });
    
    // Watch for search term changes using effect - this will reactively watch the searchTerm signal
    effect(() => {
      const commandComponent = this.commandRef();
      if (commandComponent) {
        // Reading searchTerm() makes this effect reactive to changes
        const searchTerm = commandComponent.searchTerm();
        this.searchSubject.next(searchTerm);
      }
    });
  }

  ngOnInit(): void {
    // Focus the command input when component is initialized
    setTimeout(() => {
      const commandComponent = this.commandRef();
      if (commandComponent) {
        commandComponent.focus();
      }
    }, 100);
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSelect(option: ZardCommandOption): void {
    // First check if it's a search result
    const searchResult = this.searchResults().find(r => r.id === option.value);
    
    if (searchResult) {
      // Navigate to search result
      this.router.navigate([searchResult.route]);
      this.close();
      return;
    }
    
    // Otherwise, find the selected option by value
    const selectedOption = [...this.defaultOptions, ...this.options()].find(
      opt => opt.value === option.value
    );

    if (selectedOption) {
      // Execute action or navigate
      if (selectedOption.action) {
        selectedOption.action();
      } else if (selectedOption.route) {
        this.router.navigate([selectedOption.route]);
      }

      // Close the command palette
      this.close();
    }
  }

  close(): void {
    this.commandPaletteService.close();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Close on Escape
    if (event.key === 'Escape') {
      this.close();
    }
  }
}

