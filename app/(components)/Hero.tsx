'use client';

import { useTranslations } from "next-intl";

type HeroProps = {
  townName: string;
  firstName?: string | null;
};

const Hero = ({ townName, firstName }: HeroProps) => {
  const t = useTranslations("hero");

  return (
    <section className="mt-8 overflow-hidden rounded-3xl bg-[#003580] p-8 shadow-lg md:p-10">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
          {townName.toUpperCase()}
        </p>
        <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl">
          {firstName ? (
            <>Welcome to<br />your town, {firstName}</>
          ) : (
            <>Welcome to<br />your town</>
          )}
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-white/90">
          Everything happening in your community, all in one place.
        </p>
      </div>
    </section>
  );
};

export default Hero;
