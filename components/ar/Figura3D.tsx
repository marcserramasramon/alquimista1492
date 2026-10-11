"use client";

import { useEffect, useRef, type RefObject } from "react";

/** Model 3D de la figura (public/models/). Sense esquelet: només es mou el cos sencer i la roba. */
export const MODEL_FIGURA_3D = "/models/capa-encaputxada.glb";

/**
 * Cap on mira el davant del model, en graus, respecte a "cap a la càmera". Si el model surt de
 * costat o d'esquena, es corregeix aquí (0, 90, 180 o -90).
 */
const GIR_DAVANT_GRAUS = 0;

/** 1 = tal com ve la textura; menys = més fosca. */
const BRILLANTOR_FIGURA = 0.75;

const FOV_HORITZONTAL = 52;
const ALCADA_CAMERA = 1.5;
const RAD = Math.PI / 180;

/**
 * Què ha de mostrar el 3D en aquest moment. L'escriu EscenaUlls (que mana quan apareix, s'acosta
 * i es dissol) i el llegeix Figura3D a cada fotograma, sense passar per React.
 */
export interface EstatFigura3D {
  /** Opacitat: 0 = no es veu. */
  alfa: number;
  /** Graus respecte al centre de la pantalla (positiu = a la dreta). */
  dx: number;
  /** Distància fictícia (m). */
  dist: number;
  /** Inclinació de la càmera (graus, positiu = mirant amunt). */
  elevacio: number;
  /** Alçada de la figura (m). */
  altura: number;
  llavor: number;
}

export function estatFigura3DInicial(): EstatFigura3D {
  return { alfa: 0, dx: 0, dist: 15, elevacio: 0, altura: 1.9, llavor: 0 };
}

export function webglDisponible(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

interface Props {
  estat: RefObject<EstatFigura3D>;
  /** No s'ha pogut carregar o dibuixar: qui l'usa tornarà a la figura plana. */
  onError: () => void;
}

/**
 * Figura en 3D sobre la càmera. Té la mateixa càmera que l'escena plana (mateix camp de visió,
 * ulls a 1,5 m), de manera que els dos dibuixos són intercanviables. Three.js es carrega només
 * quan es fa servir aquesta pantalla.
 */
export function Figura3D({ estat, onError }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const errorRef = useRef(onError);

  useEffect(() => {
    errorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    let cancel = false;
    let frame = 0;
    let alliberar: () => void = () => {};

    (async () => {
      try {
        const THREE = await import("three");
        const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
        const canvas = canvasRef.current;
        if (cancel || !canvas) return;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x000000, 0);
        const escena = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 120);

        const gltf = await new GLTFLoader().loadAsync(MODEL_FIGURA_3D);
        if (cancel) {
          renderer.dispose();
          return;
        }

        // Textura tal com ve del model (ja porta la llum), una mica atenuada, amb l'ondulació de la
        // capa: la roba es mou més com més a prop és de terra.
        const temps = { value: 0 };
        const materials: import("three").Material[] = [];
        gltf.scene.traverse((node) => {
          const malla = node as import("three").Mesh;
          if (!malla.isMesh) return;
          const original = malla.material as import("three").MeshStandardMaterial;
          const material = new THREE.MeshBasicMaterial({
            map: original.map,
            color: new THREE.Color(0xffffff),
            transparent: true,
            side: THREE.DoubleSide,
          });
          material.onBeforeCompile = (shader) => {
            shader.uniforms.uTemps = temps;
            // Més contrast i més fosc: es retallen els clars i s'enfosqueix el conjunt.
            shader.fragmentShader = shader.fragmentShader.replace(
              "#include <map_fragment>",
              `#include <map_fragment>
              diffuseColor.rgb = clamp((diffuseColor.rgb - 0.12) * 1.6 + 0.04, 0.0, 1.0);
              diffuseColor.rgb *= ${BRILLANTOR_FIGURA.toFixed(2)};`
            );
            shader.vertexShader = shader.vertexShader
              .replace("#include <common>", "#include <common>\nuniform float uTemps;")
              .replace(
                "#include <begin_vertex>",
                `#include <begin_vertex>
                float roba = pow(1.0 - clamp(position.y, 0.0, 1.0), 1.6);
                transformed.x += sin(uTemps * 1.3 + position.y * 5.0) * 0.022 * roba;
                transformed.z += sin(uTemps * 1.7 + position.y * 4.0 + position.x * 6.0) * 0.018 * roba;
                transformed.y *= 1.0 + 0.007 * sin(uTemps * 1.1);`
              );
          };
          malla.material = material;
          materials.push(material);
        });

        // Normalitza: peus a y = 0 i alçada d'1 unitat; el grup s'escala a l'alçada que toqui.
        const caixa = new THREE.Box3().setFromObject(gltf.scene);
        gltf.scene.position.y -= caixa.min.y;
        const alcadaModel = Math.max(0.0001, caixa.max.y - caixa.min.y);
        const grup = new THREE.Group();
        grup.add(gltf.scene);
        escena.add(grup);

        let amplada = 0;
        let alcada = 0;
        let pintat = false;
        const inici = performance.now();

        const dibuixa = (ara: number) => {
          const w = canvas.clientWidth;
          const h = canvas.clientHeight;
          if (w !== amplada || h !== alcada) {
            amplada = w;
            alcada = h;
            renderer.setSize(w, h, false);
            camera.aspect = w / Math.max(1, h);
            camera.fov = (2 * Math.atan(Math.tan((FOV_HORITZONTAL / 2) * RAD) / camera.aspect)) / RAD;
            camera.updateProjectionMatrix();
          }

          const e = estat.current;
          if (e.alfa <= 0.003) {
            // Res a mostrar: s'esborra un cop i no es gasta bateria fins que torni.
            if (pintat) {
              renderer.clear();
              pintat = false;
            }
          } else {
            const t = (ara - inici) / 1000;
            temps.value = t;
            camera.rotation.x = e.elevacio * RAD;
            const dx = e.dx * RAD;
            const x = e.dist * Math.sin(dx);
            const z = -e.dist * Math.cos(dx);
            grup.position.set(x, -ALCADA_CAMERA, z);
            grup.scale.setScalar(e.altura / alcadaModel);
            // Mira cap a la càmera, amb un petit balanceig.
            grup.rotation.y = Math.atan2(-x, -z) + GIR_DAVANT_GRAUS * RAD + Math.sin(t * 0.5 + e.llavor) * 0.06;
            for (const m of materials) m.opacity = e.alfa;
            renderer.render(escena, camera);
            pintat = true;
          }
          frame = requestAnimationFrame(dibuixa);
        };
        frame = requestAnimationFrame(dibuixa);

        alliberar = () => {
          cancelAnimationFrame(frame);
          gltf.scene.traverse((node) => {
            const malla = node as import("three").Mesh;
            if (!malla.isMesh) return;
            malla.geometry.dispose();
          });
          for (const m of materials) {
            (m as import("three").MeshBasicMaterial).map?.dispose();
            m.dispose();
          }
          renderer.dispose();
        };
      } catch {
        if (!cancel) errorRef.current();
      }
    })();

    return () => {
      cancel = true;
      cancelAnimationFrame(frame);
      alliberar();
    };
  }, [estat]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />;
}
