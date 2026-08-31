"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import { Inter, Rubik_Bubbles } from "next/font/google";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

// "Fat Bubble" isn't a real Google Font (checked) — Rubik Bubbles is the
// closest real match: chunky, rounded, balloon-like display letterforms.
// Reserved for the big background word only — it's a decorative display
// face, unreadable at footer body-copy sizes. Inter carries all the
// actual footer text (nav, contact, copyright).
const rubikBubbles = Rubik_Bubbles({ weight: "400", subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

export interface Product3DCloseoutMaterialOverride {
  color?: string;
  metalness?: number;
  roughness?: number;
}

export interface Product3DCloseoutLink {
  label: string;
  href: string;
}

export interface Product3DCloseoutProps {
  modelSrc: string;
  tiltDeg?: number;
  tiltAxis?: "x" | "z";
  pinDuration?: string | number;
  mobileBreakpoint?: number;
  materialOverride?: Product3DCloseoutMaterialOverride;
  color?: string;
  backgroundTintColor?: string;
  startScale?: number;
  endScale?: number;
  cornerOffsetX?: number;
  cornerOffsetY?: number;
  revealWord?: string;
  revealWordColor?: string;
  footerNavLinks?: Product3DCloseoutLink[];
  footerSocialLinks?: Product3DCloseoutLink[];
  footerContactLines?: string[];
  footerCopyright?: string;
  className?: string;
}

const DEFAULT_TILT_DEG = 6;
const DEFAULT_TILT_AXIS: "x" | "z" = "z";
// The sequence now has more to get through than the original grow/move/
// rotate close: the word reveal, then the footer shelf rising and its
// content populating. No fade-out anymore — the object stays put as the
// footer's anchor. First guess, not yet visually tuned.
const DEFAULT_PIN_DURATION = 3600;
const DEFAULT_MOBILE_BREAKPOINT = 768;
// glTF primitives with no material reference get three's GLTFLoader
// default (white, metalness:1, roughness:1 — see node_modules/three/
// examples/jsm/loaders/GLTFLoader.js createDefaultMaterial). A real
// color always applies now, not just when materialOverride is passed.
const DEFAULT_COLOR = "#FF6B00";
// Starts small in the corner, grows to dominate/overflow the frame —
// this is a "grows into a full-bleed color moment" close, not a "keep
// the object neatly contained" reveal, so there's deliberately no
// camera-distance compensation here.
const DEFAULT_START_SCALE = 0.5;
const DEFAULT_END_SCALE = 4;
// Static presentation for prefers-reduced-motion — not DEFAULT_START_SCALE,
// which is deliberately too small/corner-cropped to stand alone as a
// resting state with no animation to grow out of it.
const REDUCED_MOTION_SCALE = 1.4;
// End corner (bottom-right: +X, -Y) — this is also where the object
// ends up sitting "to one side" once the footer is showing, rising up
// out of the shelf panel rather than sitting fully behind it. The start
// corner is this mirrored through the origin (top-left) — a full
// diagonal traverse, not center-to-corner.
const DEFAULT_CORNER_OFFSET_X = 1.6;
const DEFAULT_CORNER_OFFSET_Y = -1.6;
const DEFAULT_REVEAL_WORD = "FANTA";
const DEFAULT_REVEAL_WORD_COLOR = "#1E3A8A";

// Full-bleed wave divider for the footer shelf's top edge — one gentle
// undulation, viewBox is the standard 1440-wide convention for this kind
// of SVG divider so it scales cleanly to any container width via
// preserveAspectRatio="none".
const WAVE_PATH = "M0,40 C360,100 1080,0 1440,50 L1440,120 L0,120 Z";

interface ModelProps {
  modelSrc: string;
  tiltDeg: number;
  tiltAxis: "x" | "z";
  pinDuration: string | number;
  mobileBreakpoint: number;
  materialOverride?: Product3DCloseoutMaterialOverride;
  color: string;
  backgroundTintColor: string;
  startScale: number;
  endScale: number;
  cornerOffsetX: number;
  cornerOffsetY: number;
  sectionRef: React.RefObject<HTMLElement | null>;
  wordContainerRef: React.RefObject<HTMLDivElement | null>;
  footerRef: React.RefObject<HTMLElement | null>;
}

function Model({
  modelSrc,
  tiltDeg,
  tiltAxis,
  pinDuration,
  mobileBreakpoint,
  materialOverride,
  color,
  backgroundTintColor,
  startScale,
  endScale,
  cornerOffsetX,
  cornerOffsetY,
  sectionRef,
  wordContainerRef,
  footerRef,
}: ModelProps) {
  const { scene } = useGLTF(modelSrc);
  const groupRef = useRef<THREE.Group>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  useEffect(() => {
    const materials: THREE.MeshStandardMaterial[] = [];
    // Some glTF exports (this Meshy-generated bottle included — see
    // asset.generator in the file) ship POSITION only: no NORMAL
    // attribute and no material. Three's GLTFLoader doesn't synthesize
    // normals when they're missing, so without this the mesh renders
    // unlit/black regardless of scene lighting.
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      if (!child.geometry.attributes.normal) {
        child.geometry.computeVertexNormals();
      }
      // Always replaces the material now, not just when materialOverride
      // is passed — the glTF's own default (white, metalness:1,
      // roughness:1, confirmed by reading GLTFLoader's
      // createDefaultMaterial) reads flat grey/white under this scene's
      // lighting, so leaving it untouched by default was the actual bug.
      // materialOverride still wins when given (falls back to `color`
      // for its own color if it doesn't specify one).
      const material = new THREE.MeshStandardMaterial({
        color: materialOverride?.color ?? color,
        metalness: materialOverride?.metalness ?? 0.15,
        roughness: materialOverride?.roughness ?? 0.45,
      });
      child.material = material;
      materials.push(material);
    });
    materialsRef.current = materials;
  }, [scene, materialOverride, color]);

  useEffect(() => {
    const group = groupRef.current;
    const section = sectionRef.current;
    const wordContainer = wordContainerRef.current;
    const footer = footerRef.current;
    if (!group || !section || !wordContainer || !footer) return;

    const letterEls = wordContainer.querySelectorAll<HTMLElement>("[data-reveal-letter]");
    const shelfEl = footer.querySelector<HTMLElement>("[data-footer-shelf]");
    const navEls = footer.querySelectorAll<HTMLElement>("[data-footer-nav-item]");
    const socialEls = footer.querySelectorAll<HTMLElement>("[data-footer-social-item]");
    const contactEls = footer.querySelectorAll<HTMLElement>("[data-footer-contact-line]");
    const copyrightEls = footer.querySelectorAll<HTMLElement>("[data-footer-copyright]");

    // Base tilt — fixed once on mount, on a different axis than the
    // scroll-driven Y rotation below. Never touched again.
    const tiltRad = (tiltDeg * Math.PI) / 180;
    if (tiltAxis === "x") group.rotation.x = tiltRad;
    else group.rotation.z = tiltRad;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      // Static, legible presentation instead of the animated sequence:
      // object at a reasonable fixed size (not DEFAULT_START_SCALE, which
      // is deliberately too small/corner-cropped to stand alone), word
      // and footer fully visible immediately, background already at its
      // final tint — the settled end state shown at once, not the motion
      // that gets there.
      group.scale.setScalar(REDUCED_MOTION_SCALE);
      section.style.backgroundColor = backgroundTintColor;
      gsap.set(letterEls, { opacity: 1, y: 0, scale: 1 });
      if (shelfEl) gsap.set(shelfEl, { yPercent: 0 });
      gsap.set([...navEls, ...socialEls, ...contactEls, ...copyrightEls], {
        opacity: 1,
        x: 0,
        y: 0,
      });
      return;
    }

    const isMobile = window.innerWidth < mobileBreakpoint;
    // Mobile doesn't pin, so a pinDuration sized for a *held* sequence
    // risks the animation still being mid-way when the (unpinned,
    // moving) section has already scrolled out of view — same reasoning
    // and pattern as ProductReveal.
    const resolvedPinDuration =
      isMobile && typeof pinDuration === "number" ? pinDuration / 2 : pinDuration;
    const resolvedEnd =
      typeof resolvedPinDuration === "number" ? `+=${resolvedPinDuration}` : resolvedPinDuration;

    // gsap.to(group, {"rotation.y": ...}) does NOT work — dot-notation
    // strings aren't valid nested-property syntax for a plain target in
    // GSAP (confirmed on the GSAP forums). Each property needs its real
    // sub-object as the tween target — group.rotation, group.scale,
    // group.position are three different Vector3/Euler instances, not
    // properties of one flat object gsap.to() can reach by string path.
    // A single timeline with one shared ScrollTrigger keeps everything —
    // object, background, word, footer — perfectly in sync.
    //
    // Positions (fractions of the timeline, not seconds — scrub maps
    // scroll progress onto these regardless of the absolute numbers):
    //   0    -> 0.4   background floods to backgroundTintColor
    //   0    -> 0.55  object rotates/grows/travels corner-to-corner —
    //                 no fade-out afterwards, it stays put, rising out
    //                 of the footer shelf as the object's final resting
    //                 spot "to one side"
    //   0.35 -> 0.6   word appears letter by letter, staggered
    //   0.5  -> 0.68  footer shelf rises from the bottom edge, wave and
    //                 all
    //   0.62 -> 0.75  nav column floats in from the left
    //   0.65 -> 0.78  contact column floats in from below
    //   0.68 -> 0.81  social column floats in from the right
    //   0.76 -> 0.86  copyright line settles in last
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: resolvedEnd,
        scrub: 0.5,
        pin: !isMobile,
      },
    });

    tl.to(group.rotation, { y: `+=${Math.PI * 2}`, ease: "none", duration: 0.55 }, 0)
      .fromTo(
        group.scale,
        { x: startScale, y: startScale, z: startScale },
        { x: endScale, y: endScale, z: endScale, ease: "none", duration: 0.55 },
        0
      )
      .fromTo(
        group.position,
        { x: -cornerOffsetX, y: -cornerOffsetY },
        { x: cornerOffsetX, y: cornerOffsetY, ease: "none", duration: 0.55 },
        0
      )
      .fromTo(
        section,
        { backgroundColor: "rgba(0, 0, 0, 0)" },
        { backgroundColor: backgroundTintColor, ease: "none", duration: 0.4 },
        0
      );

    if (letterEls.length > 0) {
      // Each letter floats up like a balloon (rises + fades in + pops
      // past 100% scale before settling) instead of just fading in place
      // — "back.out" gives the slight overshoot that reads as buoyant
      // rather than mechanical.
      gsap.set(letterEls, { opacity: 0, y: 40, scale: 0.4 });
      tl.to(
        letterEls,
        { opacity: 1, y: 0, scale: 1, ease: "back.out(1.8)", stagger: 0.06, duration: 0.25 },
        0.35
      );
    }

    if (shelfEl) {
      // The shelf (scrim panel + wave edge) rises up from below the
      // fold, then each content column floats in from whichever edge
      // it's closest to — same buoyant language as the word letters, so
      // the whole close reads as one consistent motion vocabulary.
      gsap.set(shelfEl, { yPercent: 100 });
      tl.to(shelfEl, { yPercent: 0, ease: "power3.out", duration: 0.18 }, 0.5);
    }
    if (navEls.length > 0) {
      gsap.set(navEls, { opacity: 0, x: -30 });
      tl.to(navEls, { opacity: 1, x: 0, ease: "back.out(1.5)", stagger: 0.05, duration: 0.2 }, 0.62);
    }
    if (contactEls.length > 0) {
      gsap.set(contactEls, { opacity: 0, y: 24 });
      tl.to(
        contactEls,
        { opacity: 1, y: 0, ease: "back.out(1.5)", stagger: 0.05, duration: 0.2 },
        0.65
      );
    }
    if (socialEls.length > 0) {
      gsap.set(socialEls, { opacity: 0, x: 30 });
      tl.to(
        socialEls,
        { opacity: 1, x: 0, ease: "back.out(1.5)", stagger: 0.05, duration: 0.2 },
        0.68
      );
    }
    if (copyrightEls.length > 0) {
      gsap.set(copyrightEls, { opacity: 0, y: 16 });
      tl.to(copyrightEls, { opacity: 1, y: 0, ease: "power2.out", duration: 0.2 }, 0.76);
    }

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [
    tiltDeg,
    tiltAxis,
    pinDuration,
    mobileBreakpoint,
    startScale,
    endScale,
    cornerOffsetX,
    cornerOffsetY,
    backgroundTintColor,
    sectionRef,
    wordContainerRef,
    footerRef,
    scene,
  ]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

