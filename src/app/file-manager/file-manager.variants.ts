import { cva, VariantProps } from 'class-variance-authority';

export const fileManagerVariants = cva('w-full', {
  variants: {},
});

export type ZardFileManagerVariants = VariantProps<typeof fileManagerVariants>;


