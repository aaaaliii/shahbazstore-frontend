"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { HeaderLink } from "@/lib/api/headerLinks";
import { useCart } from "@/lib/store/cart-store";
import { categoriesApi } from "@/lib/api/categories";
import { Category } from "@/types";

const HEADER_GRADIENT =
  "linear-gradient(126deg, rgba(255, 168, 168, 1) 0%, rgba(112, 14, 119, 1) 36%, rgba(112, 14, 119, 1) 70%)";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  headerLinks?: HeaderLink[];
}

export function MobileMenu({
  isOpen,
  onClose,
  headerLinks = [],
}: MobileMenuProps) {
  const { items: cartItems } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const topLevel = await categoriesApi.getCategories(null);
        setCategories(topLevel);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  if (!isOpen) return null;

  return (
    <>
      <div className="mobile-menu-overlay" onClick={onClose}></div>
      <div
        className="mobile-menu-container mobile-menu-container--header-bg"
        style={{ background: HEADER_GRADIENT }}
      >
        <div className="mobile-menu-wrapper">
          <span className="mobile-menu-close" onClick={onClose}>
            <i className="fa fa-times"></i>
          </span>
          <div
            className="mb-3"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <Link href="/" onClick={onClose}>
              <Image
                src="/assets/images/image.png"
                width={160}
                height={80}
                alt="Shahbaz Store"
                style={{
                  borderRadius: "8px",
                  maxWidth: "100%",
                  height: "auto",
                }}
              />
            </Link>
          </div>
          <nav className="mobile-nav">
            <ul className="mobile-menu">
              {headerLinks.map((link) => (
                <li key={link._id || link.id}>
                  {link.openInNewTab ? (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onClose}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.url} onClick={onClose}>
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            {/* Categories - accordion, closed by default, same style as mobile menu list */}
            <div className="mobile-menu-categories -mt-4">
              <div
                className="mobile-menu-categories__header"
                role="button"
                tabIndex={0}
                onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  setCategoriesExpanded(!categoriesExpanded)
                }
                aria-expanded={categoriesExpanded}
              >
                <span>CATEGORIES</span>
                <i
                  className={`fa fa-${categoriesExpanded ? "minus" : "plus"}`}
                  aria-hidden
                />
              </div>
              {categoriesExpanded && (
                <ul className="mobile-menu mobile-menu-categories__list">
                  <li>
                    <Link href="/products" onClick={onClose}>
                      All
                    </Link>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href={`/products?category=${cat.id}`}
                        onClick={onClose}
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </nav>

          <form className="search-wrapper mb-2" action="#">
            <input
              type="text"
              className="form-control mb-0"
              placeholder="Search..."
              required
            />
            <button
              className="btn icon-search text-white bg-transparent p-0"
              type="submit"
            ></button>
          </form>
        </div>
      </div>
    </>
  );
}
