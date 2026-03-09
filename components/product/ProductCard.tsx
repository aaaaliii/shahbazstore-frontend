"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useWishlist } from "@/lib/store/wishlist-store";
import { useCart } from "@/lib/store/cart-store";
import { QuickViewModal } from "./QuickViewModal";

interface ProductCardProps {
  product: Product;
  showQuickView?: boolean;
  viewMode?: "grid" | "list";
  /** Shop page theme layout */
  variant?: "default" | "shop";
}

export function ProductCard({
  product,
  showQuickView = true,
  viewMode = "grid",
  variant = "default",
}: ProductCardProps) {
  const { addItem: addToWishlist, removeItem, isInWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null,
  );

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if (isInWishlist(product.id)) {
        await removeItem(product.id);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(product);
        toast.success("Added to wishlist");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to update wishlist");
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} added to cart`, { icon: "🛒" });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    setQuickViewProduct(product);
  };

  const categoryName = (
    product.categoryInfo?.name ||
    product.category ||
    "category"
  ).toUpperCase();

  return (
    <div
      className={`product-card product-default ${variant === "shop" ? "inner-quickview inner-icon" : ""} ${viewMode === "list" ? "product-list" : ""}`}
    >
      <figure
        className={`product-card__figure ${viewMode === "list" ? "col-md-4" : ""}`}
      >
        <Link
          href={`/product/${product.slug}`}
          className="product-card__image-link"
        >
          <Image
            src={product.image}
            alt={product.name}
            width={327}
            height={327}
            className="product-card__image"
          />
        </Link>
        {/* Mobile: wishlist + quickview overlay on image (top left/right) */}
        <div className="product-card__overlay-actions">
          <a
            href="#"
            title={
              isInWishlist(product.id)
                ? "Remove from Wishlist"
                : "Add to Wishlist"
            }
            className={`btn-icon-wish ${isInWishlist(product.id) ? "added-wishlist" : ""}`}
            onClick={handleToggleWishlist}
          >
            <i className="icon-heart"></i>
          </a>
          {showQuickView && (
            <a
              href="#"
              className="btn-quickview"
              title="Quick View"
              onClick={handleQuickView}
            >
              <i className="fas fa-external-link-alt"></i>
            </a>
          )}
        </div>
      </figure>
      <div
        className={`product-details product-card__details align-items-center ${viewMode === "list" ? "col-md-8" : ""}`}
        style={viewMode === "grid" ? { textAlign: "center" } : {}}
      >
        <div
          className="category-list"
          style={viewMode === "grid" ? { textAlign: "center" } : {}}
        >
          <Link
            href={
              product.categoryInfo?.id
                ? `/products?category=${product.categoryInfo.id}`
                : "/products"
            }
            className="product-category"
          >
            {categoryName}
          </Link>
        </div>
        <h3
          className="product-title"
          style={viewMode === "grid" ? { textAlign: "center" } : {}}
        >
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <div
          className="ratings-container"
          style={
            viewMode === "grid"
              ? { display: "flex", justifyContent: "center" }
              : {}
          }
        >
          <div className="product-ratings">
            <span
              className="ratings"
              style={{
                width: `${(product.rating || 0) * 20}%`,
                color: "#ffc107",
              }}
            />
            <span className="tooltiptext tooltip-top"></span>
          </div>
        </div>
        <div
          className="price-box"
          style={viewMode === "grid" ? { textAlign: "center" } : {}}
        >
          {product.oldPrice && product.oldPrice > product.price && (
            <del className="old-price">{formatPrice(product.oldPrice)}</del>
          )}
          <span className="product-price">{formatPrice(product.price)}</span>
        </div>
        <div
          className="product-action product-card__actions"
          style={
            viewMode === "grid"
              ? {
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "0.5rem",
                }
              : {}
          }
        >
          <a
            href="#"
            title={
              isInWishlist(product.id)
                ? "Remove from Wishlist"
                : "Add to Wishlist"
            }
            className={`btn-icon-wish btn-icon-wish--desktop ${isInWishlist(product.id) ? "added-wishlist" : ""}`}
            onClick={handleToggleWishlist}
          >
            <i className="icon-heart"></i>
          </a>
          <a
            href="#"
            className="btn btn-primary btn-add-cart product-type-simple"
            onClick={handleAddToCart}
          >
            <i className="icon-shopping-cart"></i>
            <span>ADD TO CART</span>
          </a>
          {showQuickView && (
            <a
              href="#"
              className="btn-quickview btn-quickview--desktop"
              title="Quick View"
              onClick={handleQuickView}
            >
              <i className="fas fa-external-link-alt"></i>
            </a>
          )}
        </div>
      </div>
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
