import { Injectable } from '@angular/core';
import { HeroiconName, HeroiconStyle, HeroiconSize } from './heroicons';
import { HEROICON_PATHS } from './heroicon-paths';

/**
 * Heroicon Service
 * Provides SVG paths for Heroicons
 * 
 * This service loads Heroicons SVG data from the heroicons package.
 * For production use, consider pre-loading commonly used icons.
 */
@Injectable({
  providedIn: 'root',
})
export class HeroiconService {
  /**
   * Get SVG path for a Heroicon
   * @param name Icon name (e.g., 'home', 'user', 'bell')
   * @param style Icon style: 'outline' or 'solid'
   * @param size Icon size: 16, 20, or 24
   * @returns SVG path string or null if not found
   */
  getIconPath(name: HeroiconName, style: HeroiconStyle = 'outline', size: HeroiconSize = 24): string | null {
    try {
      // Try to import from heroicons package
      // Note: The heroicons package structure may vary
      // This is a placeholder - you may need to adjust based on actual package structure
      const iconPath = this.loadIconFromPackage(name, style, size);
      return iconPath;
    } catch (error) {
      console.warn(`Failed to load Heroicon: ${name}`, error);
      return null;
    }
  }

  /**
   * Get full SVG markup for a Heroicon
   * @param name Icon name
   * @param style Icon style
   * @param size Icon size
   * @returns Complete SVG string
   */
  getIconSvg(name: HeroiconName, style: HeroiconStyle = 'outline', size: HeroiconSize = 24): string {
    const path = this.getIconPath(name, style, size);
    if (!path) {
      return '';
    }

    const viewBox = this.getViewBox(size);
    const isOutline = style === 'outline';

    if (isOutline) {
      return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="${viewBox}" stroke-width="1.5" stroke="currentColor" class="w-full h-full">${path}</svg>`;
    } else {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="currentColor" class="w-full h-full">${path}</svg>`;
    }
  }

  private getViewBox(size: HeroiconSize): string {
    switch (size) {
      case 16:
        return '0 0 16 16';
      case 20:
        return '0 0 20 20';
      case 24:
      default:
        return '0 0 24 24';
    }
  }

  private loadIconFromPackage(name: HeroiconName, style: HeroiconStyle, size: HeroiconSize): string | null {
    // Load from static mapping
    const iconData = HEROICON_PATHS[name];
    if (!iconData) {
      return null;
    }

    // Return the appropriate path based on style
    return style === 'solid' ? iconData.solid : iconData.outline;
  }

  private kebabToPascal(str: string): string {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}

