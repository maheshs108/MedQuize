"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, Box, Cylinder, MeshDistortMaterial } from "@react-three/drei";

const TEAL = "#0d9488";
const TEAL_DARK = "#0f766e";

function HeartShape() {
  return (
    <group scale={0.9}>
      <Sphere args={[0.5, 32, 32]} position={[-0.25, 0.2, 0]}>
        <MeshDistortMaterial color={TEAL} distort={0.15} speed={0} roughness={0.4} metalness={0.1} />
      </Sphere>
      <Sphere args={[0.5, 32, 32]} position={[0.25, 0.2, 0]}>
        <MeshDistortMaterial color={TEAL} distort={0.15} speed={0} roughness={0.4} metalness={0.1} />
      </Sphere>
      <Sphere args={[0.55, 32, 32]} position={[0, -0.35, 0]}>
        <MeshDistortMaterial color={TEAL_DARK} distort={0.1} speed={0} roughness={0.4} metalness={0.1} />
      </Sphere>
    </group>
  );
}

function KidneyShape() {
  return (
    <group scale={1.1}>
      <Sphere args={[0.7, 32, 32]} scale={[1, 1.2, 0.85]}>
        <MeshDistortMaterial color={TEAL} distort={0.2} speed={0} roughness={0.4} metalness={0.1} />
      </Sphere>
    </group>
  );
}

function BrainShape() {
  return (
    <group scale={0.95}>
      <Sphere args={[0.65, 32, 32]} position={[-0.35, 0, 0]}>
        <MeshDistortMaterial color={TEAL} distort={0.25} speed={0} roughness={0.5} metalness={0.05} />
      </Sphere>
      <Sphere args={[0.65, 32, 32]} position={[0.35, 0, 0]}>
        <MeshDistortMaterial color={TEAL} distort={0.25} speed={0} roughness={0.5} metalness={0.05} />
      </Sphere>
    </group>
  );
}

function LungsShape() {
  return (
    <group scale={0.9}>
      <Sphere args={[0.45, 32, 32]} scale={[0.8, 1.2, 0.9]} position={[-0.5, 0, 0]}>
        <MeshDistortMaterial color={TEAL} distort={0.1} speed={0} roughness={0.4} metalness={0.1} />
      </Sphere>
      <Sphere args={[0.45, 32, 32]} scale={[0.8, 1.2, 0.9]} position={[0.5, 0, 0]}>
        <MeshDistortMaterial color={TEAL} distort={0.1} speed={0} roughness={0.4} metalness={0.1} />
      </Sphere>
    </group>
  );
}

function LiverShape() {
  return (
    <group scale={1}>
      <Sphere args={[0.6, 32, 32]} scale={[1.3, 0.75, 0.9]}>
        <MeshDistortMaterial color={TEAL} distort={0.15} speed={0} roughness={0.4} metalness={0.1} />
      </Sphere>
    </group>
  );
}

function StomachShape() {
  return (
    <group scale={0.95}>
      <Sphere args={[0.55, 32, 32]} scale={[1.1, 1.3, 0.9]}>
        <MeshDistortMaterial color={TEAL} distort={0.2} speed={0} roughness={0.4} metalness={0.1} />
      </Sphere>
    </group>
  );
}

function IntestineShape() {
  return (
    <group scale={0.85}>
      <Sphere args={[0.5, 32, 32]} scale={[1.4, 0.8, 0.8]}>
        <MeshDistortMaterial color={TEAL} distort={0.3} speed={0} roughness={0.4} metalness={0.1} />
      </Sphere>
    </group>
  );
}

function SpleenShape() {
  return (
    <group scale={1}>
      <Sphere args={[0.6, 32, 32]} scale={[0.9, 1.1, 0.95]}>
        <MeshDistortMaterial color={TEAL} distort={0.15} speed={0} roughness={0.4} metalness={0.1} />
      </Sphere>
    </group>
  );
}

function PancreasShape() {
  return (
    <group scale={0.9}>
      <Sphere args={[0.5, 32, 32]} scale={[1.4, 0.7, 0.8]}>
        <MeshDistortMaterial color={TEAL} distort={0.15} speed={0} roughness={0.4} metalness={0.1} />
      </Sphere>
    </group>
  );
}

function GallbladderShape() {
  return (
    <group scale={1}>
      <Sphere args={[0.45, 32, 32]} scale={[0.8, 1.2, 0.9]}>
        <MeshDistortMaterial color={TEAL_DARK} distort={0.1} speed={0} roughness={0.4} metalness={0.1} />
      </Sphere>
    </group>
  );
}

