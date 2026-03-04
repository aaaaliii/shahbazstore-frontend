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
  activeTab: string;
  onCategorySelect: (tabKey: string) => void;
  categoryIdsByTab: Record<string, string>;
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

const SPLIDE_OPTIONS = {
  type: "loop",
  perPage: 1,
  perMove: 1,
  gap: "0.25rem",
  arrows: true,
  pagination: false,
  mediaQuery: "min" as const,
  breakpoints: {
    576: { perPage: 3 },
    768: { perPage: 4 },
    992: { perPage: 5 },
    1200: { perPage: 6 },
  },
};

export function ShopByCategory({
  categories,
  activeTab,
  onCategorySelect,
  categoryIdsByTab,
}: ShopByCategoryProps) {
  if (categories.length === 0) return null;

  return (
    <section className="shop-by-category appear-animate mt-5 mb-5">
      <div className="heading text-center mb-4">
        <h2 className="title title-simple">Shop by Category</h2>
      </div>

      <div className="shop-by-category__wrapper position-relative">
        <Splide
          options={SPLIDE_OPTIONS}
          aria-label="Shop by Category"
          className="shop-by-category__splide"
        >
          {categories.map((category) => {
            const tabKey = category.slug || category.id;
            const categoryId = categoryIdsByTab[tabKey];
            const isActive = activeTab === tabKey;
            const imageUrl = formatImageUrl(category.image);

            return (
              <SplideSlide key={category.id}>
                <Link
                  href={
                    categoryId
                      ? `/products?category=${categoryId}`
                      : "/products"
                  }
                  className={`shop-by-category__item ${isActive ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onCategorySelect(tabKey);
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
                </Link>
              </SplideSlide>
            );
          })}
        </Splide>
      </div>
    </section>
  );
}
