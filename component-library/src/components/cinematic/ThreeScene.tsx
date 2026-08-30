"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

export interface ThreeSceneMaterialOverride {
  color?: string;
  metalness?: number;
  roughness?: number;
}

export interface ThreeSceneProps {
  modelSrc: string;
  tiltDeg?: number;
  tiltAxis?: "x" | "z";
  pinDuration?: string | number;
  mobileBreakpoint?: number;
  materialOverride?: ThreeSceneMaterialOverride;
  className?: string;
}

const DEFAULT_TILT_DEG = 6;
const DEFAULT_TILT_AXIS: "x" | "z" = "z";
const DEFAULT_PIN_DURATION = 500;
const DEFAULT_MOBILE_BREAKPOINT = 768;

interface ModelProps {
  modelSrc: string;
  tiltDeg: number;
  tiltAxis: "x" | "z";
  pinDuration: string | number;
  mobileBreakpoint: number;
  materialOverride?: ThreeSceneMaterialOverride;
  sectionRef: React.RefObject<HTMLElement | null>;
}

function Model({
  modelSrc,
  tiltDeg,
  tiltAxis,
  pinDuration,
  mobileBreakpoint,
  materialOverride,
  sectionRef,
}: ModelProps) {
  const { scene } = useGLTF(modelSrc);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
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
      if (materialOverride) {
        child.material = new THREE.MeshStandardMaterial({
          color: materialOverride.color ?? "#c9c9c9",
          metalness: materialOverride.metalness ?? 0.15,
          roughness: materialOverride.roughness ?? 0.45,
        });
      }
    });
  }, [scene, materialOverride]);

  useEffect(() => {
    const group = groupRef.current;
    const section = sectionRef.current;
    if (!group || !section) return;

    // Base tilt — fixed once on mount, on a different axis than the
    // scroll-driven Y rotation below. Never touched again.
    const tiltRad = (tiltDeg * Math.PI) / 180;
    if (tiltAxis === "x") group.rotation.x = tiltRad;
    else group.rotation.z = tiltRad;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const isMobile = window.innerWidth < mobileBreakpoint;
    const resolvedEnd =
      typeof pinDuration === "number" ? `+=${pinDuration}` : pinDuration;

    const tween = gsap.to(group.rotation, {
      y: `+=${Math.PI * 2}`,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: resolvedEnd,
        scrub: 0.5,
        pin: !isMobile,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [tiltDeg, tiltAxis, pinDuration, mobileBreakpoint, sectionRef]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

export function ThreeScene({
  modelSrc,
  tiltDeg = DEFAULT_TILT_DEG,
  tiltAxis = DEFAULT_TILT_AXIS,
  pinDuration = DEFAULT_PIN_DURATION,
  mobileBreakpoint = DEFAULT_MOBILE_BREAKPOINT,
  materialOverride,
  className,
}: ThreeSceneProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  return (
    <section
      ref={sectionRef}
      className={["flex min-h-screen items-center justify-center overflow-hidden", className]
        .filter(Boolean)
        .join(" ")}
    >
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5], fov: 40 }}>
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
            sectionRef={sectionRef}
          />
        </Suspense>
      </Canvas>
    </section>
  );
}
