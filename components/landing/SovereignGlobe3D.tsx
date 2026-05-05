"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ─── SOVEREIGN GLOBE — High-Fidelity Continental Dot Sphere ──────────────────
// Maps a world topology image to an offscreen canvas and filters Fibonacci 
// sphere points to only render on continents. Absolute perfection.
// ─────────────────────────────────────────────────────────────────────────────

const POINT_COUNT = 60000; // Increased for higher density continent resolution
const GLOBE_RADIUS = 1.0;
const BG_COLOR = "#FAF9F6";
const DOT_COLOR = "#3F3F46";
const DOT_SIZE = 0.005;

// We use an earth specular map where oceans are white (255) and land is black (0).
const EARTH_SPECULAR_URL = "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg";

function PointGlobeMesh() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(DOT_COLOR), []);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [pixelData, setPixelData] = useState<Uint8ClampedArray | null>(null);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);

  // Load the image and extract pixel data
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = EARTH_SPECULAR_URL;
    
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, img.width, img.height);
          setPixelData(imgData.data);
          setImageWidth(img.width);
          setImageHeight(img.height);
          setMapLoaded(true);
        } else {
          setMapLoaded(true); // Fallback if no context
        }
      } catch (err) {
        setMapLoaded(true); // Fallback on CORS error
      }
    };
    
    img.onerror = () => {
      setMapLoaded(true); // Fallback on network error
    };
  }, []);

  // Construct the sphere points
  useEffect(() => {
    if (!meshRef.current || !mapLoaded) return;
    
    const PHI = Math.PI * (3 - Math.sqrt(5));
    let validIndex = 0;
    
    for (let i = 0; i < POINT_COUNT; i++) {
      // Fibonacci sphere
      const y = 1 - (i / (POINT_COUNT - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = PHI * i;
      
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      let isLand = true; // Default to true for fallback

      if (pixelData) {
        // Convert 3D position to 2D UV coordinates
        // u: 0 to 1 (longitude), v: 0 to 1 (latitude)
        const u = 0.5 + Math.atan2(z, x) / (2 * Math.PI);
        const v = 0.5 - Math.asin(y) / Math.PI;

        // Read pixel from image
        const px = Math.floor(u * imageWidth);
        const py = Math.floor(v * imageHeight);
        const pixelIndex = (py * imageWidth + px) * 4;
        
        // Specular map: Oceans are bright (high R), land is dark (low R)
        const r_color = pixelData[pixelIndex];
        if (r_color >= 50) {
          isLand = false;
        }
      }
      
      if (isLand) {
        dummy.position.set(x * GLOBE_RADIUS, y * GLOBE_RADIUS, z * GLOBE_RADIUS);
        dummy.lookAt(0, 0, 0);
        dummy.updateMatrix();
        
        meshRef.current.setMatrixAt(validIndex, dummy.matrix);
        meshRef.current.setColorAt(validIndex, color);
        validIndex++;
      }
    }
    
    // Hide the unused instances by scaling them to 0
    for (let i = validIndex; i < POINT_COUNT; i++) {
      dummy.position.set(0, 0, 0);
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    
    meshRef.current.count = validIndex;
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [dummy, color, mapLoaded, pixelData, imageWidth, imageHeight]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, POINT_COUNT]}>
      <circleGeometry args={[DOT_SIZE, 8]} />
      <meshBasicMaterial 
        vertexColors 
        transparent 
        opacity={0.85} 
        side={THREE.DoubleSide} 
        depthWrite={false}
      />
    </instancedMesh>
  );
}

// ─── SOLID CORE ─────────────────────────────────────────────────────────────
// An elegant solid white sphere inside to give it volume and block back-dots.
function SolidCore() {
  return (
    <mesh>
      <sphereGeometry args={[GLOBE_RADIUS * 0.985, 64, 64]} />
      <meshStandardMaterial 
        color="#ffffff" 
        roughness={0.9} 
        metalness={0.1} 
      />
    </mesh>
  );
}

// ─── ROTATING GLOBE GROUP ────────────────────────────────────────────────────
function RotatingGlobeGroup() {
  const groupRef = useRef<THREE.Group>(null!);
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001; // Smooth, slow elegant rotation
    }
  });

  return (
    <group ref={groupRef}>
      <SolidCore />
      <PointGlobeMesh />
    </group>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export function SovereignGlobe3D() {
  return (
    <div className="w-full h-full absolute inset-0 z-0 bg-transparent overflow-hidden flex items-center justify-center">
      <Canvas
        camera={{ position: [0, 0, 2.6], fov: 45, near: 0.01, far: 10 }}
        dpr={[1, 2]} // High DPI for retina displays
        gl={{ 
          antialias: true, 
          powerPreference: "high-performance", 
          alpha: true 
        }}
        style={{ background: "transparent", cursor: "grab" }}
      >
        {/* Fog creates the beautiful depth effect fading into the background */}
        <fog attach="fog" args={[BG_COLOR, 1.8, 3.8]} />

        {/* Elegant lighting setup to give the white core soft volume */}
        <ambientLight intensity={0.7} color="#ffffff" />
        <directionalLight position={[5, 5, 4]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-5, -3, -5]} intensity={0.5} color="#f1f5f9" />

        <group rotation={[0.2, -0.4, 0]}>
          <RotatingGlobeGroup />
        </group>

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI * 0.2}
          maxPolarAngle={Math.PI * 0.8}
          autoRotate={false}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}
