"use client";

import { useEffect, useRef, useState } from "react";

export default function FacebookFeaturedVideo({
  reelUrl,
  title,
}: {
  reelUrl: string;
  title: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => {
      setWidth(Math.max(220, Math.floor(container.getBoundingClientRect().width)));
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  const height = width ? Math.round((width * 563) / 1000) : 0;
  const embedUrl = width
    ? "https://www.facebook.com/plugins/video.php?height=" +
      height +
      "&href=" +
      encodeURIComponent(reelUrl) +
      "&show_text=false&width=" +
      width +
      "&t=0"
    : "";

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden bg-[#071a2b]"
      style={{ aspectRatio: "1000 / 563" }}
    >
      {embedUrl && (
        <iframe
          key={width}
          src={embedUrl}
          title={title}
          width={width}
          height={height}
          className="block h-full w-full border-0"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
        />
      )}
    </div>
  );
}