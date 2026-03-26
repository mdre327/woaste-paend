"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type KulladSceneProps = {
  turns: number;
};

function createClayTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  const gradient = context.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, "#d39a69");
  gradient.addColorStop(0.45, "#bb7a4f");
  gradient.addColorStop(1, "#78462f");

  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  for (let i = 0; i < 900; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = 1 + Math.random() * 4;
    const alpha = 0.05 + Math.random() * 0.08;

    context.beginPath();
    context.fillStyle = `rgba(86, 49, 33, ${alpha})`;
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  for (let i = 0; i < 42; i += 1) {
    const y = (size / 42) * i + Math.random() * 6;
    context.strokeStyle = `rgba(255, 235, 214, ${0.03 + Math.random() * 0.04})`;
    context.lineWidth = 2 + Math.random() * 2;
    context.beginPath();
    context.moveTo(0, y);
    context.bezierCurveTo(size * 0.2, y - 6, size * 0.8, y + 6, size, y);
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.2, 1);
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

export default function KulladScene({ turns }: KulladSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const targetRotationRef = useRef(0);

  useEffect(() => {
    targetRotationRef.current = turns * Math.PI * 2;
  }, [turns]);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) {
      return;
    }

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 1.4, 18);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    group.rotation.x = -0.14;
    scene.add(group);

    const clayTexture = createClayTexture();

    const bodyGeometry = new THREE.CylinderGeometry(4, 2, 6, 64, 1, true);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: "#b8744c",
      map: clayTexture,
      roughness: 0.92,
      metalness: 0.04,
      side: THREE.DoubleSide,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);

    const rimGeometry = new THREE.TorusGeometry(4, 0.22, 20, 72);
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: "#c9895e",
      roughness: 0.88,
      metalness: 0.03,
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 3;
    group.add(rim);

    const teaGeometry = new THREE.CircleGeometry(3.45, 64);
    const teaMaterial = new THREE.MeshStandardMaterial({
      color: "#5b2e20",
      roughness: 0.55,
      metalness: 0.02,
    });
    const tea = new THREE.Mesh(teaGeometry, teaMaterial);
    tea.rotation.x = -Math.PI / 2;
    tea.position.y = 2.78;
    group.add(tea);

    const baseGeometry = new THREE.TorusGeometry(2.06, 0.16, 16, 48);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: "#8a5438",
      roughness: 0.9,
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.rotation.x = Math.PI / 2;
    base.position.y = -3;
    group.add(base);

    const ambientLight = new THREE.AmbientLight("#fff0de", 1.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight("#fff1de", 2.3);
    keyLight.position.set(8, 10, 10);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight("#8dc7d8", 1.2);
    fillLight.position.set(-10, 4, 8);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight("#5d8f78", 1);
    backLight.position.set(0, 2, -12);
    scene.add(backLight);

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;

      if (!width || !height) {
        return;
      }

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();

    let frameId = 0;

    const animate = () => {
      group.rotation.y += (targetRotationRef.current - group.rotation.y) * 0.1;
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    animate();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      mount.removeChild(renderer.domElement);

      bodyGeometry.dispose();
      bodyMaterial.dispose();
      rimGeometry.dispose();
      rimMaterial.dispose();
      teaGeometry.dispose();
      teaMaterial.dispose();
      baseGeometry.dispose();
      baseMaterial.dispose();
      clayTexture?.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="kullad-canvas" aria-hidden="true" />;
}
