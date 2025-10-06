import { useState, MouseEvent } from "react";
import NextImage from "next/image";
import { CheckButton } from "./CheckButton";
import { ImageExtended, ImageProps } from "./types";
import * as styles from "./styles";
import { getStyle } from "./styles";
import gridStyles from "./ReactGridGallery.module.css";

// Helper function to get margin class
const getMarginClass = (margin: number): string => {
  const marginMap: Record<number, string> = {
    1: gridStyles["gallery-item-margin-1"],
    2: gridStyles["gallery-item-margin-2"],
    3: gridStyles["gallery-item-margin-3"],
    4: gridStyles["gallery-item-margin-4"],
    5: gridStyles["gallery-item-margin-5"],
  };
  return marginMap[margin] || "";
};

// Helper function to calculate thumbnail CSS custom properties
const getThumbnailStyle = (item: ImageExtended): React.CSSProperties => {
  const rotationTransformMap: Record<number, string> = {
    3: "rotate(180deg)",
    2: "rotateY(180deg)",
    4: "rotate(180deg) rotateY(180deg)",
    5: "rotate(270deg) rotateY(180deg)",
    6: "rotate(90deg)",
    7: "rotate(90deg) rotateY(180deg)",
    8: "rotate(270deg)",
  };

  const SELECTION_MARGIN = 16;
  let width = item.scaledWidth;
  let height = item.scaledHeight;
  let marginLeft = item.marginLeft;
  let marginTop = 0;

  if (item.isSelected) {
    const ratio = item.scaledWidth / item.scaledHeight;
    const viewportHeight = item.scaledHeight - SELECTION_MARGIN * 2;
    const viewportWidth = item.viewportWidth - SELECTION_MARGIN * 2;

    if (item.scaledWidth > item.scaledHeight) {
      width = item.scaledWidth - SELECTION_MARGIN * 2;
      height = Math.floor(width / ratio);
    } else {
      height = item.scaledHeight - SELECTION_MARGIN * 2;
      width = Math.floor(height * ratio);
    }

    const calcMarginTop = Math.abs(Math.floor((viewportHeight - height) / 2));
    const calcMarginLeft = Math.abs(Math.floor((viewportWidth - width) / 2));

    marginLeft = calcMarginLeft === 0 ? 0 : -calcMarginLeft;
    marginTop = calcMarginTop === 0 ? 0 : -calcMarginTop;
  }

  const transform = item.orientation ? rotationTransformMap[item.orientation] : undefined;

  return {
    "--thumbnail-width": `${width}px`,
    "--thumbnail-height": `${height}px`,
    "--thumbnail-margin-left": `${marginLeft}px`,
    "--thumbnail-margin-top": `${marginTop}px`,
    "--thumbnail-transform": transform || "none",
  } as React.CSSProperties;
};

