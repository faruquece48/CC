"use client";

import { useEffect, useRef } from "react";

export default function FeaturedVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pausedByUserRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;

    const startPlayback = () => {
      if (!pausedByUserRef.current && video.paused) {
        void video.play().catch(() => {
          // Some browsers may still require a user gesture.
        });
      }
    };

    startPlayback();
    video.addEventListener("canplay", startPlayback);

    return () => video.removeEventListener("canplay", startPlayback);
  }, [src]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      pausedByUserRef.current = false;
      void video.play();
    } else {
      pausedByUserRef.current = true;
      video.pause();
    }
  };

  return (
    <video
      ref={videoRef}
      className="block aspect-video w-full cursor-pointer bg-[#071a2b] object-contain"
      autoPlay
      controls
      muted
      playsInline
      preload="auto"
      src={src}
      onClick={togglePlayback}
    >
      Your browser does not support the video element.
    </video>
  );
}