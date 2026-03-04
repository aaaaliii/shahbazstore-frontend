declare module '@splidejs/react-splide' {
  import type { ComponentType, ReactNode } from 'react';

  export interface SplideProps {
    options?: Record<string, unknown>;
    ariaLabel?: string;
    'aria-label'?: string;
    className?: string;
    children?: ReactNode;
  }

  export interface SplideSlideProps {
    className?: string;
    children?: ReactNode;
  }

  export const Splide: ComponentType<SplideProps>;
  export const SplideSlide: ComponentType<SplideSlideProps>;
}
