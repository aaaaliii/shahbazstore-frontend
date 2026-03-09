"use client";

import Link from "next/link";
import Image from "next/image";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import { Category } from "@/types";
import { API_BASE_URL } from "@/lib/api/config";
import "@splidejs/react-splide/css";

export interface CategoryWithImage extends Category {
  image: string;
}

interface ShopByCategoryProps {
  categories: CategoryWithImage[];
  categoryIdsByTab: Record<string, string>;
  /** When set (e.g. "/category"), links go to /category/[slug]. Otherwise /products?category=id */
  basePath?: string;
  /** Optional onClick handler for category selection (for filtering products) */
  onCategoryClick?: (categoryId: string, category: CategoryWithImage) => void;
}

function formatImageUrl(imagePath: string | undefined): string {
  if (!imagePath) return "/assets/images/products/product-1.jpg";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const baseUrl = API_BASE_URL.endsWith("/api")
    ? API_BASE_URL.replace("/api", "")
    : API_BASE_URL.replace(/\/api\/?$/, "");
  return imagePath.startsWith("/")
    ? `${baseUrl}${imagePath}`
    : `${baseUrl}/${imagePath}`;
}

export function ShopByCategory({
  categories,
  categoryIdsByTab,
  basePath,
  onCategoryClick,
}: ShopByCategoryProps) {
  if (categories.length === 0) return null;

  // Calculate perPage based on actual category count, but respect breakpoint limits
  const getPerPage = (count: number, breakpoint: number) => {
    const limits: Record<number, number> = {
      576: 3,
      768: 4,
      992: 5,
      1200: 6,
    };
    const limit = limits[breakpoint] || 6;
    return Math.min(count, limit);
  };

  // Build breakpoints dynamically based on category count
  const buildBreakpoints = () => {
    const breakpoints: Record<number, { perPage: number }> = {};
    const breakpointValues = [576, 768, 992, 1200];
    
    breakpointValues.forEach((bp) => {
      const perPage = getPerPage(categories.length, bp);
      if (perPage > 0) {
        breakpoints[bp] = { perPage };
      }
    });
    
    return breakpoints;
  };

  const splideOptions = {
    type: categories.length > 1 ? "loop" : "slide" as const,
    perPage: Math.min(categories.length, 1),
    perMove: 1,
    gap: "0.25rem",
    arrows: categories.length > 1,
    pagination: false,
    mediaQuery: "min" as const,
    breakpoints: buildBreakpoints(),
  };

  return (
    <section className="shop-by-category appear-animate mt-5 mb-5">
      <div className="heading text-center mb-4">
        <h2 className="title title-simple">Shop by Category</h2>
      </div>

      <div className="shop-by-category__wrapper position-relative">
        <Splide
          options={splideOptions}
          aria-label="Shop by Category"
          className="shop-by-category__splide"
        >
          {categories.map((category) => {
            const tabKey = category.slug || category.id;
            const categoryId = categoryIdsByTab[tabKey];
            const imageUrl = formatImageUrl(category.image);

            return (
              <SplideSlide key={category.id}>
                {onCategoryClick && categoryId ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onCategoryClick(categoryId, category);
                    }}
                    className="shop-by-category__item"
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      padding: 0, 
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div className="shop-by-category__circle">
                      <Image
                        src={imageUrl}
                        alt={category.name}
                        width={200}
                        height={200}
                        className="shop-by-category__img"
                      />
                    </div>
                    <span className="shop-by-category__label">
                      {category.name}
                    </span>
                  </button>
                ) : (
                  <Link
                    href={
                      basePath && (category.slug || category.id)
                        ? `${basePath}/${category.slug || category.id}`
                        : categoryId
                          ? `/products?category=${categoryId}`
                          : "/products"
                    }
                    className="shop-by-category__item"
                  >
                    <div className="shop-by-category__circle">
                      <Image
                        src={imageUrl}
                        alt={category.name}
                        width={200}
                        height={200}
                        className="shop-by-category__img"
                      />
                    </div>
                    <span className="shop-by-category__label">
                      {category.name}
                    </span>
                  </Link>
                )}
              </SplideSlide>
            );
          })}
        </Splide>
      </div>
    </section>
  );
}
