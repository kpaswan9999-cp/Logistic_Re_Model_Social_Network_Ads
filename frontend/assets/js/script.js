/**
 * SocialFlow Advanced Animation Engine
 * Features:
 *  - Interactive particle background with mouse repel + synapses
 *  - Intersection Observer scroll-reveals (slide-up, slide-right, pop)
 *  - Animated stat counters + bar fills
 *  - Ripple click effect on buttons
 *  - Glass card entrance animation
 */

// ── Three.js Celestial Animation ───────────────────────────────────────────────
class ParticleBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas || typeof THREE === 'undefined') return;
        
        this.init();
        this.animate = this.animate.bind(this);
        this.animate();
    }
    
    init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 25;

        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Core - Soft Glowing Yellow
        const coreGeo = new THREE.IcosahedronGeometry(4, 2);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xfce588, transparent: true, opacity: 0.9 });
        this.core = new THREE.Mesh(coreGeo, coreMat);
        this.scene.add(this.core);

        // Wireframe Shell
        const shellGeo = new THREE.IcosahedronGeometry(5, 2);
        const shellMat = new THREE.MeshBasicMaterial({ 
            color: 0xaaaaaa, 
            wireframe: true, 
            transparent: true, 
            opacity: 0.3 
        });
        this.shell = new THREE.Mesh(shellGeo, shellMat);
        this.scene.add(this.shell);

        // Orbital Ring 1
        const ringGeo1 = new THREE.TorusGeometry(8.5, 0.04, 16, 100);
        const ringMat1 = new THREE.MeshBasicMaterial({ color: 0xa89f68, transparent: true, opacity: 0.6 });
        this.ring1 = new THREE.Mesh(ringGeo1, ringMat1);
        this.ring1.rotation.x = Math.PI / 3;
        this.scene.add(this.ring1);

        // Orbital Ring 2
        const ringGeo2 = new THREE.TorusGeometry(12, 0.02, 16, 100);
        const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x666666, transparent: true, opacity: 0.4 });
        this.ring2 = new THREE.Mesh(ringGeo2, ringMat2);
        this.ring2.rotation.y = Math.PI / 4;
        this.ring2.rotation.x = Math.PI / 2.5;
        this.scene.add(this.ring2);

        // Background Particles
        const particlesGeo = new THREE.BufferGeometry();
        const particlesCount = 300;
        const posArray = new Float32Array(particlesCount * 3);
        const colorsArray = new Float32Array(particlesCount * 3);
        const scalesArray = new Float32Array(particlesCount);

        for (let i = 0; i < particlesCount * 3; i += 3) {
            posArray[i] = (Math.random() - 0.5) * 80;
            posArray[i+1] = (Math.random() - 0.5) * 80;
            posArray[i+2] = (Math.random() - 0.5) * 80;

            const colorTheme = Math.random();
            if (colorTheme > 0.8) {
                // Orange/Brownish star
                colorsArray[i] = 0.8; colorsArray[i+1] = 0.5; colorsArray[i+2] = 0.1;
                scalesArray[i/3] = 1.2;
            } else if (colorTheme > 0.4) {
                // Bright white
                colorsArray[i] = 0.9; colorsArray[i+1] = 0.9; colorsArray[i+2] = 0.9;
                scalesArray[i/3] = 0.8;
            } else {
                // Dim gray
                colorsArray[i] = 0.5; colorsArray[i+1] = 0.5; colorsArray[i+2] = 0.5;
                scalesArray[i/3] = 0.5;
            }
        }
        particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        particlesGeo.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

        const particlesMat = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });

        this.particles = new THREE.Points(particlesGeo, particlesMat);

        // Neural Connections (Synapses)
        const linePositions = [];
        const lineColors = [];
        for (let i = 0; i < particlesCount; i++) {
            for (let j = i + 1; j < particlesCount; j++) {
                const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
                const jx = j * 3, jy = j * 3 + 1, jz = j * 3 + 2;
                const dx = posArray[ix] - posArray[jx];
                const dy = posArray[iy] - posArray[jy];
                const dz = posArray[iz] - posArray[jz];
                const distSq = dx * dx + dy * dy + dz * dz;

                if (distSq < 180) { // Distance threshold for connections
                    linePositions.push(
                        posArray[ix], posArray[iy], posArray[iz],
                        posArray[jx], posArray[jy], posArray[jz]
                    );
                    // Light blueish connectivity lines
                    lineColors.push(
                        0.2, 0.7, 0.9,
                        0.2, 0.7, 0.9
                    );
                }
            }
        }
        const linesGeo = new THREE.BufferGeometry();
        linesGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        linesGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
        
        const linesMat = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending
        });
        
        this.lines = new THREE.LineSegments(linesGeo, linesMat);

        // Group stars and lines
        this.starGroup = new THREE.Group();
        this.starGroup.add(this.particles);
        this.starGroup.add(this.lines);
        this.scene.add(this.starGroup);

        // Multiple Galaxies (Universes)
        this.galaxies = [];
        
        const createGalaxy = (count, radius, spin, xOffset, yOffset, zOffset, tiltX, tiltY, insideColor, outsideColor) => {
            const params = { count, size: 0.12, radius, branches: 4, spin, randomness: 1.5, randomnessPower: 3 };
            const geo = new THREE.BufferGeometry();
            const pos = new Float32Array(params.count * 3);
            const cols = new Float32Array(params.count * 3);
            const cIn = new THREE.Color(insideColor);
            const cOut = new THREE.Color(outsideColor);

            for (let i = 0; i < params.count; i++) {
                const i3 = i * 3;
                const r = Math.random() * params.radius;
                const spinAngle = r * params.spin;
                const branchAngle = (i % params.branches) / params.branches * Math.PI * 2;
                
                const randomX = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * r;
                const randomY = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * r * 0.3; // Platter shape
                const randomZ = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * r;
                
                pos[i3    ] = Math.cos(branchAngle + spinAngle) * r + randomX;
                pos[i3 + 1] = randomY;
                pos[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + randomZ;
                
                const mixedColor = cIn.clone();
                mixedColor.lerp(cOut, r / params.radius);
                
                cols[i3    ] = mixedColor.r;
                cols[i3 + 1] = mixedColor.g;
                cols[i3 + 2] = mixedColor.b;
            }

            geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));

            const mat = new THREE.PointsMaterial({
                size: params.size, sizeAttenuation: true, depthWrite: false,
                blending: THREE.AdditiveBlending, vertexColors: true, transparent: true, opacity: 0.6
            });

            const galaxy = new THREE.Points(geo, mat);
            galaxy.position.set(xOffset, yOffset, zOffset);
            galaxy.rotation.set(tiltX, tiltY, 0);
            return galaxy;
        };

        // 1. Main central galaxy (Cyan/Indigo)
        const g1 = createGalaxy(3500, 50, 1.5, 0, -8, 0, 0.5, 0, '#38bdf8', '#4f46e5');
        // 2. Distant pink/purple galaxy
        const g2 = createGalaxy(1500, 25, -2, -60, 30, -50, -0.4, 0.8, '#f472b6', '#c026d3');
        // 3. Distant yellowish/red galaxy
        const g3 = createGalaxy(2000, 35, 1.2, 50, -20, -70, 0.6, -0.5, '#fbbf24', '#e11d48');
        // 4. Far emerald galaxy
        const g4 = createGalaxy(1800, 30, 2.5, -40, -40, -80, 0.2, 0.3, '#34d399', '#064e3b');
        // 5. Far deep space distant core
        const g5 = createGalaxy(2500, 40, -1.8, 70, 40, -90, -0.6, 0.2, '#ffffff', '#1e3a8a');
        // 6. Lower floating neon orange
        const g6 = createGalaxy(1200, 20, 1.0, 20, 50, -60, 0.8, -0.2, '#fdba74', '#9a3412');
        // 7. Small far-left dwarf galaxy
        const g7 = createGalaxy(800, 15, -3, -80, -10, -100, -0.1, 0.9, '#a78bfa', '#4c1d95');

        this.galaxies.push(g1, g2, g3, g4, g5, g6, g7);
        // Store initial positions for floating animation
        this.galaxies.forEach(g => {
            g.userData.initialY = g.position.y;
            this.scene.add(g);
        });

        // Initialize clock for smooth time-based animations
        this.clock = new THREE.Clock();

        // Resize handler
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Mouse Move for Parallax
        this.mouseX = 0;
        this.mouseY = 0;
        document.addEventListener('mousemove', (event) => {
            this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        });
    }

    animate() {
        requestAnimationFrame(this.animate);
        const elapsedTime = this.clock.getElapsedTime();

        // Core Rotations & Breathing
        this.core.rotation.y += 0.003;
        this.core.rotation.x += 0.0015;
        const breathScale = 1 + Math.sin(elapsedTime * 2) * 0.04;
        this.core.scale.set(breathScale, breathScale, breathScale);

        this.shell.rotation.y -= 0.001;
        this.shell.rotation.z += 0.0015;

        this.ring1.rotation.z += 0.002;
        this.ring2.rotation.z -= 0.0015;

        this.starGroup.rotation.y -= 0.0003;
        this.starGroup.rotation.x += 0.0001;

        // Animate all Universes
        this.galaxies.forEach((g, idx) => {
            // Rotate the galaxies
            g.rotation.z -= 0.0005 * (idx % 2 === 0 ? 1 : -1);
            g.rotation.x += 0.0002 * (idx % 3 === 0 ? 1 : -1);
            
            // Cosmic bobbing/floating effect
            const offset = idx * 1.5; // Stagger the animation timing
            g.position.y = g.userData.initialY + Math.sin(elapsedTime * 0.4 + offset) * 3;
        });

        // Advanced Camera Parallax + Gentle Sweep
        const camParallaxX = (this.mouseX * 4 - this.camera.position.x) * 0.05;
        const camParallaxY = (this.mouseY * 4 - this.camera.position.y) * 0.05;
        
        this.camera.position.x += camParallaxX + Math.sin(elapsedTime * 0.2) * 0.03;
        this.camera.position.y += camParallaxY + Math.cos(elapsedTime * 0.3) * 0.03;
        
        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);
    }
}

