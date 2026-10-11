"use client";

import { useEffect, useRef, type RefObject } from "react";

/** Model 3D de la figura (public/models/). Sense esquelet: només es mou el cos sencer i la roba. */
export const MODEL_FIGURA_3D = "/models/capa-encaputxada.glb";

/**
 * Cap on mira el davant del model, en graus, respecte a "cap a la càmera". Si el model surt de
 * costat o d'esquena, es corregeix aquí (0, 90, 180 o -90).
 */
const GIR_DAVANT_GRAUS = 0;

/** Fanal que porta la figura (public/images/ar/fanal.webp), amb una espelma a dins. */
const IMATGE_FANAL = "/images/ar/fanal.webp";
/**
 * On és el fanal, en unitats del model (alçada del model = 1). La mà dreta de la figura (a
 * l'esquerra de qui la mira) és a (-0,13, 0,45, 0,10): el fanal hi penja amb l'anella a l'alçada de
 * la mà i una mica endavant, de manera que la mà queda darrere. `FLAMA` és on crema l'espelma.
 */
const FANAL = { x: -0.13, y: 0.37, z: 0.16, alcada: 0.17 };
const FLAMA = { x: -0.13, y: 0.34, z: 0.15 };

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
  /** Quant camina (0 = quieta, 1 = caminant): mou el cos, la capa i els peus. */
  camina: number;
  llavor: number;
}

