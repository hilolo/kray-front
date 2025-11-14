import { ChangeDetectionStrategy, Component, computed, inject, input, signal, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import type { ClassValue } from 'clsx';
import { ZardPageComponent } from '../page/page.component';
import { ZardCardComponent } from '@shared/components/card/card.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardCheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardBreadcrumbModule } from '@shared/components/breadcrumb/breadcrumb.module';
import { ZardAlertDialogService } from '@shared/components/alert-dialog/alert-dialog.service';
import { mergeClasses } from '@shared/utils/merge-classes';
import { fileManagerVariants } from './file-manager.variants';
import { ZardFileViewerComponent } from '@shared/components/file-viewer/file-viewer.component';

export interface FileItem {
  id: string;
  name: string;
  extension: string;
  type: 'file';
  url?: string; // Optional URL for file viewing
  size?: number; // Optional file size
}

export interface FolderItem {
  id: string;
  name: string;
  fileCount: number;
  type: 'folder';
}

export type FileManagerItem = FileItem | FolderItem;

@Component({
  selector: 'app-file-manager',
  standalone: true,
  imports: [
    FormsModule,
    ZardPageComponent,
    ZardCardComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ZardCheckboxComponent,
    ZardInputDirective,
    ZardBreadcrumbModule,
    ZardFileViewerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './file-manager.component.html',
  host: {
    '[class]': 'classes()',
  },
})
export class FileManagerComponent {
  private readonly router = inject(Router);
  private readonly alertDialogService = inject(ZardAlertDialogService);
  private readonly viewContainerRef = inject(ViewContainerRef);

  readonly zFolders = input<FolderItem[]>([
    { id: '1', name: 'Personal', fileCount: 57, type: 'folder' },
    { id: '2', name: 'Photos', fileCount: 907, type: 'folder' },
    { id: '3', name: 'Work', fileCount: 24, type: 'folder' },
  ]);
  readonly zFiles = input<FileItem[]>([
    { id: '1', name: 'Biometric portrait', extension: 'jpg', type: 'file' },
    { id: '2', name: 'Contract #123', extension: 'pdf', type: 'file' },
    { id: '3', name: 'Crash logs', extension: 'txt', type: 'file' },
    { id: '4', name: 'DMCA notice #42', extension: 'doc', type: 'file' },
    { id: '5', name: 'Estimated budget', extension: 'xls', type: 'file' },
    { id: '6', name: 'Invoices', extension: 'pdf', type: 'file' },
    { id: '7', name: 'Personal projects', extension: 'doc', type: 'file' },
    { id: '8', name: 'Prices', extension: 'doc', type: 'file' },
    { id: '9', name: 'Scanned image 202...', extension: 'jpg', type: 'file' },
    { id: '10', name: 'Scanned image 202...', extension: 'jpg', type: 'file' },
    { id: '11', name: 'Shopping list', extension: 'doc', type: 'file' },
    { id: '12', name: 'Summer budget', extension: 'xls', type: 'file' },
    { id: '13', name: 'System logs', extension: 'txt', type: 'file' },
  ]);
  readonly zCurrentPath = input<string>('/');
  readonly class = input<ClassValue>('');

  readonly selectedItem = signal<FileManagerItem | null>(null);
  readonly selectedFileIds = signal<Set<string>>(new Set());
  readonly searchTerm = signal<string>('');

  // File viewer
  readonly fileViewerOpen = signal(false);
  readonly fileViewerUrl = signal<string>('');
  readonly fileViewerName = signal<string>('');
  readonly fileViewerSize = signal<number>(0);

  protected readonly classes = computed(() => mergeClasses(fileManagerVariants(), this.class()));

  // Check if any files are selected
  readonly hasSelectedFiles = computed(() => {
    return this.selectedFileIds().size > 0;
  });

  // Check if all files are selected
  readonly allFilesSelected = computed(() => {
    const files = this.filteredFiles();
    return files.length > 0 && files.every(file => this.selectedFileIds().has(file.id));
  });

  // Filtered folders based on search
  readonly filteredFolders = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const folders = this.zFolders();
    if (!search) return folders;
    return folders.filter(folder => folder.name.toLowerCase().includes(search));
  });

  // Filtered files based on search
  readonly filteredFiles = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const files = this.zFiles();
    if (!search) return files;
    return files.filter(file => 
      file.name.toLowerCase().includes(search) || 
      file.extension.toLowerCase().includes(search)
    );
  });

  // Check if a specific file is selected
  isFileSelected(fileId: string): boolean {
    return this.selectedFileIds().has(fileId);
  }

  // Get file extension color
  getExtensionColor(extension: string): string {
    const colors: Record<string, string> = {
      'jpg': 'bg-orange-500',
      'jpeg': 'bg-orange-500',
      'png': 'bg-orange-500',
      'pdf': 'bg-red-500',
      'txt': 'bg-gray-600',
      'doc': 'bg-blue-500',
      'docx': 'bg-blue-500',
      'xls': 'bg-green-500',
      'xlsx': 'bg-green-500',
    };
    return colors[extension.toLowerCase()] || 'bg-gray-500';
  }

  // Get file icon type based on extension
  getFileIconType(extension: string): 'image' | 'file-text' | 'file-spreadsheet' | 'file' {
    const ext = extension.toLowerCase();
    const iconMap: Record<string, 'image' | 'file-text' | 'file-spreadsheet' | 'file'> = {
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'gif': 'image',
      'webp': 'image',
      'pdf': 'file-text',
      'txt': 'file-text',
      'doc': 'file-text',
      'docx': 'file-text',
      'xls': 'file-spreadsheet',
      'xlsx': 'file-spreadsheet',
    };
    return iconMap[ext] || 'file';
  }

  // Navigate to folder
  navigateToFolder(folder: FolderItem): void {
    // This would typically update the current path and load folder contents
    console.log('Navigate to folder:', folder);
  }

  // Navigate to file
  navigateToFile(file: FileItem): void {
    // If file has URL, open in viewer
    if (file.url) {
      this.openFile(file.url, file.name, file.size || 0);
    } else {
      // Otherwise, just log (in real app, would fetch URL from backend)
      console.log('Open file:', file);
    }
  }

  /**
   * Open file in appropriate viewer
   */
  openFile(url: string, name: string, size: number): void {
    this.fileViewerUrl.set(url);
    this.fileViewerName.set(name);
    this.fileViewerSize.set(size);
    this.fileViewerOpen.set(true);
  }

  // Go back to home
  goHome(): void {
    this.selectedItem.set(null);
    this.selectedFileIds.set(new Set());
    this.router.navigate(['/']);
  }

  // Select item (file or folder)
  selectItem(item: FileManagerItem): void {
    this.selectedItem.set(item);
  }

  // Toggle file selection
  toggleFileSelection(fileId: string, checked: boolean): void {
    const current = new Set(this.selectedFileIds());
    if (checked) {
      current.add(fileId);
    } else {
      current.delete(fileId);
    }
    this.selectedFileIds.set(current);
  }

  // Select all files
  selectAllFiles(): void {
    const files = this.filteredFiles();
    const allIds = new Set(files.map(file => file.id));
    this.selectedFileIds.set(allIds);
  }

  // Deselect all files
  deselectAllFiles(): void {
    this.selectedFileIds.set(new Set());
  }

  // Update search term
  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  // Upload new file
  uploadFile(): void {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = false;
    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        console.log('Upload file:', file);
        // Here you would typically upload the file to your backend
      }
    };
    input.click();
  }

  // Create new folder
  createNewFolder(): void {
    const folderName = prompt('Enter folder name:');
    if (folderName && folderName.trim()) {
      console.log('Create new folder:', folderName.trim());
      // Here you would typically create the folder in your backend
      // For now, this is just a placeholder
    }
  }

  // Delete selected files
  deleteSelectedFiles(): void {
    const selectedIds = this.selectedFileIds();
    if (selectedIds.size > 0) {
      const fileNames = Array.from(selectedIds)
        .map(id => {
          const file = this.zFiles().find(f => f.id === id);
          return file?.name || id;
        })
        .join(', ');
      
      const dialogRef = this.alertDialogService.confirm({
        zTitle: 'Delete Files',
        zDescription: `Are you sure you want to delete ${selectedIds.size} file(s)?\n\n${fileNames}`,
        zOkText: 'Delete',
        zCancelText: 'Cancel',
        zOkDestructive: true,
        zViewContainerRef: this.viewContainerRef,
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          console.log('Delete files:', Array.from(selectedIds));
          // Here you would typically delete the files from your backend
          this.selectedFileIds.set(new Set());
        }
      });
    }
  }

  // Get path segments for breadcrumb
  readonly pathSegments = computed(() => {
    const path = this.zCurrentPath();
    if (path === '/') return [{ label: 'Home', route: '/' }];
    
    const segments = path.split('/').filter(s => s);
    const result = [{ label: 'Home', route: '/' }];
    
    let currentPath = '';
    segments.forEach(segment => {
      currentPath += `/${segment}`;
      result.push({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        route: currentPath,
      });
    });
    
    return result;
  });

  // Navigate to path segment
  navigateToPath(route: string): void {
    // This would typically update the current path
    console.log('Navigate to path:', route);
  }
}

