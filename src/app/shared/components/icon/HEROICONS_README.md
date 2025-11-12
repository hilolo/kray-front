# Heroicons Integration

This project includes support for [Heroicons](https://github.com/tailwindlabs/heroicons) - beautiful hand-crafted SVG icons by the makers of Tailwind CSS.

## Installation

The `heroicons` package is already installed. If you need to reinstall:

```bash
npm install heroicons
```

## Usage

### Basic Usage

Import and use the `ZardHeroiconComponent` in your component:

```typescript
import { ZardHeroiconComponent } from '@shared/components/icon/heroicon.component';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [ZardHeroiconComponent],
  template: `
    <z-heroicon zName="home" />
    <z-heroicon zName="user" zStyle="solid" zSize="20" />
  `
})
export class ExampleComponent {}
```

### Component Props

- `zName` (required): The name of the Heroicon (e.g., 'home', 'user', 'bell')
- `zStyle`: Icon style - `'outline'` (default) or `'solid'`
- `zSize`: Icon size - `16`, `20`, or `24` (default: `24`)
- `class`: Additional CSS classes

### Examples

```html
<!-- Outline icon (default) -->
<z-heroicon zName="home" />

<!-- Solid icon -->
<z-heroicon zName="user" zStyle="solid" />

<!-- Small icon -->
<z-heroicon zName="bell" zSize="16" />

<!-- With custom classes -->
<z-heroicon zName="heart" class="text-red-500" />
```

## Available Icons

All Heroicons are available. Common icons include:
- `home`, `user`, `bell`, `mail`, `calendar`
- `search`, `settings`, `heart`, `star`
- `arrow-left`, `arrow-right`, `chevron-down`
- `check`, `x-mark`, `plus`, `minus`
- And many more...

Browse all available icons at: [heroicons.com](https://heroicons.com)

## Implementation Notes

The current implementation uses a service-based approach. For production use, you may want to:

1. **Pre-load commonly used icons** - Create a static mapping of frequently used icons
2. **Use dynamic imports** - Load icons on-demand to reduce bundle size
3. **Create icon bundles** - Group related icons together

## Alternative: Direct SVG Usage

You can also copy SVG code directly from [heroicons.com](https://heroicons.com) and use it inline:

```html
<svg class="size-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>
```

## Resources

- [Heroicons GitHub](https://github.com/tailwindlabs/heroicons)
- [Heroicons Website](https://heroicons.com)
- [Heroicons Documentation](https://github.com/tailwindlabs/heroicons#readme)

