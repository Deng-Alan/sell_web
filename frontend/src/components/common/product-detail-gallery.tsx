"use client";

import { useEffect, useMemo, useState } from "react";

type ProductDetailGalleryProps = {
  productName: string;
  coverImage?: string | null;
  galleryUrls: string[];
};

function dedupeImageUrls(coverImage: string | null | undefined, galleryUrls: string[]) {
  const seen = new Set<string>();
  const images = [coverImage, ...galleryUrls]
    .map((item) => item?.trim() ?? "")
    .filter(Boolean)
    .filter((item) => {
      if (seen.has(item)) {
        return false;
      }
      seen.add(item);
      return true;
    });

  return images;
}

export function ProductDetailGallery({ productName, coverImage, galleryUrls }: ProductDetailGalleryProps) {
  const images = useMemo(() => dedupeImageUrls(coverImage, galleryUrls), [coverImage, galleryUrls]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [images.length]);

  const activeImage = images[activeIndex] ?? null;

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-[1.8rem] border border-[var(--line)] bg-[linear-gradient(180deg,#fffefb_0%,#f7efe2_100%)] shadow-[0_16px_36px_rgba(16,16,16,0.05)]">
        <div className="relative aspect-[5/4] p-4 sm:p-5">
          {activeImage ? (
            <img
              src={activeImage}
              alt={productName}
              className="h-full w-full rounded-[1.4rem] border border-[rgba(16,16,16,0.06)] bg-white object-contain"
              loading="eager"
              decoding="async"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-[1.4rem] border border-dashed border-[var(--line)] bg-white px-6 text-center text-sm leading-7 text-[var(--muted)]">
              暂未上传商品图片
            </div>
          )}
        </div>
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-3">
          {images.map((imageUrl, index) => {
            const isActive = activeIndex === index;

            return (
              <button
                key={imageUrl}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`overflow-hidden rounded-[1.15rem] border bg-white p-1.5 transition ${
                  isActive
                    ? "border-[var(--accent)] shadow-[0_8px_24px_rgba(169,79,29,0.18)]"
                    : "border-[var(--line)] hover:border-[rgba(169,79,29,0.3)]"
                }`}
                aria-label={`查看第 ${index + 1} 张商品图片`}
              >
                <div className="aspect-square overflow-hidden rounded-[0.9rem] bg-[rgba(255,248,239,0.9)]">
                  <img
                    src={imageUrl}
                    alt={`${productName} 缩略图 ${index + 1}`}
                    className="h-full w-full object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
