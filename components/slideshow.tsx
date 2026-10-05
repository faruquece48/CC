'use client';

import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import '@/styles/swiper.css';


interface ImageSlideShowProps {
    images: string[];
}

export default function ImageSlideShow({ images }: ImageSlideShowProps) {
    return (
        <>
            <Swiper
                spaceBetween={30}
                centeredSlides={true}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                }}
                pagination={{
                    clickable: true,
                }}
                // navigation={true}
                modules={[Autoplay, Pagination, Navigation]}
                className="mySwiper"
            >
                {images.map((image, index) => (
                    <SwiperSlide key={index}>
                        <Image
                            src={image}
                            alt={`Slide ${index + 1}`}
                            fill
                            sizes="(min-width: 1024px) 560px, calc(100vw - 32px)"
                            quality={80}
                            priority={index === 0}
                        />
                    </SwiperSlide>
                ))}

            </Swiper>
        </>
    );
}
