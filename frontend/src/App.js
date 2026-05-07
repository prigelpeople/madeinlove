import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import "@/App.css";
import {
    ChevronDown,
    Calendar,
    Clock,
    MapPin,
    Music2,
    VolumeX,
    Heart,
    Send,
} from "lucide-react";

/* ===========================================================
   Wedding date constants
   =========================================================== */
const RESEPSI_DATE = new Date("2026-05-24T10:00:00+07:00");
const NGUNDUH_DATE = new Date("2026-05-30T10:00:00+07:00");

/* ===========================================================
   Hooks
   =========================================================== */

function useQueryParam(key) {
    return useMemo(() => {
        if (typeof window === "undefined") return "";
        const params = new URLSearchParams(window.location.search);
        const v = params.get(key) || "";
        return v.trim();
    }, [key]);
}

function useInView(ref, options = { threshold: 0.18 }) {
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    obs.disconnect();
                }
            },
            options
        );
        obs.observe(node);
        return () => obs.disconnect();
    }, [ref, options]);
    return inView;
}

function useCountdown(target) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);
    const diff = Math.max(0, target.getTime() - now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds };
}

/* ===========================================================
   Decorative SVG ornament — gold line art
   =========================================================== */
const Ornament = ({ className = "ornament-top" }) => (
    <svg
        className={className}
        viewBox="0 0 240 60"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        aria-hidden="true"
    >
        <path d="M10 30 L100 30" />
        <path d="M140 30 L230 30" />
        <circle cx="120" cy="30" r="6" />
        <circle cx="120" cy="30" r="2" fill="currentColor" />
        <path d="M100 30 Q108 22 120 24" />
        <path d="M100 30 Q108 38 120 36" />
        <path d="M140 30 Q132 22 120 24" />
        <path d="M140 30 Q132 38 120 36" />
        <path d="M70 30 Q72 22 76 22 Q78 26 76 30" />
        <path d="M170 30 Q168 22 164 22 Q162 26 164 30" />
        <path d="M50 30 Q52 26 54 28" />
        <path d="M190 30 Q188 26 186 28" />
    </svg>
);

/* ===========================================================
   Side Navbar (vertical, fixed left, 48px wide)
   =========================================================== */
const Navbar = ({ scrolled, scrollTo }) => (
    <nav
        className={`side-nav ${scrolled ? "scrolled" : ""}`}
        data-testid="nav-bar"
    >
        <button
            type="button"
            className="side-nav-monogram"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            data-testid="nav-monogram"
            aria-label="Top"
        >
        </button>
        <ul className="side-nav-links">
            <li>
                <a
                    className="vrl"
                    onClick={() => scrollTo("acara")}
                    data-testid="nav-link-acara"
                >
                    Acara
                </a>
            </li>
            <li>
                <a
                    className="vrl"
                    onClick={() => scrollTo("hitung")}
                    data-testid="nav-link-hitung"
                >
                    Hitung Hari
                </a>
            </li>
            <li>
                <a
                    className="vrl"
                    onClick={() => scrollTo("rsvp")}
                    data-testid="nav-link-rsvp"
                >
                    RSVP
                </a>
            </li>
        </ul>
        <span className="side-nav-foot" aria-hidden="true" />
    </nav>
);

/* ===========================================================
   Marquee Text Section — horizontal scroll
   =========================================================== */
const MarqueeSection = () => {
    const trackRef = useRef(null);

    useEffect(() => {
        const inner = trackRef.current;
        if (!inner || !window.gsap) return;

        const totalWidth = inner.scrollWidth / 3;

        window.gsap.to(inner, {
            scrollTrigger: {
                trigger: "#marquee-section",
                start: "top bottom",
                end: "bottom top",
                scrub: 1.5,
            },
            x: -totalWidth * 0.4,
            ease: "none",
        });
    }, []);

    return (
        <section className="marquee-section" id="marquee-section">
            <div className="marquee-rule top" />
            <div className="marquee-track">
                <div className="marquee-inner" ref={trackRef}>
                    <span className="marquee-text">Dengan Cinta yang Tulus&nbsp;&nbsp;·&nbsp;&nbsp;</span>
                    <span className="marquee-text">Rachmatulla &amp; Devy Puspita&nbsp;&nbsp;·&nbsp;&nbsp;</span>
                    <span className="marquee-text">24 Mei 2026&nbsp;&nbsp;·&nbsp;&nbsp;</span>
                    <span className="marquee-text">Dengan Cinta yang Tulus&nbsp;&nbsp;·&nbsp;&nbsp;</span>
                    <span className="marquee-text">Rachmatulla &amp; Devy Puspita&nbsp;&nbsp;·&nbsp;&nbsp;</span>
                    <span className="marquee-text">24 Mei 2026&nbsp;&nbsp;·&nbsp;&nbsp;</span>
                    <span className="marquee-text">Dengan Cinta yang Tulus&nbsp;&nbsp;·&nbsp;&nbsp;</span>
                    <span className="marquee-text">Rachmatulla &amp; Devy Puspita&nbsp;&nbsp;·&nbsp;&nbsp;</span>
                </div>
            </div>
            <div className="marquee-rule bottom" />
        </section>
    );
};

/* ===========================================================
   Product Pin Section — sticky asset + card swap
   =========================================================== */
