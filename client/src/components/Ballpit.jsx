import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Ballpit - Interactive 3D ball animation component using Three.js
 * Creates a colorful animated ball pit effect as a background
 */
const Ballpit = ({
  count = 100,
  gravity = 0.5,
  friction = 0.98,
  wallBounce = 0.95,
  followCursor = true,
  colors = [0xff1744, 0xe91e63, 0x9c27b0, 0x673ab7, 0x3f51b5]
}) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 50;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(25, 50, 25);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xff69b4, 0.5);
    pointLight2.position.set(-25, -50, 25);
    scene.add(pointLight2);

    // Ball class
    class Ball {
      constructor() {
        const radius = Math.random() * 1.5 + 0.5;
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        const material = new THREE.MeshPhongMaterial({
          color: color,
          shininess: 100,
          specular: 0x444444,
          emissive: color,
          emissiveIntensity: 0.1
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(
          (Math.random() - 0.5) * 80,
          (Math.random() - 0.5) * 60,
          (Math.random() - 0.5) * 30
        );

        this.velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        );

        this.radius = radius;
        scene.add(this.mesh);
      }

      update(mousePos) {
        // Apply gravity
        this.velocity.y -= gravity * 0.01;

        // Apply friction
        this.velocity.multiplyScalar(friction);

        // Follow cursor effect
        if (followCursor && mousePos) {
          const dx = mousePos.x - this.mesh.position.x;
          const dy = mousePos.y - this.mesh.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 20) {
            const force = (20 - dist) / 20;
            this.velocity.x += (dx / dist) * force * 0.3;
            this.velocity.y += (dy / dist) * force * 0.3;
          }
        }

        // Update position
        this.mesh.position.add(this.velocity);

        // Boundary collision
        const bounds = {
          x: 45,
          y: 35,
          z: 20
        };

        if (Math.abs(this.mesh.position.x) > bounds.x) {
          this.mesh.position.x = Math.sign(this.mesh.position.x) * bounds.x;
          this.velocity.x *= -wallBounce;
        }

        if (Math.abs(this.mesh.position.y) > bounds.y) {
          this.mesh.position.y = Math.sign(this.mesh.position.y) * bounds.y;
          this.velocity.y *= -wallBounce;
        }

        if (Math.abs(this.mesh.position.z) > bounds.z) {
          this.mesh.position.z = Math.sign(this.mesh.position.z) * bounds.z;
          this.velocity.z *= -wallBounce;
        }

        // Rotation for visual effect
        this.mesh.rotation.x += this.velocity.x * 0.02;
        this.mesh.rotation.y += this.velocity.y * 0.02;
      }
    }

    // Create balls
    const balls = [];
    for (let i = 0; i < count; i++) {
      balls.push(new Ball());
    }

    // Mouse tracking
    const mouse = new THREE.Vector2();
    const mousePos = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();

    const onMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      raycaster.ray.intersectPlane(plane, mousePos);
    };

    window.addEventListener('mousemove', onMouseMove);

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      balls.forEach(ball => {
        ball.update(mousePos);
      });

      // Ball-to-ball collision detection (simplified)
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const ball1 = balls[i];
          const ball2 = balls[j];
          
          const dx = ball2.mesh.position.x - ball1.mesh.position.x;
          const dy = ball2.mesh.position.y - ball1.mesh.position.y;
          const dz = ball2.mesh.position.z - ball1.mesh.position.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const minDist = ball1.radius + ball2.radius;

          if (dist < minDist) {
            // Simple collision response
            const nx = dx / dist;
            const ny = dy / dist;
            const nz = dz / dist;
            
            const overlap = (minDist - dist) / 2;
            
            ball1.mesh.position.x -= overlap * nx;
            ball1.mesh.position.y -= overlap * ny;
            ball1.mesh.position.z -= overlap * nz;
            
            ball2.mesh.position.x += overlap * nx;
            ball2.mesh.position.y += overlap * ny;
            ball2.mesh.position.z += overlap * nz;

            // Exchange velocities along collision normal
            const dvx = ball1.velocity.x - ball2.velocity.x;
            const dvy = ball1.velocity.y - ball2.velocity.y;
            const dvz = ball1.velocity.z - ball2.velocity.z;
            
            const dvn = dvx * nx + dvy * ny + dvz * nz;
            
            if (dvn > 0) {
              ball1.velocity.x -= dvn * nx * 0.5;
              ball1.velocity.y -= dvn * ny * 0.5;
              ball1.velocity.z -= dvn * nz * 0.5;
              
              ball2.velocity.x += dvn * nx * 0.5;
              ball2.velocity.y += dvn * ny * 0.5;
              ball2.velocity.z += dvn * nz * 0.5;
            }
          }
        }
      }

      // Slight camera movement for dynamic effect
      camera.position.x = Math.sin(Date.now() * 0.0001) * 2;
      camera.position.y = Math.cos(Date.now() * 0.0001) * 2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      balls.forEach(ball => {
        scene.remove(ball.mesh);
        ball.mesh.geometry.dispose();
        ball.mesh.material.dispose();
      });
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [count, gravity, friction, wallBounce, followCursor, colors]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default Ballpit;
