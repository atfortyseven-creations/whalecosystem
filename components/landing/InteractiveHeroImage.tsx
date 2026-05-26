"use client";

import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";

// The path in the background is a cross. We restrict movement to x=0 or z=0.
const LIMIT = 12; // boundaries of the cross
const SPEED = 5;

function Character({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const [bob, setBob] = useState(0);

  // Simple walking animation (bobbing)
  useFrame((state) => {
    if (groupRef.current) {
      // If moving, we bob up and down
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 10) * 0.1;
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, position[0], 0.2);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, position[2], 0.2);
      
      // Face direction of movement
      if (position[0] > groupRef.current.position.x + 0.1) groupRef.current.rotation.y = Math.PI / 2;
      else if (position[0] < groupRef.current.position.x - 0.1) groupRef.current.rotation.y = -Math.PI / 2;
      else if (position[2] > groupRef.current.position.z + 0.1) groupRef.current.rotation.y = 0;
      else if (position[2] < groupRef.current.position.z - 0.1) groupRef.current.rotation.y = Math.PI;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[0.8, 1.2, 0.4]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.2, 0.3, 0]} castShadow>
        <boxGeometry args={[0.3, 0.6, 0.3]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[0.2, 0.3, 0]} castShadow>
        <boxGeometry args={[0.3, 0.6, 0.3]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* Arm L */}
      <mesh position={[-0.55, 1.1, 0]} castShadow>
        <boxGeometry args={[0.3, 0.8, 0.3]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* Arm R & Sword */}
      <group position={[0.55, 1.1, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.3, 0.8, 0.3]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        {/* Sword attached to right hand */}
        <mesh position={[0, -0.6, 0.8]} rotation={[-Math.PI / 4, 0, 0]} castShadow>
          <boxGeometry args={[0.1, 0.1, 2.5]} />
          <meshStandardMaterial color="#cccccc" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Sword Crossguard */}
        <mesh position={[0, -0.6, -0.2]} rotation={[-Math.PI / 4, 0, 0]} castShadow>
          <boxGeometry args={[0.5, 0.15, 0.15]} />
          <meshStandardMaterial color="#888888" />
        </mesh>
      </group>
    </group>
  );
}

function Scene() {
  const [targetPos, setTargetPos] = useState<[number, number, number]>([0, 0, 0]);
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    let [x, y, z] = targetPos;
    const isMovingZ = Math.abs(x) < 0.1;
    const isMovingX = Math.abs(z) < 0.1;

    let nextX = x;
    let nextZ = z;

    if (keys.current["ArrowUp"]) nextZ -= SPEED * delta;
    if (keys.current["ArrowDown"]) nextZ += SPEED * delta;
    if (keys.current["ArrowLeft"]) nextX -= SPEED * delta;
    if (keys.current["ArrowRight"]) nextX += SPEED * delta;

    // Movement resolution to stick to the cross
    if (isMovingZ && Math.abs(nextX - x) > 0) {
      if (Math.abs(z) < 0.2) {
        // close enough to intersection, snap Z and move X
        z = 0;
        x = nextX;
      }
    } else if (isMovingX && Math.abs(nextZ - z) > 0) {
      if (Math.abs(x) < 0.2) {
        // close enough to intersection, snap X and move Z
        x = 0;
        z = nextZ;
      }
    } else {
      if (isMovingZ) z = nextZ;
      if (isMovingX) x = nextX;
    }

    // Clamp to limits
    x = Math.max(-LIMIT, Math.min(LIMIT, x));
    z = Math.max(-LIMIT, Math.min(LIMIT, z));

    setTargetPos([x, y, z]);
  });

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 15, 10]} intensity={2} castShadow shadow-mapSize={[2048, 2048]} />
      <Character position={targetPos} />
    </>
  );
}

export function InteractiveHeroImage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
      {/* Pixel Art Background */}
      <img
        src="/system-shots/monochrome-illustration-science-fiction-arch-pixel-art-Devine-Lu-Linvega-2268380-wallhere.com (1).jpg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover mix-blend-darken opacity-90"
      />
      {/* 3D Canvas Overlay */}
      <div className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
        <Canvas shadows>
          {/* Isometric projection: angle matching the drawing */}
          <OrthographicCamera
            makeDefault
            position={[20, 20, 20]}
            zoom={40}
            near={-100}
            far={100}
            onUpdate={(c) => c.lookAt(0, 0, 0)}
          />
          <Scene />
        </Canvas>
      </div>
      {/* Instructions */}
      <div className="absolute bottom-8 left-8 bg-white/80 backdrop-blur px-4 py-2 text-[11px] font-mono tracking-widest uppercase border border-black/10 text-black/60 shadow-sm pointer-events-none rounded">
        Use arrows to explore
      </div>
    </div>
  );
}
