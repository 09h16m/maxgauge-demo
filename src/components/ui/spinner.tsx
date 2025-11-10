'use client';

import {
  LoaderIcon,
  type LucideProps,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type SpinnerProps = LucideProps;

export const Spinner = ({ className, ...props }: SpinnerProps) => (
  <LoaderIcon className={cn('animate-spin', className)} {...props} />
);