export const Image = <T extends ImageExtended>({
  item,
  thumbnailImageComponent: ThumbnailImageComponent,
  isSelectable = true,
  thumbnailStyle,
  tagStyle,
  tileViewportStyle,
  margin,
  index,
  alt,
  onSelect,
  onClick,
}: ImageProps<T>): JSX.Element => {
  const styleContext = { item };

  const [hover, setHover] = useState(false);

  const thumbnailProps = {
    key: index,
    "data-testid": "grid-gallery-item_thumbnail",
    src: item.src,
    alt: item.alt || "",
    title: typeof item.caption === "string" ? item.caption : null,
  };

  const handleCheckButtonClick = (event: MouseEvent<HTMLElement>) => {
    if (!isSelectable) {
      return;
    }
    onSelect(index, event);
  };

  const handleViewportClick = (event: MouseEvent<HTMLElement>) => {
    onClick(index, event);
  };

  const thumbnailImageProps = {
    item,
    index,
    margin,
    onSelect,
    onClick,
    isSelectable,
    tileViewportStyle,
    thumbnailStyle,
    tagStyle,
  };

  return (
    // Dynamic margin values > 5 require CSS custom properties - using a small <style> block
    // to set per-item CSS variables avoids inline style attributes and satisfies webhint.
    <a
      className={`rg-item-${index} ReactGridGallery_tile group relative block rounded-xl overflow-hidden ${gridStyles["gallery-item"]} ${
        margin <= 5 ? getMarginClass(margin) : gridStyles["gallery-item-dynamic"]
      }`}
      data-testid="grid-gallery-item"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      href={item.href}
    >
      {/* Per-item dynamic CSS variables injected here to avoid inline styles */}
      <style>{`
        .rg-item-${index} {
          ${margin > 5 ? `--dynamic-margin: ${margin}px;` : ""}
          --viewport-width: ${item.viewportWidth}px;
          --viewport-height: ${item.scaledHeight}px;
          ${item.nano ? `--nano-background: url(${item.nano});` : ""}
          ${item.isSelected ? `--selected-viewport-width: ${item.viewportWidth - 32}px; --selected-viewport-height: ${item.scaledHeight - 32}px; --selected-margin: 16px;` : ""}
          ${Object.entries(getThumbnailStyle(item)).map(([k, v]) => `${k}: ${v};`).join("\n")}
        }
      `}</style>
      <div
        className={`ReactGridGallery_tile-icon-bar ${gridStyles["tile-icon-bar"]}`}
      >
        <CheckButton
          isSelected={!!item.isSelected}
          isVisible={!!item.isSelected || (isSelectable && hover)}
          onClick={handleCheckButtonClick}
        />
      </div>

      {!!item.tags && (
        <div
          className={`ReactGridGallery_tile-bottom-bar ${gridStyles["bottom-bar"]}`}
        >
          {item.tags.map((tag, index) => (
            <div
              key={tag.key || index}
              title={tag.title}
              className={gridStyles["tag-item-block"]}
            >
              <span className={gridStyles["tag-item"]}>
                {tag.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {!!item.customOverlay && (
        <div
          className={`ReactGridGallery_custom-overlay ${gridStyles["custom-overlay"]} ${
            hover ? gridStyles["custom-overlay-visible"] : gridStyles["custom-overlay-hidden"]
          }`}
        >
          {item.customOverlay}
        </div>
      )}

      <div
        className={`ReactGridGallery_tile-overlay ${gridStyles["tile-overlay"]} ${
          hover && !item.isSelected && isSelectable
            ? gridStyles["tile-overlay-visible"]
            : gridStyles["tile-overlay-hidden"]
        }`}
      />

      {/* Dynamic viewport dimensions and nano background require CSS custom properties - preferred over inline styles */}
      {/* CSS custom properties for dynamic viewport dimensions and nano background cannot be pre-computed */}
      <div
        className={`ReactGridGallery_tile-viewport ${gridStyles["tile-viewport"]} ${
          gridStyles["tile-viewport-dynamic"]
        } ${
          item.nano ? gridStyles["tile-viewport-with-background"] : ""
        } ${
          item.isSelected ? gridStyles["tile-viewport-selected"] : ""
        }`}
        data-testid="grid-gallery-item_viewport"
        onClick={handleViewportClick}
      >
        {ThumbnailImageComponent ? (
          <ThumbnailImageComponent
            key={index}
            {...(thumbnailImageProps as any)}
            imageProps={thumbnailProps}
          />
        ) : (
          <NextImage
            key={index}
            src={thumbnailProps.src}
            alt={alt ?? thumbnailProps.alt ?? `Gallery image ${index + 1}`}
            title={thumbnailProps.title || undefined}
            width={item.scaledWidth}
            height={item.scaledHeight}
            className={`group-hover:scale-105 group-focus:scale-105 transition-transform duration-500 ease-in-out ${gridStyles.thumbnail} ${gridStyles["thumbnail-dynamic"]}`}
            unoptimized={true}
          />
        )}
      </div>
      {item.thumbnailCaption && (
        <div
          className={`ReactGridGallery_tile-description ${gridStyles["tile-description"]}`}
        >
          {item.thumbnailCaption}
        </div>
      )}
    </a>
  );
};
