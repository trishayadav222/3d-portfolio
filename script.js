document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("webgl-canvas");

  if (!canvas || typeof THREE === "undefined") {
    console.error("Canvas or Three.js is missing.");
    return;
  }

  /* 1. Scene & Camera Setup */
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 10);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  /* 2. Lighting */
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xef4444, 5, 25);
  pointLight.position.set(3, 3, 5);
  scene.add(pointLight);

  /* 3. Main 3D Group */
  const mainGroup = new THREE.Group();

  // Core Geodesic Sphere
  const sphereGeo = new THREE.IcosahedronGeometry(2.2, 3);
  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    wireframe: true,
    emissive: 0x991b1b,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.85
  });
  const coreSphere = new THREE.Mesh(sphereGeo, sphereMat);
  mainGroup.add(coreSphere);

  // Inner Core Mesh
  const innerGeo = new THREE.IcosahedronGeometry(1.5, 1);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x0a0a0a,
    transparent: true,
    opacity: 0.9
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  mainGroup.add(innerMesh);

  // Torus Knot Ribbon
  const knotGeo = new THREE.TorusKnotGeometry(4.5, 1.1, 120, 24, 2, 3);
  const knotMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    wireframe: true,
    emissive: 0x7f1d1d,
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.35
  });
  const torusKnot = new THREE.Mesh(knotGeo, knotMat);
  torusKnot.rotation.x = Math.PI / 3;
  mainGroup.add(torusKnot);

  // Initial Position
  mainGroup.position.set(2.5, 0, 0);
  scene.add(mainGroup);

  /* 4. Background Star Field Particles */
  const particlesCount = 1200;
  const positions = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 30;
    positions[i + 1] = (Math.random() - 0.5) * 30;
    positions[i + 2] = (Math.random() - 0.5) * 30;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.035,
    color: 0xf87171,
    transparent: true,
    opacity: 0.7
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  /* 5. Mouse Parallax Movement */
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;

  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    pointLight.position.x = mouseX * 6;
    pointLight.position.y = mouseY * 6;
  });

  /* 6. Section Navigation Switching */
  const navBtns = document.querySelectorAll(".nav-btn");
  const sections = document.querySelectorAll(".section");

  const switchTab = (targetSection) => {
    navBtns.forEach((b) => b.classList.remove("active"));
    const activeBtn = document.querySelector(`[data-section="${targetSection}"]`);
    if (activeBtn) activeBtn.classList.add("active");

    sections.forEach((sec) => {
      sec.classList.remove("active-section");
      if (sec.getAttribute("id") === targetSection) {
        sec.classList.add("active-section");
      }
    });

    // Reposition 3D element depending on section
    if (targetSection === "hero") mainGroup.position.set(2.5, 0, 0);
    else if (targetSection === "about") mainGroup.position.set(-2.5, 0, 0);
    else if (targetSection === "skills") mainGroup.position.set(2.8, -0.5, -0.5);
    else if (targetSection === "certifications") mainGroup.position.set(-2.8, 0.5, -0.5);
    else if (targetSection === "projects") mainGroup.position.set(2.8, 0.5, -1);
    else if (targetSection === "contact") mainGroup.position.set(0, 0, 1);
  };

  // Click handlers for nav bar buttons
  navBtns.forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.getAttribute("data-section")));
  });

  // Click handler for the Logo (Links to Hero/Home)
  const logo = document.querySelector(".logo");
  logo?.addEventListener("click", (e) => {
    e.preventDefault();
    switchTab("hero");
  });

  // Hero section call-to-action buttons
  document.getElementById("btn-projects")?.addEventListener("click", () => switchTab("projects"));
  document.getElementById("btn-contact")?.addEventListener("click", () => switchTab("contact"));

  /* 7. Animation Loop */
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    coreSphere.rotation.y = elapsedTime * 0.2;
    coreSphere.rotation.x = elapsedTime * 0.1;

    torusKnot.rotation.z = elapsedTime * 0.12;
    torusKnot.rotation.y = elapsedTime * 0.08;

    particleSystem.rotation.y = elapsedTime * 0.015;

    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    camera.position.x = targetX * 0.8;
    camera.position.y = targetY * 0.8;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();

  /* 8. Resize Handler */
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});