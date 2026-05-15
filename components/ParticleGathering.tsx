import * as THREE from 'three';
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

const vertexShader = `
  uniform float uTime;
  uniform float uProgress;
  uniform vec2 uMouse;
  attribute vec3 targetPosition;
  attribute vec3 targetColor;
  varying float vDistance;
  varying vec3 vColor;

  void main() {
    // Смешиваем хаотичное положение с целевым (образом из фото)
    vec3 pos = mix(position, targetPosition, uProgress);
    
    // Добавляем легкое "дыхание" частицам
    pos.x += sin(uTime * 0.5 + position.y) * 0.1 * (1.0 - uProgress);
    pos.y += cos(uTime * 0.5 + position.x) * 0.1 * (1.0 - uProgress);

    // Взаимодействие с мышью (отталкивание)
    float dist = distance(pos.xy, uMouse * 5.0);
    if(dist < 1.0) {
      pos.z += (1.0 - dist) * 0.5;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 2.0 * (1.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    vDistance = dist;
    
    // Pass color to fragment shader
    // Mix from default emerald to target color based on progress
    vec3 defaultColor = vec3(0.47, 0.97, 0.82);
    vColor = mix(defaultColor, targetColor, uProgress);
  }
`;

const fragmentShader = `
  varying float vDistance;
  varying vec3 vColor;
  void main() {
    float alpha = smoothstep(0.0, 1.0, 0.5 / length(gl_PointCoord - 0.5));
    gl_FragColor = vec4(vColor, alpha * 0.8);
  }
`;

