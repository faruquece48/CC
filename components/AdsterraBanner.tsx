"use client";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    atOptions: any;
  }
}

interface Props {
  adKey: string;
  width: number;
  height: number;
}

export default function AdsterraBanner({ adKey, width, height }: Props) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current) return;

    adRef.current.innerHTML = "";
    delete window.atOptions;

    window.atOptions = {
      key: adKey,
      format: "iframe",
      height,
      width,
      params: {},
    };

    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.async = true;
    invokeScript.src = `//www.highperformanceformat.com/${adKey}/invoke.js`;

    adRef.current.appendChild(invokeScript);

    return () => {
      if (adRef.current) adRef.current.innerHTML = "";
      delete window.atOptions;
    };
  }, [adKey, width, height]);

  return (
    <div className="w-full flex justify-center items-center my-10">
      <div
        ref={adRef}
        style={{ width: `${width}px`, height: `${height}px` }}
      />
    </div>
  );
}