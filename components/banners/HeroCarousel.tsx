"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import Link from "next/link";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export interface HeroSlide {
  image: string;
  title?: string;
  subtitle?: string;
  link?: string;
  linkText?: string;
  categoryId?: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    image: "/assets/images/hero/hero (1).webp",
    title: "New Arrivals",
    subtitle: "Discover the latest trends and styles",
    link: "/products",
    linkText: "Shop Now",
  },
  {
    image: "/assets/images/hero/hero (2).webp",
    title: "Best Deals",
    subtitle: "Up to 50% off on selected items",
    link: "/products",
    linkText: "Shop Now",
  },
  {
    image: "/assets/images/hero/hero (3).webp",
    title: "Gift Ideas",
    subtitle: "Perfect presents for your loved ones",
    link: "/products",
    linkText: "Shop Now",
  },
];

interface HeroCarouselProps {
  slides?: HeroSlide[];
  getCategoryLink?: (slide: HeroSlide) => string;
}

export function HeroCarousel({
  slides = DEFAULT_SLIDES,
  getCategoryLink,
}: HeroCarouselProps) {
  const effectiveSlides = slides.length > 0 ? slides : DEFAULT_SLIDES;

  return (
    <section className="hero-carousel appear-animate">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        loop={effectiveSlides.length > 1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        navigation
        pagination={{ clickable: true }}
        className="hero-carousel__swiper"
      >
        {effectiveSlides.map((slide, index) => {
          const link = getCategoryLink
            ? getCategoryLink(slide)
            : slide.link || "/products";

          return (
            <SwiperSlide key={index}>
              <Link href={link} className="hero-carousel__slide">
                <div className="hero-carousel__figure">
                  <span className="hero-carousel__overlay" aria-hidden />
                  <Image
                    src={slide.image}
                    alt={slide.title || `Banner ${index + 1}`}
                    fill
                    sizes="100vw"
                    quality={100}
                    className="hero-carousel__img"
                    priority={index === 0}
                  />
                </div>
                {(slide.title || slide.subtitle || slide.linkText) && (
                  <div className="hero-carousel__content">
                    {slide.title && (
                      <h1 className="hero-carousel__title">
                        <strong>{slide.title}</strong>
                      </h1>
                    )}
                    {slide.subtitle && (
                      <p className="hero-carousel__subtitle">
                        {slide.subtitle}
                      </p>
                    )}
                    {slide.linkText && (
                      <span className="hero-carousel__btn btn">
                        {slide.linkText}{" "}
                        <i className="fas fa-long-arrow-alt-right"></i>
                      </span>
                    )}
                  </div>
                )}
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
