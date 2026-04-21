import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Float, Text } from '@react-three/drei';

function House() {
  return (
    <group rotation={[0, -Math.PI / 4, 0]}>
      {/* Foundation / Multi-level Floor */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[4, 0.1, 4]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.1} />
      </mesh>

      {/* Main Block (White) */}
      <mesh position={[-0.5, 0.75, 0]} castShadow>
        <boxGeometry args={[2, 1.5, 2.5]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Modern Accent Block (Amber/Brand) */}
      <mesh position={[1, 0.5, 0.5]} castShadow>
        <boxGeometry args={[1.5, 1, 1.5]} />
        <meshStandardMaterial color="#d97706" />
      </mesh>

      {/* Cantilever Roof Section (Slate-900) */}
      <mesh position={[0, 1.55, 0]} castShadow>
        <boxGeometry args={[3.2, 0.1, 3]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Glass Windows (Large Panels) */}
      <mesh position={[-0.5, 0.75, 1.26]}>
        <planeGeometry args={[1.5, 1]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.6} metalness={0.8} roughness={0.1} />
      </mesh>

      {/* Door (Accent) */}
      <mesh position={[1.5, 0.35, 1.26]}>
        <planeGeometry args={[0.6, 0.8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Deck / Pool Area Backdrop */}
      <mesh position={[1.5, -0.04, 0]} receiveShadow>
        <boxGeometry args={[1.5, 0.05, 4]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
    </group>
  );
}

export const Blueprint3D: React.FC = () => {
  return (
    <div className="w-full h-full relative bg-slate-50 rounded-sm overflow-hidden border border-slate-200">
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Interactive V-Alpha</div>
        <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Structural Preview</h3>
        <p className="text-[10px] font-mono text-brand font-bold">Orbit Active • Zoom Enabled</p>
      </div>

      <div className="absolute bottom-6 right-6 z-10 flex gap-2 pointer-events-none">
         <div className="px-3 py-1 bg-white/80 border border-slate-200 rounded-sm text-[8px] font-bold text-slate-500 uppercase tracking-widest">
            340m² Living
         </div>
         <div className="px-3 py-1 bg-white/80 border border-slate-200 rounded-sm text-[8px] font-bold text-slate-500 uppercase tracking-widest">
            Steel Frame
         </div>
      </div>

      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[6, 4, 6]} fov={40} />
        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 2.2} 
          autoRotate 
          autoRotateSpeed={0.5}
        />
        
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} castShadow intensity={2} shadow-bias={-0.0001} />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />

        <Suspense fallback={null}>
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
            <House />
          </Float>
          <Environment preset="city" />
          <ContactShadows 
            position={[0, 0, 0]} 
            opacity={0.4} 
            scale={10} 
            blur={2} 
            far={4.5} 
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
