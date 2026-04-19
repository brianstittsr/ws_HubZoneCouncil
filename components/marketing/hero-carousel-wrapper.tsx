"use client";

import { useState, useEffect } from "react";
import { HeroCarousel, type HeroSlide } from "./hero-carousel";

interface HeroCarouselWrapperProps {
  autoPlayInterval?: number;
  fallbackSlides?: HeroSlide[];
}

export function HeroCarouselWrapper({ 
  autoPlayInterval = 6000,
  fallbackSlides,
}: HeroCarouselWrapperProps) {
  const [slides, setSlides] = useState<HeroSlide[]>(fallbackSlides || []);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch("/api/hero-slides");
        if (response.ok) {
          const data = await response.json();
          if (data.slides && data.slides.length > 0) {
            setSlides(data.slides);
          }
        }
      } catch (error) {
        console.error("Error fetching hero slides:", error);
        // Keep fallback slides on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlides();
  }, []);

  // Show nothing while loading if no fallback slides
  if (isLoading && slides.length === 0) {
    return (
      <div className="relative overflow-hidden bg-black text-white py-20 md:py-32">
        <div className="flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return <HeroCarousel slides={slides} autoPlayInterval={autoPlayInterval} />;
}
