"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import { Rubik_Bubbles } from "next/font/google";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

// "Fat Bubble" isn't a real Google Font (checked) — Rubik Bubbles is the
// closest real match: chunky, rounded, balloon-like display letterforms.
const rubikBubbles = Rubik_Bubbles({ weight: "400", subsets: ["latin"] });

export interface Product3DCloseoutMaterialOverride {
  color?: string;
  metalness?: number;
  roughness?: number;
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
  className?: string;
}

const DEFAULT_TILT_DEG = 6;
const DEFAULT_TILT_AXIS: "x" | "z" = "z";
// This sequence has three distinct beats (grow/move/rotate, letter-by-
// letter word reveal, product fade) to read clearly instead of blurring
// past on a fast scroll. First guess, not yet visually tuned.
const DEFAULT_PIN_DURATION = 2200;
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
// End corner (bottom-right: +X, -Y). The start corner is this mirrored
// through the origin (-DEFAULT_CORNER_OFFSET_X, -DEFAULT_CORNER_OFFSET_Y
// = top-left) — a full diagonal traverse, not center-to-corner.
const DEFAULT_CORNER_OFFSET_X = 1.6;
const DEFAULT_CORNER_OFFSET_Y = -1.6;
const DEFAULT_REVEAL_WORD = "FANTA";
const DEFAULT_REVEAL_WORD_COLOR = "#1E3A8A";

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
      // for its own color if it doesn't specify one). transparent: true
      // so the closing fade-out (below) can animate opacity at all —
      // Three ignores opacity on a non-transparent material.
      const material = new THREE.MeshStandardMaterial({
        color: materialOverride?.color ?? color,
        metalness: materialOverride?.metalness ?? 0.15,
        roughness: materialOverride?.roughness ?? 0.45,
        transparent: true,
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
    if (!group || !section || !wordContainer) return;

    const letterEls = wordContainer.querySelectorAll<HTMLElement>("[data-reveal-letter]");

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
      // fully visible immediately, background already at its final tint
      // — the settled end state shown at once, not the motion that gets
      // there.
      group.scale.setScalar(REDUCED_MOTION_SCALE);
      section.style.backgroundColor = backgroundTintColor;
      gsap.set(letterEls, { opacity: 1, y: 0, scale: 1 });
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
    // object, background, word, fade-out — perfectly in sync.
    //
    // Positions (fractions of the timeline, not seconds — scrub maps
    // scroll progress onto these regardless of the absolute numbers):
    //   0    -> 0.5   background floods to backgroundTintColor, so it's
    //                 already fully tinted by the time the word appears
    //   0    -> 0.85  object rotates/grows/travels corner-to-corner
    //   0.5  -> 0.8   word appears letter by letter, staggered
    //   0.8  -> 1.0   object fades out, leaving the word on the flood
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: resolvedEnd,
        scrub: 0.5,
        pin: !isMobile,
      },
    });

    tl.to(group.rotation, { y: `+=${Math.PI * 2}`, ease: "none", duration: 0.85 }, 0)
      .fromTo(
        group.scale,
        { x: startScale, y: startScale, z: startScale },
        { x: endScale, y: endScale, z: endScale, ease: "none", duration: 0.85 },
        0
      )
      .fromTo(
        group.position,
        { x: -cornerOffsetX, y: -cornerOffsetY },
        { x: cornerOffsetX, y: cornerOffsetY, ease: "none", duration: 0.85 },
        0
      )
      .fromTo(
        section,
        { backgroundColor: "rgba(0, 0, 0, 0)" },
        { backgroundColor: backgroundTintColor, ease: "none", duration: 0.5 },
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
        {
          opacity: 1,
          y: 0,
          scale: 1,
          ease: "back.out(1.8)",
          stagger: 0.06,
          duration: 0.3,
        },
        0.5
      );
    }

    tl.to(materialsRef.current, { opacity: 0, ease: "none", duration: 0.2 }, 0.8);

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
    scene,
  ]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
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
  className,
}: Product3DCloseoutProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const wordContainerRef = useRef<HTMLDivElement | null>(null);
  const letters = revealWord.split("");

  return (
    <section
      ref={sectionRef}
      className={["relative flex min-h-screen items-center justify-center overflow-hidden", className]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Behind the Canvas (z-0 vs z-10) and slightly above vertical
          center — the object (rendered on a transparent WebGL background,
          see gl/onCreated below) sits visually in front of it. */}
      <div
        ref={wordContainerRef}
        className="pointer-events-none absolute inset-0 z-0 flex items-start justify-center pt-[28vh]"
      >
        <p className={`${rubikBubbles.className} flex text-7xl sm:text-8xl md:text-9xl`} style={{ color: revealWordColor }}>
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
          />
        </Suspense>
      </Canvas>
    </section>
  );
}
