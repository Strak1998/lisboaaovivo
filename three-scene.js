/* ============================================
   LISBOA DESPIDA — 3D WebGL Experience
   Three.js particle field, hero geometry,
   enhanced card tilt, scroll-driven 3D
   ============================================ */

(function () {
  'use strict';

  // Bail on reduced-motion or missing WebGL
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.getElementById('webglCanvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;
  gl.getExtension('WEBGL_lose_context')?.loseContext(); // release temporary context

  /* ============================================
     SETUP
     ============================================ */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // Mouse tracking
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  document.addEventListener('mousemove', function (e) {
    mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Scroll tracking
  let scrollProgress = 0;
  window.addEventListener('scroll', function () {
    scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  }, { passive: true });

  /* ============================================
     1. 3D PARTICLE FIELD
     Gold & wine colored particles with depth
     ============================================ */
  const PARTICLE_COUNT = window.innerWidth < 768 ? 80 : 200;
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const velocities = new Float32Array(PARTICLE_COUNT * 3);

  // Color palette
  const goldColor = new THREE.Color(0xd2a45f);
  const wineColor = new THREE.Color(0x6f1830);
  const ivoryColor = new THREE.Color(0xf3e6d3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;

    // Spread particles in a wide 3D volume
    positions[i3]     = (Math.random() - 0.5) * 80;
    positions[i3 + 1] = (Math.random() - 0.5) * 60;
    positions[i3 + 2] = (Math.random() - 0.5) * 40 - 5;

    // Velocities for drifting
    velocities[i3]     = (Math.random() - 0.5) * 0.008;
    velocities[i3 + 1] = Math.random() * 0.006 + 0.002;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.004;

    // Random color from palette
    const t = Math.random();
    const color = t < 0.5
      ? goldColor.clone().lerp(ivoryColor, Math.random() * 0.4)
      : wineColor.clone().lerp(goldColor, Math.random() * 0.6);
    colors[i3]     = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    sizes[i] = Math.random() * 3.0 + 0.5;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  // Custom shader material for soft glowing particles
  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: renderer.getPixelRatio() },
    },
    vertexShader: [
      'attribute float size;',
      'varying vec3 vColor;',
      'uniform float uTime;',
      'uniform float uPixelRatio;',
      'void main() {',
      '  vColor = color;',
      '  vec3 pos = position;',
      '  pos.y += sin(uTime * 0.3 + position.x * 0.1) * 0.5;',
      '  pos.x += cos(uTime * 0.2 + position.z * 0.1) * 0.3;',
      '  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);',
      '  gl_PointSize = size * uPixelRatio * (18.0 / -mvPosition.z);',
      '  gl_Position = projectionMatrix * mvPosition;',
      '}',
    ].join('\n'),
    fragmentShader: [
      'varying vec3 vColor;',
      'void main() {',
      '  float dist = length(gl_PointCoord - vec2(0.5));',
      '  if (dist > 0.5) discard;',
      '  float alpha = 1.0 - smoothstep(0.0, 0.5, dist);',
      '  alpha *= 0.6;',
      '  gl_FragColor = vec4(vColor, alpha);',
      '}',
    ].join('\n'),
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  // Hide CSS particles since we replaced them
  var cssParticles = document.querySelector('.particles');
  if (cssParticles) cssParticles.style.display = 'none';

  /* ============================================
     2. HERO GEOMETRY — Animated wireframe torus knot
     Subtle, luxurious, floating behind the hero
     ============================================ */
  const heroGroup = new THREE.Group();

  // Main torus knot — gold wireframe
  const torusGeo = new THREE.TorusKnotGeometry(6, 1.8, 128, 32, 2, 3);
  const torusMat = new THREE.MeshBasicMaterial({
    color: 0xd2a45f,
    wireframe: true,
    transparent: true,
    opacity: 0.06,
  });
  const torusKnot = new THREE.Mesh(torusGeo, torusMat);
  heroGroup.add(torusKnot);

  // Inner sphere — wine accent
  const sphereGeo = new THREE.IcosahedronGeometry(4, 2);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x6f1830,
    wireframe: true,
    transparent: true,
    opacity: 0.04,
  });
  const innerSphere = new THREE.Mesh(sphereGeo, sphereMat);
  heroGroup.add(innerSphere);

  // Outer ring — platinum
  const ringGeo = new THREE.TorusGeometry(9, 0.15, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xede6dc,
    transparent: true,
    opacity: 0.05,
  });
  const outerRing = new THREE.Mesh(ringGeo, ringMat);
  heroGroup.add(outerRing);

  // Position to the right side (behind hero image area)
  heroGroup.position.set(12, 2, -8);
  scene.add(heroGroup);

  /* ============================================
     3. ENHANCED CARD TILT — Light reflection
     Adds a dynamic light highlight on cards
     ============================================ */
  var tiltCards = document.querySelectorAll(
    '.collection-card, .pricing-card, .pack-card, .event-card, .testimonial-card, .persona-card, .city-card, .flow-card'
  );

  tiltCards.forEach(function (card) {
    // Create reflection overlay
    var reflection = document.createElement('div');
    reflection.className = 'card-3d-reflection';
    reflection.setAttribute('aria-hidden', 'true');
    card.style.position = 'relative';
    card.style.overflow = 'hidden';
    card.appendChild(reflection);

    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var cx = rect.width / 2;
      var cy = rect.height / 2;

      // Tilt angles
      var tiltX = ((y - cy) / cy) * -6;
      var tiltY = ((x - cx) / cx) * 6;

      card.style.transform =
        'perspective(800px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg) translateZ(8px) scale(1.02)';
      card.style.boxShadow =
        '0 ' + (20 + Math.abs(tiltX) * 4) + 'px ' + (60 + Math.abs(tiltY) * 4) + 'px rgba(0,0,0,0.5), ' +
        '0 0 40px rgba(210,164,95,' + (0.04 + Math.abs(tiltY) * 0.01) + ')';

      // Move reflection
      reflection.style.background =
        'radial-gradient(circle at ' + x + 'px ' + y + 'px, rgba(210,164,95,0.12) 0%, transparent 60%)';
      reflection.style.opacity = '1';
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
      card.style.boxShadow = '';
      reflection.style.opacity = '0';
    });
  });

  /* ============================================
     4. SCROLL-DRIVEN 3D TRANSFORMS
     Sections rotate/shift subtly on scroll
     ============================================ */
  var scrollSections = document.querySelectorAll('.section-heading');
  var scrollCards = document.querySelectorAll('.persona-card, .city-card, .flow-card, .collection-card');

  function updateScrollTransforms() {
    // Section headings — subtle parallax
    scrollSections.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var viewportCenter = window.innerHeight / 2;
      var elementCenter = rect.top + rect.height / 2;
      var offset = (elementCenter - viewportCenter) / viewportCenter;

      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.style.transform =
          'perspective(1200px) rotateX(' + (offset * 1.5) + 'deg) translateY(' + (offset * -6) + 'px)';
        el.style.opacity = Math.max(0, 1 - Math.abs(offset) * 0.3);
      }
    });

    // Cards — staggered depth on scroll
    scrollCards.forEach(function (card, i) {
      var rect = card.getBoundingClientRect();
      if (rect.top > window.innerHeight + 100 || rect.bottom < -100) return;

      var progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      progress = Math.max(0, Math.min(1, progress));

      var stagger = (i % 4) * 0.05;
      var z = (1 - progress) * 20;
      var rotateY = (1 - progress) * (3 + stagger * 10) * (i % 2 === 0 ? 1 : -1);

      // Only apply scroll transform if not being hover-tilted
      if (!card.matches(':hover')) {
        card.style.transform =
          'perspective(1000px) translateZ(' + (-z) + 'px) rotateY(' + rotateY + 'deg)';
      }
    });
  }

  window.addEventListener('scroll', updateScrollTransforms, { passive: true });

  /* ============================================
     ANIMATION LOOP
     ============================================ */
  var clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    var elapsed = clock.getElapsedTime();

    // Smooth mouse lerp
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // Update particle shader time
    particleMaterial.uniforms.uTime.value = elapsed;

    // Drift particles
    var posArray = particleGeometry.attributes.position.array;
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      var i3 = i * 3;
      posArray[i3]     += velocities[i3];
      posArray[i3 + 1] += velocities[i3 + 1];
      posArray[i3 + 2] += velocities[i3 + 2];

      // Wrap around bounds
      if (posArray[i3 + 1] > 35) {
        posArray[i3 + 1] = -35;
        posArray[i3] = (Math.random() - 0.5) * 80;
      }
      if (posArray[i3] > 45) posArray[i3] = -45;
      if (posArray[i3] < -45) posArray[i3] = 45;
    }
    particleGeometry.attributes.position.needsUpdate = true;

    // Particles follow mouse subtly
    particles.rotation.y = mouse.x * 0.08;
    particles.rotation.x = mouse.y * 0.04;

    // Hero geometry — slow rotation + mouse interaction
    torusKnot.rotation.x = elapsed * 0.08 + mouse.y * 0.2;
    torusKnot.rotation.y = elapsed * 0.12 + mouse.x * 0.3;
    torusKnot.rotation.z = elapsed * 0.05;

    innerSphere.rotation.x = -elapsed * 0.1;
    innerSphere.rotation.y = elapsed * 0.15;

    outerRing.rotation.x = Math.PI / 2 + Math.sin(elapsed * 0.3) * 0.15;
    outerRing.rotation.z = elapsed * 0.06;

    // Hero group follows mouse
    heroGroup.position.x = 12 + mouse.x * 2;
    heroGroup.position.y = 2 + mouse.y * 1.5;

    // Fade hero geometry based on scroll (visible mostly in hero area)
    var heroFade = Math.max(0, 1 - scrollProgress * 5);
    torusMat.opacity = 0.06 * heroFade;
    sphereMat.opacity = 0.04 * heroFade;
    ringMat.opacity = 0.05 * heroFade;

    // Camera subtle drift
    camera.position.x = mouse.x * 1.5;
    camera.position.y = mouse.y * 0.8;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();

  /* ============================================
     RESIZE HANDLER
     ============================================ */
  var resizeTimeout;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }, 100);
  });

  /* ============================================
     PERFORMANCE — Pause when tab hidden
     ============================================ */
  var animId;
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      renderer.setAnimationLoop(null);
    } else {
      renderer.setAnimationLoop(null); // ensure stopped
      animate();
    }
  });

})();
