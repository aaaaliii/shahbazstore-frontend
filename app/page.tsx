"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { HeroCarousel } from "@/components/banners/HeroCarousel";
import { PromotionCarousel } from "@/components/banners/PromotionCarousel";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { ProductCollections } from "@/components/product/ProductCollections";
import {
  ShopByCategory,
  CategoryWithImage,
} from "@/components/category/ShopByCategory";
import { Product } from "@/types";
import { productsApi } from "@/lib/api/products";
import { categoriesApi } from "@/lib/api/categories";
import { Category } from "@/types";
import { useWishlist } from "@/lib/store/wishlist-store";
import { useCart } from "@/lib/store/cart-store";
import { useSiteLoading } from "@/lib/loading-context";
import { formatCurrency } from "@/lib/utils/currency";
import { settingsApi, Settings } from "@/lib/api/settings";

export default function HomePage() {
  const {
    addItem: addToWishlist,
    removeItem,
    isInWishlist,
    fetchWishlist,
  } = useWishlist();
  const { addItem: addToCart } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const { setLoading: setSiteLoading } = useSiteLoading();
  const [activeTab, setActiveTab] = useState<string>("");
  const [featuredProducts, setFeaturedProducts] = useState<
    Record<string, Product[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [categoryIdsByTab, setCategoryIdsByTab] = useState<
    Record<string, string>
  >({});
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null,
  );
  const [settings, setSettings] = useState<Settings | null>(null);
  const [homepageCategories, setHomepageCategories] = useState<any[]>([]);

  const handleToggleWishlist = async (
    e: React.MouseEvent,
    product: Product,
  ) => {
    e.preventDefault();
    try {
      if (isInWishlist(product.id)) {
        await removeItem(product.id);
      } else {
        await addToWishlist(product);
      }
    } catch (error) {
      // Error is already handled in the store
    }
  };

  // Fetch wishlist on mount
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Fetch settings to check banner status and homepage categories
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const siteSettings = await settingsApi.get();
        setSettings(siteSettings);
        if (
          siteSettings.homepageCategories &&
          siteSettings.homepageCategories.length > 0
        ) {
          // Sort by position and filter active ones
          const sorted = siteSettings.homepageCategories
            .filter((cat) => cat.isActive !== false)
            .sort((a, b) => a.position - b.position);
          setHomepageCategories(sorted);
        } else {
          setHomepageCategories([]);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        setSettings(null);
        setHomepageCategories([]);
      }
    };

    fetchSettings();
  }, []);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setSiteLoading(true);
        const fetchedCategories = await categoriesApi.getCategories();
        const topLevelCategories = fetchedCategories.filter(
          (cat) => !cat.parentId,
        );
        setCategories(topLevelCategories);

        if (topLevelCategories.length > 0) {
          const firstCategorySlug =
            topLevelCategories[0].slug || topLevelCategories[0].id;
          setActiveTab(firstCategorySlug);
          setCategoryIdsByTab(
            Object.fromEntries(
              topLevelCategories.map((cat) => [cat.slug || cat.id, cat.id]),
            ),
          );
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setSiteLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products only for the active category (lazy load on switch)
  useEffect(() => {
    if (!activeTab || !categoryIdsByTab[activeTab]) return;

    const categoryId = categoryIdsByTab[activeTab];
    if (featuredProducts[activeTab]?.length) return; // Already cached

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const result = await productsApi.getProducts({
          category: categoryId,
          limit: 20,
        });
        setFeaturedProducts((prev) => ({
          ...prev,
          [activeTab]: result.products || [],
        }));
      } catch (error) {
        console.error("Failed to fetch products for category:", error);
        setFeaturedProducts((prev) => ({
          ...prev,
          [activeTab]: [],
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeTab, categoryIdsByTab, featuredProducts]);

  // Helper function to get category link
  const getCategoryLink = (category: any) => {
    // Use categoryId if available (backend expects ObjectId)
    if (category?.categoryId) {
      return `/products?category=${category.categoryId}`;
    }
    // Fall back to custom link or default
    return category?.link || "/products";
  };

  return (
    <main className={`home main ${!settings?.banner?.isActive ? "mt-10" : ""}`}>
      <div className="container">
        <section className="hero-section">
          <HeroCarousel />
        </section>

        <section className="info-box-container mb-0 appear-animate">
          <div className="row">
            <div className="col-sm-6 col-xl-3 mb-2 mb-xl-0">
              <div className="info-box info-box-icon-left justify-content-sm-center justify-content-start p-0">
                <i className="icon-shipping line-height-1"></i>
                <div className="info-box-content">
                  <h4 className="ls-25 line-height-1">
                    FREE SHIPPING &amp; RETURN
                  </h4>
                  <p className="text-body">
                    Free shipping on all orders over Rs 99.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-xl-3 mb-2 mb-xl-0">
              <div className="info-box info-box-icon-left justify-content-sm-center justify-content-start p-0">
                <i className="icon-money line-height-1"></i>
                <div className="info-box-content">
                  <h4 className="ls-25 line-height-1">MONEY BACK GUARANTEE</h4>
                  <p className="text-body">100% money back guarantee.</p>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-xl-3 mb-2 mb-xl-0">
              <div className="info-box info-box-icon-left justify-content-sm-center justify-content-start p-0">
                <i className="icon-support line-height-1"></i>
                <div className="info-box-content">
                  <h4 className="ls-25 line-height-1">ONLINE SUPPORT 24/7</h4>
                  <p className="text-body"> We are always here to help you.</p>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-xl-3 mb-2 mb-xl-0">
              <div className="info-box info-box-icon-left justify-content-sm-center justify-content-start p-0">
                <i className="icon-secure-payment line-height-1"></i>
                <div className="info-box-content">
                  <h4 className="ls-25 line-height-1">Cash on Delivery</h4>
                  <p className="text-body"> We accept cash on delivery.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="mt-0" />

        <section className="featured-section product-slider-tab appear-animate">
          <ShopByCategory
            categories={categories.map((category): CategoryWithImage => {
              const tabKey = category.slug || category.id;
              const products = featuredProducts[tabKey] || [];
              const homepageCat = homepageCategories.find(
                (hc) => hc.categoryId === category.id,
              );
              return {
                ...category,
                image:
                  category.image ||
                  homepageCat?.image ||
                  products[0]?.image ||
                  "/assets/images/products/product-1.jpg",
              };
            })}
            categoryIdsByTab={categoryIdsByTab}
            basePath="/category"
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
              <div className="tab-banner-wrapper">
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
                  {categories.map((category) => {
                    const tabKey = category.slug || category.id;
                    return (
                      <li
                        key={category.id}
                        className="nav-item product-filter-item"
                        style={{ flexShrink: 0 }}
                      >
                        <a
                          href="#"
                          className={`nav-link ${activeTab === tabKey ? "active" : ""}`}
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
                {loading ? (
                  <div className="text-center py-5">
                    <p>Loading products...</p>
                  </div>
                ) : (
                  categories.map((category) => {
                    const tabKey = category.slug || category.id;
                    const products = featuredProducts[tabKey] || [];
                    const categoryId = categoryIdsByTab[tabKey];
                    return (
                      <div
                        key={category.id}
                        className={`tab-pane fade ${
                          activeTab === tabKey ? "show active" : ""
                        }`}
                      >
                        {products.length > 0 ? (
                          <>
                            <ProductCarousel products={products} />
                            {categoryId && (
                              <Link
                                href={`/products?category=${categoryId}`}
                                className="btn with-icon align-center font2"
                              >
                                Browse All
                                <i className="fas fa-long-arrow-alt-right"></i>
                              </Link>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-5">
                            <p>
                              No featured products available for this category.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>
        <PromotionCarousel heading="Special Promotions" />
      </div>

      <ProductCollections categoryId={categoryIdsByTab[activeTab]} />

      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </main>
  );
}
