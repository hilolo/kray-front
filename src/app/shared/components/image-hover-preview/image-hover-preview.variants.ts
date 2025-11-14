import { cva, VariantProps } from 'class-variance-authority';

export const imageHoverPreviewVariants = cva(
  'z-50 overflow-hidden rounded-lg border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
);

export type ZardImageHoverPreviewVariants = VariantProps<typeof imageHoverPreviewVariants>;

