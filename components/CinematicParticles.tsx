import { useEffect, useRef, useState } from "react"
import * as THREE from "three"

export default function CinematicParticles() {
  const mount = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      if (!mount.current) return

      const width = mount.current.clientWidth || window.innerWidth
      const height = mount.current.clientHeight || window.innerHeight

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x000000, 0.0015); // Черный туман для слияния с экраном

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 2000)
    camera.position.set(0, 15, 110)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    })

    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.toneMapping = THREE.ReinhardToneMapping

    mount.current.appendChild(renderer.domElement)

    // ИДЕАЛЬНО КРУГЛАЯ ТЕКСТУРА С ПУЛЬСАЦИЕЙ (Glow)
    function createGlowTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const context = canvas.getContext('2d');
      if (context) {
        const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.2, 'rgba(255,255,255,1)'); // Более жесткое белое ядро для четкости
        gradient.addColorStop(0.4, 'rgba(255,255,255,0.8)'); // Плотное свечение
        gradient.addColorStop(0.6, 'rgba(255,255,255,0.3)'); // Мягкий шлейф
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 128, 128);
      }
      return new THREE.CanvasTexture(canvas);
    }

    const texture = createGlowTexture()

    // --- ФОНОВЫЕ ЧАСТИЦЫ ---
    const AMBIENT_COUNT = 3000;
    const ambientGeometry = new THREE.BufferGeometry();
    const ambientPositions = new Float32Array(AMBIENT_COUNT * 3);
    const ambientColors = new Float32Array(AMBIENT_COUNT * 3);
    const ambientPhases = new Float32Array(AMBIENT_COUNT);

    for(let i = 0; i < AMBIENT_COUNT; i++) {
        const r = 60 + Math.random() * 150;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        
        ambientPositions[i*3] = r * Math.sin(phi) * Math.cos(theta);
        ambientPositions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        ambientPositions[i*3+2] = r * Math.cos(phi);

        const color = new THREE.Color(Math.random() > 0.5 ? 0x10b981 : 0x00d4ff);
        color.multiplyScalar(0.4);
        ambientColors[i*3] = color.r;
        ambientColors[i*3+1] = color.g;
        ambientColors[i*3+2] = color.b;

        ambientPhases[i] = Math.random() * Math.PI * 2;
    }

    ambientGeometry.setAttribute('position', new THREE.BufferAttribute(ambientPositions, 3));
    ambientGeometry.setAttribute('color', new THREE.BufferAttribute(ambientColors, 3));
    ambientGeometry.setAttribute('phase', new THREE.BufferAttribute(ambientPhases, 1));

    const ambientMaterial = new THREE.PointsMaterial({
        map: texture,
        size: 3.0,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending, // Аддитивное смешивание для эффекта магии ИИ
        opacity: 0.6,
        vertexColors: true
    });

    const ambientParticles = new THREE.Points(ambientGeometry, ambientMaterial);
    scene.add(ambientParticles);


    // --- ОСНОВНЫЕ ЧАСТИЦЫ ---
    const FLOWER_COUNT = 15000; // Больше частиц для реалистичности
    const flowerMaterial = new THREE.PointsMaterial({
      map: texture,
      size: 1.8,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending, // Перекрывание дает яркий свет "любви" и энергии
      opacity: 1.0,
      vertexColors: true
    })

    const flowerGeometry = new THREE.BufferGeometry()
    const positions = new Float32Array(FLOWER_COUNT * 3)
    
    const sourceTargets = new Float32Array(FLOWER_COUNT * 3)
    const destTargets = new Float32Array(FLOWER_COUNT * 3)
    const sourceColors = new Float32Array(FLOWER_COUNT * 3)
    const destColors = new Float32Array(FLOWER_COUNT * 3)

    // Вспомогательная функция для центрирования любых фигур точно по центру
    function centerTargets(targets: Float32Array) {
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      let minZ = Infinity, maxZ = -Infinity;

      for (let i = 0; i < FLOWER_COUNT; i++) {
        const x = targets[i * 3];
        const y = targets[i * 3 + 1];
        const z = targets[i * 3 + 2];
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
        if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
      }

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const centerZ = (minZ + maxZ) / 2;

      for (let i = 0; i < FLOWER_COUNT; i++) {
        targets[i * 3] -= centerX;
        targets[i * 3 + 1] -= centerY;
        targets[i * 3 + 2] -= centerZ;
      }
    }

    // 1. ИИ-ЯДРО (Нейросеть рождает жизнь)
    function createAINeuralCore(targets: Float32Array, colors: Float32Array) {
      for (let i = 0; i < FLOWER_COUNT; i++) {
        // Равномерное распределение по сфере (сфера Фибоначчи)
        const phi = Math.acos(-1 + (2 * i) / FLOWER_COUNT);
        const theta = Math.sqrt(FLOWER_COUNT * Math.PI) * phi;
        
        // Органические пульсации для нейросети
        const noise = Math.sin(phi * 8) * Math.cos(theta * 8) * 3;
        const r = 26 + noise; 

        targets[i * 3] = r * Math.cos(theta) * Math.sin(phi);
        targets[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
        targets[i * 3 + 2] = r * Math.cos(phi);

        // Изумрудно-голубой цвет "разума" и технологий
        const aiTeal = new THREE.Color(0x00ffcc);
        const aiBlue = new THREE.Color(0x0066ff);
        const mixedColor = aiTeal.lerp(aiBlue, Math.pow(Math.sin(phi+theta), 2));
        
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
      }
      centerTargets(targets);
    }

    // 2. АНГЕЛ И КУПИДОН (Сердце с крыльями и утонченной стрелой)
    function createAngelCupidStrike(targets: Float32Array, colors: Float32Array) {
      const isMobile = window.innerWidth < 768;
      const baseScale = isMobile ? 0.6 : 1.0; // Адаптация для мобилок
      const heartCount = 3500;
      const wingCount = 2000;
      const arrowCount = 1500; // Немного частиц для стрелы
      const particleTotal = heartCount + wingCount + arrowCount;

      for (let i = 0; i < FLOWER_COUNT; i++) {
        let x = 0, y = 0, z = 0, r = 1, g = 1, b = 1;

        if (i < heartCount) {
          // КРАСИВОЕ СЕРДЦЕ АНГЕЛА (В центре)
          const t = Math.random() * Math.PI * 2;
          const shell = Math.pow(Math.random(), 0.8);
          // Делаем сердце немного меньше, чтобы освободить место для крыльев
          const scale = (0.7 + shell * 0.3) * baseScale;
          
          x = 14 * Math.pow(Math.sin(t), 3) * scale;
          y = (11 * Math.cos(t) - 4 * Math.cos(2 * t) - 1.5 * Math.cos(3 * t) - Math.cos(4 * t)) * scale;
          z = (Math.random() - 0.5) * 6 * (1 - shell);
          
          const loveEdge = new THREE.Color(0xff2d55);
          const loveCore = new THREE.Color(0xcc0033);
          const c = loveCore.lerp(loveEdge, shell);
          r = c.r; g = c.g; b = c.b;

        } else if (i < heartCount + wingCount) {
          // КРЫЛЬЯ АНГЕЛА (Обернутые вокруг сердца)
          const idx = i - heartCount;
          const isRightWing = idx % 2 === 0;
          
          const u = Math.random(); // Вдоль крыла (от основания к краю)
          const v = Math.random(); // Поперек крыла
          
          const side = isRightWing ? 1 : -1;
          
          // Размах и форма
          const wingX = (10 + u * 20) * baseScale; // Длина
          const wingY = (15 * (1 - Math.pow(u, 2)) + v * 8) * baseScale; // Изгиб вверх
          
          x = (wingX * side);
          y = (Math.random() * 5 + u * 15) * baseScale - (15 * baseScale);
          z = (-8 - u * 5 + v * 3) * baseScale; // Завернуто чуть назад
          
          // Небольшой шум на краях (перья)
          x += (Math.random() - 0.5) * 2;
          y += (Math.random() - 0.5) * 3;
          z += (Math.random() - 0.5) * 1.5;

          const featherLight = new THREE.Color(0xffffff);
          const featherGlow = new THREE.Color(0xdceeff);
          const c = featherGlow.lerp(featherLight, Math.random());
          r = c.r; g = c.g; b = c.b;

        } else {
          // ИЗЯЩНАЯ СТРЕЛА КУПИДОНА (Очень Маленькая и Тонкая!)
          const idx = i - (heartCount + wingCount);
          // Длина стрелы уменьшена!
          const arrowLength = 22 * baseScale; 
          const t = (idx / arrowCount) - 0.5; // от -0.5 до 0.5
          
          // Наклон стрелы (диагонально пронзает сердце)
          const angle = Math.PI / 6; // 30 градусов
          
          x = t * arrowLength * Math.cos(angle);
          y = t * arrowLength * Math.sin(angle);
          z = t * arrowLength * 0.5; // слегка под углом к зрителю
          
          // Очень тонкое тело
          x += (Math.random() - 0.5) * 0.4 * baseScale;
          y += (Math.random() - 0.5) * 0.4 * baseScale;
          z += (Math.random() - 0.5) * 0.4 * baseScale;

          // Наконечник стрелы (если частица ближе к переднему концу)
          if (t > 0.45) {
             const tipSize = (0.5 - t) * 20 * baseScale; // Маленький наконечник
             x += (Math.random() - 0.5) * tipSize;
             y += (Math.random() - 0.5) * tipSize;
          }
           // Оперение (если частица ближе к заднему концу)
          if (t < -0.45) {
             const featherSize = (t + 0.5) * 30 * baseScale; // Компактные перья
             x += (Math.random() - 0.5) * featherSize;
             y += (Math.random() - 0.5) * featherSize;
          }
          
          const goldEdge = new THREE.Color(0xffcc00);
          const goldCore = new THREE.Color(0xfffacd);
          const c = goldCore.lerp(goldEdge, Math.random());
          r = c.r; g = c.g; b = c.b;
        }

        targets[i * 3] = x;
        targets[i * 3 + 1] = y;
        targets[i * 3 + 2] = z;
        colors[i * 3] = r;
        colors[i * 3 + 1] = g;
        colors[i * 3 + 2] = b;
      }
      
      // Сдвинем всю композицию чуть выше для мобилок 
      // чтобы она не перекрывалась кнопками
      if (isMobile) {
        for(let i=0; i<FLOWER_COUNT; i++) {
           targets[i*3 + 1] += 10;
        }
      }
      
      centerTargets(targets);
    }

    // 3. СОВЕРШЕННЫЙ ЛОТОС (Гармония Природы и Данных)
    function createPerfectLotus(targets: Float32Array, colors: Float32Array) {
      for (let i = 0; i < FLOWER_COUNT; i++) {
        const theta = i * 137.508 * (Math.PI / 180); // Золотое сечение природы
        const r = Math.pow(i, 0.55) * 0.5; // Логарифмическая спираль
        
        // Органическая форма лепестков
        const numPetals = 8;
        const petalPhase = Math.cos(theta * numPetals / 2);
        const petalShape = Math.pow(Math.abs(petalPhase), 0.5);
        const fold = Math.sin(r * 0.6) * 1.5;
        
        const finalR = r * (0.35 + 0.65 * petalShape);
        const y = (r * r) * 0.015 - 12 + fold + Math.pow(Math.max(0, 10 - r), 1.5) * 0.2; 

        targets[i * 3] = Math.cos(theta) * finalR;
        targets[i * 3 + 1] = y;
        targets[i * 3 + 2] = Math.sin(theta) * finalR;

        // Золото + Перламутрово-розовый
        const coreColor = new THREE.Color(0xffd700); 
        const petalColor = new THREE.Color(0xfff0f5); 
        const edgeColor = new THREE.Color(0xff1493); 
        
        let mixedColor = petalColor.clone();
        if (r < 15) {
            mixedColor = coreColor.lerp(petalColor, r/15);
        } else {
            mixedColor = petalColor.lerp(edgeColor, Math.pow((r-15)/45, 2));
        }

        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
      }
      centerTargets(targets);
    }

    // 4. ЦИФРОВАЯ РОЗА (Потенциал ИИ-флориста)
    function createDigitalRose(targets: Float32Array, colors: Float32Array) {
      for (let i = 0; i < FLOWER_COUNT; i++) {
        // Усложненная спираль Ферма для лепестков розы
        const theta = i * 137.508 * (Math.PI / 180);
        const r = Math.pow(i, 0.5) * 0.45;
        
        const layerBias = Math.sin(r * 0.8) * 3;
        const petalWave = Math.sin(theta * 5 + r * 0.1) * (r * 0.15);
        const finalR = r + petalWave;

        const y = (r * r) * 0.02 - 10 + layerBias;

        targets[i * 3] = Math.cos(theta) * finalR;
        targets[i * 3 + 1] = y;
        targets[i * 3 + 2] = Math.sin(theta) * finalR;

        // Фирменный Изумрудный соединяется с цветом живой розы
        const cyberEmerald = new THREE.Color(0x059669); 
        const lushRose = new THREE.Color(0xf43f5e); 
        
        const mixRatio = (Math.sin(theta * 2 - r * 0.2) + 1) / 2;
        const mixedColor = cyberEmerald.lerp(lushRose, mixRatio);
        
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
      }
      centerTargets(targets);
    }

    // 5. ВЕЛИЧЕСТВЕННЫЙ ПОДСОЛНУХ (Энергия солнца и радости)
    function createSunflower(targets: Float32Array, colors: Float32Array) {
      for (let i = 0; i < FLOWER_COUNT; i++) {
        const theta = i * 137.508 * (Math.PI / 180); // Спираль Фибоначчи
        const r = Math.pow(i, 0.5) * 0.5;

        let finalR = r;
        let y = 0;
        
        // Разделяем на сердцевину и лепестки
        if (r < 18) {
            // Сердцевина (плотная)
            y = Math.sin(r * 0.5) * 1.5 - 5;
        } else {
            // Лепестки
            const numPetals = 34; // Число Фибоначчи
            const petalPhase = Math.cos(theta * numPetals / 2);
            const petalShape = Math.pow(Math.abs(petalPhase), 0.3); // Широкие лепестки
            finalR = r * (0.6 + 0.4 * petalShape) + 5;
            y = Math.sin(r * 0.2) * 5 - 10 + Math.sin(theta * 5) * 2; // Изгиб лепестков вниз
        }

        targets[i * 3] = Math.cos(theta) * finalR;
        targets[i * 3 + 1] = y;
        targets[i * 3 + 2] = Math.sin(theta) * finalR;

        // Яркий желто-оранжевый с темной сердцевиной
        const darkCore = new THREE.Color(0x3e1f04); 
        const lightCore = new THREE.Color(0x8b4513);
        const petalYellow = new THREE.Color(0xffd700);
        const petalOrange = new THREE.Color(0xff8c00);
        
        let mixedColor = new THREE.Color();
        if (r < 18) {
            mixedColor = darkCore.lerp(lightCore, r/18);
        } else {
            mixedColor = petalYellow.lerp(petalOrange, Math.random() * 0.5);
        }

        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
      }
      centerTargets(targets);
    }

    // 6. НЕЖНАЯ САКУРА (Мимолетная красота)
    function createSakura(targets: Float32Array, colors: Float32Array) {
      for (let i = 0; i < FLOWER_COUNT; i++) {
        const theta = i * 137.508 * (Math.PI / 180);
        const r = Math.pow(i, 0.5) * 0.4;
        
        const numPetals = 5; // 5 лепестков сакуры
        // Характерный разрез на лепестке сакуры
        let petalShape = Math.abs(Math.sin((theta * numPetals) / 2));
        petalShape = Math.pow(petalShape, 0.6); // Округление
        
        // Разрез на конце
        const angleInPetal = (theta * numPetals / 2) % Math.PI;
        if (Math.abs(angleInPetal - Math.PI/2) < 0.2 && r > 10) {
            petalShape -= 0.3 * (r / 20); 
        }

        const finalR = r * petalShape * 1.5;
        const y = Math.sin(r * 0.3) * 3 - 5 + Math.random() * 0.5; // Слегка чашевидная

        targets[i * 3] = Math.cos(theta) * finalR;
        targets[i * 3 + 1] = y;
        targets[i * 3 + 2] = Math.sin(theta) * finalR;

        // Нежно-розовый градиент
        const darkPink = new THREE.Color(0xff1493); // Ядра
        const softPink = new THREE.Color(0xffb7c5); // Цвет сакуры
        const whitePink = new THREE.Color(0xfff0f5); 
        
        let mixedColor = new THREE.Color();
        if (r < 8) {
            mixedColor = darkPink.lerp(softPink, r/8);
        } else {
            mixedColor = softPink.lerp(whitePink, (r-8)/20);
        }

        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
      }
      centerTargets(targets);
    }

    // 7. ЗАГАДОЧНАЯ ОРХИДЕЯ (Элегантность и сложная форма)
    function createOrchid(targets: Float32Array, colors: Float32Array) {
      for (let i = 0; i < FLOWER_COUNT; i++) {
        const t = (i / FLOWER_COUNT) * Math.PI * 2 * 10; // Спиральный обход
        const r = Math.pow(i, 0.5) * 0.35;
        
        // Орхидея имеет сложную форму: губа (особый нижний лепесток) и 5 других лепестков
        const numPetals = 3;
        const petalPhase = Math.sin(t * numPetals);
        
        // Губа орхидеи (выделяется снизу)
        const isLip = (t % (Math.PI*2)) > Math.PI*1.2 && (t % (Math.PI*2)) < Math.PI*1.8;
        
        let finalR = r * (0.8 + 0.4 * Math.pow(Math.abs(petalPhase), 0.5));
        let x = Math.cos(t) * finalR;
        let z = Math.sin(t) * finalR;
        let y = Math.sin(r * 0.4) * 4 - 8;

        if (isLip) {
            y -= r * 0.5; // Вытягиваем губу вниз
            x *= 0.7; // Сжимаем по бокам
            z += r * 0.3; // Выдаем вперед
        }

        targets[i * 3] = x;
        targets[i * 3 + 1] = y;
        targets[i * 3 + 2] = z;

        // Пурпурный, фиолетовый и тигровые пятна (символически через шум)
        const magenta = new THREE.Color(0xff00ff);
        const deepPurple = new THREE.Color(0x4b0082);
        const white = new THREE.Color(0xffffff);
        
        let mixedColor = new THREE.Color();
        
        if (isLip) {
            mixedColor = magenta.lerp(deepPurple, Math.random());
            if (r > 10 && Math.random() > 0.8) mixedColor = white.clone(); // Пятнышки
        } else {
            mixedColor = white.lerp(magenta, r/25);
        }

        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
      }
      centerTargets(targets);
    }

    // Инициализация первой сцены
    createAINeuralCore(destTargets, destColors);

    for (let i = 0; i < FLOWER_COUNT; i++) {
      positions[i * 3] = destTargets[i * 3];
      positions[i * 3 + 1] = destTargets[i * 3 + 1];
      positions[i * 3 + 2] = destTargets[i * 3 + 2];
      sourceTargets[i * 3] = destTargets[i * 3];
      sourceTargets[i * 3 + 1] = destTargets[i * 3 + 1];
      sourceTargets[i * 3 + 2] = destTargets[i * 3 + 2];
      sourceColors[i * 3] = destColors[i * 3];
      sourceColors[i * 3 + 1] = destColors[i * 3 + 1];
      sourceColors[i * 3 + 2] = destColors[i * 3 + 2];
    }

    flowerGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    flowerGeometry.setAttribute("color", new THREE.BufferAttribute(destColors.slice(), 3));

    const flowerParticles = new THREE.Points(flowerGeometry, flowerMaterial);
    scene.add(flowerParticles);

    // ЦИКЛ СЦЕН: Нейросеть -> Ангельское Сердце -> Лотос -> Цифровая Роза
    const scenes = [createAINeuralCore, createAngelCupidStrike, createPerfectLotus, createDigitalRose];
    let index = 0;

    // СТЕЙТ-МАШИНА ДЛЯ ОЧЕНЬ ПЛАВНЫХ ПЕРЕХОДОВ
    let transitionState = 'IDLE'; 
    let transitionTimer = 0;
    
    // Интерактив мыши
    const mouse = new THREE.Vector2(-9999, -9999);
    const targetMouse = new THREE.Vector2(-9999, -9999);
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    const onMouseMove = (event: MouseEvent) => {
      targetMouse.x = (event.clientX - windowHalfX);
      targetMouse.y = (event.clientY - windowHalfY);
    };
    window.addEventListener('mousemove', onMouseMove);
    
    // ПЕРЕХОД ДЛИТСЯ 18 СЕКУНД (очень плавно, без взрывов)
    const TRANSITION_DURATION = 18.0; 

    function nextScene() {
      index++;
      if (index >= scenes.length) index = 0;
      
      for (let i = 0; i < FLOWER_COUNT * 3; i++) {
          sourceTargets[i] = destTargets[i];
          sourceColors[i] = destColors[i];
      }
      
      scenes[index](destTargets, destColors);
      
      transitionState = 'TRANSITION';
      transitionTimer = 0;
    }

    // Меняем сцену каждые 30 секунд
    const intervalId = setInterval(nextScene, 30000)

    let animationFrameId: number;
    let time = 0;
    let lastTime = Date.now();

    function lerp(start: number, end: number, t: number) {
        return start * (1 - t) + end * t;
    }

    function animate() {
      animationFrameId = requestAnimationFrame(animate)
      const now = Date.now();
      const dt = (now - lastTime) / 1000; 
      lastTime = now;
      time += dt;

      const pos = flowerGeometry.attributes.position.array as Float32Array
      const col = flowerGeometry.attributes.color.array as Float32Array
      
      // Плавное следование мыши
      mouse.x += (targetMouse.x - mouse.x) * 0.05;
      mouse.y += (targetMouse.y - mouse.y) * 0.05;
      
      // Примерное проецирование мыши в 3D пространство частичек (камера на Z: 80 - 110)
      const mouse3DX = (mouse.x / windowHalfX) * 55;
      const mouse3DY = -(mouse.y / windowHalfY) * 35;
      
      if (transitionState === 'TRANSITION') {
          transitionTimer += dt;
          let progress = transitionTimer / TRANSITION_DURATION;
          
          if (progress >= 1.0) {
              progress = 1.0;
              transitionState = 'IDLE';
          }

          // Очень плавная и размеренная кривая
          let easeT = progress;
          // Плавное ускорение в начале, мягкое замедление к концу. Sine-in-out.
          easeT = -(Math.cos(Math.PI * progress) - 1) / 2;
          
          // Мягкая дуга для легкого органичного движения (почти без разлета в стороны)
          const arc = Math.sin(progress * Math.PI) * 0.3; 

          for (let i = 0; i < FLOWER_COUNT; i++) {
              const i3 = i * 3;
              
              const bx = lerp(sourceTargets[i3], destTargets[i3], easeT);
              const by = lerp(sourceTargets[i3+1], destTargets[i3+1], easeT);
              const bz = lerp(sourceTargets[i3+2], destTargets[i3+2], easeT);

              // Мягкое разбегание от мыши (Интерактив)
              const dx = pos[i3] - mouse3DX;
              const dy = pos[i3+1] - mouse3DY;
              const distSq = dx*dx + dy*dy;
              let repX = 0, repY = 0, repZ = 0;
              if (distSq < 144) { // Радиус отталкивания 12
                  const force = (144 - distSq) / 144;
                  const dist = Math.sqrt(distSq) || 0.1;
                  repX = (dx / dist) * force * 3;
                  repY = (dy / dist) * force * 3;
                  repZ = force * 5;
              }

              // ОЧЕНЬ мягкий шум, просто чтобы частицы не летели по прямой линии
              const noiseX = Math.sin(i * 0.05 + progress * 5 + time) * 3 * arc; 
              const noiseY = Math.cos(i * 0.07 + progress * 4 + time) * 3 * arc;
              const noiseZ = Math.sin(i * 0.09 + progress * 6 + time) * 3 * arc;

              // Легкое закручивание всей фигуры
              const angle = progress * Math.PI * 0.2 * arc; 
              const rx = bx * Math.cos(angle) - bz * Math.sin(angle);
              const rz = bx * Math.sin(angle) + bz * Math.cos(angle);

              pos[i3] = rx + noiseX + repX;
              pos[i3+1] = by + noiseY + repY;
              pos[i3+2] = rz + noiseZ + repZ;

              col[i3] = lerp(sourceColors[i3], destColors[i3], easeT);
              col[i3+1] = lerp(sourceColors[i3+1], destColors[i3+1], easeT);
              col[i3+2] = lerp(sourceColors[i3+2], destColors[i3+2], easeT);
          }
      } else {
          // IDLE (Стабильно, без пульсации)
          const breath = 1.0; 

          for (let i = 0; i < FLOWER_COUNT; i++) {
              const i3 = i * 3;

              // Мягкое отталкивание от мыши (ИИ реагирует на ваши прикосновения плавно)
              const dx = pos[i3] - mouse3DX;
              const dy = pos[i3+1] - mouse3DY;
              const distSq = dx*dx + dy*dy;
              let repX = 0, repY = 0, repZ = 0;
              if (distSq < 144) { // Радиус
                  const force = (144 - distSq) / 144;
                  const dist = Math.sqrt(distSq) || 0.1;
                  repX = (dx / dist) * force * 3;
                  repY = (dy / dist) * force * 3;
                  repZ = force * 5;
              }

              // Индивидуальные органичные колебания (без хаотичных прыжков)
              const localPhase = i * 0.05;
              const driftX = Math.sin(time * 2.2 + localPhase) * 1.0;
              const driftY = Math.cos(time * 1.8 + localPhase) * 1.0;
              const driftZ = Math.sin(time * 2.0 + localPhase) * 1.0;
              
              // Возврат к пульсирующей базовой точке
              const tx = destTargets[i3] * breath + repX;
              const ty = destTargets[i3+1] * breath + repY;
              const tz = destTargets[i3+2] * breath + repZ;
              
              pos[i3] += (tx + driftX - pos[i3]) * 0.08;
              pos[i3+1] += (ty + driftY - pos[i3+1]) * 0.08;
              pos[i3+2] += (tz + driftZ - pos[i3+2]) * 0.08;
          }
      }

      flowerGeometry.attributes.position.needsUpdate = true
      flowerGeometry.attributes.color.needsUpdate = true
      
      // Заменяем полное круговое вращение на изящное покачивание (оставляем объекты всегда лицом)
      flowerParticles.rotation.y = Math.sin(time * 0.05) * 0.15;

      // 2. Анимация фоновых частиц
      ambientParticles.rotation.y = time * 0.05;
      ambientParticles.rotation.x = Math.sin(time * 0.05) * 0.1;
      
      const ambPos = ambientGeometry.attributes.position.array as Float32Array;
      const ambPhases = ambientGeometry.attributes.phase.array as Float32Array;
      
      for(let i=0; i < AMBIENT_COUNT; i++) {
          ambPos[i * 3 + 1] += Math.sin(time * 2 + ambPhases[i]) * 0.05;
      }
      ambientGeometry.attributes.position.needsUpdate = true;

      // 3. Плавная ОГРАНИЧЕННАЯ орбитальная камера
      const aspect = window.innerWidth / window.innerHeight;
      const aspectScale = aspect < 1 ? (1 / aspect) * 0.95 : 1; 
      const baseDist = 85 * aspectScale; // Динамически отодвигаем камеру на мобилках
      const camAngle = Math.sin(time * 0.12) * (Math.PI / 4.5); // Панорама только спереди (±40 градусов)
      camera.position.x = Math.sin(camAngle) * baseDist; 
      camera.position.z = Math.cos(camAngle) * baseDist;
      camera.position.y = (aspect < 1 ? 16 : 12) + Math.sin(time * 0.1) * 8;
      camera.lookAt(0, 3, 0);

      renderer.render(scene, camera)
    }

    animate()

    function handleResize() {
      if (!mount.current) return
      const w = mount.current.clientWidth
      const h = mount.current.clientHeight
      windowHalfX = window.innerWidth / 2;
      windowHalfY = window.innerHeight / 2;

      camera.aspect = w / h
      camera.updateProjectionMatrix()

      renderer.setSize(w, h)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", onMouseMove)
      clearInterval(intervalId)
      cancelAnimationFrame(animationFrameId)
      if (mount.current && renderer.domElement) {
        try { mount.current.removeChild(renderer.domElement) } catch(e) {}
      }
      flowerGeometry.dispose()
      flowerMaterial.dispose()
      ambientGeometry.dispose()
      ambientMaterial.dispose()
      texture.dispose()
      renderer.dispose()
    }
    } catch (err: any) {
      console.error("CinematicParticles Error:", err);
      setError(err.message || String(err));
    }
  }, [])

  if (error) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black text-white p-4">
        <div className="bg-red-900/50 p-6 rounded-xl border border-red-500 max-w-2xl">
          <h2 className="text-xl font-bold mb-2 text-red-400">Particle System Error</h2>
          <pre className="text-sm overflow-auto whitespace-pre-wrap">{error}</pre>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={mount}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
