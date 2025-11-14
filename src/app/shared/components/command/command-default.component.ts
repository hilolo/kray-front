import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  OnInit,
  signal,
  ViewEncapsulation,
  viewChild,
} from '@angular/core';
import type { ClassValue } from 'clsx';
import { Router } from '@angular/router';
import { ZardCommandComponent, ZardCommandOption } from './command.component';
import { ZardCommandInputComponent } from './command-input.component';
import { ZardCommandListComponent } from './command-list.component';
import { ZardCommandOptionComponent } from './command-option.component';
import { ZardCommandEmptyComponent } from './command-empty.component';
import { CommandPaletteService } from '@shared/services/command-palette.service';
import { mergeClasses } from '@shared/utils/merge-classes';
import { ZardIcon } from '../icon/icons';

export interface ZardCommandDefaultOption {
  value: string;
  label: string;
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
export class ZardCommandDefaultComponent implements OnInit {
  private readonly commandPaletteService = inject(CommandPaletteService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly commandRef = viewChild.required<ZardCommandComponent>('commandRef');
  readonly size = input<'sm' | 'default' | 'lg' | 'xl'>('default');
  readonly placeholder = input<string>('Type a command or search...');
  readonly class = input<ClassValue>('');
  readonly options = input<ZardCommandDefaultOption[]>([]);

  protected readonly classes = computed(() =>
    mergeClasses('fixed inset-0 z-50 flex items-center justify-center p-4', this.class())
  );

  // Default command options
  private readonly defaultOptions: ZardCommandDefaultOption[] = [
    {
      value: 'dashboard',
      label: 'Dashboard',
      icon: 'monitor',
      route: '/',
    },
    {
      value: 'settings',
      label: 'Settings',
      icon: 'settings',
      route: '/settings',
    },
    {
      value: 'contacts',
      label: 'Contacts',
      icon: 'user',
      route: '/contact/tenants',
    },
    {
      value: 'file-manager',
      label: 'File Manager',
      icon: 'folder',
      route: '/file-manager',
    },
    {
      value: 'ai-chat',
      label: 'AI Chat',
      icon: 'sparkles',
      route: '/ai-chat',
    },
  ];

  // Grouped options - filter based on search term from command component
  protected readonly filteredGroups = computed(() => {
    const allOptions = [...this.defaultOptions, ...this.options()];
    const commandComponent = this.commandRef();
    const searchTerm = commandComponent?.searchTerm() || '';
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    
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

  ngOnInit(): void {
    // Focus the command input when component is initialized
    setTimeout(() => {
      const commandComponent = this.commandRef();
      if (commandComponent) {
        commandComponent.focus();
      }
    }, 100);
  }

  onSelect(option: ZardCommandOption): void {
    // Find the selected option by value
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