const ProductPinSection = () => {
    const sectionRef = useRef(null);
    const cardL1Ref = useRef(null);
    const cardL2Ref = useRef(null);
    const cardR1Ref = useRef(null);
    const cardR2Ref = useRef(null);
    const assetRef = useRef(null);
    const spacerRef = useRef(null);

    useEffect(() => {
        const section = sectionRef.current;
        const spacer = spacerRef.current;
        if (!section || !spacer || !window.gsap) return;

        const gsap = window.gsap;
        const ScrollTrigger = window.ScrollTrigger;

        // Entrance
        gsap.from(assetRef.current, {
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                toggleActions: "play none none none",
            },
            y: 60,
            opacity: 0,
            scale: 0.88,
            duration: 1.2,
            ease: "expo.out",
        });

        gsap.from([cardL1Ref.current, cardR1Ref.current], {
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                toggleActions: "play none none none",
            },
            x: (i) => (i === 0 ? -50 : 50),
            opacity: 0,
            duration: 1.0,
            ease: "expo.out",
            stagger: 0.15,
        });

        // Card Swap Logic
        const showCards = (showL, showR, hideL, hideR) => {
            [showL, showR].forEach((card) => {
                if (card && card.classList.contains("hidden")) {
                    card.classList.remove("hidden");
                    gsap.fromTo(
                        card,
                        { opacity: 0, y: 16 },
                        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
                    );
                }
            });
            [hideL, hideR].forEach((card) => {
                if (card && !card.classList.contains("hidden")) {
                    gsap.to(card, {
                        opacity: 0,
                        y: -10,
                        duration: 0.4,
                        ease: "power2.in",
                        onComplete: () => card.classList.add("hidden"),
                    });
                }
            });
        };

        ScrollTrigger.create({
            trigger: spacer,
            start: "top top",
            end: "bottom bottom",
            onUpdate: (self) => {
                const p = self.progress;
                if (p < 0.45) {
                    showCards(cardL1Ref.current, cardR1Ref.current, cardL2Ref.current, cardR2Ref.current);
                } else if (p > 0.55) {
                    showCards(cardL2Ref.current, cardR2Ref.current, cardL1Ref.current, cardR1Ref.current);
                }

                const bgImg = section.querySelector(".product-bg-img");
                if (bgImg) {
                    gsap.set(bgImg, { y: p * -60 });
                }
            },
        });
    }, []);

    return (
        <>
            <section className="product-pin-section" id="productPin" ref={sectionRef}>
                <div className="product-bg">
                    <img
                        src={`${process.env.PUBLIC_URL || ""}/assets/couple-photo.jpg`}
                        alt="Rachmatulla dan Devy Puspita"
                        className="product-bg-img"
                    />
                    <div className="product-bg-overlay" />
                </div>

                <div className="product-pin-inner">
                    {/* Left Cards */}
                    <div className="product-card left" ref={cardL1Ref}>
                        <div className="card-tag">RESEPSI PERNIKAHAN</div>
                        <h3 className="card-headline">24 Mei 2026</h3>
                        <div className="card-icon">✦</div>
                        <p className="card-body">
                            Sabtu, 24 Mei 2026<br />
                            Jalan Salak, Gondang, Tanjung<br />
                            Kertosono, Nganjuk<br />
                            Pukul 10.00 WIB
                        </p>
                    </div>
                    <div className="product-card left hidden" ref={cardL2Ref}>
                        <div className="card-tag">NGUNDUH MANTU</div>
                        <h3 className="card-headline">30 Mei 2026</h3>
                        <div className="card-icon">✦</div>
                        <p className="card-body">
                            Sabtu, 30 Mei 2026<br />
                            [Nama Gedung / Lokasi]<br />
                            [Alamat Lengkap]<br />
                            Pukul [00.00] WIB
                        </p>
                    </div>

                    {/* Center */}
                    <div className="product-center">
                        <div className="product-float-wrap">
                            <img
                                src={`${process.env.PUBLIC_URL || ""}/assets/monogram-3d.png`}
                                alt="Rachmatulla & Devy Puspita"
                                className="product-3d-img"
                                ref={assetRef}
                            />
                            <div className="product-glow" />
                        </div>
                        <div className="product-label-wrap">
                            <p className="product-label-tag">THE WEDDING OF</p>
                            <h2 className="product-label-name">Rachmatulla &amp; Devy Puspita</h2>
                        </div>
                    </div>

                    {/* Right Cards */}
                    <div className="product-card right" ref={cardR1Ref}>
                        <div className="card-tag">MEMPELAI PRIA</div>
                        <h3 className="card-headline">Rachmatulla</h3>
                        <div className="card-icon">♡</div>
                        <p className="card-body">
                            Putra dari<br />
                            Bpk. Moh Nahir Sidik<br />
                            &amp; Ibu Tarmini
                        </p>
                    </div>
                    <div className="product-card right hidden" ref={cardR2Ref}>
                        <div className="card-tag">MEMPELAI WANITA</div>
                        <h3 className="card-headline">Devy Puspita</h3>
                        <div className="card-icon">♡</div>
                        <p className="card-body">
                            Putri dari<br />
                            Bpk. Margono<br />
                            &amp; Ibu Sudarmi
                        </p>
                    </div>
                </div>
            </section>
            <div id="productPinSpacer" ref={spacerRef} style={{ height: "250vh" }} />
        </>
    );
};