function ExternalLinkGlyph() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 opacity-60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
      aria-hidden="true"
    >
      <path d="M7 17L17 7M17 7H9M17 7V15" />
    </svg>
  );
}

export function Product3DCloseout({
  modelSrc,
  tiltDeg = DEFAULT_TILT_DEG,
  tiltAxis = DEFAULT_TILT_AXIS,
  pinDuration = DEFAULT_PIN_DURATION,
  mobileBreakpoint = DEFAULT_MOBILE_BREAKPOINT,
  materialOverride,
  color = DEFAULT_COLOR,
  // Defaults to `color` (the object's own material color) so existing
  // usage — from before this prop existed — looks identical: the flood
  // still matches the object unless a caller explicitly wants otherwise.
  backgroundTintColor = color,
  startScale = DEFAULT_START_SCALE,
  endScale = DEFAULT_END_SCALE,
  cornerOffsetX = DEFAULT_CORNER_OFFSET_X,
  cornerOffsetY = DEFAULT_CORNER_OFFSET_Y,
  revealWord = DEFAULT_REVEAL_WORD,
  revealWordColor = DEFAULT_REVEAL_WORD_COLOR,
  footerNavLinks = [],
  footerSocialLinks = [],
  footerContactLines = [],
  footerCopyright,
  className,
}: Product3DCloseoutProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const wordContainerRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);
  const letters = revealWord.split("");
  const hasFooterContent =
    footerNavLinks.length > 0 ||
    footerSocialLinks.length > 0 ||
    footerContactLines.length > 0 ||
    Boolean(footerCopyright);

  return (
    <section
      ref={sectionRef}
      className={["relative flex min-h-screen items-center justify-center overflow-hidden", className]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Behind the Canvas (z-0 vs z-10), left-aligned and slightly
          above vertical center — the object (rendered on a transparent
          WebGL background, see gl/onCreated below) sits visually in
          front of it. */}
      <div
        ref={wordContainerRef}
        className="pointer-events-none absolute inset-0 z-0 flex items-start justify-start pl-[6vw] pt-[28vh]"
      >
        <p className={`${rubikBubbles.className} flex text-8xl sm:text-9xl md:text-[11rem]`} style={{ color: revealWordColor }}>
          {letters.map((letter, i) => (
            <span key={i} data-reveal-letter className="inline-block">
              {letter}
            </span>
          ))}
        </p>
      </div>
      <Canvas
        className="relative z-10"
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 40 }}
        gl={{ alpha: true }}
        // Real transparency, not the Puppeteer/headless case (see
        // scripts/generate-frame-sequence.mjs and render-sequence/page.tsx)
        // — this renders in an actual browser, where gl alpha + a
        // transparent clear color is the standard, reliable way to let
        // the section's own background (and the word behind it) show
        // through the canvas wherever the object doesn't cover it.
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 5, 2]} intensity={1} />
        {/* Procedural studio environment — generated on the GPU from these
            Lightformer planes, no external .hdr fetch. drei's `preset=`
            environments download an HDRI from its CDN at runtime, which
            fails outright with no network access; this has no such
            dependency. */}
        <Environment resolution={256}>
          <Lightformer intensity={2} color="white" position={[0, 5, -8]} scale={[10, 10, 1]} />
          <Lightformer intensity={1.5} color="white" position={[-6, 1, -1]} rotation={[0, Math.PI / 2, 0]} scale={[10, 2, 1]} />
          <Lightformer intensity={1.5} color="white" position={[6, 1, -1]} rotation={[0, -Math.PI / 2, 0]} scale={[10, 2, 1]} />
          <Lightformer intensity={1} color="white" position={[0, -5, 1]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 10, 1]} />
        </Environment>
        <Suspense fallback={null}>
          <Model
            modelSrc={modelSrc}
            tiltDeg={tiltDeg}
            tiltAxis={tiltAxis}
            pinDuration={pinDuration}
            mobileBreakpoint={mobileBreakpoint}
            materialOverride={materialOverride}
            color={color}
            backgroundTintColor={backgroundTintColor}
            startScale={startScale}
            endScale={endScale}
            cornerOffsetX={cornerOffsetX}
            cornerOffsetY={cornerOffsetY}
            sectionRef={sectionRef}
            wordContainerRef={wordContainerRef}
            footerRef={footerRef}
          />
        </Suspense>
      </Canvas>

      {/* Footer — above the Canvas (z-20). A shelf panel (scrim + wave
          top edge) rises from below the fold once the object/word have
          settled, holding the actual footer content in a proper grid
          instead of scattered loose text. Real <footer>, links stay
          interactive (no pointer-events-none here, unlike the decorative
          word layer behind the canvas). */}
      {hasFooterContent && (
        <footer ref={footerRef} className="absolute inset-x-0 bottom-0 z-20">
          <div data-footer-shelf className="relative">
            <svg
              viewBox="0 0 1440 120"
              preserveAspectRatio="none"
              className="absolute inset-x-0 -top-[59px] h-[60px] w-full text-black/25 sm:-top-[89px] sm:h-[90px]"
              aria-hidden="true"
            >
              <path d={WAVE_PATH} fill="currentColor" />
            </svg>
            <div className={`${inter.className} bg-black/25 px-6 pb-6 pt-8 backdrop-blur-[2px] sm:px-10 sm:pb-8 sm:pt-10`}>
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
                {footerNavLinks.length > 0 && (
                  <div>
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                      Navegación
                    </p>
                    <ul className="space-y-2">
                      {footerNavLinks.map((link) => (
                        <li key={link.href} data-footer-nav-item>
                          <a
                            href={link.href}
                            className="text-[15px] font-medium text-white/90 transition-colors hover:text-white"
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {footerContactLines.length > 0 && (
                  <div>
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                      Contacto
                    </p>
                    <ul className="space-y-2">
                      {footerContactLines.map((line) => (
                        <li key={line} data-footer-contact-line className="text-[15px] text-white/80">
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {footerSocialLinks.length > 0 && (
                  <div className="sm:text-right">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                      Síguenos
                    </p>
                    <ul className="space-y-2">
                      {footerSocialLinks.map((link) => (
                        <li key={link.href} data-footer-social-item>
                          <a
                            href={link.href}
                            className="group inline-flex items-center gap-1.5 text-[15px] font-medium text-white/90 transition-colors hover:text-white sm:flex-row-reverse"
                          >
                            {link.label}
                            <ExternalLinkGlyph />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {footerCopyright && (
                <div className="mx-auto mt-8 max-w-5xl border-t border-white/15 pt-4">
                  <p data-footer-copyright className="text-xs text-white/50">
                    {footerCopyright}
                  </p>
                </div>
              )}
            </div>
          </div>
        </footer>
      )}
    </section>
  );
}
