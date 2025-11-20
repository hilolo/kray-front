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

  readonly valueChange = output<string>();
  readonly htmlChange = output<string>();

  private quill?: Quill;
  private updateTimeout?: ReturnType<typeof setTimeout>;
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
      this.onEditorChange();
    });

    // Add selection change listener to update button state
    this.quill.on('selection-change', () => {
      this.updateButtonState();
    });

    // Add keyboard handler to remove entire code tag when deleting inside it
    this.quill.root.addEventListener('keydown', (e: KeyboardEvent) => {
      this.handleCodeTagDeletion(e);
    });

    this.isReady.set(true);
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

  /**
   * Insert or toggle custom inline blot example
   * This method demonstrates how to apply/remove custom inline formats
   */
  insertInlineBlot(): void {
    if (!this.quill) {
      return;
    }

    const range = this.quill.getSelection(true);
    if (!range) {
      return;
    }

    // Check if the selected text already has the highlight format
    const format = this.quill.getFormat(range);
    
    if (format['highlight']) {
      // Remove the format if it's already applied
      this.quill.formatText(range.index, range.length, 'highlight', false, 'user');
    } else {
      // Apply the highlight format to selected text
      if (range.length > 0) {
        // Text is selected, apply format
        this.quill.formatText(range.index, range.length, 'highlight', true, 'user');
      } else {
        // No text selected, insert example text with format
        const exampleText = 'inline example';
        this.quill.insertText(range.index, exampleText, 'highlight', true, 'user');
        this.quill.setSelection(range.index + exampleText.length, 0);
      }
    }

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
   * Handle deletion of code tags - removes entire code tag when deleting inside it
   */
  private handleCodeTagDeletion(event: KeyboardEvent): void {
    if (!this.quill) {
      return;
    }

    // Only handle Backspace and Delete keys
    if (event.key !== 'Backspace' && event.key !== 'Delete') {
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

    // Prevent default deletion behavior
    event.preventDefault();
    event.stopPropagation();

    // Find the boundaries of the code format using Quill's format API
    const { startIndex, endIndex } = this.findCodeFormatRange(range.index);
    if (startIndex === -1 || endIndex === -1) {
      return;
    }

    // Remove the entire code tag and its content
    this.quill.deleteText(startIndex, endIndex - startIndex, 'user');
    
    // Set cursor position after the deleted code
    this.quill.setSelection(startIndex, 0, 'user');
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
    for (let i = index; i >= 0; i--) {
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
    for (let i = index; i < editorLength - 1; i++) {
      const format = this.quill.getFormat(i, 1);
      if (!format || !format['code']) {
        // Found the boundary - code format ends at i
        endIndex = i;
        break;
      }
    }

    // Ensure we have valid indices
    if (startIndex < 0 || endIndex <= startIndex || endIndex > editorLength) {
      return { startIndex: -1, endIndex: -1 };
    }

    return { startIndex, endIndex };
  }
}

