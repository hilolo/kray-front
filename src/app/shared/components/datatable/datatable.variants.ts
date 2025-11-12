import { cva, VariantProps } from 'class-variance-authority';

export const datatableVariants = cva('flex flex-col w-full', {
  variants: {
    zType: {
      default: '',
      striped: '',
      bordered: '',
    },
    zSize: {
      default: '',
      compact: '',
      comfortable: '',
    },
  },
  defaultVariants: {
    zType: 'default',
    zSize: 'default',
  },
});

export type ZardDatatableVariants = VariantProps<typeof datatableVariants>;

