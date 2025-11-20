import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextReplacementModalComponent } from './text-replacement-modal.component';
import Quill from 'quill';

@Component({
  selector: 'app-wysiwyg-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, TextReplacementModalComponent],
  templateUrl: './wysiwyg-editor.component.html',
  styleUrls: ['./wysiwyg-editor.component.css']
})
export class WysiwygEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editor', { static: false }) editorElement!: ElementRef;
  @ViewChild('modal', { static: false }) modal!: TextReplacementModalComponent;
  @Output() htmlGenerated = new EventEmitter<string>();
  @Output() htmlChanged = new EventEmitter<string>();  // Real-time updates
  
  private quill!: Quill;
  private updateTimeout: any;
  showModal: boolean = false;
  showImportModal: boolean = false;
  importHtml: string = '';

  ngAfterViewInit(): void {
    this.initializeQuill();
  }
  
  ngOnDestroy(): void {
    // Clean up timeout to avoid memory leaks
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
  }

  private initializeQuill(): void {
    const toolbarOptions = [
      [{ 'header': [1, 2, 3, false] }],  // Paragraph styles
      ['bold', 'italic', 'underline', 'strike'],  // Text formatting
      [{ 'align': '' }, { 'align': 'center' }, { 'align': 'right' }, { 'align': 'justify' }],  // Alignment buttons
      [{ 'indent': '-1'}, { 'indent': '+1' }],  // Indent/Outdent
      [{ 'list': 'ordered'}, { 'list': 'bullet' }]  // Lists
    ];

    this.quill = new Quill(this.editorElement.nativeElement, {
      theme: 'snow',
      modules: {
        toolbar: toolbarOptions,
        history: {
          delay: 1000,
          maxStack: 50,
          userOnly: true
        }
      },
      placeholder: 'Start typing your content here...'
    });

    // Add custom image handler for resizing
    this.setupImageResizing();
    
    // Add real-time update listener with debouncing
    this.quill.on('text-change', () => {
      this.onEditorChange();
    });
  }
  
  private onEditorChange(): void {
    // Debounce the updates to avoid too many conversions
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    
    this.updateTimeout = setTimeout(() => {
      if (this.quill) {
        let html = this.quill.root.innerHTML;
        // Apply the same transformations as convertToHtml
        html = html.replace(/<p><br><\/p>/gi, '<p>&nbsp;</p>');
        this.htmlChanged.emit(html);
      }
    }, 500);  // Wait 500ms after last change before updating
  }

  insertLogo(): void {
    const logoUrl = 'https://immocorner.ma/wp-content/uploads/2020/02/immocorner-400px.png';
    const range = this.quill.getSelection(true);
    
    if (range) {
      // Try to load via CORS proxy first, fallback to direct URL if fails
      const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(logoUrl)}`;
      
      this.urlToBase64(corsProxyUrl).then((base64: string) => {
        // Insert the logo image as base64
        this.quill.insertEmbed(range.index, 'image', base64);
        // Move cursor after the image
        this.quill.setSelection(range.index + 1, 0);
        
        // Wait for the image to be inserted, then set its size
        setTimeout(() => {
          const images = this.quill.root.querySelectorAll('img');
          const lastImage = images[images.length - 1] as HTMLImageElement;
          if (lastImage && lastImage.src === base64) {
            lastImage.style.width = '200px';
            lastImage.style.height = 'auto';
          }
        }, 100);
      }).catch(error => {
        console.error('Error loading logo via proxy, trying direct URL:', error);
        
        // Fallback: try loading directly (might work if CORS is enabled)
        this.urlToBase64(logoUrl).catch(err => {
          console.error('Error loading logo directly:', err);
          
          // Final fallback: insert URL directly (works in editor, might have issues in PDF)
          this.quill.insertEmbed(range.index, 'image', logoUrl);
          this.quill.setSelection(range.index + 1, 0);
          
          setTimeout(() => {
            const images = this.quill.root.querySelectorAll('img');
            const lastImage = images[images.length - 1] as HTMLImageElement;
            if (lastImage) {
              lastImage.style.width = '200px';
              lastImage.style.height = 'auto';
            }
          }, 100);
          
          alert('Logo inserted but may not work in PDF export. Consider uploading to a CORS-enabled server.');
        });
      });
    }
  }

  private urlToBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          try {
            const base64 = canvas.toDataURL('image/png');
            resolve(base64);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };
      
      img.onerror = (error) => {
        reject(new Error('Failed to load image from URL'));
      };
      
      img.src = url;
    });
  }

  private setupImageResizing(): void {
    const editor = this.quill.root;
    
    editor.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target && target.tagName === 'IMG') {
        this.selectImage(target as HTMLImageElement);
      }
    });
  }

  private selectImage(img: HTMLImageElement): void {
    // Remove any existing resize handles
    const existingHandles = document.querySelectorAll('.resize-handle');
    existingHandles.forEach(handle => handle.remove());

    // Add resize handles
    const handlePositions = ['nw', 'ne', 'sw', 'se'];
    handlePositions.forEach(position => {
      const handle = document.createElement('div');
      handle.className = `resize-handle resize-handle-${position}`;
      handle.style.position = 'absolute';
      handle.style.width = '10px';
      handle.style.height = '10px';
      handle.style.backgroundColor = '#2196F3';
      handle.style.border = '1px solid white';
      handle.style.cursor = position.includes('n') ? 
        (position.includes('w') ? 'nwse-resize' : 'nesw-resize') : 
        (position.includes('w') ? 'nesw-resize' : 'nwse-resize');
      handle.style.zIndex = '1000';
      
      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.startResize(img, e, position);
      });

      img.parentElement?.appendChild(handle);
      this.positionHandle(handle, img, position);
    });

    // Add border to selected image
    img.style.outline = '2px solid #2196F3';
    img.style.outlineOffset = '2px';

    // Remove handles when clicking outside
    const removeHandles = (e: Event) => {
      if (!(e.target as HTMLElement).closest('.resize-handle') && e.target !== img) {
        const handles = document.querySelectorAll('.resize-handle');
        handles.forEach(h => h.remove());
        img.style.outline = '';
        img.style.outlineOffset = '';
        document.removeEventListener('click', removeHandles);
      }
    };
    setTimeout(() => document.addEventListener('click', removeHandles), 100);
  }

  private positionHandle(handle: HTMLElement, img: HTMLImageElement, position: string): void {
    const rect = img.getBoundingClientRect();
    const parentRect = img.parentElement!.getBoundingClientRect();
    
    if (position.includes('n')) {
      handle.style.top = (rect.top - parentRect.top - 5) + 'px';
    } else {
      handle.style.top = (rect.bottom - parentRect.top - 5) + 'px';
    }
    
    if (position.includes('w')) {
      handle.style.left = (rect.left - parentRect.left - 5) + 'px';
    } else {
      handle.style.left = (rect.right - parentRect.left - 5) + 'px';
    }
  }

  private startResize(img: HTMLImageElement, e: MouseEvent, position: string): void {
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = img.width;
    const startHeight = img.height;
    const aspectRatio = startWidth / startHeight;

    const doResize = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;

      if (position.includes('e')) {
        newWidth = startWidth + deltaX;
      } else if (position.includes('w')) {
        newWidth = startWidth - deltaX;
      }

      // Maintain aspect ratio
      newHeight = newWidth / aspectRatio;

      // Set minimum size
      if (newWidth > 50 && newHeight > 50) {
        img.style.width = newWidth + 'px';
        img.style.height = newHeight + 'px';
        
        // Update handle positions
        const handles = img.parentElement?.querySelectorAll('.resize-handle');
        handles?.forEach((handle: Element) => {
          const pos = (handle as HTMLElement).className.split('-').pop()!;
          this.positionHandle(handle as HTMLElement, img, pos);
        });
      }
    };

    const stopResize = () => {
      document.removeEventListener('mousemove', doResize);
      document.removeEventListener('mouseup', stopResize);
    };

    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResize);
  }

  insertTextPlaceholder(): void {
    if (this.quill) {
      const range = this.quill.getSelection(true);
      if (range) {
        this.quill.insertText(range.index, '#text#', 'bold', true);
        this.quill.setSelection(range.index + 6, 0);
      }
    }
  }

  convertToHtml(): void {
    if (this.quill) {
      // Remove resize handles before getting HTML
      const handles = this.quill.root.querySelectorAll('.resize-handle');
      handles.forEach(handle => handle.remove());
      
      // Process images to ensure dimensions are preserved
      const images = this.quill.root.querySelectorAll('img');
      images.forEach(img => {
        const imgElement = img as HTMLImageElement;
        
        // Remove outline
        imgElement.style.outline = '';
        imgElement.style.outlineOffset = '';
        
        // Ensure width and height are preserved as both style and attributes
        const computedWidth = imgElement.style.width || imgElement.width + 'px';
        const computedHeight = imgElement.style.height || imgElement.height + 'px';
        
        if (computedWidth && computedWidth !== '0px') {
          imgElement.style.width = computedWidth;
          imgElement.setAttribute('width', computedWidth);
        }
        if (computedHeight && computedHeight !== '0px' && computedHeight !== 'auto') {
          imgElement.style.height = computedHeight;
          imgElement.setAttribute('height', computedHeight);
        }
      });
      
      // Get HTML - innerHTML preserves HTML entities
      let html = this.quill.root.innerHTML;
      
      // Ensure empty paragraphs are properly represented
      // Replace <p><br></p> with a paragraph containing a non-breaking space for proper spacing
      html = html.replace(/<p><br><\/p>/gi, '<p>&nbsp;</p>');
      
      // Check if there are any #text# placeholders
      const placeholderCount = (html.match(/#text#/g) || []).length;
      
      if (placeholderCount > 0) {
        // Show modal to get replacement values
        this.showModal = true;
        this.modal.setPlaceholders(placeholderCount);
      } else {
        // No placeholders, emit HTML directly
        this.htmlGenerated.emit(html);
      }
    }
  }

  onModalConfirm(replacementValues: string[]): void {
    if (this.quill) {
      let html = this.quill.root.innerHTML;
      
      // Replace each #text# with the corresponding value
      replacementValues.forEach(value => {
        html = html.replace('#text#', value);
      });
      
      this.showModal = false;
      this.htmlGenerated.emit(html);
    }
  }

  onModalCancel(): void {
    this.showModal = false;
  }

  clearEditor(): void {
    if (this.quill) {
      this.quill.setText('');
    }
  }

  copyHtmlToClipboard(): void {
    if (this.quill) {
      // Remove resize handles before getting HTML
      const handles = this.quill.root.querySelectorAll('.resize-handle');
      handles.forEach(handle => handle.remove());
      
      // Process images to ensure dimensions are preserved
      const images = this.quill.root.querySelectorAll('img');
      images.forEach(img => {
        const imgElement = img as HTMLImageElement;
        
        // Remove outline
        imgElement.style.outline = '';
        imgElement.style.outlineOffset = '';
        
        // Ensure width and height are preserved as both style and attributes
        const computedWidth = imgElement.style.width || imgElement.width + 'px';
        const computedHeight = imgElement.style.height || imgElement.height + 'px';
        
        if (computedWidth && computedWidth !== '0px') {
          imgElement.style.width = computedWidth;
          imgElement.setAttribute('width', computedWidth);
        }
        if (computedHeight && computedHeight !== '0px' && computedHeight !== 'auto') {
          imgElement.style.height = computedHeight;
          imgElement.setAttribute('height', computedHeight);
        }
      });
      
      // Get HTML - innerHTML preserves HTML entities
      let html = this.quill.root.innerHTML;
      
      // Ensure empty paragraphs are properly represented
      html = html.replace(/<p><br><\/p>/gi, '<p>&nbsp;</p>');
      
      // Copy to clipboard
      navigator.clipboard.writeText(html).then(() => {
        alert('HTML copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy HTML:', err);
        alert('Failed to copy HTML to clipboard');
      });
    }
  }

  openImportModal(): void {
    this.importHtml = '';
    this.showImportModal = true;
  }

  closeImportModal(): void {
    this.showImportModal = false;
    this.importHtml = '';
  }

  validateAndImportHtml(): void {
    if (!this.importHtml.trim()) {
      alert('Please enter some HTML to import');
      return;
    }

    // Basic HTML validation
    const tempDiv = document.createElement('div');
    try {
      tempDiv.innerHTML = this.importHtml;
      
      // Check if HTML was parsed successfully
      if (tempDiv.innerHTML) {
        // Import into Quill editor using the clipboard API
        if (this.quill) {
          // Clear existing content first
          this.quill.setText('');
          
          // Store image dimensions before conversion
          const imageData: { src: string; width: string; height: string; }[] = [];
          const images = tempDiv.querySelectorAll('img');
          images.forEach((img: HTMLImageElement) => {
            imageData.push({
              src: img.src,
              width: img.style.width || img.getAttribute('width') || '',
              height: img.style.height || img.getAttribute('height') || ''
            });
          });
          
          // Insert the HTML content
          const delta = this.quill.clipboard.convert({ html: this.importHtml });
          this.quill.setContents(delta, 'user');
          
          // Restore image dimensions after import
          setTimeout(() => {
            const editorImages = this.quill.root.querySelectorAll('img');
            editorImages.forEach((img: HTMLImageElement, index: number) => {
              if (imageData[index]) {
                const data = imageData[index];
                // Match by src or by index
                const matchingData = imageData.find(d => d.src === img.src) || imageData[index];
                if (matchingData) {
                  if (matchingData.width) {
                    img.style.width = matchingData.width;
                  }
                  if (matchingData.height) {
                    img.style.height = matchingData.height;
                  }
                }
              }
            });
          }, 100);
          
          alert('HTML imported successfully!');
          this.closeImportModal();
        }
      } else {
        alert('Invalid HTML. Please check your input.');
      }
    } catch (error) {
      console.error('HTML validation error:', error);
      alert('Invalid HTML. Please check your input and try again.');
    }
  }
}