/* ===========================================================
   Hero (canvas-based sequence)
   =========================================================== */
const Hero = ({ onOpen }) => {
    const heroRef = useRef(null);
    const canvasRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const [stage, setStage] = useState(0);

    const frameCount = 100;
    const currentFrame = (index) =>
        `${process.env.PUBLIC_URL || ""}/frames/frame_${index.toString().padStart(3, "0")}.jpg`;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");

        // Set high-res canvas size
        canvas.width = 1920;
        canvas.height = 1080;

        const imgArray = [];
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.src = currentFrame(i);
            imgArray.push(img);
        }

        const render = (index) => {
            const img = imgArray[Math.min(frameCount - 1, Math.max(0, Math.floor(index)))];
            // Check both complete and naturalWidth to ensure image isn't broken/404
            if (img && img.complete && img.naturalWidth !== 0) {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
        };

        // GSAP ScrollTrigger sequence
        const sequence = { frame: 0 };

        // Ensure GSAP and ScrollTrigger are loaded (from CDN in index.html)
        if (window.gsap && window.ScrollTrigger) {
            window.gsap.registerPlugin(window.ScrollTrigger);

            const tl = window.gsap.timeline({
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1.5,
                    onUpdate: (self) => {
                        const p = self.progress;
                        setProgress(p);
                        if (p < 0.25) setStage(0);
                        else if (p < 0.55) setStage(1);
                        else if (p < 0.8) setStage(2);
                        else setStage(3);
                    }
                }
            });

            tl.to(sequence, {
                frame: frameCount - 1,
                snap: "frame",
                ease: "none",
                onUpdate: () => render(sequence.frame)
            });

            // Initial render
            imgArray[0].onload = () => render(0);
        }

        return () => {
            if (window.ScrollTrigger) {
                window.ScrollTrigger.getAll().forEach(t => t.kill());
            }
        };
    }, []);

    return (
        <section
            ref={heroRef}
            className="hero-scroll"
            id="hero"
            data-testid="hero-scroll-container"
        >
            <div className="hero-sticky">
                <canvas
                    ref={canvasRef}
                    className="hero-canvas"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block"
                    }}
                />

                <div className="petals" aria-hidden="true">
                    <span className="petal" />
                    <span className="petal" />
                    <span className="petal" />
                    <span className="petal" />
                </div>

                <div className="hero-content">
                    {/* Stage 0 — Entry */}
                    <div
                        className={`hero-stage ${stage === 0 ? "active" : ""}`}
                        data-testid="hero-stage-0"
                    >
                        <div className="stage-stack">
                            <p className="stage-overline white">
                                The Wedding Of
                            </p>
                            <h1
                                className="stage-script white"
                                style={{ color: "#ffffff" }}
                            >
                                Rachmatulla &amp; Devy Puspita
                            </h1>
                            <span className="stage-divider" />
                            <p className="stage-overline">
                                Kami mengundang kehadiran anda
                            </p>
                            <button
                                type="button"
                                className="stage-cta"
                                onClick={() => {
                                    window.scrollBy({
                                        top: window.innerHeight * 0.7,
                                        behavior: "smooth",
                                    });
                                }}
                                data-testid="hero-scroll-cta"
                            >
                                Gulir untuk melihat lebih
                                <ChevronDown
                                    className="scroll-cue-arrow"
                                    strokeWidth={1.4}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Stage 1 — Date Reveal */}
                    <div
                        className={`hero-stage ${stage === 1 ? "active" : ""}`}
                        data-testid="hero-stage-1"
                    >
                        <div className="stage-stack">
                            <p
                                className="stage-italic"
                                style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)" }}
                            >
                                Dua hati, satu janji.
                            </p>
                            <span className="stage-divider-thin" />
                            <p className="stage-date">
                                24 Mei 2026
                                <span className="dot">·</span>Resepsi Pernikahan
                            </p>
                            <p className="stage-date light">
                                30 Mei 2026
                                <span className="dot">·</span>Ngunduh Mantu
                            </p>
                        </div>
                    </div>

                    {/* Stage 2 — Mood */}
                    <div
                        className={`hero-stage ${stage === 2 ? "active" : ""}`}
                        data-testid="hero-stage-2"
                    >
                        <div className="stage-stack-tight">
                            <p className="stage-italic-large">
                                Momen terindah dalam hidup kami.
                            </p>
                            <span className="stage-divider-thin" />
                            <p className="stage-overline gold">
                                Bersama keluarga &amp; sahabat tercinta
                            </p>
                        </div>
                    </div>

                    {/* Stage 3 — Invitation Close */}
                    <div
                        className={`hero-stage ${stage === 3 ? "active" : ""}`}
                        data-testid="hero-stage-3"
                    >
                        <div className="stage-stack">
                            <p
                                className="stage-script"
                                style={{
                                    fontSize: "clamp(2.4rem,5vw,4.4rem)",
                                }}
                            >
                                Dengan penuh cinta,
                            </p>
                            <p
                                className="stage-overline gold"
                                style={{ marginTop: 4 }}
                            >
                                Rachmatulla &amp; Devy Puspita
                            </p>
                            <button
                                type="button"
                                className="stage-cta stage-cta-solid"
                                onClick={onOpen}
                                data-testid="hero-open-cta"
                            >
                                Buka Undangan
                                <ChevronDown
                                    style={{
                                        width: 16,
                                        height: 16,
                                        transform: "rotate(-90deg)",
                                    }}
                                    strokeWidth={1.6}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className="hero-progress"
                    style={{ width: `${(progress * 100).toFixed(2)}%` }}
                    aria-hidden="true"
                />
            </div>
        </section>
    );
};



