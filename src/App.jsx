import React, { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from "recharts";
import { Star, ChevronDown } from "lucide-react";

/* ---------- design tokens ---------- */
const C = {
  bg: "#0B0B0C",
  panel: "#141414",
  panel2: "#1A1A1A",
  paper: "#F4F2ED",
  paperDim: "rgba(244,242,237,0.62)",
  line: "rgba(244,242,237,0.14)",
  gold: "#E8C27E",
  goldDark: "#C9973F",
};

const AMAZON_LINKS = {
  IN: "https://www.amazon.in/dp/REPLACE_WITH_ASIN",
  US: "https://www.amazon.com/dp/REPLACE_WITH_ASIN",
};
const PRICE = { IN: "\u20B9999", US: "$59" };

const concentrationData = [
  { name: "Body mist", value: 2 },
  { name: "Deodorant", value: 3 },
  { name: "EDT", value: 10 },
  { name: "EDP", value: 18 },
  { name: "No. 1", value: 21 },
];

/* ---------- interactive hero sprite ---------- */
const HERO_FRAME_COUNT = 96;
const HERO_FRAME_W = 400;
const HERO_FRAME_H = 225;
const HERO_IDLE_FRAME = 0;
const HERO_SPRITE_SRC = "/sprite-sheet.png";

// crops the source frame to fill the destination area without distorting or
// off-centering the character (same idea as CSS object-fit: cover)
function computeCoverRect(srcW, srcH, dstW, dstH) {
  const srcRatio = srcW / srcH;
  const dstRatio = dstW / dstH;
  if (srcRatio > dstRatio) {
    const sh = srcH;
    const sw = srcH * dstRatio;
    return { sx: (srcW - sw) / 2, sy: 0, sw, sh };
  }
  const sw = srcW;
  const sh = srcW / dstRatio;
  return { sx: 0, sy: (srcH - sh) / 2, sw, sh };
}

/* ---------- hooks ---------- */
function useInView(threshold = 0.3) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.unobserve(el);
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function useInViewToggle(threshold = 0) {
  const ref = useRef(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function useCountUp(target, run, duration = 1700) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) return;
    let start = null;
    let raf;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [run, target, duration]);
  return value;
}

/* ---------- small building blocks ---------- */
function MarqueeGroup() {
  const items = Array.from({ length: 6 });
  return (
    <>
      {items.map((_, i) => (
        <React.Fragment key={i}>
          <span>STAY ODD</span>
          <span style={{ opacity: 0.45 }}>&bull;</span>
          <span>NORMAL WAS NEVER THE PLAN.</span>
          <span style={{ opacity: 0.45 }}>&bull;</span>
          <span>21% PERFUME OIL</span>
          <span style={{ opacity: 0.45 }}>&bull;</span>
        </React.Fragment>
      ))}
    </>
  );
}

function ConcentrationMeter() {
  const [ref, inView] = useInView(0.4);
  const pct = useCountUp(21, inView, 1800);
  return (
    <div ref={ref} className="flex flex-col items-center">
      <div
        className="relative overflow-hidden"
        style={{ width: 150, height: 260, border: `2px solid ${C.line}`, borderRadius: 20 }}
      >
        <div
          className="absolute left-0 right-0 bottom-0"
          style={{
            height: inView ? "21%" : "0%",
            transition: "height 1.8s cubic-bezier(.16,.9,.25,1)",
            background: `linear-gradient(180deg, ${C.gold}, ${C.goldDark})`,
          }}
        >
          <div className="wave-wrap">
            <svg viewBox="0 0 200 20" preserveAspectRatio="none" style={{ width: "200%", height: 14, display: "block" }}>
              <path
                d="M0,10 C25,0 25,20 50,10 C75,0 75,20 100,10 C125,0 125,20 150,10 C175,0 175,20 200,10 L200,20 L0,20 Z"
                fill={C.gold}
              />
            </svg>
          </div>
        </div>
      </div>
      <div className="mt-7 font-black" style={{ fontSize: 64, lineHeight: 1, color: C.gold }}>
        {pct}%
      </div>
      <div className="mt-2 text-sm" style={{ color: C.paperDim }}>perfume oil concentration</div>
    </div>
  );
}

