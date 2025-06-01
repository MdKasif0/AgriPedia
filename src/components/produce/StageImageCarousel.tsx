'use client';

import React, { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image'; // Import next/image
// import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

interface StageImageCarouselProps {
  images: string[];
  stageName: string;
}

const StageImageCarousel: React.FC<StageImageCarouselProps> = ({ images, stageName }) => {
  // const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 }, [Autoplay()]); // With Autoplay
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: images.length > 1,
    align: 'start',
    containScroll: 'trimSnaps'
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!images || images.length === 0) {
    return null;
  }

  if (images.length === 1) {
     return (
        <div className="relative w-full h-48 md:h-64 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <Image
                src={images[0]}
                alt={`${stageName} media 1`}
                layout="fill"
                objectFit="cover"
                loading="lazy"
            />
        </div>
     );
  }

  return (
    <div className="embla relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container flex">
          {images.map((img, i) => (
            <div className="embla__slide relative flex-[0_0_100%] min-w-0 h-48 md:h-64" key={i}> {/* Added relative and height here */}
              <Image
                src={img}
                alt={`${stageName} media ${i + 1}`}
                layout="fill"
                objectFit="cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
      <button
        className="embla__prev absolute top-1/2 left-2 -translate-y-1/2 bg-black/60 text-white p-1 sm:p-2 rounded-full hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition-all duration-150 ease-in-out opacity-80 hover:opacity-100 disabled:opacity-30"
        onClick={scrollPrev}
        aria-label="Previous image"
        disabled={!emblaApi?.canScrollPrev()}
      >
        <ChevronLeftIcon className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
      <button
        className="embla__next absolute top-1/2 right-2 -translate-y-1/2 bg-black/60 text-white p-1 sm:p-2 rounded-full hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition-all duration-150 ease-in-out opacity-80 hover:opacity-100 disabled:opacity-30"
        onClick={scrollNext}
        aria-label="Next image"
        disabled={!emblaApi?.canScrollNext()}
      >
        <ChevronRightIcon className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
    </div>
  );
};

export default StageImageCarousel;