/* ===========================================================
   PRAMBANAN MOMENT — full-bleed photo + monogram asset
   =========================================================== */
const prambananSlides = [
    {
        bg: "/prambanan.png",
        eyebrow: "A Sacred Moment",
        headline: (
            <>
                Momen yang Telah
                <br />
                <em>Kami Nantikan</em>
            </>
        ),
        sub: (
            <>
                Rachmatulla &amp; Devy Puspita
                <span className="dot">·</span>24 Mei 2026
            </>
        ),
        body: (
            <>
                Dengan penuh syukur dan kebahagiaan,
                <br />
                kami mengundang kehadiran Anda
                <br />
                untuk berbagi momen terindah ini bersama kami.
            </>
        ),
    },
    {
        bg: "/slide2.jpg",
        eyebrow: (
            <span style={{ color: "#ffffff" }}>
                Mempelai wanita
            </span>
        ),
        headline: (
            <span style={{ fontWeight: "bold", color: "#ffffff" }}>
                Devy Puspitasari
            </span>
        ),
        sub: (
            <span style={{ color: "#ffffff" }}>
                Putri dari Bpk. Margono
                <br />
                & Ibu Sudarmi
                <br />
                Kertosono, Nganjuk
            </span>
        ),

    },
    {
        bg: "/slide3.jpg",
        eyebrow: (
            <span style={{ color: "#ffffff" }}>
                Mempelai pria
            </span>
        ),
        headline: (
            <span style={{ fontWeight: "bold", color: "#ffffff" }}>
                Rachmatulla
            </span>
        ),
        sub: (
            <span style={{ color: "#ffffff" }}>
                Putra dari Bpk. Moh Nahir Sidik
                <br />
                & Ibu Tarmini
                <br />
                Jatirejo, Nganjuk
            </span>
        ),

    },
];