function ThyroidShape() {
  return (
    <group scale={1}>
      <Sphere args={[0.4, 32, 32]} position={[-0.35, 0, 0]}>
        <MeshDistortMaterial color={TEAL} distort={0.1} speed={0} roughness={0.4} metalness={0.1} />
      </Sphere>
      <Sphere args={[0.4, 32, 32]} position={[0.35, 0, 0]}>
        <MeshDistortMaterial color={TEAL} distort={0.1} speed={0} roughness={0.4} metalness={0.1} />
      </Sphere>
    </group>
  );
}

function BladderShape() {
  return (
    <group scale={0.95}>
      <Sphere args={[0.65, 32, 32]}>
        <MeshDistortMaterial color={TEAL} distort={0.1} speed={0} roughness={0.4} metalness={0.1} />
      </Sphere>
    </group>
  );
}

function ColonShape() {
  return (
    <group scale={0.85}>
      <Sphere args={[0.5, 32, 32]} scale={[1.5, 0.85, 0.85]}>
        <MeshDistortMaterial color={TEAL} distort={0.25} speed={0} roughness={0.4} metalness={0.1} />
      </Sphere>
    </group>
  );
}

function TubeShape() {
  return (
    <group scale={0.9}>
      <Cylinder args={[0.35, 0.4, 1.4, 32]}>
        <MeshDistortMaterial color={TEAL} distort={0.1} speed={0} roughness={0.4} metalness={0.1} />
      </Cylinder>
    </group>
  );
}

function EyeShape() {
  return (
    <group scale={0.95}>
      <Sphere args={[0.7, 32, 32]}>
        <MeshDistortMaterial color={TEAL} distort={0.05} speed={0} roughness={0.3} metalness={0.05} />
      </Sphere>
    </group>
  );
}

function BoneShape() {
  return (
    <group scale={0.9}>
      <Box args={[0.6, 1.2, 0.5]}>
        <MeshDistortMaterial color={TEAL} distort={0.15} speed={0} roughness={0.5} metalness={0.1} />
      </Box>
    </group>
  );
}

function DefaultOrgan() {
  return (
    <Sphere args={[1.1, 64, 64]}>
      <MeshDistortMaterial color={TEAL} distort={0.25} speed={0} roughness={0.4} metalness={0.1} />
    </Sphere>
  );
}

const ORGAN_SHAPE_MAP: Record<string, () => JSX.Element> = {
  heart: () => <HeartShape />,
  kidney: () => <KidneyShape />,
  brain: () => <BrainShape />,
  lungs: () => <LungsShape />,
  liver: () => <LiverShape />,
  stomach: () => <StomachShape />,
  intestine: () => <IntestineShape />,
  spleen: () => <SpleenShape />,
  pancreas: () => <PancreasShape />,
  gallbladder: () => <GallbladderShape />,
  thyroid: () => <ThyroidShape />,
  bladder: () => <BladderShape />,
  colon: () => <ColonShape />,
  adrenal: () => <GallbladderShape />,
  thymus: () => <ThyroidShape />,
  trachea: () => <TubeShape />,
  esophagus: () => <TubeShape />,
  diaphragm: () => <TubeShape />,
  skin: () => <DefaultOrgan />,
  eye: () => <EyeShape />,
  bone: () => <BoneShape />,
  muscle: () => <TubeShape />,
  "spinal-cord": () => <TubeShape />,
  "lymph-node": () => <SpleenShape />,
  "blood-vessel": () => <TubeShape />,
  nerve: () => <TubeShape />,
  appendix: () => <GallbladderShape />,
  uterus: () => <StomachShape />,
  ovary: () => <KidneyShape />,
  testis: () => <KidneyShape />,
};

function OrganModel({ organId }: { organId?: string }) {
  const Shape = organId ? ORGAN_SHAPE_MAP[organId] : null;
  return Shape ? Shape() : <DefaultOrgan />;
}

interface AnatomyViewer3DProps {
  organId?: string;
}

export function AnatomyViewer3D({ organId }: AnatomyViewer3DProps) {
  return (
    <div className="w-full h-[280px] sm:h-[320px] md:h-[380px] rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-3, -2, 2]} intensity={0.4} />
        <Suspense fallback={null}>
          <OrganModel organId={organId} />
          <OrbitControls
            enableZoom
            enablePan={false}
            minDistance={2}
            maxDistance={6}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