function ComparisonChart() {
  const [ref, inView] = useInView(0.3);
  return (
    <div ref={ref} style={{ height: 260, width: "100%" }}>
      {inView && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={concentrationData} margin={{ top: 26, right: 8, left: -18, bottom: 0 }}>
            <XAxis dataKey="name" stroke="rgba(244,242,237,0.5)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis stroke="rgba(244,242,237,0.35)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
            <Bar dataKey="value" radius={[5, 5, 0, 0]}>
              <LabelList dataKey="value" position="top" formatter={(v) => `${v}%`} style={{ fill: C.paper, fontSize: 12, fontWeight: 700 }} />
              {concentrationData.map((entry, i) => (
                <Cell key={i} fill={entry.name === "No. 1" ? C.gold : "#3A3A3A"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function NotePill({ tier, notes }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="text-left w-full"
      style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: "18px 20px", background: open ? C.panel2 : "transparent" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase" style={{ letterSpacing: "0.1em", color: C.gold }}>{tier}</span>
        <ChevronDown size={16} style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.25s", color: C.paperDim }} />
      </div>
      <div className="mt-2 font-semibold" style={{ fontSize: 17 }}>{notes}</div>
    </button>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${C.line}` }} className="py-4">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center text-left gap-4">
        <span className="font-semibold" style={{ fontSize: 15 }}>{q}</span>
        <ChevronDown size={18} style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.25s", flexShrink: 0, color: C.paperDim }} />
      </button>
      {open && <p className="mt-3 text-sm leading-relaxed" style={{ color: C.paperDim }}>{a}</p>}
    </div>
  );
}

const reviews = [
  { text: "Smells like main character energy, not office-safe energy.", name: "Rhea, Mumbai" },
  { text: "I don't do \u201Cnice smelling.\u201D This isn't that. It's better.", name: "Kabir, Delhi" },
  { text: "Finally a scent brand that gets it.", name: "Ana, Bengaluru" },
  { text: "This does not smell like anything else in my gym bag. Ordered two more.", name: "Jordan, Austin" },
  { text: "Didn't expect an Indian fragrance brand to hit this hard. Immediately reordered.", name: "Maya, Brooklyn" },
];

function ReviewCard({ text, name }) {
  return (
    <div style={{ flex: "0 0 280px", border: `1px solid ${C.line}`, borderRadius: 12, padding: 26 }}>
      <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 0.6, marginBottom: 10, color: C.gold }}>&ldquo;</div>
      <p style={{ fontSize: 15, fontWeight: 600 }}>{text}</p>
      <div className="mt-3 text-xs uppercase" style={{ letterSpacing: "0.05em", color: C.paperDim }}>{name}</div>
    </div>
  );
}

function ReviewsSection() {
  const [ref, inView] = useInView(0.2);
  return (
    <section style={{ padding: "90px 24px", borderBottom: `1px solid ${C.line}` }}>
      <h2 className="font-black text-center mb-10" style={{ fontSize: 28 }}>People said things. We're not editing them.</h2>
      <div ref={ref} style={{ overflow: "hidden", maxWidth: 1180, margin: "0 auto" }}>
        <div className={`reviews-track ${inView ? "playing" : ""}`}>
          {reviews.map((r, i) => <ReviewCard key={"a" + i} {...r} />)}
          {reviews.map((r, i) => <ReviewCard key={"b" + i} {...r} />)}
        </div>
      </div>
    </section>
  );
}

function RangeSection({ onDigitClick }) {
  const digits = [
    { n: "1", active: true, label: "Out now" },
    { n: "3", active: false, label: "Coming odd" },
    { n: "5", active: false, label: "Coming odd" },
    { n: "7", active: false, label: "Coming odd" },
    { n: "9", active: false, label: "Coming odd" },
  ];
  return (
    <section
      style={{
        padding: "90px 24px",
        textAlign: "center",
        borderBottom: `1px solid ${C.line}`,
        background: `radial-gradient(rgba(244,242,237,0.05) 1px, transparent 1px) 0 0/16px 16px, ${C.bg}`,
      }}
    >
      <h2 className="font-black" style={{ fontSize: 30, letterSpacing: "-0.01em", marginBottom: 56 }}>
        Five digits. Five drops.
        <svg className="sparkle" viewBox="0 0 24 24" fill={C.paper} style={{ width: 15, height: 15, marginLeft: 8, display: "inline-block", verticalAlign: "middle" }}>
          <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
        </svg>
      </h2>
      <div className="flex justify-center flex-wrap" style={{ gap: 20, maxWidth: 820, margin: "0 auto" }}>
        {digits.map((d) => (
          <div key={d.n} style={{ width: 100 }}>
            <div
              className={d.active ? "" : "digit-ghost"}
              onClick={d.active ? onDigitClick : undefined}
              style={{
                fontSize: 46,
                fontWeight: 900,
                height: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `3px solid ${d.active ? C.paper : C.line}`,
                background: d.active ? C.paper : "transparent",
                color: d.active ? C.bg : "rgba(244,242,237,0.35)",
                cursor: d.active ? "pointer" : "default",
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) => { if (d.active) e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={(e) => { if (d.active) e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {d.n}
            </div>
            <div className="mt-3 text-xs uppercase" style={{ letterSpacing: "0.05em", color: C.paperDim }}>{d.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ManifestoSection() {
  return (
    <section style={{ padding: "100px 24px", borderBottom: `1px solid ${C.line}` }}>
      <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
        <p style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.55, color: C.paper }}>
          We didn't start 13579 to smell like everyone else's gym bag. If your fragrance doesn't make at least one person ask "wait, what is that?" &mdash; it's not doing its job.
        </p>
        <div className="scrawl" style={{ marginTop: 18, fontSize: 30 }}>normal was never the plan.</div>
      </div>
    </section>
  );
}

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------- main ---------- */
export default function ProductPage() {
  const [country, setCountry] = useState("IN");
  const [heroBtnRef, heroBtnInView] = useInViewToggle(0);
  const heroSectionRef = useRef(null);
  const heroCanvasRef = useRef(null);
  const heroImgRef = useRef(null);
  const heroTarget = useRef(HERO_IDLE_FRAME);
  const heroCurrent = useRef(HERO_IDLE_FRAME);
  const heroRaf = useRef(null);
  const [heroReady, setHeroReady] = useState(false);
  const [heroHovered, setHeroHovered] = useState(false);

  // preload the sprite sheet
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      heroImgRef.current = img;
      setHeroReady(true);
    };
    img.src = HERO_SPRITE_SRC;
  }, []);

  // render loop: eases the current frame toward the target frame, cover-crops to fill the hero
  useEffect(() => {
    if (!heroReady) return;
    const canvas = heroCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const el = heroSectionRef.current;
      if (!el) return;
      canvas.width = Math.round(el.clientWidth * dpr);
      canvas.height = Math.round(el.clientHeight * dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      const diff = heroTarget.current - heroCurrent.current;
      heroCurrent.current += Math.abs(diff) < 0.02 ? diff : diff * 0.12;
      const idx = Math.max(0, Math.min(HERO_FRAME_COUNT - 1, Math.round(heroCurrent.current)));
      const { sx, sy, sw, sh } = computeCoverRect(HERO_FRAME_W, HERO_FRAME_H, canvas.width, canvas.height);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(heroImgRef.current, idx * HERO_FRAME_W + sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      heroRaf.current = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(heroRaf.current);
      window.removeEventListener("resize", resize);
    };
  }, [heroReady]);

  function heroFrameFromX(clientX) {
    const rect = heroSectionRef.current.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(1, x)) * (HERO_FRAME_COUNT - 1);
  }
  function handleHeroMouseMove(e) {
    heroTarget.current = heroFrameFromX(e.clientX);
  }
  function handleHeroMouseLeave() {
    setHeroHovered(false);
    heroTarget.current = HERO_IDLE_FRAME;
  }
  function handleHeroTouchMove(e) {
    const t = e.touches[0];
    if (t) heroTarget.current = heroFrameFromX(t.clientX);
  }
  function handleHeroTouchEnd() {
    setHeroHovered(false);
    heroTarget.current = HERO_IDLE_FRAME;
  }

  useEffect(() => {
    const lang = (navigator.language || "").toUpperCase();
    if (lang.includes("US")) setCountry("US");
    // Best-effort only: real geolocation belongs in Shopify Markets on the live store.
  }, []);

  function buyOnAmazon(source) {
    console.log("[track] amazon_redirect", { country, source, ts: Date.now() });
    window.open(AMAZON_LINKS[country], "_blank");
  }

  return (
    <div style={{ background: C.bg, color: C.paper, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif", overflowX: "hidden" }}>
      <style>{`
        .marquee-track{ display:flex; width:max-content; gap:20px; white-space:nowrap; animation:marquee 70s linear infinite; }
        @keyframes marquee{ from{transform:translateX(0);} to{transform:translateX(-50%);} }
        .marquee-track span{ font-weight:800; font-size:13px; text-transform:uppercase; letter-spacing:0.08em; }
        .wave-wrap{ margin-top:-10px; animation:waveMove 3s linear infinite; }
        @keyframes waveMove{ from{transform:translateX(0);} to{transform:translateX(-50%);} }
        .reviews-track{ display:flex; gap:24px; width:max-content; animation:reviewsScroll 36s linear infinite; animation-play-state:paused; }
        .reviews-track.playing{ animation-play-state:running; }
        @keyframes reviewsScroll{ from{transform:translateX(0);} to{transform:translateX(-50%);} }
        .sparkle{ animation:twinkle 2.2s ease-in-out infinite; }
        @keyframes twinkle{ 0%,100%{opacity:0.35; transform:scale(0.8);} 50%{opacity:1; transform:scale(1.15);} }
        .digit-ghost:hover{ animation:wiggle 0.4s ease; }
        @keyframes wiggle{ 0%,100%{transform:rotate(0);} 25%{transform:rotate(-4deg);} 75%{transform:rotate(4deg);} }
        .scrawl{ font-family:'Segoe Print','Bradley Hand','Comic Sans MS',cursive; color:${C.gold}; transform:rotate(-2deg); display:inline-block; }
        .btn-gold{ background:${C.gold}; color:#0B0B0C; font-weight:800; border:none; cursor:pointer; transition:transform 0.15s, background 0.15s; }
        .btn-gold:hover{ background:#f0d093; transform:translateY(-2px); }
        .btn-outline{ background:transparent; color:${C.paper}; border:1.5px solid ${C.line}; cursor:pointer; transition:border-color 0.15s, transform 0.15s; }
        .btn-outline:hover{ border-color:${C.gold}; transform:translateY(-2px); }
        .country-pill{ background:none; border:none; padding:6px 12px; font-size:12px; font-weight:800; cursor:pointer; color:${C.paperDim}; }
        .country-pill.active{ color:${C.gold}; }
        input[type=email]{ background:${C.panel2}; border:1px solid ${C.line}; color:${C.paper}; }
        input[type=email]::placeholder{ color:${C.paperDim}; }
        @media (max-width:860px){ .grid-2{ grid-template-columns:1fr !important; } }
      `}</style>

      {/* marquee */}
      <div style={{ overflow: "hidden", background: "#000", borderBottom: `1px solid ${C.line}`, padding: "10px 0" }}>
        <div className="marquee-track">
          <MarqueeGroup />
          <MarqueeGroup />
        </div>
      </div>

      {/* nav */}
      <nav className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${C.line}` }}>
        <div className="font-black" style={{ fontSize: 20, letterSpacing: "-0.01em" }}>13579</div>
        <div className="flex items-center gap-2" style={{ border: `1px solid ${C.line}`, borderRadius: 20 }}>
          <button className={`country-pill ${country === "IN" ? "active" : ""}`} onClick={() => setCountry("IN")}>IN</button>
          <button className={`country-pill ${country === "US" ? "active" : ""}`} onClick={() => setCountry("US")}>US</button>
        </div>
      </nav>

      {/* hero */}
      <section
        ref={heroSectionRef}
        onMouseMove={handleHeroMouseMove}
        onMouseEnter={() => setHeroHovered(true)}
        onMouseLeave={handleHeroMouseLeave}
        onTouchMove={handleHeroTouchMove}
        onTouchStart={() => setHeroHovered(true)}
        onTouchEnd={handleHeroTouchEnd}
        onTouchCancel={handleHeroTouchEnd}
        style={{ position: "relative", width: "100%", height: "82vh", minHeight: 500, overflow: "hidden", cursor: "pointer", touchAction: "pan-y" }}
      >
        <canvas
          ref={heroCanvasRef}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", opacity: heroReady ? 1 : 0, transition: "opacity 0.6s ease" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(11,11,12,0.94) 0%, rgba(11,11,12,0.4) 42%, rgba(11,11,12,0.05) 72%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "0 24px 48px" }}>
          <div style={{ maxWidth: 640 }}>
            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={15} fill={C.gold} stroke={C.gold} />)}
              <span className="text-xs ml-2" style={{ color: C.paperDim }}>4.9 from 210 reviews</span>
            </div>
            <h1 className="font-black" style={{ fontSize: 44, lineHeight: 1.05, letterSpacing: "-0.02em" }}>No. 1</h1>
            <p className="mt-4" style={{ maxWidth: "42ch", color: C.paperDim, fontSize: 16, lineHeight: 1.6 }}>
              Not your dad's aftershave. Not a candle either. Just 21% perfume oil doing its job way longer than it should at this price.
            </p>
            <div className="mt-6 font-bold" style={{ fontSize: 24 }}>{PRICE[country]} &middot; 100 ml</div>
            <div ref={heroBtnRef} id="buy" className="mt-6 flex gap-3">
              <button className="btn-gold" style={{ padding: "15px 30px", fontSize: 14, textTransform: "uppercase", letterSpacing: "0.03em" }} onClick={() => buyOnAmazon("hero")}>
                Buy on Amazon
              </button>
            </div>
          </div>
        </div>
        <div
          style={{
            position: "absolute", top: 24, right: 24, fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 700,
            color: "rgba(244,242,237,0.65)", opacity: heroReady && !heroHovered ? 1 : 0, transition: "opacity 0.4s ease", pointerEvents: "none",
          }}
        >
          Move your cursor to look around
        </div>
      </section>

      {/* concentration reveal */}
      <section style={{ borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, padding: "90px 24px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div className="text-center mb-14">
            <h2 className="font-black" style={{ fontSize: 34, letterSpacing: "-0.01em" }}>This isn't diluted.</h2>
            <p className="mt-3" style={{ color: C.paperDim, maxWidth: "48ch", margin: "0 auto" }}>
              Most brands cut the oil to hit a price. We cut everyone standing between the perfumer and you instead.
            </p>
          </div>
          <div className="grid-2 grid items-center" style={{ gridTemplateColumns: "0.8fr 1.2fr", gap: 60 }}>
            <ConcentrationMeter />
            <ComparisonChart />
          </div>
        </div>
      </section>

      {/* notes */}
      <section style={{ padding: "90px 24px", borderBottom: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 className="font-black text-center mb-10" style={{ fontSize: 28 }}>How it unfolds</h2>
          <div className="flex flex-col gap-3">
            <NotePill tier="Top" notes="Bergamot, pink pepper, cardamom" />
            <NotePill tier="Heart" notes="Rose, oud, cedarwood" />
            <NotePill tier="Base" notes="Amber, vetiver, white musk" />
          </div>
        </div>
      </section>

      {/* range */}
      <RangeSection onDigitClick={() => scrollToId("buy")} />

      {/* manifesto */}
      <ManifestoSection />

      {/* reviews */}
      <ReviewsSection />

      {/* FAQ */}
      <section style={{ padding: "90px 24px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <h2 className="font-black text-center mb-8" style={{ fontSize: 28 }}>Questions people actually ask</h2>
          <FAQItem q="Is 21% too strong for daily wear?" a="No — 2 to 3 sprays is enough. It's concentrated, not overpowering; you control the intensity with how much you use." />
          <FAQItem q="How is this cheaper than EDPs with less oil?" a="We sell through Amazon and this page directly instead of retail markup layers, and manufacture through an established GMP-certified partner instead of building our own plant." />
          <FAQItem q="What if I don't like it?" a="7-day risk-free trial: wear it for a week, and if it's not for you, return it for a refund." />
        </div>
      </section>

      <footer className="text-center py-10" style={{ borderTop: `1px solid ${C.line}`, color: C.paperDim, fontSize: 12.5 }}>
        &copy; 2026 13579. All prices inclusive of applicable tax.
      </footer>

      {/* sticky buy bar */}
      <div
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 60,
          transform: heroBtnInView ? "translateY(100%)" : "translateY(0)",
          transition: "transform 0.3s ease",
          background: "#000", borderTop: `1px solid ${C.line}`,
        }}
        className="px-5 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="font-bold">No. 1</span>
          <span className="text-sm" style={{ color: C.paperDim }}>{PRICE[country]}</span>
        </div>
        <button className="btn-gold" style={{ padding: "10px 22px", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.03em" }} onClick={() => buyOnAmazon("sticky_bar")}>
          Buy on Amazon
        </button>
      </div>
    </div>
  );
}
