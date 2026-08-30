"use client";

// Tooling page, not a cinematic component-library demo — not linked from
// the site index. Renders botella_fanta.glb at a single fixed pose
// (?angle=<deg>, defaults to 0) with no scroll/animation, so
// scripts/generate-frame-sequence.mjs can screenshot the <canvas> at 60
// angles to build a turntable frame sequence. Same camera/light/normals
// setup as Product3DCloseout.tsx (renamed from ThreeScene.tsx) — kept in
// sync by hand since this page predates any shared config extraction.

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const DEFAULT_MODEL_SRC = "/models/botella_fanta.glb";
const TILT_DEG = 6;
const CANVAS_SIZE = 800;

function readAngleFromUrl(): number {
  const raw = new URLSearchParams(window.location.search).get("angle");
  const parsed = raw !== null ? Number(raw) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

function readModelSrcFromUrl(): string {
  return new URLSearchParams(window.location.search).get("model") ?? DEFAULT_MODEL_SRC;
}

function Model({ modelSrc, angleDeg }: { modelSrc: string; angleDeg: number }) {
  const { scene } = useGLTF(modelSrc);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    // Same fix as Product3DCloseout.tsx: this model ships POSITION only,
    // no NORMAL, so Three's GLTFLoader renders it unlit/black without this.
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      if (!child.geometry.attributes.normal) {
        child.geometry.computeVertexNormals();
      }
    });

    const group = groupRef.current;
    if (!group) return;
    group.rotation.z = (TILT_DEG * Math.PI) / 180;
    group.rotation.y = (angleDeg * Math.PI) / 180;

    // Puppeteer waits on this flag before screenshotting. R3F's default
    // continuous render loop needs a couple of animation frames after
    // setting rotation for the canvas to actually reflect this exact
    // pose — signalling immediately would risk capturing a stale frame.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        (window as typeof window & { __renderReady?: boolean }).__renderReady = true;
      });
    });
  }, [scene, angleDeg]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

export default function RenderSequencePage() {
  const [angleDeg, setAngleDeg] = useState<number | null>(null);
  const [modelSrc, setModelSrc] = useState(DEFAULT_MODEL_SRC);

  useEffect(() => {
    setAngleDeg(readAngleFromUrl());
    setModelSrc(readModelSrcFromUrl());
  }, []);

  if (angleDeg === null) return null;

  return (
    <div style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
      <Canvas
        gl={{ preserveDrawingBuffer: true }}
        // Real transparency (gl={{alpha:true}} + clearAlpha 0) produced an
        // opaque PNG anyway (verified: colorType 2, no alpha channel) —
        // Chromium headless not honoring WebGL canvas alpha compositing,
        // not a scene config issue. Solid backdrop instead: reliable, and
        // removable later with chroma-key if real transparency is needed.
        onCreated={({ gl }) => gl.setClearColor(0xffffff, 1)}
        dpr={1}
        camera={{ position: [0, 0, 5], fov: 40 }}
        style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 5, 2]} intensity={1} />
        <Environment resolution={256}>
          <Lightformer intensity={2} color="white" position={[0, 5, -8]} scale={[10, 10, 1]} />
          <Lightformer
            intensity={1.5}
            color="white"
            position={[-6, 1, -1]}
            rotation={[0, Math.PI / 2, 0]}
            scale={[10, 2, 1]}
          />
          <Lightformer
            intensity={1.5}
            color="white"
            position={[6, 1, -1]}
            rotation={[0, -Math.PI / 2, 0]}
            scale={[10, 2, 1]}
          />
          <Lightformer
            intensity={1}
            color="white"
            position={[0, -5, 1]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[10, 10, 1]}
          />
        </Environment>
        <Suspense fallback={null}>
          <Model modelSrc={modelSrc} angleDeg={angleDeg} />
        </Suspense>
      </Canvas>
    </div>
  );
}
