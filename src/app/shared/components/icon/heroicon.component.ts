import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import type { ClassValue } from 'clsx';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { iconVariants, ZardIconVariants } from './icon.variants';
import { mergeClasses } from '@shared/utils/merge-classes';
import { HeroiconName, HeroiconStyle, HeroiconSize } from './heroicons';
import { HeroiconService } from './heroicon.service';

/**
 * Heroicon Component
 * Renders Heroicons SVG icons
 * 
 * Usage:
 * <z-heroicon zName="home" zStyle="outline" zSize="24" />
 * 
 * Based on: https://github.com/tailwindlabs/heroicons
 */
@Component({
  selector: 'z-heroicon, [z-heroicon]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <span [innerHTML]="iconSvg()" [class]="classes()"></span>
  `,
  host: {},
})
export class ZardHeroiconComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly heroiconService = inject(HeroiconService);

  readonly zName = input.required<HeroiconName>();
  readonly zStyle = input<HeroiconStyle>('outline');
  readonly zSize = input<HeroiconSize>(24);
  readonly class = input<ClassValue>('');

  protected readonly classes = computed(() => 
    mergeClasses(
      iconVariants({ zSize: this.getSizeVariant() }),
      'inline-block',
      this.class()
    )
  );

  protected readonly iconSvg = computed(() => {
    const name = this.zName();
    const style = this.zStyle();
    const size = this.zSize();
    
    // Get SVG from heroicon service
    const svg = this.heroiconService.getIconSvg(name, style, size);
    
    if (!svg) {
      console.warn(`Heroicon "${name}" not found`);
      return this.sanitizer.bypassSecurityTrustHtml('');
    }

    // Bypass sanitizer for SVG content since we control it
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  });

  private getSizeVariant(): ZardIconVariants['zSize'] {
    const size = this.zSize();
    if (size <= 16) return 'sm';
    if (size <= 20) return 'default';
    if (size <= 24) return 'lg';
    return 'xl';
  }
}