const PrambananMoment = () => {
    const containerRef = useRef(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const node = containerRef.current;
        if (!node) return;

        const onScroll = () => {
            const rect = node.getBoundingClientRect();
            const total = rect.height - window.innerHeight;
            const scrolled = -rect.top;
            const p = Math.max(0, Math.min(1, scrolled / total));
            setProgress(p);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        onScroll();

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, []);

    let currentSlide = 0;
    if (progress >= 0.66) currentSlide = 2;
    else if (progress >= 0.33) currentSlide = 1;

    const slide = prambananSlides[currentSlide];

    return (
        <section
            ref={containerRef}
            id="momen"
            className="prambanan-scroll"
            data-testid="section-prambanan"
        >
            <div className="prambanan-sticky">
                <div
                    className="prambanan-bg anim-parallax"
                    aria-hidden="true"
                    style={{
                        backgroundImage: `url(${process.env.PUBLIC_URL || ""}${slide.bg})`,
                        transition: "background-image 0.6s ease-in-out",
                    }}
                />
                <div className="prambanan-vignette" aria-hidden="true" />

                <div className="prambanan-grid">
                    <div className="prambanan-text" key={currentSlide}>
                        <p className="prambanan-eyebrow anim-label">{slide.eyebrow}</p>
                        <h2 className="prambanan-headline anim-lines">{slide.headline}</h2>
                        <p className="prambanan-sub anim-up">{slide.sub}</p>
                        <p className="prambanan-body anim-up" data-delay="0.15">{slide.body}</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

/* ===========================================================
   Bismillah
   =========================================================== */
const Bismillah = () => {
    const ref = useRef(null);
    return (
        <section
            ref={ref}
            id="bismillah"
            className="section warm-white bismillah-section"
            data-testid="section-bismillah"
        >
            <div className="section-inner">
                <div className="anim-scale">
                    <Ornament />
                </div>
                <p className="bismillah-arabic anim-lines" lang="ar" dir="rtl">
                    بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                </p>
                <p className="bismillah-translation anim-up">
                    Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha
                    Penyayang.
                </p>
            </div>
        </section>
    );
};

/* ===========================================================
   Couple
   =========================================================== */
const Couple = () => {
    const ref = useRef(null);
    const [cursorPos, setCursorPos] = useState({ x: -300, y: -300 });
    const [isHovering, setIsHovering] = useState(false);
    const animRef = useRef(null);
    const currentPos = useRef({ x: -300, y: -300 });
    const targetPos = useRef({ x: -300, y: -300 });

    useEffect(() => {
        const section = ref.current;
        if (!section) return;

        const onMouseMove = (e) => {
            const rect = section.getBoundingClientRect();
            targetPos.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        };

        const onMouseEnter = () => setIsHovering(true);
        const onMouseLeave = () => {
            setIsHovering(false);
            targetPos.current = { x: -300, y: -300 };
        };

        const lerp = (a, b, t) => a + (b - a) * t;

        const animate = () => {
            currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, 0.1);
            currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, 0.1);
            setCursorPos({ x: currentPos.current.x, y: currentPos.current.y });
            animRef.current = requestAnimationFrame(animate);
        };

        animRef.current = requestAnimationFrame(animate);
        section.addEventListener("mousemove", onMouseMove);
        section.addEventListener("mouseenter", onMouseEnter);
        section.addEventListener("mouseleave", onMouseLeave);

        return () => {
            section.removeEventListener("mousemove", onMouseMove);
            section.removeEventListener("mouseenter", onMouseEnter);
            section.removeEventListener("mouseleave", onMouseLeave);
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, []);

    return (
        <section
            ref={ref}
            id="mempelai"
            className="section cream couple-section"
            data-testid="section-couple"
            style={{ position: "relative", cursor: isHovering ? "none" : "auto" }}
        >
            <img
                src={`${process.env.PUBLIC_URL || ""}/couple-sticker.png`}
                alt=""
                aria-hidden="true"
                style={{
                    position: "absolute",
                    left: cursorPos.x,
                    top: cursorPos.y,
                    width: "180px",
                    height: "auto",
                    transform: "translate(-50%, -85%)",
                    pointerEvents: "none",
                    zIndex: 20,
                    opacity: isHovering ? 1 : 0,
                    transition: "opacity 300ms ease",
                    filter: "drop-shadow(0 12px 28px rgba(0,0,0,0.18))",
                }}
            />

            <div className="section-inner">
                <p className="section-eyebrow anim-label">Sang Mempelai</p>
                <h2 className="section-title anim-lines">
                    Dengan rahmat &amp; ridho-Nya
                </h2>
                <p className="section-sub anim-up">
                    Kami bermaksud menyelenggarakan pernikahan putra dan putri
                    kami sebagai bukti syukur atas anugerah cinta yang Tuhan
                    titipkan.
                </p>

                <div className="couple-grid">
                    <article className="couple-card" data-testid="card-groom">
                        <p className="couple-role anim-label">The Groom</p>
                        <span className="card-rule anim-line-draw" />
                        <h3 className="couple-name anim-lines">Rachmatulla</h3>
                        <span className="card-rule bottom anim-line-draw" />
                        <p className="couple-parents anim-up" data-delay="0.15">
                            Putra dari Bpk.{" "}
                            <span className="placeholder-tag">
                                [Nama Ayah]
                            </span>{" "}
                            &amp; Ibu{" "}
                            <span className="placeholder-tag">
                                [Nama Ibu]
                            </span>
                        </p>
                    </article>

                    <span
                        className="couple-amp anim-scale"
                        aria-hidden="true"
                        data-delay="0.3"
                        data-testid="couple-ampersand"
                    >
                        &amp;
                    </span>

                    <article className="couple-card" data-testid="card-bride">
                        <p className="couple-role anim-label">The Bride</p>
                        <span className="card-rule anim-line-draw" />
                        <h3 className="couple-name anim-lines">Devy Puspita</h3>
                        <span className="card-rule bottom anim-line-draw" />
                        <p className="couple-parents anim-up" data-delay="0.15">
                            Putri dari Bpk.{" "}
                            <span className="placeholder-tag">
                                [Nama Ayah]
                            </span>{" "}
                            &amp; Ibu{" "}
                            <span className="placeholder-tag">
                                [Nama Ibu]
                            </span>
                        </p>
                    </article>
                </div>
            </div>
        </section>
    );
};

/* ===========================================================
   Events
   =========================================================== */
const EventCard = ({ label, day, dateText, time, venue, address, mapsUrl, testid }) => (
    <article className="event-card" data-testid={testid}>
        <div className="event-icon-wrap">
            <Calendar size={22} strokeWidth={1.2} />
        </div>
        <p className="event-label">{label}</p>
        <h3 className="event-title">{day}, {dateText}</h3>

        <p className="event-detail-line">
            <Clock size={16} strokeWidth={1.4} /> {time}
        </p>
        <hr className="event-rule" />
        <p className="event-detail-line">
            <MapPin size={16} strokeWidth={1.4} />
            <span className="placeholder-tag">{venue}</span>
        </p>
        <p
            className="event-detail-line"
            style={{ fontSize: "0.95rem", opacity: 0.78 }}
        >
            <span className="placeholder-tag">{address}</span>
        </p>

        <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="event-cta"
            data-testid={`${testid}-maps-cta`}
        >
            Lihat Lokasi
            <ChevronDown
                style={{
                    width: 14,
                    height: 14,
                    transform: "rotate(-90deg)",
                }}
                strokeWidth={1.6}
            />
        </a>
    </article>
);

const Events = () => {
    const ref = useRef(null);
    const inView = useInView(ref);
    return (
        <section
            ref={ref}
            id="acara"
            className="section warm-white events-section"
            data-testid="section-events"
        >
            <div className="section-inner">
                <p className="section-eyebrow anim-label">Save The Date</p>
                <h2 className="section-title anim-lines">Rangkaian Acara</h2>
                <p className="section-sub anim-up">
                    Sebuah kehormatan bagi kami untuk berbagi kebahagiaan
                    bersama anda dalam dua hari yang penuh berkah.
                </p>

                <div className="events-grid anim-stagger">
                    <EventCard
                        label="Resepsi Pernikahan"
                        day="Minggu"
                        dateText="24 Mei 2026"
                        time="10.00 WIB - Selesai"
                        address="Jalan Salak, Gondang, Tanjung, Kertosono"
                        mapsUrl="https://maps.app.goo.gl/iTiR7nGpQzXrwnMP8"
                    />
                    <EventCard
                        label="Acara Adat"
                        day="Sabtu"
                        dateText="30 Mei 2026"
                        time="[Waktu — WIB]"
                        venue="[Nama Gedung / Lokasi]"
                        address="[Alamat Lengkap]"
                        mapsUrl="https://maps.google.com/"
                        testid="event-ngunduh"
                    />
                </div>

                <h3
                    className="event-title anim-lines"
                    style={{
                        marginTop: 60,
                        fontSize: "1.4rem",
                        opacity: 0.85,
                    }}
                >
                    Resepsi Pernikahan &nbsp;·&nbsp; Ngunduh Mantu
                </h3>
            </div>
        </section>
    );
};

/* ===========================================================
   Countdown
   =========================================================== */
const Countdown = () => {
    const ref = useRef(null);
    const { days, hours, minutes, seconds } = useCountdown(RESEPSI_DATE);
    const pad = (n) => String(n).padStart(2, "0");
    return (
        <section
            ref={ref}
            id="hitung"
            className="section dark-warm countdown-section"
            data-testid="section-countdown"
        >
            <div className="section-inner">
                <p className="section-eyebrow anim-label">Counting Down</p>
                <h2 className="countdown-headline anim-lines">
                    Menghitung hari menuju hari bahagia
                </h2>
                <p className="countdown-sub anim-up">24 Mei 2026 · Resepsi Pernikahan</p>

                <div className="countdown-grid anim-stagger" data-testid="countdown-grid">
                    <div className="countdown-cell">
                        <div className="countdown-num anim-counter" data-target={days} data-testid="countdown-days">
                            {pad(days)}
                        </div>
                        <div className="countdown-label anim-label">Hari</div>
                    </div>
                    <div className="countdown-cell">
                        <div className="countdown-num anim-counter" data-target={hours} data-testid="countdown-hours">
                            {pad(hours)}
                        </div>
                        <div className="countdown-label anim-label">Jam</div>
                    </div>
                    <div className="countdown-cell">
                        <div className="countdown-num anim-counter" data-target={minutes} data-testid="countdown-minutes">
                            {pad(minutes)}
                        </div>
                        <div className="countdown-label anim-label">Menit</div>
                    </div>
                    <div className="countdown-cell">
                        <div className="countdown-num anim-counter" data-target={seconds} data-testid="countdown-seconds">
                            {pad(seconds)}
                        </div>
                        <div className="countdown-label anim-label">Detik</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

/* ===========================================================
   Quote
   =========================================================== */
const Quote = () => {
    const ref = useRef(null);
    return (
        <section
            ref={ref}
            id="quote"
            className="section cream quote-section"
            data-testid="section-quote"
        >
            <div className="quote-block">
                <p className="quote-mark anim-scale" aria-hidden="true">
                    &ldquo;
                </p>
                <p className="quote-text anim-lines">
                    Dan di antara tanda-tanda kekuasaan-Nya ialah Dia
                    menciptakan untukmu pasangan hidup dari jenismu sendiri,
                    supaya kamu cenderung dan merasa tenteram kepadanya.
                </p>
                <p className="quote-source anim-up">QS. Ar-Rum : 21</p>
                <hr className="quote-rule anim-line-draw" />
            </div>
        </section>
    );
};

/* ===========================================================
   RSVP
   =========================================================== */
const RSVP = ({ guestName }) => {
    const ref = useRef(null);
    const [form, setForm] = useState({
        name: guestName || "",
        attendance: "ya",
        guests: 1,
        message: "",
    });
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (guestName) setForm((f) => ({ ...f, name: guestName }));
    }, [guestName]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: connect to Firebase / Google Sheets
        // eslint-disable-next-line no-console
        console.log("[RSVP submission]", form);
        setSubmitted(true);
    };

    const setAtt = (val) => setForm((f) => ({ ...f, attendance: val }));

    return (
        <section
            ref={ref}
            id="rsvp"
            className="section cream rsvp-section"
            data-testid="section-rsvp"
        >
            <div className="section-inner">
                <p className="section-eyebrow anim-label">RSVP &amp; Doa</p>
                <h2 className="section-title anim-lines">
                    Konfirmasi kehadiran &amp; ucapan
                </h2>
                <p className="section-sub anim-up">
                    Doa dan kehadiran anda menjadi hadiah paling berharga
                    bagi kami berdua.
                </p>

                {submitted ? (
                    <div
                        className="form-success anim-up"
                        data-testid="rsvp-success"
                    >
                        Terima kasih,
                        <span className="form-success-name">
                            &nbsp;{form.name || "tamu kami"}&nbsp;
                        </span>
                        — pesan dan doa anda telah kami terima dengan hangat.
                    </div>
                ) : (
                    <form
                        className="rsvp-form anim-stagger"
                        onSubmit={handleSubmit}
                        data-testid="rsvp-form"
                    >
                        <div className="form-row">
                            <label htmlFor="rsvp-name">Nama lengkap</label>
                            <input
                                id="rsvp-name"
                                className="form-input"
                                type="text"
                                placeholder="Tuliskan nama anda"
                                value={form.name}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        name: e.target.value,
                                    }))
                                }
                                required
                                data-testid="rsvp-input-name"
                            />
                        </div>

                        <div className="form-row">
                            <label>Konfirmasi kehadiran</label>
                            <div className="radio-group">
                                {[
                                    { v: "ya", t: "Ya, hadir" },
                                    { v: "tidak", t: "Tidak hadir" },
                                    { v: "belum", t: "Masih belum pasti" },
                                ].map((opt) => (
                                    <label
                                        key={opt.v}
                                        className={`radio-pill ${form.attendance === opt.v
                                            ? "active"
                                            : ""
                                            }`}
                                        data-testid={`rsvp-attend-${opt.v}`}
                                    >
                                        <input
                                            type="radio"
                                            name="attendance"
                                            value={opt.v}
                                            checked={
                                                form.attendance === opt.v
                                            }
                                            onChange={() => setAtt(opt.v)}
                                        />
                                        <span className="dot-radio" />
                                        {opt.t}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-row">
                            <label htmlFor="rsvp-guests">
                                Jumlah tamu (1 — 5)
                            </label>
                            <input
                                id="rsvp-guests"
                                className="form-input"
                                type="number"
                                min={1}
                                max={5}
                                value={form.guests}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        guests: Math.max(
                                            1,
                                            Math.min(
                                                5,
                                                Number(e.target.value) || 1
                                            )
                                        ),
                                    }))
                                }
                                data-testid="rsvp-input-guests"
                            />
                        </div>

                        <div className="form-row">
                            <label htmlFor="rsvp-message">
                                Pesan / doa untuk pasangan
                            </label>
                            <textarea
                                id="rsvp-message"
                                className="form-textarea"
                                rows={4}
                                placeholder="Tuliskan doa terbaik anda..."
                                value={form.message}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        message: e.target.value,
                                    }))
                                }
                                data-testid="rsvp-input-message"
                            />
                        </div>

                        <button
                            type="submit"
                            className="form-submit"
                            data-testid="rsvp-submit"
                        >
                            Kirim Ucapan
                            <Send size={14} strokeWidth={1.6} />
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
};

