"use client";

import Link from "next/link";
import Image from "next/image";

export interface GalleryItem {
  image: string;
  alt: string;
  link?: string;
}

const GALLERY_IMAGES = [
  "/assets/images/carousel/banner (1).jpeg",
  "/assets/images/carousel/banner (2).jpeg",
  "/assets/images/carousel/banner (3).jpeg",
];

const DEFAULT_ITEMS: GalleryItem[] = GALLERY_IMAGES.map((image, i) => ({
  image,
  alt: `Shahbaz Store - Gallery ${i + 1}`,
  link: "/products",
}));

interface ImageGalleryProps {
  heading?: string;
  items?: GalleryItem[];
}

export function ImageGallery({
  heading = "Gallery",
  items = DEFAULT_ITEMS,
}: ImageGalleryProps) {
  return (
    <section
      className="image-gallery appear-animate mb-5"
      style={{
        marginLeft: "calc(-50vw + 50%)",
        marginRight: "calc(-50vw + 50%)",
        width: "100vw",
        maxWidth: "100vw",
      }}
    >
      {heading && (
        <div className="heading text-center mb-4">
          {/* <h2 className="title title-simple">{heading}</h2> */}
        </div>
      )}
      <div className="image-gallery__grid">
        {items.map((item, index) => (
          <div key={index} className="image-gallery__item">
            {item.link ? (
              <Link href={item.link} className="image-gallery__link">
                <figure className="image-gallery__figure">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    width={400}
                    height={280}
                    className="image-gallery__img"
                  />
                </figure>
              </Link>
            ) : (
              <figure className="image-gallery__figure">
                <Image
                  src={item.image}
                  alt={item.alt}
                  width={400}
                  height={280}
                  className="image-gallery__img"
                />
              </figure>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