// ── Scroll-Reveal Observer ────────────────────────────────────────────────────
function initScrollReveal() {
    const targets = document.querySelectorAll(
        '.anim-slide-up, .anim-slide-right, .anim-pop, .pipeline-step, .stat-card'
    );

    if (!targets.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');

                // Trigger stat bar fill
                const bar = entry.target.querySelector('.stat-bar-fill');
                if (bar) {
                    const targetWidth = bar.style.width; // already set inline
                    bar.style.width = '0';
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => { bar.style.width = targetWidth; });
                    });
                }
            }
        });

        // Pipeline progress bar fill
        const pipelineSteps = document.querySelectorAll('.pipeline-step');
        const progressFill = document.getElementById('pipelineProgress');
        const progressLabel = document.querySelector('.pipeline-progress-label');
        if (pipelineSteps.length && progressFill) {
            const inViewCount = document.querySelectorAll('.pipeline-step.in-view').length;
            const pct = (inViewCount / pipelineSteps.length) * 100;
            progressFill.style.width = pct + '%';
            if (pct === 100 && progressLabel) progressLabel.classList.add('visible');
        }
    }, { threshold: 0.2 });

    targets.forEach(el => observer.observe(el));
}

// ── Stat Counter Animation ────────────────────────────────────────────────────
function initStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    if (!statNumbers.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseInt(el.dataset.target, 10);
            const suffix = el.dataset.suffix || '';
            let start = 0;
            const duration = 1500;
            const step = target / (duration / 16);

            const tick = () => {
                start = Math.min(start + step, target);
                el.textContent = Math.floor(start) + suffix;
                if (start < target) requestAnimationFrame(tick);
                else el.textContent = target + suffix;
            };
            requestAnimationFrame(tick);
            observer.unobserve(el);
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => observer.observe(el));
}

