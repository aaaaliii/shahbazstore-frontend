"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { HomeBanner } from "@/components/banners/HomeBanner";
import { PromotionCarousel } from "@/components/banners/PromotionCarousel";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { ProductCollections } from "@/components/product/ProductCollections";
import { ShopByCategory, CategoryWithImage } from "@/components/category/ShopByCategory";
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
        if (siteSettings.homepageCategories && siteSettings.homepageCategories.length > 0) {
          // Sort by position and filter active ones
          const sorted = siteSettings.homepageCategories
            .filter(cat => cat.isActive !== false)
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
              topLevelCategories.map((cat) => [
                cat.slug || cat.id,
                cat.id,
              ])
            )
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
        <section>
          <div className="row grid">
            {homepageCategories.length > 0 ? (
              <>
                <div className="grid-item col-lg-5 height-x1">
                  <HomeBanner
                    image={homepageCategories[0]?.image || "/assets/images/demoes/demo29/banners/home-banner1.jpg"}
                    imageWidth={674}
                    imageHeight={316}
                    title={homepageCategories[0]?.title || homepageCategories[0]?.category?.name || "black<br />Armchairs"}
                    price={homepageCategories[0]?.subtitle || "starting from Rs 399"}
                    link={getCategoryLink(homepageCategories[0])}
                    linkText={homepageCategories[0]?.linkText || "shop now"}
                    position="right"
                    titleClass="ls-10"
                  />
                </div>
                <div className="grid-item col-lg-7 height-x2">
                  <div className="home-banner">
                    <figure className="bg-gray">
                      <Image
                        src={homepageCategories[1]?.image || "/assets/images/demoes/demo29/banners/home-banner2.jpg"}
                        width={951}
                        height={651}
                        alt="banner"
                      />
                    </figure>
                    <div className="banner-content content-left">
                      <h3>
                        <strong>
                          {homepageCategories[1]?.title || homepageCategories[1]?.category?.name || "wooden"}
                          <br />
                        </strong>
                        {homepageCategories[1]?.subtitle || "Black Chair"}
                      </h3>
                      <div className="banner-info">
                        {homepageCategories[1]?.linkText && (
                          <Link href={getCategoryLink(homepageCategories[1])} className="btn skew-box">
                            {homepageCategories[1].linkText}
                          </Link>
                        )}
                        <Link href={getCategoryLink(homepageCategories[1])} className="btn">
                          shop now <i className="fas fa-long-arrow-alt-right"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                {homepageCategories[2] && (
                  <div className="grid-item col-6 col-lg-2 height-x1">
                    <HomeBanner
                      image={homepageCategories[2]?.image || "/assets/images/demoes/demo29/banners/home-banner3.jpg"}
                      imageWidth={257}
                      imageHeight={315}
                      subtitle={homepageCategories[2]?.subtitle || "check new arrivals"}
                      title={`<strong>${homepageCategories[2]?.title || homepageCategories[2]?.category?.name || "cool lamps"}</strong>`}
                      link={getCategoryLink(homepageCategories[2])}
                      linkText={homepageCategories[2]?.linkText || "shop now"}
                      position="top"
                      className="bg-dark"
                      useH4={true}
                    />
                  </div>
                )}
                {homepageCategories[3] && (
                  <div className="grid-item col-6 col-lg-3 height-x1">
                    <HomeBanner
                      image={homepageCategories[3]?.image || "/assets/images/demoes/demo29/banners/home-banner4.jpg"}
                      imageWidth={396}
                      imageHeight={315}
                      subtitle={homepageCategories[3]?.subtitle || "exclusive new collection"}
                      title={`<strong>${homepageCategories[3]?.title || homepageCategories[3]?.category?.name || "luxurious jacuzzi"}</strong>`}
                      link={getCategoryLink(homepageCategories[3])}
                      linkText={homepageCategories[3]?.linkText || "shop now"}
                      position="bottom"
                      className="bg-primary"
                      useH4={true}
                    />
                  </div>
                )}
              </>
            ) : (
              // Fallback to default banners if not configured
              <>
                <div className="grid-item col-lg-5 height-x1">
                  <HomeBanner
                    image="/assets/images/demoes/demo29/banners/home-banner1.jpg"
                    imageWidth={674}
                    imageHeight={316}
                    title="black<br />Armchairs"
                    price="starting from Rs 399"
                    link="/products"
                    linkText="shop now"
                    position="right"
                    titleClass="ls-10"
                  />
                </div>
                <div className="grid-item col-lg-7 height-x2">
                  <div className="home-banner">
                    <figure className="bg-gray">
                      <Image
                        src="/assets/images/demoes/demo29/banners/home-banner2.jpg"
                        width={951}
                        height={651}
                        alt="banner"
                      />
                    </figure>
                    <div className="banner-content content-left">
                      <h3>
                        <strong>
                          wooden
                          <br />
                        </strong>
                        Black Chair
                      </h3>
                      <div className="banner-info">
                        <a href="#" className="btn skew-box">
                          go coupon
                        </a>
                        <h3 className="sale-off skew-box">
                          <span>Rs 100</span>off
                        </h3>
                        <p className="font2">starting from Rs 199</p>
                        <Link href="/products" className="btn">
                          shop now <i className="fas fa-long-arrow-alt-right"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid-item col-6 col-lg-2 height-x1">
                  <HomeBanner
                    image="/assets/images/demoes/demo29/banners/home-banner3.jpg"
                    imageWidth={257}
                    imageHeight={315}
                    subtitle="check new arrivals"
                    title="<strong>cool lamps</strong>"
                    position="top"
                    className="bg-dark"
                    useH4={true}
                  />
                </div>
                <div className="grid-item col-6 col-lg-3 height-x1">
                  <HomeBanner
                    image="/assets/images/demoes/demo29/banners/home-banner4.jpg"
                    imageWidth={396}
                    imageHeight={315}
                    subtitle="exclusive new collection"
                    title="<strong>luxurious jacuzzi</strong>"
                    position="bottom"
                    className="bg-primary"
                    useH4={true}
                  />
                </div>
              </>
            )}
            <div className="col-1 pr-0 pl-0 grid-col-sizer"></div>
          </div>
        </section>

        <PromotionCarousel heading="Special Promotions" />

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
                (hc) => hc.categoryId === category.id
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
            activeTab={activeTab}
            onCategorySelect={setActiveTab}
            categoryIdsByTab={categoryIdsByTab}
          />

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
                        <p>No featured products available for this category.</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
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
