"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { ProductGrid } from "@/components/product/ProductGrid";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { ImageGallery } from "@/components/gallery/ImageGallery";
import {
  ShopByCategory,
  CategoryWithImage,
} from "@/components/category/ShopByCategory";
import { Product } from "@/types";
import { categoriesApi } from "@/lib/api/categories";
import { productsApi } from "@/lib/api/products";
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
  const [loading, setLoading] = useState(true);
  const [categoryIdsByTab, setCategoryIdsByTab] = useState<
    Record<string, string>
  >({});
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
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
          setCategoryIdsByTab(
            Object.fromEntries(withImages.map((c) => [c.slug || c.id, c.id])),
          );
        } else {
          const parentKey = parent.slug || parent.id;
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

  // Fetch products based on selected category
  useEffect(() => {
    if (!parentCategory) return;

    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        let allProducts: Product[] = [];

        if (selectedSubCategoryId) {
          // Fetch products for selected sub-category only
          const response = await productsApi.getProducts({
            category: selectedSubCategoryId,
            limit: 100,
          });
          allProducts = response.products || [];
        } else {
          // Fetch products for parent category and all sub-categories
          const categoryIds = [parentCategory.id];
          if (subCategories.length > 0) {
            categoryIds.push(...subCategories.map((cat) => cat.id));
          }

          // Fetch products for each category and combine
          const productPromises = categoryIds.map((catId) =>
            productsApi.getProducts({ category: catId, limit: 100 })
          );
          const responses = await Promise.all(productPromises);
          const allProductsArrays = responses.map((r) => r.products || []);
          
          // Combine and remove duplicates based on product ID
          const productMap = new Map<string, Product>();
          allProductsArrays.flat().forEach((product) => {
            if (!productMap.has(product.id)) {
              productMap.set(product.id, product);
            }
          });
          allProducts = Array.from(productMap.values());
        }

        setProducts(allProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [parentCategory, subCategories, selectedSubCategoryId]);

  // Handle sub-category click
  const handleSubCategoryClick = (categoryId: string, category: CategoryWithImage) => {
    setSelectedSubCategoryId(categoryId);
  };

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

  const categoryName = parentCategory?.name || "Category";

  return (
    <main className="main">
      <div className="container">
        <section className="hero-section">
          <div className="category-banner">
            <Image
              src={parentCategory?.banner || "/assets/images/hero/hero (1).webp"}
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
          {subCategories.length > 0 && (
            <ShopByCategory
              categories={displayCategories}
              categoryIdsByTab={displayCategoryIdsByTab}
              onCategoryClick={handleSubCategoryClick}
            />
          )}

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
              {parentCategory?.promoBanner && (
                <div className="tab-banner-wrapper mb-4">
                  <Link href="/products" className="tab-banner">
                    <Image
                      src={parentCategory.promoBanner}
                      alt={`${parentCategory.name} Promotional Banner`}
                      width={1200}
                      height={320}
                      className="tab-banner__img"
                    />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Products Display Section */}
          <div className="container">
            <div className="row main-content-wrapper mb-2 pb-2">
              <div className="col-lg-12">
                {selectedSubCategoryId && (
                  <div className="mb-4 text-center">
                    <button
                      onClick={() => setSelectedSubCategoryId(null)}
                      className="btn btn-sm btn-outline-secondary"
                      style={{ marginBottom: "1rem" }}
                    >
                      <i className="fas fa-times mr-2"></i>
                      Clear Filter - Show All Categories
                    </button>
                  </div>
                )}
                
                <div className="row products-body">
                  {productsLoading ? (
                    <div className="col-12 text-center py-5">
                      <p>Loading products...</p>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="col-12 text-center py-5">
                      <p>No products found.</p>
                    </div>
                  ) : (
                    <ProductGrid
                      products={products}
                      viewMode="grid"
                      columnClass="col-6 col-md-4 col-lg-3 col-xl-5col"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <ImageGallery heading="Gallery" />
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
