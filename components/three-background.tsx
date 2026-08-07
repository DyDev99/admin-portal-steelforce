'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function FloatingSphere({ position, scale, color, speed }: { position: [number, number, number]; scale: number; color: string; speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * speed;
    meshRef.current.position.y = initialY + Math.sin(t) * 0.3;
    meshRef.current.rotation.y = t * 0.15;
    meshRef.current.rotation.x = Math.sin(t * 0.5) * 0.1;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.12}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 80;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#60A5FA" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

function MouseParallax() {
  const { camera } = useThree();
  useFrame((state) => {
    const x = state.pointer.x * 0.3;
    const y = state.pointer.y * 0.3;
    camera.position.x += (x - camera.position.x) * 0.02;
    camera.position.y += (y - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function SceneContent({ isDark }: { isDark: boolean }) {
  const sphereColor = isDark ? '#60A5FA' : '#3B82F6';
  const particleColor = isDark ? '#60A5FA' : '#2563EB';

  return (
    <>
      <ambientLight intensity={isDark ? 0.3 : 0.6} />
      <directionalLight position={[5, 5, 5]} intensity={isDark ? 0.4 : 0.8} color={sphereColor} />
      <pointLight position={[-5, -3, 2]} intensity={isDark ? 0.2 : 0.4} color={particleColor} />

      <FloatingSphere position={[-4, 1.5, -3]} scale={1.2} color={sphereColor} speed={0.3} />
      <FloatingSphere position={[4, -1, -4]} scale={0.9} color={sphereColor} speed={0.4} />
      <FloatingSphere position={[2, 2.5, -5]} scale={0.7} color={sphereColor} speed={0.25} />
      <FloatingSphere position={[-3, -2, -3.5]} scale={0.8} color={sphereColor} speed={0.35} />
      <FloatingSphere position={[0, 0.5, -6]} scale={1.5} color={sphereColor} speed={0.2} />

      <ParticleField />
      <MouseParallax />
    </>
  );
}

export function ThreeBackground({ isDark }: { isDark: boolean }) {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <SceneContent isDark={isDark} />
      </Canvas>
    </div>
  );
}
