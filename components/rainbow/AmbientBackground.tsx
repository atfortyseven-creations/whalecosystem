"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function FloatingParticles({ count = 50 }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  
  // Create random positions
  const dummy = new THREE.Object3D();
  const particles = useRef(new Array(count).fill(0).map(() => ({
    position: [
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 10
    ],
    rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
    scale: Math.random() * 0.5 + 0.2,
    speed: Math.random() * 0.02
  })));

  useFrame((state) => {
    if (!mesh.current) return;

    particles.current.forEach((particle, i) => {
      let { position, rotation, scale, speed } = particle;

      // Update position (float up)
      position[1] += speed;
      if (position[1] > 10) position[1] = -10;

      // Update rotation
      rotation[0] += speed;
      rotation[1] += speed;

      dummy.position.set(position[0], position[1], position[2]);
      dummy.rotation.set(rotation[0], rotation[1], rotation[2]);
      dummy.scale.set(scale, scale, scale);
      
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <icosahedronGeometry args={[0.2, 0]} />
      <meshStandardMaterial 
        color="#ffffff" 
        emissive="#ffffff"
        emissiveIntensity={0.5}
        roughness={0.5} // More glass-like
        metalness={0.8}
        transparent
        opacity={0.3}
      />
    </instancedMesh>
  );
}

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-black">
        {/* Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-purple-900/20" />
        
        {/* WebGL Layer */}
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ff00ff" />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#00ffff" />
            <FloatingParticles />
            <fog attach="fog" args={['#000000', 5, 20]} />
        </Canvas>
    </div>
  );
}

