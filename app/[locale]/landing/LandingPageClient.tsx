'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  MapPin,
  Calendar,
  Bell,
  Building2,
  Shield,
  Star,
  Cloud,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Map,
  Zap,
  Users,
  Globe,
} from 'lucide-react';

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

// Landing Page Header - consistent with main app
const LandingHeader = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
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
          <Button variant="ghost" size="sm" asChild>
            <Link href="/stykkisholmur">
              Go to App
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

// Hero Section - Compact
const HeroSection = () => {
  const t = useTranslations('landing');

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#003580] via-[#004aad] to-[#0066cc] py-12 md:py-16">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-blue-400/10 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5 text-yellow-300" />
            {t('hero.badge')}
          </div>

          {/* Main Headline */}
          <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
            {t('hero.title')}
            <span className="bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent">
              {' '}{t('hero.titleHighlight')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mb-6 text-base leading-relaxed text-white/80 md:text-lg max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-12 min-w-[180px] bg-white text-[#003580] hover:bg-white/90 text-sm font-semibold shadow-lg"
              asChild
            >
              <a href="#map-showcase">
                <Map className="mr-2 h-4 w-4" />
                {t('hero.ctaExplore')}
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 min-w-[180px] border-white/30 bg-white/10 text-white hover:bg-white/20 text-sm font-semibold backdrop-blur-sm"
              asChild
            >
              <a href="#features">
                <Sparkles className="mr-2 h-4 w-4" />
                {t('hero.ctaFeatures')}
              </a>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-white/60">
            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              <span>{t('hero.trustVercel')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              <span>{t('hero.trustRealtime')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              <span>{t('hero.trustSecure')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Mock Map Marker Component
const MockMarker = ({
  type,
  label,
  style,
  isPremium = false,
}: {
  type: 'lodging' | 'restaurant' | 'attraction' | 'event' | 'service';
  label: string;
  style: React.CSSProperties;
  isPremium?: boolean;
}) => {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    lodging: { bg: 'bg-white', border: 'border-blue-500', text: 'text-blue-500' },
    restaurant: { bg: 'bg-white', border: 'border-orange-500', text: 'text-orange-500' },
    attraction: { bg: 'bg-white', border: 'border-purple-500', text: 'text-purple-500' },
    event: { bg: 'bg-indigo-500', border: 'border-indigo-500', text: 'text-white' },
    service: { bg: 'bg-white', border: 'border-slate-600', text: 'text-slate-600' },
  };

  const c = colors[type];
  const premiumStyle = isPremium ? 'border-amber-500 ring-2 ring-amber-200' : '';

  return (
    <div className="absolute flex flex-col items-center" style={style}>
      <div className={`${c.bg} ${c.border} ${premiumStyle} border-2 rounded-full px-2 py-1 shadow-lg flex items-center gap-1 whitespace-nowrap`}>
        <span className="text-sm">{label}</span>
      </div>
      <div className={`w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent ${c.border.replace('border-', 'border-t-')} -mt-[1px]`}></div>
    </div>
  );
};

// Interactive Map Showcase - Hero feature section
const MapShowcase = () => {
  const t = useTranslations('landing');

  return (
    <section id="map-showcase" className="bg-white py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 items-center">
            {/* Text Content */}
            <div className="order-2 lg:order-1">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                <Map className="h-4 w-4" />
                {t('mapShowcase.badge')}
              </div>
              <h2 className="mb-4 text-2xl font-bold text-slate-900 md:text-3xl lg:text-4xl">
                {t('mapShowcase.title')}
              </h2>
              <p className="mb-5 text-base text-slate-600 leading-relaxed">
                {t('mapShowcase.description')}
              </p>

              {/* Feature bullets */}
              <ul className="mb-6 space-y-2.5">
                <li className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white flex-shrink-0">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-slate-700">{t('mapShowcase.feature1')}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white flex-shrink-0">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-slate-700">{t('mapShowcase.feature2')}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white flex-shrink-0">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-slate-700">{t('mapShowcase.feature3')}</span>
                </li>
              </ul>

              <Button
                size="lg"
                className="h-11 bg-[#003580] text-white hover:bg-[#002a66] font-semibold shadow-lg"
                asChild
              >
                <Link href="/stykkisholmur">
                  <Map className="mr-2 h-4 w-4" />
                  {t('mapShowcase.cta')}
                </Link>
              </Button>
            </div>

            {/* Mock Map Preview */}
            <div className="order-1 lg:order-2">
              <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-2xl">
                {/* Browser Chrome */}
                <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-400"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400"></div>
                  </div>
                  <div className="ml-3 flex-1 rounded bg-white px-3 py-1 text-xs text-slate-400 border border-slate-200">
                    townhub.vercel.app/en
                  </div>
                </div>

                {/* Mock Map Container */}
                <div className="relative h-[380px] w-full bg-[#e8f4f8] overflow-hidden">
                  {/* Stylized map background - water and land */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 380" preserveAspectRatio="xMidYMid slice">
                    {/* Ocean/water */}
                    <rect fill="#c7e3f0" width="400" height="380"/>

                    {/* Breiðafjörður bay water texture */}
                    <ellipse cx="200" cy="50" rx="250" ry="80" fill="#b5dbe8"/>

                    {/* Main landmass - Stykkishólmur peninsula */}
                    <path d="M0,150 Q50,120 100,140 Q150,100 200,120 Q250,90 300,130 Q350,110 400,150 L400,380 L0,380 Z" fill="#d4e6c8"/>

                    {/* Harbor area */}
                    <ellipse cx="180" cy="180" rx="50" ry="30" fill="#b5dbe8"/>

                    {/* Small islands */}
                    <ellipse cx="100" cy="80" rx="20" ry="15" fill="#d4e6c8"/>
                    <ellipse cx="300" cy="60" rx="15" ry="10" fill="#d4e6c8"/>
                    <ellipse cx="340" cy="90" rx="12" ry="8" fill="#d4e6c8"/>

                    {/* Roads */}
                    <path d="M0,250 Q100,240 200,260 Q300,250 400,270" stroke="#ffffff" strokeWidth="4" fill="none"/>
                    <path d="M200,260 L200,380" stroke="#ffffff" strokeWidth="3" fill="none"/>
                    <path d="M150,200 Q180,220 200,260" stroke="#f0f0f0" strokeWidth="2" fill="none"/>

                    {/* Town center indication */}
                    <rect x="140" y="200" width="80" height="60" fill="#e8e0d8" rx="4"/>
                  </svg>

                  {/* Map Markers */}
                  {/* Hotels/Lodging - Blue */}
                  <MockMarker type="lodging" label="🏨" style={{ top: '42%', left: '35%' }} isPremium />
                  <MockMarker type="lodging" label="🏨" style={{ top: '55%', left: '55%' }} />
                  <MockMarker type="lodging" label="🏨" style={{ top: '48%', left: '70%' }} />

                  {/* Restaurants - Orange */}
                  <MockMarker type="restaurant" label="🍽️" style={{ top: '52%', left: '42%' }} />
                  <MockMarker type="restaurant" label="🍽️" style={{ top: '58%', left: '28%' }} />
                  <MockMarker type="restaurant" label="🍽️" style={{ top: '45%', left: '60%' }} isPremium />

                  {/* Attractions - Purple */}
                  <MockMarker type="attraction" label="📷" style={{ top: '35%', left: '50%' }} />
                  <MockMarker type="attraction" label="📷" style={{ top: '62%', left: '65%' }} />
                  <MockMarker type="attraction" label="📷" style={{ top: '25%', left: '25%' }} />

                  {/* Events - Indigo with dates */}
                  <MockMarker type="event" label="Dec 15" style={{ top: '50%', left: '48%' }} />
                  <MockMarker type="event" label="Dec 20" style={{ top: '38%', left: '72%' }} />

                  {/* Services - Slate */}
                  <MockMarker type="service" label="🏛️" style={{ top: '60%', left: '40%' }} />

                  {/* Selected marker callout */}
                  <div className="absolute bg-white rounded-xl shadow-xl border border-slate-200 p-3 w-48" style={{ top: '15%', left: '55%' }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-sm">🏨</div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">Hótel Fransiskus</p>
                        <p className="text-[10px] text-slate-500">Boutique Hotel</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-600">
                      <span className="flex items-center gap-0.5">⭐ 4.8</span>
                      <span>•</span>
                      <span className="text-green-600 font-medium">Open now</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 p-2.5 text-[10px]">
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Lodging</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Dining</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Attractions</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Events</span>
                    </div>
                  </div>

                  {/* Zoom controls */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1">
                    <button className="w-7 h-7 bg-white rounded shadow border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50">+</button>
                    <button className="w-7 h-7 bg-white rounded shadow border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50">−</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Feature Grid
const features = [
  {
    icon: Map,
    titleKey: 'features.map.title',
    descKey: 'features.map.description',
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    icon: Calendar,
    titleKey: 'features.events.title',
    descKey: 'features.events.description',
    color: 'bg-purple-500/10 text-purple-600',
  },
  {
    icon: AlertTriangle,
    titleKey: 'features.alerts.title',
    descKey: 'features.alerts.description',
    color: 'bg-orange-500/10 text-orange-600',
  },
  {
    icon: Building2,
    titleKey: 'features.directory.title',
    descKey: 'features.directory.description',
    color: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    icon: Star,
    titleKey: 'features.partnerships.title',
    descKey: 'features.partnerships.description',
    color: 'bg-amber-500/10 text-amber-600',
  },
  {
    icon: Users,
    titleKey: 'features.community.title',
    descKey: 'features.community.description',
    color: 'bg-pink-500/10 text-pink-600',
  },
];

const FeatureGrid = () => {
  const t = useTranslations('landing');

  return (
    <section id="features" className="bg-slate-50/50 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
            {t('features.sectionTitle')}
          </h2>
          <p className="mb-12 text-lg text-slate-600">
            {t('features.sectionSubtitle')}
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.titleKey}
              className="group border-0 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <CardHeader className="pb-3">
                <div className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  {t(feature.titleKey)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed text-slate-600">
                  {t(feature.descKey)}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Live Insights Teaser
const liveInsights = [
  {
    icon: Calendar,
    labelKey: 'insights.events.label',
    valueKey: 'insights.events.value',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  {
    icon: Cloud,
    labelKey: 'insights.weather.label',
    valueKey: 'insights.weather.value',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    icon: AlertTriangle,
    labelKey: 'insights.roads.label',
    valueKey: 'insights.roads.value',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  {
    icon: Sparkles,
    labelKey: 'insights.aurora.label',
    valueKey: 'insights.aurora.value',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  {
    icon: Bell,
    labelKey: 'insights.alerts.label',
    valueKey: 'insights.alerts.value',
    color: 'bg-red-100 text-red-700 border-red-200',
  },
];

const LiveInsightsTeaser = () => {
  const t = useTranslations('landing');

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            {t('insights.liveLabel')}
          </div>
          <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
            {t('insights.sectionTitle')}
          </h2>
          <p className="mb-12 text-lg text-slate-600">
            {t('insights.sectionSubtitle')}
          </p>
        </div>

        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-4">
          {liveInsights.map((insight) => (
            <div
              key={insight.labelKey}
              className={`flex items-center gap-3 rounded-2xl border px-5 py-3 ${insight.color}`}
            >
              <insight.icon className="h-5 w-5" />
              <div>
                <p className="text-xs font-medium opacity-75">{t(insight.labelKey)}</p>
                <p className="text-sm font-bold">{t(insight.valueKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Town Selector with Preview
const TownCard = () => {
  const t = useTranslations('landing');
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section id="towns" className="bg-gradient-to-b from-slate-50 to-white py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
            {t('towns.sectionTitle')}
          </h2>
          <p className="mb-12 text-lg text-slate-600">
            {t('towns.sectionSubtitle')}
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          {/* Town Card */}
          <div
            className={`group cursor-pointer overflow-hidden rounded-xl border-2 bg-white shadow-sm transition-all duration-300 ${
              isExpanded
                ? 'border-[#003580] shadow-xl'
                : 'border-slate-200 hover:border-[#003580]/50 hover:shadow-lg'
            }`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {/* Town Image Banner - Full bleed at top */}
            <div className="relative h-44 w-full overflow-hidden rounded-t-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#003580] via-[#004aad] to-[#0066cc]">
                <img
                  src="/media/hotel-stykkish-lmur.jpg"
                  alt="Stykkishólmur harbor"
                  className="h-full w-full object-cover opacity-40 mix-blend-overlay"
                />
              </div>
              {/* Overlay content on the banner */}
              <div className="absolute inset-0 flex items-end p-6">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm text-3xl shadow-lg border border-white/30">
                      🇮🇸
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white drop-shadow-md">
                        Stykkishólmur
                      </h3>
                      <p className="text-sm text-white/90 drop-shadow-sm">
                        {t('towns.stykkisholmur.region')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white border border-white/30">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400"></span>
                    </span>
                    {t('towns.live')}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="mb-4 text-sm text-slate-600 leading-relaxed">
                {t('towns.stykkisholmur.description')}
              </p>

              {/* Quick stats */}
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                  <MapPin className="mr-1.5 inline h-3.5 w-3.5" />
                  {t('towns.stykkisholmur.businesses')}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                  <Calendar className="mr-1.5 inline h-3.5 w-3.5" />
                  {t('towns.stykkisholmur.events')}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                  <Bell className="mr-1.5 inline h-3.5 w-3.5" />
                  {t('towns.stykkisholmur.alerts')}
                </span>
              </div>

              {/* Expand/Collapse indicator */}
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-[#003580] py-2">
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    {t('towns.collapse')}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    {t('towns.expand')}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Expanded Preview */}
          {isExpanded && (
            <div className="mt-4 overflow-hidden rounded-2xl border-2 border-[#003580]/20 bg-white shadow-xl">
              {/* Preview Header */}
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    {t('towns.preview.title')}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    {t('towns.preview.liveData')}
                  </div>
                </div>
              </div>

              {/* iframe Preview */}
              <div className="relative h-[500px] w-full">
                <iframe
                  src="/en/stykkisholmur"
                  className="h-full w-full border-0"
                  title="Stykkishólmur TownApp Preview"
                />
              </div>

              {/* CTA below iframe */}
              <div className="border-t border-slate-200 bg-gradient-to-r from-[#003580] to-[#004aad] px-6 py-4">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <p className="text-sm text-white/90">
                    {t('towns.preview.ctaText')}
                  </p>
                  <Button
                    size="lg"
                    className="bg-white text-[#003580] hover:bg-white/90 font-semibold shadow-lg"
                    asChild
                  >
                    <Link href="/stykkisholmur">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {t('towns.preview.ctaButton')}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Coming Soon Towns */}
          <div className="mt-8 text-center">
            <p className="mb-4 text-sm font-medium text-slate-500">
              {t('towns.comingSoon')}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Ísafjörður', 'Akureyri', 'Reykjavík', 'Húsavík'].map((town) => (
                <span
                  key={town}
                  className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-400"
                >
                  {town}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Footer CTA
const FooterCTA = () => {
  const t = useTranslations('landing');

  return (
    <section className="bg-gradient-to-br from-[#003580] via-[#004aad] to-[#0066cc] py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            {t('cta.title')}
          </h2>
          <p className="mb-10 text-lg text-white/80">
            {t('cta.subtitle')}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="h-14 min-w-[200px] bg-white text-[#003580] hover:bg-white/90 text-base font-semibold shadow-xl"
              asChild
            >
              <a href="mailto:hello@townapp.is?subject=Request%20my%20town">
                <MapPin className="mr-2 h-5 w-5" />
                {t('cta.requestTown')}
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 min-w-[200px] border-white/30 bg-white/10 text-white hover:bg-white/20 text-base font-semibold backdrop-blur-sm"
              asChild
            >
              <a href="mailto:demo@townapp.is?subject=Book%20a%20demo">
                <Calendar className="mr-2 h-5 w-5" />
                {t('cta.bookDemo')}
              </a>
            </Button>
          </div>

          {/* Contact Info */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-white/60">
            <a href="mailto:hello@townapp.is" className="hover:text-white/90 transition-colors">
              hello@townapp.is
            </a>
            <span className="hidden sm:inline">•</span>
            <span>Stykkishólmur, Iceland</span>
            <span className="hidden sm:inline">•</span>
            <span>{t('cta.hostedOn')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  const t = useTranslations('landing');

  return (
    <footer className="border-t border-slate-200 bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#003580] text-white text-sm font-bold">
              T
            </div>
            <span className="font-semibold text-slate-900">TownApp</span>
          </div>
          <p className="text-sm text-slate-500">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <Link href="/stykkisholmur" className="hover:text-slate-900 transition-colors">
              {t('footer.app')}
            </Link>
            <a href="mailto:hello@townapp.is" className="hover:text-slate-900 transition-colors">
              {t('footer.contact')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main Landing Page Client Component
const LandingPageClient = () => {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      <main>
        <HeroSection />
        <MapShowcase />
        <FeatureGrid />
        <LiveInsightsTeaser />
        <TownCard />
        <FooterCTA />
        <Footer />
      </main>
    </div>
  );
};

export default LandingPageClient;
