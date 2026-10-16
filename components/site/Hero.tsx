"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, MessageCircle, Pause, Play } from "lucide-react";
import { whatsappLink } from "@/lib/format";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToMotionPreference(callback: () => void) {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getMotionPreference() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export type HeroSlide = {
  image: string;
  title: string;
  category: string;
};

/** Editorial furniture showcase with reduced-motion-aware project playback. */
export function Hero({
  headline,
  sub,
  slides,
  whatsapp,
  videoUrl = "/demo/atelier-motion.mp4",
  videoPoster = "/demo/workshop-1.svg",
}: {
  headline: string;
  sub: string;
  slides: HeroSlide[];
  whatsapp: string;
  videoUrl?: string;
  videoPoster?: string;
}) {
  const sceneRef = useRef<HTMLElement>(null);
  const motionVideoRef = useRef<HTMLVideoElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [playing, setPlaying] = useState(true);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    getMotionPreference,
    () => false,
  );

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    let raf = 0;
    function onMove(event: PointerEvent) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = sceneRef.current;
        if (!el || event.pointerType === "touch") return;
        const x = (event.clientX / window.innerWidth - 0.5) * 10;
        const y = (event.clientY / window.innerHeight - 0.5) * 8;
        el.style.setProperty("--px", `${x}px`);
        el.style.setProperty("--py", `${y}px`);
      });
    }
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    const video = motionVideoRef.current;
    if (!video) return;
    if (prefersReducedMotion) {
      video.pause();
      return;
    }
    void video.play().catch((error: unknown) => {
      console.warn("The decorative hero video could not autoplay.", error);
    });
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!playing || slides.length < 2 || prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [playing, prefersReducedMotion, slides.length]);

  const waLink = whatsappLink(
    whatsapp,
    "Hello Official Akogun Furniture — I saw your website and would like to discuss a furniture project.",
  );
  const slide = slides[activeSlide] ?? slides[0];
  const slideTitle = slide?.title.replace(/^(?:demo\s*[—-]\s*)/i, "");

  function showSlide(offset: number) {
    setActiveSlide((current) => (current + offset + slides.length) % slides.length);
  }

  return (
    <section
      ref={sceneRef}
      className="hero-editorial relative isolate overflow-hidden pt-[5.25rem]"
      aria-label="Introduction"
      style={{ "--px": "0px", "--py": "0px" } as React.CSSProperties}
    >
      <div className="hero-atelier-motion" aria-hidden="true">
        <video
          key={videoUrl}
          ref={motionVideoRef}
          autoPlay={!prefersReducedMotion}
          muted
          loop
          playsInline
          preload="none"
          poster={videoPoster || "/demo/workshop-1.svg"}
          className="hero-motion-video"
          tabIndex={-1}
        >
          <source src={videoUrl || "/demo/atelier-motion.mp4"} type="video/mp4" />
        </video>
        <div className="hero-motion-glow" />
        <div className="hero-motion-floor" />
        <div className="hero-motion-cabinet">
          <span />
          <span />
          <span />
        </div>
        <div className="hero-motion-sweep" />
      </div>
      <div className="container-site relative z-10 grid min-h-[calc(92svh-5.25rem)] items-center gap-10 py-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-14 lg:py-16">
        <div className="relative z-10 max-w-2xl py-8 lg:py-0">
          <p className="eyebrow mb-6 flex items-center gap-3">
            <span className="inline-block h-px w-9 bg-gold" />
            Official Akogun Furniture
          </p>
          <h1 className="max-w-[16ch] text-5xl leading-[1.02] text-ivory sm:text-6xl lg:text-[4.5rem]">
            {headline}
          </h1>
          <p className="mt-7 max-w-lg text-base leading-8 text-muted sm:text-lg">{sub}</p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/portfolio" className="btn btn-primary rounded-sm px-6">
              Discover our work
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link href="/quote" className="btn btn-secondary rounded-sm px-6">
              Begin a commission
            </Link>
            {waLink ? (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Enquire on WhatsApp"
                className="inline-flex size-11 items-center justify-center border border-ivory/25 text-ivory transition-colors hover:border-gold hover:text-gold"
              >
                <MessageCircle className="size-4" aria-hidden />
              </a>
            ) : null}
          </div>

          <div className="mt-12 hidden items-center gap-4 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-muted sm:flex">
            <span>Made for your space</span>
            <span className="h-px w-12 bg-gold/50" aria-hidden />
            <span>Built around your brief</span>
          </div>
        </div>

        {slide ? (
          <div className="relative min-w-0">
            <div className="hero-image-panel editorial-image relative ml-auto aspect-[0.92] w-full max-w-[50rem] overflow-hidden sm:aspect-[1.14] lg:aspect-[1.08]">
              <div
                className="parallax-layer absolute inset-0"
              >
                {slides.map((item, index) => (
                  <Image
                    key={`${item.image}-${index}`}
                    src={item.image}
                    alt=""
                    fill
                    loading={index === 0 ? "eager" : "lazy"}
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className={`object-cover object-center transition-[opacity,transform] duration-[1400ms] ${
                      index === activeSlide ? "scale-[1.03] opacity-100" : "scale-[1.09] opacity-0"
                    }`}
                    style={{ transform: "translate3d(var(--px, 0), var(--py, 0), 0) scale(1.03)" }}
                  />
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/5" aria-hidden />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-white/80 sm:p-7">
                <span>Selected work</span>
                <span>{slide.category}</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-5 p-6 text-white sm:p-9">
                <div>
                  <p className="text-[0.62rem] uppercase tracking-[0.22em] text-white/65">
                    Furniture · interiors · craft
                  </p>
                  <p className="mt-2 max-w-[20rem] font-display text-xl sm:text-2xl">{slideTitle}</p>
                </div>
              </div>
            </div>
            {slides.length > 1 ? (
              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted">
                  <span className="shrink-0 font-mono text-gold">
                    {String(activeSlide + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                  </span>
                  <span className="h-px w-8 shrink-0 bg-gold/45" aria-hidden />
                  <span className="truncate">Furniture stories</span>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => showSlide(-1)}
                    aria-label="Previous furniture project"
                    className="inline-flex size-10 items-center justify-center border border-ivory/20 text-ivory transition-colors hover:border-gold hover:text-gold"
                  >
                    <ArrowLeft className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlaying((value) => !value)}
                    aria-label={
                      prefersReducedMotion
                        ? "Automatic furniture playback is disabled by your motion preference"
                        : playing
                          ? "Pause furniture showcase"
                          : "Play furniture showcase"
                    }
                    disabled={prefersReducedMotion}
                    className="inline-flex size-10 items-center justify-center border border-ivory/20 text-ivory transition-colors hover:border-gold hover:text-gold disabled:opacity-50"
                  >
                    {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
                  </button>
                  <button
                    type="button"
                    onClick={() => showSlide(1)}
                    aria-label="Next furniture project"
                    className="inline-flex size-10 items-center justify-center border border-ivory/20 text-ivory transition-colors hover:border-gold hover:text-gold"
                  >
                    <ArrowRight className="size-4" aria-hidden />
                  </button>
                </div>
              </div>
            ) : null}
            <span className="absolute -bottom-5 -left-5 -z-0 hidden h-36 w-36 border border-gold/30 sm:block" aria-hidden />
            <span className="absolute -right-3 -top-4 -z-0 hidden h-24 w-24 border border-wood/20 sm:block" aria-hidden />
          </div>
        ) : null}
      </div>
    </section>
  );
}