// ── Card Entrance ─────────────────────────────────────────────────────────────
function initCardEntrance() {
    const cards = document.querySelectorAll('.page-container .glass-card');
    if (!cards.length) return;

    // Small delay so entrance feels deliberate
    setTimeout(() => {
        cards.forEach(card => card.classList.add('card-visible'));
    }, 150);
}

// ── Ripple Effect ─────────────────────────────────────────────────────────────
function initRipple() {
    document.querySelectorAll('.predict-btn, .cta-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${e.clientX - rect.left - size / 2}px;
                top: ${e.clientY - rect.top - size / 2}px;
            `;
            this.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove());
        });
    });
}

// ── Form Submission ───────────────────────────────────────────────────────────
function initForm() {
    const form = document.getElementById('predictionForm');
    const submitBtn = document.getElementById('submitBtn');
    const loader = document.getElementById('loader');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.style.display = 'none';
        if (loader) loader.classList.remove('hidden');

        const age = document.getElementById('age').value;
        const salary = document.getElementById('salary').value;
        const apiUrl = window.API_BASE_URL || 'http://127.0.0.1:5000';

        try {
            const response = await fetch(`${apiUrl}/api/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ age, salary })
            });
            const data = await response.json();
            if (data.success) {
                // Client-side redirect with params
                const q = `prediction=${data.prediction}&prob=${data.probability}&age=${data.age}&salary=${data.salary}&time=${encodeURIComponent(data.timestamp || '')}`;
                setTimeout(() => { window.location.href = `result.html?${q}`; }, 600);
            } else {
                alert('System Error: ' + (data.error || 'Unknown error'));
                submitBtn.style.display = 'block';
                if (loader) loader.classList.add('hidden');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            alert('Failed to connect to Neural API.');
            submitBtn.style.display = 'block';
            if (loader) loader.classList.add('hidden');
        }
    });
}

// ── Bootstrap All ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    new ParticleBackground('particle-canvas');
    initScrollReveal();
    initStatCounters();
    initCardEntrance();
    initRipple();
    initForm();
});