/* ===========================================================
   Footer
   =========================================================== */
const Footer = () => (
    <footer className="footer" data-testid="footer">
        <div className="anim-scale">
            <Ornament className="ornament-top" />
        </div>
        <h3 className="footer-script anim-lines">Rachmatulla &amp; Devy Puspita</h3>
        <p className="footer-meta anim-up">24 Mei 2026 · Resepsi Pernikahan</p>
        <div className="footer-rule anim-line-draw" />
        <p className="footer-tag anim-label">
            Made with Claude, Antigravity, seedance by PrigelPeople
            <Heart
                className="footer-mark"
                size={12}
                fill="currentColor"
                style={{
                    display: "inline",
                    verticalAlign: "middle",
                    marginLeft: 6,
                }}
            />
        </p>
    </footer>
);

/* ===========================================================
   Music Toggle (fixed corner)
   =========================================================== */
const MusicToggle = () => {
    const audioRef = useRef(null);
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        const a = audioRef.current;
        if (!a) return;
        a.volume = 0.45;
        const onEnd = () => setPlaying(false);
        a.addEventListener("ended", onEnd);
        return () => a.removeEventListener("ended", onEnd);
    }, []);

    const toggle = () => {
        const a = audioRef.current;
        if (!a) return;
        const next = !playing;
        // toggle visual state immediately so the UI responds even if the
        // audio file is missing / play() rejects
        setPlaying(next);
        if (next) {
            a.play().catch(() => {
                /* keep visual state — file may be missing */
            });
        } else {
            a.pause();
        }
    };

    return (
        <>
            <audio
                ref={audioRef}
                src="/wedding-music.mp3"
                loop
                preload="none"
                data-testid="bg-music-audio"
            />
            <button
                type="button"
                className={`music-toggle ${playing ? "playing" : ""}`}
                onClick={toggle}
                aria-label={playing ? "Pause music" : "Play music"}
                title={playing ? "Pause music" : "Play music"}
                data-testid="music-toggle-btn"
            >
                {playing ? (
                    <VolumeX size={20} strokeWidth={1.5} />
                ) : (
                    <Music2 size={20} strokeWidth={1.5} />
                )}
            </button>
        </>
    );
};

