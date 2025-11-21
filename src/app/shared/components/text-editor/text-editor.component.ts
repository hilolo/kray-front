import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  OnDestroy,
  output,
  signal,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import type { ClassValue } from 'clsx';
import Quill from 'quill';
import { mergeClasses } from '@shared/utils/merge-classes';
import { textEditorVariants, ZardTextEditorVariants } from './text-editor.variants';
import { ZardButtonComponent } from '../button/button.component';
import { ZardIconComponent } from '../icon/icon.component';
import { CommonModule } from '@angular/common';

// Custom Inline Blot Example - Highlight format
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const InlineBlot = Quill.import('blots/inline') as any;

class HighlightInlineBlot extends InlineBlot {
  static blotName = 'highlight';
  static tagName = 'span';

  static create() {
    const node = super.create() as HTMLElement;
    node.style.backgroundColor = 'hsl(var(--primary) / 0.2)';
    node.style.padding = '2px 4px';
    node.style.borderRadius = '4px';
    node.style.fontWeight = '500';
    return node;
  }
}

Quill.register('formats/highlight', HighlightInlineBlot);

@Component({
  selector: 'z-text-editor',
  exportAs: 'zTextEditor',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.css'],
})
export class ZardTextEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editor', { static: false }) editorElement!: ElementRef<HTMLDivElement>;

  readonly zSize = input<ZardTextEditorVariants['zSize']>('default');
  readonly zStatus = input<ZardTextEditorVariants['zStatus']>('default');
  readonly class = input<ClassValue>('');
  readonly placeholder = input<string>('Start typing your content here...');
  readonly value = input<string>('');
  readonly zReadonly = input(false);
  readonly protectedCodeBlocks = input<string[]>([]);

  readonly valueChange = output<string>();
  readonly htmlChange = output<string>();

  private quill?: Quill;
  private updateTimeout?: ReturnType<typeof setTimeout>;
  private isCleaningUp = false;
  readonly isReady = signal(false);

  protected readonly classes = computed(() =>
    mergeClasses(
      textEditorVariants({
        zSize: this.zSize(),
        zStatus: this.zStatus(),
      }),
      this.class(),
    ),
  );

  ngAfterViewInit(): void {
    this.initializeQuill();
  }

  ngOnDestroy(): void {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
  }

  private initializeQuill(): void {
    if (!this.editorElement?.nativeElement) {
      return;
    }

    const toolbarOptions = [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'code'],
      [{ 'align': '' }, { 'align': 'center' }, { 'align': 'right' }, { 'align': 'justify' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ];

    this.quill = new Quill(this.editorElement.nativeElement, {
      theme: 'snow',
      modules: {
        toolbar: toolbarOptions,
        history: {
          delay: 1000,
          maxStack: 50,
          userOnly: true,
        },
      },
      placeholder: this.placeholder(),
      readOnly: this.zReadonly(),
    });

    // Add custom inline blot button to toolbar
    this.addCustomInlineButton();

    // Set initial value if provided
    if (this.value()) {
      this.quill.root.innerHTML = this.value();
    }

    // Force line-height to 2 on the editor element and all children
    if (this.quill.root) {
      const editorElement = this.quill.root as HTMLElement;
      editorElement.style.lineHeight = '2';
      // Also apply to all child elements
      const allElements = editorElement.querySelectorAll('*');
      allElements.forEach((el) => {
        (el as HTMLElement).style.lineHeight = '2';
      });
    }

    // Add change listener with debouncing
    this.quill.on('text-change', () => {
      // Immediately clean up invalid code blocks before debounced change handler
      this.immediateCleanupInvalidCodeBlocks();
      this.onEditorChange();
    });

    // Add selection change listener to update button state
    this.quill.on('selection-change', () => {
      this.updateButtonState();
    });

    // Add keyboard handler to handle code block interactions
    this.quill.root.addEventListener('keydown', (e: KeyboardEvent) => {
      this.handleCodeBlockInteraction(e);
    });

    // Debug: Force apply padding-bottom to ql-container
    this.applyContainerPadding();

    this.isReady.set(true);
  }

  /**
   * Debug method to force apply padding-bottom to ql-container
   */
  private applyContainerPadding(): void {
    if (!this.editorElement?.nativeElement) {
      return;
    }

    // Try multiple times with delay to ensure element is rendered
    let attempts = 0;
    const maxAttempts = 5;
    
    const tryApplyPadding = () => {
      attempts++;

      // Find the ql-container element - it might be the wrapper itself or a child
      let container = this.editorElement.nativeElement.querySelector('.ql-container');
      
      // If not found as child, check if wrapper itself is the container
      if (!container && this.editorElement.nativeElement.classList.contains('ql-container')) {
        container = this.editorElement.nativeElement;
      }
      
      if (container) {
        const htmlElement = container as HTMLElement;

        // Force apply padding-bottom via inline style with !important
        htmlElement.style.setProperty('padding-bottom', '25px', 'important');
        htmlElement.style.paddingBottom = '25px';
      } else {
        // Retry if we haven't exceeded max attempts
        if (attempts < maxAttempts) {
          setTimeout(tryApplyPadding, 200);
        }
      }
    };

    // Start trying immediately and also after a short delay
    tryApplyPadding();
    setTimeout(tryApplyPadding, 100);
    setTimeout(tryApplyPadding, 500);
  }

  /**
   * Add custom inline blot button to the toolbar
   */
  private addCustomInlineButton(): void {
    if (!this.quill || !this.editorElement?.nativeElement) {
      return;
    }

    // Find the toolbar element
    const toolbar = this.editorElement.nativeElement.querySelector('.ql-toolbar');
    if (!toolbar) {
      return;
    }

    // Create custom button for inline blot
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('ql-inline-blot');
    button.setAttribute('title', 'Inline Blot Example');
    button.innerHTML = `
      <svg viewBox="0 0 18 18" width="16" height="16">
        <rect x="3" y="5" width="12" height="8" fill="none" stroke="currentColor" stroke-width="1.5" rx="2"/>
        <line x1="6" y1="9" x2="12" y2="9" stroke="currentColor" stroke-width="1.5"/>
      </svg>
    `;

    // Add click handler
    button.addEventListener('click', (e) => {
      e.preventDefault();
      this.insertInlineBlot();
    });

    // Insert button after the strike button or at the end of the formatting group
    const formatsGroup = toolbar.querySelector('.ql-formats');
    if (formatsGroup) {
      // Create a new formats group or add to existing
      let buttonGroup = formatsGroup.nextElementSibling;
      if (!buttonGroup || !buttonGroup.classList.contains('ql-formats')) {
        buttonGroup = document.createElement('span');
        buttonGroup.classList.add('ql-formats');
        toolbar.appendChild(buttonGroup);
      }
      buttonGroup.appendChild(button);
    } else {
      // Fallback: append directly to toolbar
      toolbar.appendChild(button);
    }
  }

  private onEditorChange(): void {
    if (!this.quill) {
      return;
    }

    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    this.updateTimeout = setTimeout(() => {
      if (this.quill) {
        let html = this.quill.root.innerHTML;
        // Clean up empty paragraphs
        html = html.replace(/<p><br><\/p>/gi, '<p>&nbsp;</p>');
        
        // Clean up invalid code blocks (only allow contactName and contactAge)
        html = this.cleanupInvalidCodeBlocks(html);
        
        // Update the editor if HTML was cleaned
        if (html !== this.quill.root.innerHTML) {
          const selection = this.quill.getSelection();
          const scrollTop = this.quill.root.scrollTop;
          this.quill.root.innerHTML = html;
          
          // Restore selection if we had one
          if (selection) {
            const length = this.quill.getLength();
            const adjustedIndex = Math.min(selection.index, Math.max(0, length - 1));
            this.quill.setSelection(adjustedIndex, 0, 'silent');
          }
          this.quill.root.scrollTop = scrollTop;
        }
        
        this.valueChange.emit(html);
        this.htmlChange.emit(html);
      }
    }, 300);
  }

  getHtml(): string {
    if (!this.quill) {
      return '';
    }
    let html = this.quill.root.innerHTML;
    html = html.replace(/<p><br><\/p>/gi, '<p>&nbsp;</p>');
    return html;
  }

  setHtml(html: string): void {
    if (this.quill) {
      this.quill.root.innerHTML = html;
    }
  }

  clear(): void {
    if (this.quill) {
      this.quill.setText('');
    }
  }

  insertText(text: string): void {
    if (!this.quill) {
      return;
    }
    let range = this.quill.getSelection();
    if (!range) {
      // If no selection, set cursor to the end
      const length = this.quill.getLength();
      range = { index: length - 1, length: 0 };
      this.quill.setSelection(range.index, 0);
    }
    this.quill.insertText(range.index, text);
    this.quill.setSelection(range.index + text.length, 0);
    this.onEditorChange();
  }

  insertTextWithFormat(text: string, format: string, value: boolean): void {
    if (!this.quill) {
      return;
    }
    
    // Focus the editor to ensure it's active
    this.quill.focus();
    
    let range = this.quill.getSelection(true);
    if (!range) {
      // If no selection, set cursor to the end
      const length = this.quill.getLength();
      range = { index: length - 1, length: 0 };
      this.quill.setSelection(range.index, 0, 'user');
    }
    
    // Save the original insertion index
    const originalIndex = range.index;
    
    // Insert text with format
    this.quill.insertText(originalIndex, text, format as any, value, 'api');
    
    // Calculate the position after the inserted text
    const newPosition = originalIndex + text.length;
    
    // Set cursor position after the inserted text and keep it there
    // Use 'api' source to prevent triggering additional events that might change position
    this.quill.setSelection(newPosition, 0, 'api');
    
    // Remove the format from the cursor position so future typing is not in that format
    // Use 'api' source to prevent cursor position changes
    this.quill.format(format, false, 'api');
    
    // Ensure cursor stays at the correct position after format removal
    this.quill.setSelection(newPosition, 0, 'api');
    
    // Update button state
    this.updateButtonState();
    
    this.onEditorChange();
  }

  /**
   * Insert or toggle custom inline blot example
   * This method demonstrates how to apply/remove custom inline formats
   */
  insertInlineBlot(): void {
    if (!this.quill) {
      return;
    }

    // Focus the editor to ensure it's active
    this.quill.focus();

    let range = this.quill.getSelection(true);
    if (!range) {
      // If no selection, set cursor to the end
      const length = this.quill.getLength();
      range = { index: length - 1, length: 0 };
      this.quill.setSelection(range.index, 0, 'api');
    }

    // Check if cursor is inside a code block
    const codeRange = this.findCodeFormatRange(range.index);
    let insertIndex = range.index;
    
    // If cursor is inside a code block, move it to just after the code block
    if (codeRange.startIndex !== -1 && codeRange.endIndex !== -1) {
      // Move cursor to just after the code block
      insertIndex = codeRange.endIndex;
      this.quill.setSelection(insertIndex, 0, 'api');
    }

    // Get protected code blocks and use the first one, or default to 'code'
    const protectedCodeBlocks = this.protectedCodeBlocks();
    const codeText = protectedCodeBlocks.length > 0 ? protectedCodeBlocks[0] : 'code';

    // Add a space at the insertion index to separate code blocks (if not at the start)
    if (insertIndex > 0) {
      this.quill.insertText(insertIndex, ' ', 'api');
      insertIndex += 1; // Adjust insert index after adding space
    }
    
    // Insert code text with code format using 'api' source for better control
    this.quill.insertText(insertIndex, codeText, 'code', true, 'api');
    
    // Calculate the position after the inserted code block
    const finalCursorPosition = insertIndex + codeText.length;
    
    // Set cursor position just after the inserted code block using 'api' source
    // This keeps the cursor at a fixed position and prevents it from changing
    this.quill.setSelection(finalCursorPosition, 0, 'api');
    
    // Force focus to ensure cursor is visible
    this.quill.focus();

    // Update button active state
    this.updateButtonState();

    this.onEditorChange();
  }

  /**
   * Update the custom button active state based on current selection
   */
  private updateButtonState(): void {
    if (!this.quill || !this.editorElement?.nativeElement) {
      return;
    }

    const button = this.editorElement.nativeElement.querySelector('.ql-inline-blot') as HTMLElement;
    if (!button) {
      return;
    }

    const range = this.quill.getSelection();
    if (range) {
      const format = this.quill.getFormat(range);
      if (format['highlight']) {
        button.classList.add('ql-active');
      } else {
        button.classList.remove('ql-active');
      }
    }
  }

  /**
   * Handle all interactions with code blocks - protects contactName and contactAge, allows normal editing for others
   */
  private handleCodeBlockInteraction(event: KeyboardEvent): void {
    if (!this.quill) {
      return;
    }

    // Allow special key combinations to pass through (Ctrl+C, Ctrl+V, Ctrl+A, etc.)
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const range = this.quill.getSelection(true);
    if (!range) {
      return;
    }

    // Check if the current selection has code format
    const format = this.quill.getFormat(range);
    if (!format['code']) {
      return;
    }

    // Find the boundaries of the code format
    const { startIndex, endIndex } = this.findCodeFormatRange(range.index);
    if (startIndex === -1 || endIndex === -1) {
      return;
    }

    // Get protected code blocks from input
    const protectedCodeBlocks = this.protectedCodeBlocks();
    
    // Get the text content of the code block
    const codeBlockText = this.getCodeBlockText(startIndex, endIndex);
    const isProtected = protectedCodeBlocks.includes(codeBlockText);
    
    if (!isProtected) {
      // Allow normal editing for non-protected code blocks
      return;
    }

    // Handle deletion (Backspace or Delete) - completely remove the protected code block
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      event.stopPropagation();

      // Use Quill's deleteText method to delete only the specific range at cursor position
      // This will only delete the code block at the cursor, not all matching blocks
      const scrollTop = this.quill.root.scrollTop;
      
      // Delete the specific range - this will only affect the code block at the cursor position
      // Quill's deleteText correctly handles deletion of a specific range in its delta model
      this.quill.deleteText(startIndex, endIndex - startIndex, 'user');
      
      // Set cursor position where the code block was (adjusted for length change)
      const length = this.quill.getLength();
      const adjustedIndex = Math.min(startIndex, Math.max(0, length - 1));
      this.quill.setSelection(adjustedIndex, 0, 'user');
      this.quill.root.scrollTop = scrollTop;
      
      this.onEditorChange();
      return;
    }

    // Handle text input (typing) - completely remove protected code block when trying to add text
    // Check if it's a printable character (not special keys like Ctrl, Alt, Arrow keys, etc.)
    // Single character keys are printable, or Enter key
    const isPrintableKey = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
    
    if (isPrintableKey || event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();

      // Use Quill's deleteText method to delete only the specific range at cursor position
      // This will only delete the code block at the cursor, not all matching blocks
      const scrollTop = this.quill.root.scrollTop;
      
      // Delete the specific range - this will only affect the code block at the cursor position
      // Quill's deleteText correctly handles deletion of a specific range in its delta model
      this.quill.deleteText(startIndex, endIndex - startIndex, 'user');
      
      // Get the character to insert
      const charToInsert = event.key === 'Enter' ? '\n' : event.key;
      
      // Insert only the new character as plain text (not the old code content)
      this.quill.insertText(startIndex, charToInsert, 'user');
      
      // Set cursor position after the inserted character
      const newPosition = startIndex + charToInsert.length;
      this.quill.setSelection(newPosition, 0, 'user');
      this.quill.root.scrollTop = scrollTop;
      
      this.onEditorChange();
      return;
    }
  }

  /**
   * Clean up any remaining <code> tags from the HTML
   */
  private cleanupCodeTags(): void {
    if (!this.quill) {
      return;
    }

    // Use setTimeout to ensure Quill has processed the deletion first
    setTimeout(() => {
      if (!this.quill) {
        return;
      }

      // Get current HTML
      let html = this.quill.root.innerHTML;
      
      // Save current selection and scroll position
      const selection = this.quill.getSelection();
      const scrollTop = this.quill.root.scrollTop;
      
      // Remove any remaining <code> tags and their content
      const cleanedHtml = html.replace(/<code[^>]*>.*?<\/code>/gi, '').replace(/<code[^>]*><\/code>/gi, '');
      
      // Update the HTML if it changed
      if (cleanedHtml !== html) {
        // Set the cleaned HTML directly
        this.quill.root.innerHTML = cleanedHtml;
        
        // Restore selection if we had one (adjust if necessary)
        if (selection) {
          const length = this.quill.getLength();
          const adjustedIndex = Math.min(selection.index, Math.max(0, length - 1));
          this.quill.setSelection(adjustedIndex, 0, 'silent');
        }
        
        // Restore scroll position
        this.quill.root.scrollTop = scrollTop;
        
        // Trigger change event
        this.onEditorChange();
      }
    }, 10);
  }

  /**
   * Clean up invalid code blocks - only allow protected code blocks
   * Removes any <code> tags that don't contain exactly one of the protected code blocks
   */
  private cleanupInvalidCodeBlocks(html: string): string {
    const protectedCodeBlocks = this.protectedCodeBlocks();
    
    // Use regex to find all code blocks
    // Match <code>content</code> and extract the content
    return html.replace(/<code[^>]*>(.*?)<\/code>/gi, (match, content) => {
      // Trim the content and remove any HTML entities or special characters
      const textContent = content.replace(/<[^>]*>/g, '').trim(); // Remove any nested HTML
      
      // Check if the content exactly matches one of the protected code blocks
      if (protectedCodeBlocks.includes(textContent)) {
        // Keep the code block as is
        return match;
      } else {
        // Remove the code tags but keep the content as plain text
        return textContent || '';
      }
    });
  }

  /**
   * Immediately clean up invalid code blocks after a text change
   * This runs synchronously to prevent invalid code blocks from appearing
   */
  private immediateCleanupInvalidCodeBlocks(): void {
    if (!this.quill || this.isCleaningUp) {
      return;
    }

    const html = this.quill.root.innerHTML;
    const cleanedHtml = this.cleanupInvalidCodeBlocks(html);
    
    // Only update if there was a change
    if (cleanedHtml !== html) {
      this.isCleaningUp = true;
      
      try {
        const selection = this.quill.getSelection();
        const scrollTop = this.quill.root.scrollTop;
        
        // Update the HTML
        this.quill.root.innerHTML = cleanedHtml;
        
        // Restore selection if we had one (adjust if necessary)
        if (selection) {
          const length = this.quill.getLength();
          const adjustedIndex = Math.min(selection.index, Math.max(0, length - 1));
          // Use 'silent' to prevent triggering another text-change event
          this.quill.setSelection(adjustedIndex, 0, 'silent');
        }
        
        // Restore scroll position
        this.quill.root.scrollTop = scrollTop;
      } finally {
        // Use setTimeout to reset flag after Quill has processed the change
        setTimeout(() => {
          this.isCleaningUp = false;
        }, 0);
      }
    }
  }

  /**
   * Find the start and end indices of the code format range using Quill's format API
   */
  private findCodeFormatRange(index: number): { startIndex: number; endIndex: number } {
    if (!this.quill) {
      return { startIndex: -1, endIndex: -1 };
    }

    const editorLength = this.quill.getLength();

    // Find the start index by going backwards
    let startIndex = index;
    // Check current position first
    let currentFormat = this.quill.getFormat(index, 1);
    if (!currentFormat || !currentFormat['code']) {
      return { startIndex: -1, endIndex: -1 }; // Not in a code block
    }

    // Go backwards to find the start
    for (let i = index - 1; i >= 0; i--) {
      const format = this.quill.getFormat(i, 1);
      if (!format || !format['code']) {
        // Found the boundary - code format starts at i + 1
        startIndex = i + 1;
        break;
      }
      if (i === 0) {
        // Reached the beginning, code format starts at 0
        startIndex = 0;
        break;
      }
    }

    // Find the end index by going forwards
    let endIndex = editorLength - 1; // Default to end of editor
    for (let i = index + 1; i < editorLength - 1; i++) {
      const format = this.quill.getFormat(i, 1);
      if (!format || !format['code']) {
        // Found the boundary - code format ends at i
        endIndex = i;
        break;
      }
    }

    // Ensure we have valid indices
    if (startIndex < 0 || endIndex <= startIndex || endIndex >= editorLength) {
      return { startIndex: -1, endIndex: -1 };
    }

    return { startIndex, endIndex };
  }

  /**
   * Get the text content of a code block between startIndex and endIndex
   */
  private getCodeBlockText(startIndex: number, endIndex: number): string {
    if (!this.quill) {
      return '';
    }

    // Get the delta for the range
    const delta = this.quill.getContents(startIndex, endIndex - startIndex);
    
    // Extract text from the delta
    let text = '';
    if (delta.ops) {
      for (const op of delta.ops) {
        if (typeof op.insert === 'string') {
          text += op.insert;
        }
      }
    }

    return text.trim();
  }
}

