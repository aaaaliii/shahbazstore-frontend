'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import 'swiper/css';

interface ProductCarouselProps {
  products: Product[];
}

export function ProductCarousel({ products }: ProductCarouselProps) {
  return (
    <Swiper
      spaceBetween={16}
      slidesPerView={1}
      breakpoints={{
        576: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 24,
        },
        992: {
          slidesPerView: 4,
          spaceBetween: 24,
        },
        1200: {
          slidesPerView: 5,
          spaceBetween: 28,
        },
      }}
      className="products-slider"
    >
      {products.map((product) => (
        <SwiperSlide key={product.id}>
          <ProductCard product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