/* ===========================================================
   Greeting Banner
   =========================================================== */
const GreetingBanner = ({ name, hidden }) => {
    if (!name) return null;
    return (
        <div
            className="greeting-banner"
            style={{ opacity: hidden ? 0 : 1, pointerEvents: hidden ? "none" : "auto" }}
            data-testid="greeting-banner"
        >
            Kepada Yth.
            <span className="greeting-name">{name}</span>
        </div>
    );
};

/* ===========================================================
   App
   =========================================================== */
function App() {
    const [scrolled, setScrolled] = useState(false);
    const [pastHero, setPastHero] = useState(false);
    const guest = useQueryParam("to");

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 80);
            setPastHero(window.scrollY > window.innerHeight * 1.4);
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });

        // ── GSAP ANIMATION SYSTEM ───────────────────────────
        if (window.gsap && window.ScrollTrigger) {
            const gsap = window.gsap;
            const ScrollTrigger = window.ScrollTrigger;
            gsap.registerPlugin(ScrollTrigger);

            const EASE_OUT = "power3.out";
            const EASE_EXPO = "expo.out";
            const DURATION = 0.85;
            const STAGGER = 0.12;
            const TRIGGER_START = "top 88%";

            function splitLines(el) {
                const text = el.innerText;
                const words = text.split(" ");
                el.innerHTML = "";
                const tempSpans = words.map((w) => {
                    const s = document.createElement("span");
                    s.style.cssText = "display:inline; white-space:pre;";
                    s.textContent = w + " ";
                    el.appendChild(s);
                    return s;
                });
                const lines = [];
                let currentLine = [];
                let lastTop = null;
                tempSpans.forEach((s) => {
                    const top = s.getBoundingClientRect().top;
                    if (lastTop !== null && Math.abs(top - lastTop) > 4) {
                        lines.push(currentLine);
                        currentLine = [];
                    }
                    currentLine.push(s.textContent.trim());
                    lastTop = top;
                });
                if (currentLine.length) lines.push(currentLine);
                el.innerHTML = "";
                lines.forEach((lineWords) => {
                    const mask = document.createElement("div");
                    mask.className = "line-mask";
                    mask.style.cssText = "overflow:hidden; display:block;";
                    const inner = document.createElement("div");
                    inner.className = "line-inner";
                    inner.style.cssText = "display:block;";
                    inner.textContent = lineWords.join(" ");
                    mask.appendChild(inner);
                    el.appendChild(mask);
                });
                return el.querySelectorAll(".line-inner");
            }

            const init = () => {
                // Text Line Reveal
                document.querySelectorAll(".anim-lines").forEach((el) => {
                    const lines = splitLines(el);
                    gsap.from(lines, {
                        scrollTrigger: {
                            trigger: el,
                            start: TRIGGER_START,
                            toggleActions: "play none none none",
                        },
                        y: "105%",
                        opacity: 0,
                        duration: DURATION,
                        ease: EASE_EXPO,
                        stagger: STAGGER,
                    });
                });

                // Fade Up
                document.querySelectorAll(".anim-up").forEach((el) => {
                    const delay = parseFloat(el.dataset.delay || 0);
                    gsap.from(el, {
                        scrollTrigger: {
                            trigger: el,
                            start: TRIGGER_START,
                            toggleActions: "play none none none",
                        },
                        y: 28,
                        opacity: 0,
                        duration: DURATION,
                        delay: delay,
                        ease: EASE_OUT,
                    });
                });

                // Stagger Group
                document.querySelectorAll(".anim-stagger").forEach((parent) => {
                    gsap.from(parent.children, {
                        scrollTrigger: {
                            trigger: parent,
                            start: TRIGGER_START,
                            toggleActions: "play none none none",
                        },
                        y: 36,
                        opacity: 0,
                        duration: DURATION,
                        ease: EASE_OUT,
                        stagger: STAGGER,
                    });
                });

                // Scale In
                document.querySelectorAll(".anim-scale").forEach((el) => {
                    gsap.from(el, {
                        scrollTrigger: {
                            trigger: el,
                            start: "top 92%",
                            toggleActions: "play none none none",
                        },
                        scale: 0.94,
                        opacity: 0,
                        duration: 1.1,
                        ease: EASE_OUT,
                    });
                });

                // Line Draw
                document.querySelectorAll(".anim-line-draw").forEach((el) => {
                    gsap.from(el, {
                        scrollTrigger: {
                            trigger: el,
                            start: TRIGGER_START,
                            toggleActions: "play none none none",
                        },
                        scaleX: 0,
                        opacity: 0,
                        duration: 1.0,
                        ease: EASE_OUT,
                        transformOrigin: "left center",
                    });
                });

                // Labels
                document.querySelectorAll(".anim-label").forEach((el) => {
                    gsap.from(el, {
                        scrollTrigger: {
                            trigger: el,
                            start: TRIGGER_START,
                            toggleActions: "play none none none",
                        },
                        opacity: 0,
                        letterSpacing: "0.08em",
                        duration: 1.0,
                        ease: EASE_OUT,
                    });
                });

                // Parallax
                document.querySelectorAll(".anim-parallax").forEach((el) => {
                    gsap.to(el, {
                        scrollTrigger: {
                            trigger: el.closest("section") || el.parentElement,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: 1.5,
                        },
                        y: "-12%",
                        ease: "none",
                    });
                });

                ScrollTrigger.refresh();
            };

            // Use a slight timeout to ensure components are fully rendered
            const timeoutId = setTimeout(() => {
                if (document.fonts) {
                    document.fonts.ready.then(init);
                } else {
                    init();
                }
            }, 100);

            return () => clearTimeout(timeoutId);
        }

        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollTo = useCallback((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - 60;
        window.scrollTo({ top, behavior: "smooth" });
    }, []);

    const handleOpen = () => {
        scrollTo("mempelai");
    };

    return (
        <div className="App" data-testid="app-root">
            <GreetingBanner name={guest} hidden={pastHero} />
            <Hero onOpen={handleOpen} />
            <div className="section-fog-transition" aria-hidden="true">
                <img
                    src={`${process.env.PUBLIC_URL || ""}/assets/fog-transition.png`}
                    alt=""
                    className="fog-img"
                />
            </div>
            <main className="main-content" data-testid="main-content">
                <Couple />
                <PrambananMoment />
                <MarqueeSection />
                <ProductPinSection />
                <Events />
                <Countdown />
                <Quote />
                <RSVP guestName={guest} />
            </main>
            <Footer />
            <MusicToggle />
        </div>
    );
}

export default App;
