'use client';

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import LanguageSwitcher from "./LanguageSwitcher";
import ProfileMenu from "./ProfileMenu";
import type { ProfileSummary } from "./types";
import type { AppLocale } from "../../lib/i18n";

type HeaderProps = {
  townName: string;
  locale: AppLocale;
  profile: ProfileSummary | null;
};

// Animated heartbeat logo component - CSS-based animation for web
const HeartbeatLogo = ({ size = 52 }: { size?: number }) => {
  const heartRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const heart = heartRef.current;
    if (!heart) return;

    // CSS animation via style injection
    const keyframes = `
      @keyframes heartbeat {
        0%, 100% { transform: scale(1); }
        7.5% { transform: scale(1.15); }
        15% { transform: scale(1); }
        21% { transform: scale(1.10); }
        27% { transform: scale(1); }
      }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.textContent = keyframes;
    document.head.appendChild(styleSheet);

    heart.style.animation = "heartbeat 2s ease-in-out infinite";

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Pin aspect ratio: 352x448 = 0.786
  const pinWidth = size;
  const pinHeight = size * 1.27;

  // Heart is about 58% of pin width, centered in the bulb
  const heartWidth = size * 0.58;
  const heartHeight = heartWidth * 0.9;

  return (
    <div className="relative" style={{ width: pinWidth, height: pinHeight }}>
      {/* Static location pin */}
      <Image
        src="/pin-only-large.png"
        alt=""
        width={pinWidth}
        height={pinHeight}
        className="object-contain"
        priority
      />
      {/* Animated heart overlay - centered in the pin's bulb */}
      <Image
        ref={heartRef}
        src="/heart-only-large.png"
        alt=""
        width={heartWidth}
        height={heartHeight}
        className="absolute object-contain"
        style={{
          top: pinHeight * 0.24,
          left: (pinWidth - heartWidth) / 2,
        }}
        priority
      />
    </div>
  );
};

const Header = ({ townName, locale, profile }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-4 text-xl font-semibold"
        >
          <HeartbeatLogo size={52} />
          <span className="flex flex-col items-center">
            <span className="flex items-baseline">
              <span className="text-2xl font-extrabold tracking-tight text-slate-900">Town</span>
              <span className="text-2xl font-extrabold tracking-tight text-blue-500">App</span>
            </span>
            <span className="text-xs text-slate-500 tracking-wide">Your Town, Connected</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher currentLocale={locale} />
          <ProfileMenu profile={profile} currentLocale={locale} />
        </div>
      </div>
    </header>
  );
};

export default Header;