export function estatFigura3DInicial(): EstatFigura3D {
  return { alfa: 0, dx: 0, dist: 15, elevacio: 0, altura: 1.9, camina: 0, llavor: 0 };
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
        // Caminada falsa (sense esquelet): intensitat (0-1) i fase del cicle de pas (radians).
        const camina = { value: 0 };
        const cicle = { value: 0 };
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
            shader.uniforms.uCamina = camina;
            shader.uniforms.uCicle = cicle;
            // Més contrast i més fosc, i la llum groga de l'espelma sobre la roba a prop del fanal.
            shader.fragmentShader = shader.fragmentShader
              .replace("#include <common>", `#include <common>
uniform float uTemps;
varying vec3 vPosLocal;`)
              .replace(
                "#include <map_fragment>",
                `#include <map_fragment>
                diffuseColor.rgb = clamp((diffuseColor.rgb - 0.12) * 1.6 + 0.04, 0.0, 1.0);
                diffuseColor.rgb *= ${BRILLANTOR_FIGURA.toFixed(2)};
                float dFanal = distance(vPosLocal, vec3(${FLAMA.x.toFixed(3)}, ${FLAMA.y.toFixed(3)}, ${FLAMA.z.toFixed(3)}));
                float flama = 0.8 + 0.12 * sin(uTemps * 7.3) + 0.08 * sin(uTemps * 13.7 + 1.3) + 0.05 * sin(uTemps * 23.0);
                diffuseColor.rgb += vec3(1.0, 0.68, 0.26) * 0.5 * exp(-dFanal * dFanal * 55.0) * flama;`
              );
            shader.vertexShader = shader.vertexShader
              .replace("#include <common>", `#include <common>
uniform float uCamina;
uniform float uCicle;
uniform float uTemps;
varying vec3 vPosLocal;`)
              .replace(
                "#include <begin_vertex>",
                `#include <begin_vertex>
                vPosLocal = position;
                float roba = pow(1.0 - clamp(position.y, 0.0, 1.0), 1.6);
                transformed.x += sin(uTemps * 1.3 + position.y * 5.0) * 0.022 * roba;
                transformed.z += sin(uTemps * 1.7 + position.y * 4.0 + position.x * 6.0) * 0.018 * roba;
                transformed.y *= 1.0 + 0.007 * sin(uTemps * 1.1);
                // Caminada falsa: la roba oscil·la més i els peus s'alternen (un aixeca i avança mentre l'altre queda).
                transformed.x += sin(uCicle) * 0.02 * roba * uCamina;
                float cos2 = step(0.0, position.x) * 2.0 - 1.0;
                float fase = uCicle + (cos2 > 0.0 ? 0.0 : 3.14159);
                float peu = smoothstep(0.11, 0.0, position.y);
                float cama = smoothstep(0.40, 0.0, position.y);
                transformed.y += max(0.0, sin(fase)) * 0.05 * peu * uCamina;
                transformed.z += sin(fase + 1.5708) * 0.055 * peu * uCamina;
                transformed.z += sin(fase + 1.5708) * 0.03 * cama * uCamina;`
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

        // El fanal (foto retallada) i el punt de llum groc d'espelma al seu voltant. Si el fanal no
        // es pot carregar, la figura es veu igualment.
        const actius: { dispose: () => void }[] = [];
        let fanal: import("three").Sprite | null = null;
        let resplendor: import("three").Sprite | null = null;
        try {
          const textura = await new THREE.TextureLoader().loadAsync(IMATGE_FANAL);
          textura.colorSpace = THREE.SRGBColorSpace;
          const imatge = textura.image as { width: number; height: number };
          const materialFanal = new THREE.SpriteMaterial({ map: textura, transparent: true });
          fanal = new THREE.Sprite(materialFanal);
          fanal.scale.set((FANAL.alcada * imatge.width) / imatge.height, FANAL.alcada, 1);
          fanal.position.set(FANAL.x, FANAL.y, FANAL.z);
          fanal.renderOrder = 2;
          grup.add(fanal);

          const llum = document.createElement("canvas");
          llum.width = llum.height = 128;
          const c2 = llum.getContext("2d");
          if (c2) {
            const g = c2.createRadialGradient(64, 64, 0, 64, 64, 64);
            g.addColorStop(0, "rgba(255, 232, 150, 1)");
            g.addColorStop(0.22, "rgba(255, 196, 88, 0.55)");
            g.addColorStop(1, "rgba(255, 150, 40, 0)");
            c2.fillStyle = g;
            c2.fillRect(0, 0, 128, 128);
          }
          const texturaLlum = new THREE.CanvasTexture(llum);
          texturaLlum.colorSpace = THREE.SRGBColorSpace;
          const materialLlum = new THREE.SpriteMaterial({
            map: texturaLlum,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          resplendor = new THREE.Sprite(materialLlum);
          resplendor.scale.set(0.3, 0.3, 1);
          resplendor.position.set(FLAMA.x, FLAMA.y, FLAMA.z + 0.03);
          resplendor.renderOrder = 3;
          grup.add(resplendor);
          actius.push(textura, materialFanal, texturaLlum, materialLlum);
        } catch {
          // Sense fanal: només la figura.
        }

        let amplada = 0;
        let alcada = 0;
        let pintat = false;
        let anteriorMs = performance.now();
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
            const dtS = Math.min(0.1, (ara - anteriorMs) / 1000);
            anteriorMs = ara;
            camina.value = e.camina;
            // 0,7 cicles per segon = 1,4 passos per segon: una caminada lenta, amenaçadora.
            cicle.value += dtS * Math.PI * 2 * 0.7 * e.camina;
            const c = cicle.value;
            camera.rotation.x = e.elevacio * RAD;
            const dx = e.dx * RAD;
            const x = e.dist * Math.sin(dx);
            const z = -e.dist * Math.cos(dx);
            // Cada pas fa botar una mica el cos (dues bots per cicle) i el balanceja de costat a costat.
            const escala = e.altura / 1.9;
            const bot = ((1 - Math.cos(2 * c)) / 2) * 0.045 * escala * e.camina;
            grup.position.set(x, -ALCADA_CAMERA + bot, z);
            grup.scale.setScalar(e.altura / alcadaModel);
            // Mira cap a la càmera, amb un petit balanceig.
            grup.rotation.order = "YXZ";
            grup.rotation.y =
              Math.atan2(-x, -z) + GIR_DAVANT_GRAUS * RAD + Math.sin(t * 0.5 + e.llavor) * 0.06 + Math.sin(c) * 0.06 * e.camina;
            grup.rotation.x = 0.05 * e.camina; // s'inclina una mica cap endavant
            grup.rotation.z = Math.sin(c) * 0.04 * e.camina; // balanceig de costat a costat
            for (const m of materials) m.opacity = e.alfa;
            // La flama de l'espelma tremola i el fanal es balanceja una mica.
            const flama = 0.8 + 0.12 * Math.sin(t * 7.3) + 0.08 * Math.sin(t * 13.7 + 1.3) + 0.05 * Math.sin(t * 23);
            if (fanal) {
              fanal.material.opacity = e.alfa;
              fanal.material.rotation = Math.sin(t * 1.4 + e.llavor) * 0.05 + Math.sin(c + 0.8) * 0.18 * e.camina;
            }
            if (resplendor) {
              resplendor.material.opacity = e.alfa * flama * 0.85;
              resplendor.scale.setScalar(0.27 + 0.04 * flama);
            }
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
          for (const a of actius) a.dispose();
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
