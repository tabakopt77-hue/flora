import * as THREE from 'three';
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

// 2026 Contemporary Awwwards-Winning Aesthetic: Quantum Fluid Flora
// Moving away from rigid morphing shapes to an organic, continuous fluid dynamic system
// with advanced curl noise, depth of field bokeh, and mouse interactivity.

const vertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uThemeFactor;
  
  attribute float aScale;
  attribute vec3 aRandom; 
  
  varying vec3 vColor;
  varying float vAlpha;
  
  // High-performance 3D Simplex & Curl Noise for fluid dynamics
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0);
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 105.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  vec3 snoiseVec3(vec3 x) {
    return vec3(
        snoise(vec3(x) * 2.0 - 1.0),
        snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2)),
        snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4))
    );
  }

  vec3 curlNoise(vec3 p) {
    const float e = 0.1;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);
    vec3 p_x0 = snoiseVec3(p - dx);
    vec3 p_x1 = snoiseVec3(p + dx);
    vec3 p_y0 = snoiseVec3(p - dy);
    vec3 p_y1 = snoiseVec3(p + dy);
    vec3 p_z0 = snoiseVec3(p - dz);
    vec3 p_z1 = snoiseVec3(p + dz);
    float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
    float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
    float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;
    return normalize(vec3(x, y, z));
  }

  void main() {
    float t = uTime * 0.05; // Make them move a bit faster to feel alive
    
    // Core structural position (a parametric seed)
    vec3 pos = position;
    
    // Dynamic organic twisting
    float angle = pos.y * 0.1 + t * 0.5;
    mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    pos.xz = rot * pos.xz;

    // Fluid Curl Noise displacement for liquid aesthetic
    float noiseFreq = 0.15;
    vec3 curl = curlNoise(pos * noiseFreq + t * 0.5);
    vec3 curl2 = curlNoise(pos * noiseFreq * 2.0 - t * 0.2);
    
    // Apply displacement
    vec3 displacement = curl * 2.0 + curl2 * 1.0;
    pos += displacement * mix(1.0, 3.0, aRandom.x);

    // Interactive fluid divergence from mouse
    vec3 mouseWorld = vec3(uMouse.x * 20.0, uMouse.y * 15.0, 0.0);
    float distToMouse = distance(pos.xy, mouseWorld.xy);
    float repulsion = smoothstep(6.0, 0.0, distToMouse);
    pos.xy += normalize(pos.xy - mouseWorld.xy) * repulsion * 3.0;

    // Oscillating breath effect
    float breathe = sin(t * 3.0 + aRandom.y * 6.28) * 0.5 + 0.5;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float depth = -mvPosition.z;

    // Advanced Cinematic Bokeh (Depth of Field formulation)
    // Scaled for a dark-on-light theme
    float pointSize = aScale * (120.0 / depth);
    if(depth < 6.0) {
        pointSize *= (1.0 + pow(6.0 - depth, 2.0) * 2.0); // massive out-of-focus bloom near camera
    } else if (depth > 12.0) {
        pointSize *= (1.0 + pow(depth - 12.0, 1.5) * 0.5); // massive out-of-focus bloom far camera
    }
    
    float sizeFactor = mix(1.0, 2.5, uThemeFactor);
    gl_PointSize = pointSize * mix(0.5, 1.5, breathe) * sizeFactor;
    gl_Position = projectionMatrix * mvPosition;

    // Floral Colors for Background changing over time dynamically
    vec3 color1 = vec3(0.95, 0.45, 0.65); // Rose pink
    vec3 color2 = vec3(0.60, 0.75, 0.95); // Pastel Blue
    vec3 color3 = vec3(0.95, 0.85, 0.45); // Peach/Yellow
    
    // Smooth interpolations based on space, noise, and time
    float mix1 = smoothstep(-5.0, 5.0, pos.x + curl.y * 5.0 + sin(t*2.0)*3.0);
    float mix2 = smoothstep(-5.0, 5.0, pos.y + curl.z * 5.0 + cos(t*1.5)*3.0);
    
    vec3 finalColor = mix(color1, color2, mix1);
    finalColor = mix(finalColor, color3, mix2 * aRandom.z);
    
    vColor = finalColor;
    
    // Deep volumetric atmospheric fade
    float alphaDepth = smoothstep(22.0, 1.0, depth);
    float baseAlpha = alphaDepth * mix(0.1, 0.6, aRandom.x) * (1.0 - repulsion * 0.5);
    vAlpha = mix(baseAlpha, baseAlpha * 2.8, uThemeFactor);
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    // Circular gradient for soft diffuse look matching light background
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float ll = length(xy);
    if(ll > 0.5) discard;
    
    // Smooth gradient
    float intensity = smoothstep(0.5, 0.05, ll);
    
    // Emitting darkened color logic for NormalBlending on White
    gl_FragColor = vec4(vColor, vAlpha * intensity * 0.9);
  }
