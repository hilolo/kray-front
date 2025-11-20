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
import './tag-blot';

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
      ['bold', 'italic', 'underline', 'strike'],
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

    this.isReady.set(true);
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

  /**
   * Insert a tag at the current cursor position
   * @param fieldName The name of the field (e.g., "Name", "Age", "Date")
   * @param value The value to store in the tag (e.g., "John Doe", "25", "2024-01-01")
   */
  insertTag(fieldName: string, value: string): void {
    if (!this.quill) {
      return;
    }

    // Get current selection or set to end of document
    let range = this.quill.getSelection();
    if (!range) {
      const length = this.quill.getLength();
      range = { index: length - 1, length: 0 };
      this.quill.setSelection(range.index, 0);
    }

    const index = range.index;
    
    // Insert text first
    this.quill.insertText(index, fieldName, 'user');
    
    // Apply tag format with the field and value
    try {
      this.quill.formatText(index, fieldName.length, 'tag', { field: fieldName, value: value }, 'user');
    } catch (error) {
      console.error('Error applying tag format:', error);
      // Fallback: remove the inserted text if format fails
      this.quill.deleteText(index, fieldName.length, 'user');
      return;
    }
    
    // Move cursor after the tag
    this.quill.setSelection(index + fieldName.length, 0);
  }

  /**
   * Extract all tag values from the editor content
   * @returns A map of field names to their values
   */
  getTagValues(): Map<string, string> {
    const tagValues = new Map<string, string>();
    
    if (!this.quill) {
      return tagValues;
    }

    const html = this.quill.root.innerHTML;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const tagElements = doc.querySelectorAll('span.ql-tag[data-field][data-value]');

    tagElements.forEach((tag) => {
      const field = tag.getAttribute('data-field');
      const value = tag.getAttribute('data-value');
      if (field && value) {
        tagValues.set(field, value);
      }
    });

    return tagValues;
  }

  /**
   * Replace all tags in the HTML content with their values
   * @param html The HTML content containing tags
   * @returns HTML with tags replaced by their values
   */
  replaceTagsWithValues(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const tagElements = doc.querySelectorAll('span.ql-tag[data-field][data-value]');

    tagElements.forEach((tag) => {
      const value = tag.getAttribute('data-value');
      if (value !== null) {
        // Replace the tag element with a text node containing the value
        const textNode = doc.createTextNode(value);
        tag.parentNode?.replaceChild(textNode, tag);
      }
    });

    return doc.body.innerHTML;
  }
}