function InteractivePoints() {
  const meshRef = useRef<any>(null);
  
  const count = 50000;
  
  const particles = useMemo(() => {
    const startPositions = new Float32Array(count * 3);
    const targetPositions = new Float32Array(count * 3);
    const targetColors = new Float32Array(count * 3);

    const defaultColor = new THREE.Color(0x78f5d0); // Emerald/Teal
    const flowerColor = new THREE.Color(0xff2a5f); // Vibrant Pink/Red
    const flowerColor2 = new THREE.Color(0xffb3c6); // Light Pink

    for (let i = 0; i < count; i++) {
        targetColors[i * 3] = defaultColor.r;
        targetColors[i * 3 + 1] = defaultColor.g;
        targetColors[i * 3 + 2] = defaultColor.b;
    }

    const getWireframeLimbPoint = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, r: number) => {
        const numLines = 6;
        const lineIndex = Math.floor(Math.random() * numLines);
        const theta = (lineIndex / numLines) * Math.PI * 2;
        
        const t = Math.random();
        const cx = x1 + (x2 - x1) * t;
        const cy = y1 + (y2 - y1) * t;
        const cz = z1 + (z2 - z1) * t;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const dz = z2 - z1;
        
        const dir = new THREE.Vector3(dx, dy, dz).normalize();
        let up = new THREE.Vector3(0, 1, 0);
        if (Math.abs(dir.y) > 0.9) up = new THREE.Vector3(1, 0, 0);
        
        const right = new THREE.Vector3().crossVectors(dir, up).normalize();
        const up2 = new THREE.Vector3().crossVectors(right, dir).normalize();

        const twist = t * Math.PI; 
        const px = cx + r * (Math.cos(theta + twist) * right.x + Math.sin(theta + twist) * up2.x);
        const py = cy + r * (Math.cos(theta + twist) * right.y + Math.sin(theta + twist) * up2.y);
        const pz = cz + r * (Math.cos(theta + twist) * right.z + Math.sin(theta + twist) * up2.z);

        return { x: px, y: py, z: pz };
    }

    const generateHuman = (
        offsetX: number, 
        heightScale: number, 
        isWoman: boolean, 
        pose: 'giving' | 'receiving' | 'holding_hands_left' | 'holding_hands_right',
        startIndex: number,
        humanCount: number
    ) => {
        const shoulderY = 1.45 * heightScale;
        const hipY = 0.9 * heightScale;
        const kneeY = 0.45 * heightScale;
        const footY = 0.0;
        const shoulderWidth = (isWoman ? 0.35 : 0.45) * heightScale;
        const hipWidth = (isWoman ? 0.4 : 0.35) * heightScale;

        const headR = 0.18 * heightScale;
        const limbR = 0.1 * heightScale;

        for (let i = 0; i < humanCount; i++) {
            const idx = startIndex + i;
            if (idx >= count) break;
            const rand = Math.random();
            let p = { x: 0, y: 0, z: 0 };

            if (rand < 0.35) {
                const isSurface = Math.random() > 0.3;
                const rad = isSurface ? headR : headR * Math.cbrt(Math.random());
                
                const phi = Math.acos(2 * Math.random() - 1);
                const theta = Math.random() * Math.PI * 2;
                
                p.x = offsetX + rad * Math.sin(phi) * Math.cos(theta);
                p.y = (shoulderY + 0.3 * heightScale) + rad * Math.sin(phi) * Math.sin(theta);
                p.z = rad * Math.cos(phi);
                
                if (Math.random() > 0.5 && p.z > 0) {
                    const faceRad = headR * 0.9;
                    const facePhi = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
                    const faceTheta = (Math.random() - 0.5) * 0.8;
                    p.x = offsetX + faceRad * Math.sin(facePhi) * Math.cos(faceTheta);
                    p.y = (shoulderY + 0.3 * heightScale) + faceRad * Math.cos(facePhi);
                    p.z = faceRad * Math.sin(facePhi) * Math.sin(faceTheta) + headR * 0.5;
                }
            } else if (rand < 0.55) {
                const t = Math.random();
                const widthAtT = shoulderWidth * (1-t) + hipWidth * t;
                const y = shoulderY * (1-t) + hipY * t;
                
                const numLines = 8;
                const lineIndex = Math.floor(Math.random() * numLines);
                const angle = (lineIndex / numLines) * Math.PI * 2 + (t * Math.PI * 0.5);
                
                const r = (widthAtT / 2);
                p.x = offsetX + r * Math.cos(angle);
                p.y = y;
                p.z = r * Math.sin(angle) * 0.8;
                
                if (isWoman && t > 0.4) {
                    const dressR = (widthAtT/2) * (1 + (t-0.4)*2.5);
                    p.x = offsetX + dressR * Math.cos(angle);
                    p.z = dressR * Math.sin(angle) * 0.8;
                }
            } else if (rand < 0.75) {
                const isLeft = Math.random() > 0.5;
                const hipX = isLeft ? -hipWidth/3 : hipWidth/3;
                if (Math.random() > 0.5) {
                    p = getWireframeLimbPoint(offsetX + hipX, hipY, 0, offsetX + hipX, kneeY, 0, limbR);
                } else {
                    p = getWireframeLimbPoint(offsetX + hipX, kneeY, 0, offsetX + hipX, footY, 0, limbR * 0.8);
                }
            } else {
                const isLeft = Math.random() > 0.5;
                const shoulderX = isLeft ? -shoulderWidth/2 : shoulderWidth/2;
                let elbowX = shoulderX * 1.2;
                let elbowY = shoulderY - 0.35 * heightScale;
                let elbowZ = 0;
                let handX = elbowX;
                let handY = elbowY - 0.35 * heightScale;
                let handZ = 0;

                if (pose === 'giving' && !isLeft) {
                    elbowX = shoulderWidth/2 + 0.2;
                    elbowY = shoulderY - 0.1;
                    handX = shoulderWidth/2 + 0.8;
                    handY = shoulderY + 0.1;
                    handZ = 0.2;
                } else if (pose === 'receiving' && isLeft) {
                    elbowX = -shoulderWidth/2 - 0.2;
                    elbowY = shoulderY - 0.1;
                    handX = -shoulderWidth/2 - 0.8;
                    handY = shoulderY + 0.1;
                    handZ = 0.2;
                } else if (pose === 'holding_hands_left' && !isLeft) {
                    elbowX = shoulderWidth/2 + 0.3;
                    elbowY = shoulderY - 0.2;
                    handX = shoulderWidth/2 + 0.6;
                    handY = shoulderY - 0.4;
                    handZ = 0.3;
                } else if (pose === 'holding_hands_right' && isLeft) {
                    elbowX = -shoulderWidth/2 - 0.3;
                    elbowY = shoulderY - 0.2;
                    handX = -shoulderWidth/2 - 0.6;
                    handY = shoulderY - 0.4;
                    handZ = 0.3;
                }

                if (Math.random() > 0.5) {
                    p = getWireframeLimbPoint(offsetX + shoulderX, shoulderY, 0, offsetX + elbowX, elbowY, elbowZ, limbR);
                } else {
                    p = getWireframeLimbPoint(offsetX + elbowX, elbowY, elbowZ, offsetX + handX, handY, handZ, limbR * 0.8);
                }
            }

            targetPositions[idx * 3] = p.x;
            targetPositions[idx * 3 + 1] = p.y - 1.0; // Shift down slightly
            targetPositions[idx * 3 + 2] = p.z;
        }
    }

    const half = Math.floor(count / 2);
    // Position the couple on the right side
    generateHuman(1.5, 1.15, false, 'giving', 0, half);
    generateHuman(3.5, 1.05, true, 'receiving', half, count - half);

    // Glowing Flower
    const flowerCount = 3000;
    const flowerStart = half - flowerCount / 2;
    
    for (let i = 0; i < flowerCount; i++) {
        const idx = Math.floor(flowerStart + i);
        if (idx < 0 || idx >= count) continue;

        const t = Math.random() * Math.PI * 2;
        const p = Math.random() * Math.PI;
        const r = 0.4 * Math.sin(4 * t) * Math.sin(p); 
        
        const dx = (Math.random() - 0.5) * 0.1;
        const dy = (Math.random() - 0.5) * 0.1;
        const dz = (Math.random() - 0.5) * 0.1;

        targetPositions[idx * 3] = 2.5 + r * Math.cos(t) + dx;
        targetPositions[idx * 3 + 1] = 1.45 + r * Math.sin(t) + dy - 1.0;
        targetPositions[idx * 3 + 2] = 0.4 + r * Math.cos(p) + dz;

        const c = Math.random() > 0.5 ? flowerColor : flowerColor2;
        targetColors[idx * 3] = c.r;
        targetColors[idx * 3 + 1] = c.g;
        targetColors[idx * 3 + 2] = c.b;
    }

    for (let i = 0; i < count; i++) {
      // Начало: Хаос (вокруг сцены)
      startPositions[i * 3] = (Math.random() - 0.5) * 20;
      startPositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      startPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }

    return { startPositions, targetPositions, targetColors };
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) }
  }), []);

  useFrame((state) => {
    const { clock, mouse } = state;
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
      meshRef.current.material.uniforms.uMouse.value = mouse;
      
      // Анимация "схлопывания" при загрузке (от 0 до 1 за 2 секунды)
      if (meshRef.current.material.uniforms.uProgress.value < 1) {
        meshRef.current.material.uniforms.uProgress.value += 0.01;
      }
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          count={count} 
          array={particles.startPositions} 
          itemSize={3} 
        />
        <bufferAttribute 
          attach="attributes-targetPosition" 
          count={count} 
          array={particles.targetPositions} 
          itemSize={3} 
        />
        <bufferAttribute 
          attach="attributes-targetColor" 
          count={count} 
          array={particles.targetColors} 
          itemSize={3} 
        />
      </bufferGeometry>
      <shaderMaterial 
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export function ParticleGathering() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas camera={{ position: [0, 0, 8] }}>
        <InteractivePoints />
      </Canvas>
    </div>
  );
}