`;

const QuantumFluid = ({ theme = 'light' }: { theme?: 'light' | 'dark' }) => {
  const meshRef = useRef<any>(null);
  const count = 30000; // Optimal density for fluid flow perception
  
  // Custom Hook for maintaining mouse world position smoothly
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });

  const { positions, scales, randoms } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const scale = new Float32Array(count);
    const rand = new Float32Array(count * 3);

    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const angleIncrement = Math.PI * 2 * goldenRatio;

    for (let i = 0; i < count; i++) {
        // Distribute points in a beautiful golden spiral (Fibonacci sphere variant)
        const t = i / count;
        const inclination = Math.acos(1 - 2 * t);
        const azimuth = angleIncrement * i;

        // Spread out to form a galaxy/nebula disc
        const radius = Math.pow(Math.random(), 0.5) * 12.0;

        pos[i * 3 + 0] = Math.sin(inclination) * Math.cos(azimuth) * radius * 1.5;
        pos[i * 3 + 1] = Math.cos(inclination) * Math.sin(azimuth) * radius * 0.5; // Flatter disc
        pos[i * 3 + 2] = Math.sin(inclination) * Math.sin(azimuth) * radius;

        scale[i] = Math.random() * 0.7 + 0.2;
        
        rand[i * 3 + 0] = Math.random();
        rand[i * 3 + 1] = Math.random();
        rand[i * 3 + 2] = Math.random();
    }
    return { positions: pos, scales: scale, randoms: rand };
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uThemeFactor: { value: theme === 'dark' ? 1.0 : 0.0 }
  }), [theme]);

  useFrame((state, delta) => {
    if (meshRef.current) {
        // Fluid time progression
        meshRef.current.material.uniforms.uTime.value += delta * 0.1; // Slower time scaling
        
        // Smooth mouse following with easing
        mouseTarget.current.x = (state.pointer.x);
        mouseTarget.current.y = (state.pointer.y);
        mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * 0.1;
        mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * 0.1;
        
        meshRef.current.material.uniforms.uMouse.value.set(
            mouseCurrent.current.x,
            mouseCurrent.current.y
        );

        // Slow, majestic camera revolution
        const camOrbitAngle = state.clock.elapsedTime * 0.02;
        state.camera.position.x = Math.sin(camOrbitAngle) * 5.0;
        state.camera.position.z = Math.cos(camOrbitAngle) * 5.0 + 3.0;
        state.camera.lookAt(0, 0, 0);
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aScale" count={count} array={scales} itemSize={1} />
        <bufferAttribute attach="attributes-aRandom" count={count} array={randoms} itemSize={3} />
      </bufferGeometry>
      <shaderMaterial 
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        blending={theme === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending}
        depthWrite={false}
      />
    </points>
  );
};

interface CinematicParticlesProps {
  theme?: 'light' | 'dark';
  position?: 'absolute' | 'fixed';
}

class WebGLErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('WebGL rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

export default function CinematicParticles({ theme = 'light', position = 'absolute' }: CinematicParticlesProps) {
  const isDark = theme === 'dark';
  return (
    <div className={`${position} inset-0 w-full h-full z-0 pointer-events-none bg-transparent overflow-hidden mix-blend-normal ${isDark ? 'opacity-30' : 'opacity-50'}`}>
      <WebGLErrorBoundary>
        <Canvas 
          camera={{ position: [0, 0, 8], fov: 45 }} 
          dpr={[1, 2]} 
          style={{ background: 'transparent' }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <QuantumFluid theme={theme} />
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
