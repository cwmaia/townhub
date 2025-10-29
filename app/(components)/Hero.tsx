'use client';

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

type HeroProps = {
  townName: string;
  firstName?: string | null;
};

// Town images from local media folder
const TOWN_IMAGES = [
  "/media/stykkis1.jpg",
  "/media/stykkis2.jpg",
  "/media/stykkis3.jpg",
  "/media/stykkis4.jpg",
];

const Hero = ({ townName, firstName }: HeroProps) => {
  const t = useTranslations("hero");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % TOWN_IMAGES.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative mt-8 overflow-hidden rounded-3xl shadow-lg">
      {/* Background images with crossfade */}
      <div className="absolute inset-0">
        {TOWN_IMAGES.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={image}
              alt={`${townName} view ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 1152px) 100vw, 1152px"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {/* Overlay gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-blue-900/80" />

      {/* Content */}
      <div className="relative z-10 px-8 py-10 text-white">
        <div className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.3em] text-white/90">
            TownHub
          </p>
          <h1 className="text-3xl font-semibold md:text-4xl">
            {firstName
              ? t("welcomeWithName", { town: townName, name: firstName })
              : t("welcome", { town: townName })}
          </h1>
          <p className="max-w-xl text-base text-white/95">
            {t("question")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
