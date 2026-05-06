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
   Hero (scroll-controlled video)
   =========================================================== */
const Hero = ({ onOpen }) => {
    const heroRef = useRef(null);
    const videoRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const [stage, setStage] = useState(0);
    const fallbackRef = useRef(false);
    const rafRef = useRef(null);
    const targetTimeRef = useRef(0);

    useEffect(() => {
        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;
        fallbackRef.current = reduceMotion;

        const v = videoRef.current;
        if (!v) return;

        if (fallbackRef.current) {
            v.muted = true;
            v.loop = true;
            v.playsInline = true;
            v.setAttribute("playsinline", "");
            const tryPlay = () => v.play().catch(() => { });
            if (v.readyState >= 2) tryPlay();
            else v.addEventListener("loadeddata", tryPlay, { once: true });
        } else {
            v.pause();
            v.currentTime = 0;
        }

        const tick = () => {
            const node = heroRef.current;
            const vid = videoRef.current;
            if (!node || !vid) {
                rafRef.current = null;
                return;
            }
            const rect = node.getBoundingClientRect();
            const total = rect.height - window.innerHeight;
            const scrolled = -rect.top;
            const p = Math.max(0, Math.min(1, scrolled / total));
            setProgress(p);
            if (p < 0.25) setStage(0);
            else if (p < 0.55) setStage(1);
            else if (p < 0.8) setStage(2);
            else setStage(3);

            if (!fallbackRef.current && vid.duration && !isNaN(vid.duration)) {
                const target = Math.max(
                    0,
                    Math.min(vid.duration - 0.05, p * vid.duration)
                );
                targetTimeRef.current = target;
                if (Math.abs(vid.currentTime - target) > 0.04) {
                    try {
                        vid.currentTime = target;
                    } catch (e) {
                        /* noop */
                    }
                }
            }
            rafRef.current = null;
        };

        const onScroll = () => {
            if (rafRef.current) return;
            rafRef.current = requestAnimationFrame(tick);
        };

        const onResize = () => {
            const wasFallback = fallbackRef.current;
            const reduce = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            fallbackRef.current = reduce;
            if (!wasFallback && fallbackRef.current) {
                v.loop = true;
                v.play().catch(() => { });
            } else if (wasFallback && !fallbackRef.current) {
                v.loop = false;
                v.pause();
            }
            tick();
        };

        tick();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
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
                <video
                    ref={videoRef}
                    className="hero-video"
                    src="/hero-video.mp4"
                    muted
                    playsInline
                    preload="auto"
                    poster=""
                    data-testid="hero-video"
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
        body: (
            <>
                Satu langkah untuk selamanya,
                <br />
                dalam balutan cinta dan kasih sayang
                <br />
                yang tulus dari hati.
            </>
        )

        ,
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
        body: (
            <>
                Kami berjanji untuk saling mencintai,
                <br />
                mendukung, dan menua bersama
                <br />
                dalam setiap perjalanan hidup.
            </>
        ),
    },
];

const PrambananMoment = () => {
    const containerRef = useRef(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const tick = () => {
            const node = containerRef.current;
            if (!node) return;
            const rect = node.getBoundingClientRect();
            const total = rect.height - window.innerHeight;
            if (total <= 0) return;
            const scrolled = -rect.top;
            const p = Math.max(0, Math.min(1, scrolled / total));
            setProgress(p);
        };

        const onScroll = () => requestAnimationFrame(tick);
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        tick();

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
                {/* full-bleed photo slideshow */}
                <div
                    className="prambanan-bg"
                    aria-hidden="true"
                    style={{
                        backgroundImage: `url(${process.env.PUBLIC_URL || ""}${slide.bg})`,
                        transition: "background-image 0.6s ease-in-out",
                    }}
                />
                <div className="prambanan-vignette" aria-hidden="true" />

                <div className="prambanan-grid">
                    <div className="prambanan-text" key={currentSlide} style={{ animation: "fadeIn 0.6s ease" }}>
                        <p className="prambanan-eyebrow">{slide.eyebrow}</p>
                        <h2 className="prambanan-headline">{slide.headline}</h2>
                        <p className="prambanan-sub">{slide.sub}</p>
                        <p className="prambanan-body">{slide.body}</p>
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
    const inView = useInView(ref);
    return (
        <section
            ref={ref}
            id="bismillah"
            className={`section warm-white bismillah-section fade-up ${inView ? "in-view" : ""}`}
            data-testid="section-bismillah"
        >
            <div className="section-inner">
                <Ornament />
                <p className="bismillah-arabic" lang="ar" dir="rtl">
                    بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                </p>
                <p className="bismillah-translation">
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
    const inView = useInView(ref);
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
            className={`section cream couple-section fade-up ${inView ? "in-view" : ""}`}
            data-testid="section-couple"
            style={{ position: "relative", cursor: isHovering ? "none" : "auto" }}
        >
            {/* Cursor follower sticker */}
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
                <p className="section-eyebrow">Sang Mempelai</p>
                <h2 className="section-title">
                    Dengan rahmat &amp; ridho-Nya
                </h2>
                <p className="section-sub">
                    Kami bermaksud menyelenggarakan pernikahan putra dan putri
                    kami sebagai bukti syukur atas anugerah cinta yang Tuhan
                    titipkan.
                </p>

                <div className="couple-grid">
                    <article className="couple-card" data-testid="card-groom">
                        <p className="couple-role">The Groom</p>
                        <span className="card-rule" />
                        <h3 className="couple-name">Rachmatulla</h3>
                        <span className="card-rule bottom" />
                        <p className="couple-parents">
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
                        className="couple-amp"
                        aria-hidden="true"
                        data-testid="couple-ampersand"
                    >
                        &amp;
                    </span>

                    <article className="couple-card" data-testid="card-bride">
                        <p className="couple-role">The Bride</p>
                        <span className="card-rule" />
                        <h3 className="couple-name">Devy Puspita</h3>
                        <span className="card-rule bottom" />
                        <p className="couple-parents">
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
            className={`section warm-white events-section fade-up ${inView ? "in-view" : ""}`}
            data-testid="section-events"
        >
            <div className="section-inner">
                <p className="section-eyebrow">Save The Date</p>
                <h2 className="section-title">Rangkaian Acara</h2>
                <p className="section-sub">
                    Sebuah kehormatan bagi kami untuk berbagi kebahagiaan
                    bersama anda dalam dua hari yang penuh berkah.
                </p>

                <div className="events-grid">
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
                    className="event-title"
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
    const inView = useInView(ref);
    const { days, hours, minutes, seconds } = useCountdown(RESEPSI_DATE);
    const pad = (n) => String(n).padStart(2, "0");
    return (
        <section
            ref={ref}
            id="hitung"
            className={`section dark-warm countdown-section fade-up ${inView ? "in-view" : ""}`}
            data-testid="section-countdown"
        >
            <div className="section-inner">
                <p className="section-eyebrow">Counting Down</p>
                <h2 className="countdown-headline">
                    Menghitung hari menuju hari bahagia
                </h2>
                <p className="countdown-sub">24 Mei 2026 · Resepsi Pernikahan</p>

                <div className="countdown-grid" data-testid="countdown-grid">
                    <div className="countdown-cell">
                        <div className="countdown-num" data-testid="countdown-days">
                            {pad(days)}
                        </div>
                        <div className="countdown-label">Hari</div>
                    </div>
                    <div className="countdown-cell">
                        <div className="countdown-num" data-testid="countdown-hours">
                            {pad(hours)}
                        </div>
                        <div className="countdown-label">Jam</div>
                    </div>
                    <div className="countdown-cell">
                        <div className="countdown-num" data-testid="countdown-minutes">
                            {pad(minutes)}
                        </div>
                        <div className="countdown-label">Menit</div>
                    </div>
                    <div className="countdown-cell">
                        <div className="countdown-num" data-testid="countdown-seconds">
                            {pad(seconds)}
                        </div>
                        <div className="countdown-label">Detik</div>
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
    const inView = useInView(ref);
    return (
        <section
            ref={ref}
            id="quote"
            className={`section cream quote-section fade-up ${inView ? "in-view" : ""}`}
            data-testid="section-quote"
        >
            <div className="quote-block">
                <p className="quote-mark" aria-hidden="true">
                    &ldquo;
                </p>
                <p className="quote-text">
                    Dan di antara tanda-tanda kekuasaan-Nya ialah Dia
                    menciptakan untukmu pasangan hidup dari jenismu sendiri,
                    supaya kamu cenderung dan merasa tenteram kepadanya.
                </p>
                <p className="quote-source">QS. Ar-Rum : 21</p>
                <hr className="quote-rule" />
            </div>
        </section>
    );
};

/* ===========================================================
   RSVP
   =========================================================== */
const RSVP = ({ guestName }) => {
    const ref = useRef(null);
    const inView = useInView(ref);
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
            className={`section cream rsvp-section fade-up ${inView ? "in-view" : ""}`}
            data-testid="section-rsvp"
        >
            <div className="section-inner">
                <p className="section-eyebrow">RSVP &amp; Doa</p>
                <h2 className="section-title">
                    Konfirmasi kehadiran &amp; ucapan
                </h2>
                <p className="section-sub">
                    Doa dan kehadiran anda menjadi hadiah paling berharga
                    bagi kami berdua.
                </p>

                {submitted ? (
                    <div
                        className="form-success"
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
                        className="rsvp-form"
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
        <Ornament className="ornament-top" />
        <h3 className="footer-script">Rachmatulla &amp; Devy Puspita</h3>
        <p className="footer-meta">24 Mei 2026 · Resepsi Pernikahan</p>
        <div className="footer-rule" />
        <p className="footer-tag">
            Made with love
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
            <Navbar scrolled={scrolled} scrollTo={scrollTo} />
            <GreetingBanner name={guest} hidden={pastHero} />
            <Hero onOpen={handleOpen} />
            <main className="main-content" data-testid="main-content">
                <Couple />
                <PrambananMoment />
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
