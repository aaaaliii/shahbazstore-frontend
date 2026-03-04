"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import {
  ShopByCategory,
  CategoryWithImage,
} from "@/components/category/ShopByCategory";
import { Product } from "@/types";
import { categoriesApi } from "@/lib/api/categories";
import { Category } from "@/types";
import { useWishlist } from "@/lib/store/wishlist-store";
import { useSiteLoading } from "@/lib/loading-context";

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { fetchWishlist } = useWishlist();
  const { setLoading: setSiteLoading } = useSiteLoading();

  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<CategoryWithImage[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [categoryIdsByTab, setCategoryIdsByTab] = useState<
    Record<string, string>
  >({});
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null,
  );

  // Fetch wishlist on mount
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Fetch parent category and sub-categories
  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        setSiteLoading(true);
        const topLevel = await categoriesApi.getCategories(null);
        const parent = topLevel.find((c) => (c.slug || c.id) === slug);
        if (!parent) {
          setParentCategory(null);
          setSubCategories([]);
          setLoading(false);
          return;
        }
        setParentCategory(parent);

        const children = await categoriesApi.getCategories(parent.id);
        const withImages: CategoryWithImage[] = children.map((cat) => ({
          ...cat,
          image: cat.image || "/assets/images/products/product-1.jpg",
        }));

        setSubCategories(withImages);

        if (withImages.length > 0) {
          const firstSlug = withImages[0].slug || withImages[0].id;
          setActiveTab(firstSlug);
          setCategoryIdsByTab(
            Object.fromEntries(withImages.map((c) => [c.slug || c.id, c.id])),
          );
        } else {
          const parentKey = parent.slug || parent.id;
          setActiveTab(parentKey);
          setCategoryIdsByTab({ [parentKey]: parent.id });
        }
      } catch (error) {
        console.error("Failed to fetch category data:", error);
        setParentCategory(null);
        setSubCategories([]);
      } finally {
        setSiteLoading(false);
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // Static product listing for now (no API fetch)
  const STATIC_PRODUCTS: Product[] = [
    { id: "1", name: "Product 1", slug: "product-1", price: 999, image: "/assets/images/products/product-1.jpg", category: "" },
    { id: "2", name: "Product 2", slug: "product-2", price: 1299, image: "/assets/images/products/product-1.jpg", category: "" },
    { id: "3", name: "Product 3", slug: "product-3", price: 799, image: "/assets/images/products/product-1.jpg", category: "" },
    { id: "4", name: "Product 4", slug: "product-4", price: 1599, image: "/assets/images/products/product-1.jpg", category: "" },
    { id: "5", name: "Product 5", slug: "product-5", price: 599, image: "/assets/images/products/product-1.jpg", category: "" },
    { id: "6", name: "Product 6", slug: "product-6", price: 899, image: "/assets/images/products/product-1.jpg", category: "" },
    { id: "7", name: "Product 7", slug: "product-7", price: 1199, image: "/assets/images/products/product-1.jpg", category: "" },
    { id: "8", name: "Product 8", slug: "product-8", price: 499, image: "/assets/images/products/product-1.jpg", category: "" },
  ];

  if (loading) {
    return (
      <main className="main">
        <div className="container py-5">
          <div className="text-center">
            <p>Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!parentCategory) {
    return (
      <main className="main">
        <div className="container py-5">
          <div className="text-center">
            <h2>Category not found</h2>
            <Link href="/" className="btn">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const displayCategories =
    subCategories.length > 0
      ? subCategories
      : parentCategory
        ? [
            {
              ...parentCategory,
              image:
                parentCategory.image || "/assets/images/products/product-1.jpg",
            } as CategoryWithImage,
          ]
        : [];
  const displayCategoryIdsByTab =
    subCategories.length > 0
      ? categoryIdsByTab
      : parentCategory
        ? { [parentCategory.slug || parentCategory.id]: parentCategory.id }
        : {};
  const displayActiveTab =
    subCategories.length > 0
      ? activeTab
      : parentCategory?.slug || parentCategory?.id || "";
  const tabsToShow =
    subCategories.length > 0
      ? subCategories
      : parentCategory
        ? [parentCategory]
        : [];

  const categoryName = parentCategory?.name || "Category";

  return (
    <main className="main">
      <div className="container">
        <section className="hero-section">
          <div className="category-banner">
            <Image
              src="/assets/images/hero/hero (1).webp"
              alt={categoryName}
              fill
              sizes="100vw"
              className="category-banner__img"
            />
            <div className="category-banner__content">
              <h1 className="category-banner__title">{categoryName}</h1>
              <p className="category-banner__text">
                Explore our curated collection of {categoryName.toLowerCase()}{" "}
                products. Find the perfect items for you.
              </p>
            </div>
          </div>
        </section>

        <section className="featured-section product-slider-tab appear-animate mt-5">
          <ShopByCategory
            categories={displayCategories}
            categoryIdsByTab={displayCategoryIdsByTab}
          />

          <div
            className="tabs-and-content-section"
            style={{
              marginLeft: "calc(-50vw + 50%)",
              marginRight: "calc(-50vw + 50%)",
              width: "100vw",
              maxWidth: "100vw",
            }}
          >
            <div className="container">
              <div className="tab-banner-wrapper mb-4">
                <Link href="/products" className="tab-banner">
                  <Image
                    src="/assets/images/banners/ramzan banner.jpg"
                    alt="Ramzan Kareem - Customize Your Ramadan Blessings"
                    width={1200}
                    height={320}
                    className="tab-banner__img"
                  />
                </Link>
              </div>

              <div
                className="heading d-flex align-items-center justify-content-center mt-5 mb-5"
                style={{ overflowX: "auto", width: "100%" }}
              >
                <ul
                  className="nav product-filter-items mb-0"
                  style={{
                    display: "flex",
                    flexWrap: "nowrap",
                    gap: "1.5rem",
                    padding: "0 1rem",
                    maxWidth: "100%",
                  }}
                >
                  {tabsToShow.map((category) => {
                    const tabKey = category.slug || category.id;
                    return (
                      <li
                        key={category.id}
                        className="nav-item product-filter-item"
                        style={{ flexShrink: 0 }}
                      >
                        <a
                          href="#"
                          className={`nav-link ${
                            displayActiveTab === tabKey ? "active" : ""
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            setActiveTab(tabKey);
                          }}
                          style={{
                            cursor: "pointer",
                            userSelect: "none",
                            fontSize: "2rem",
                            fontWeight: "600",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {category.name.toUpperCase()}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="tab-content">
                {tabsToShow.map((category) => {
                  const tabKey = category.slug || category.id;
                  const categoryId = displayCategoryIdsByTab[tabKey];
                  return (
                    <div
                      key={category.id}
                      className={`tab-pane fade ${
                        displayActiveTab === tabKey ? "show active" : ""
                      }`}
                    >
                      <ProductCarousel products={STATIC_PRODUCTS} />
                      {categoryId && (
                        <Link
                          href={`/products?category=${categoryId}`}
                          className="btn with-icon align-center font2"
                        >
                          Browse All
                          <i className="fas fa-long-arrow-alt-right"></i>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>

      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </main>
  );
}
