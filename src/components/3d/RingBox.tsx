"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  CanvasTexture,
  Group,
  LatheGeometry,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PMREMGenerator,
  PointLight,
  Points,
  PointsMaterial,
  SpotLight,
  Vector2,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/** Each step of the reveal. ProposalScene moves through these in order. */
export const RING_PHASES = ["dark", "box", "zoom", "open", "ring", "question"] as const;
export type RingPhase = (typeof RING_PHASES)[number];

const reached = (phase: RingPhase, step: RingPhase) =>
  RING_PHASES.indexOf(phase) >= RING_PHASES.indexOf(step);

const LID_OPEN_ANGLE = -1.95;
const RING_SEATED_Y = 1.36;
const RING_HIDDEN_Y = 0.45;
const FOV = 30;

/**
 * Where the camera wants to be at each step. `height` is how much of the scene
 * should fill the screen vertically, and `width` the minimum to keep in frame
 * on narrow phones.
 */
const SHOTS: Record<RingPhase, { height: number; width: number; lambda: number }> = {
  dark: { height: 7.5, width: 6, lambda: 1 },
  box: { height: 7.5, width: 6, lambda: 1 },
  zoom: { height: 5, width: 3.9, lambda: 0.35 },
  open: { height: 4.2, width: 3.4, lambda: 0.4 },
  ring: { height: 3.4, width: 3, lambda: 0.45 },
  question: { height: 0, width: 3.5, lambda: 0.8 },
};

/** Height of the open box, from the stage to the top of the raised lid. */
const OPEN_BOX_HEIGHT = 3.5;
const OPEN_BOX_CENTER_Y = 1.45;
/** Screen space the question and its buttons need, in pixels. */
const QUESTION_TEXT_PX = 440;

function CameraRig({ phase, instant }: { phase: RingPhase; instant: boolean }) {
  const { camera, size } = useThree();
  const look = useRef(new Vector3(0, 1, 0));
  const goal = useMemo(() => new Vector3(), []);

  useFrame((_, delta) => {
    const shot = SHOTS[phase];
    const tan = Math.tan(MathUtils.degToRad(FOV / 2));
    const aspect = size.width / size.height;
    // For the question, fit the whole open box into the space above the text.
    const textShare = MathUtils.clamp(QUESTION_TEXT_PX / size.height, 0.3, 0.64);
    const wanted = phase === "question" ? OPEN_BOX_HEIGHT / (1 - textShare) : shot.height;
    const distance = Math.max(wanted / (2 * tan), shot.width / (2 * tan * aspect));
    const visibleHeight = 2 * tan * distance;
    const lookY =
      phase === "question" ? OPEN_BOX_CENTER_Y - (textShare * visibleHeight) / 2 : 0.95;
    const lambda = instant ? 100 : shot.lambda;

    goal.set(0, lookY + distance * 0.2, distance);
    camera.position.x = MathUtils.damp(camera.position.x, goal.x, lambda, delta);
    camera.position.y = MathUtils.damp(camera.position.y, goal.y, lambda, delta);
    camera.position.z = MathUtils.damp(camera.position.z, goal.z, lambda, delta);
    look.current.y = MathUtils.damp(look.current.y, lookY, lambda, delta);
    camera.lookAt(look.current);
  });
  return null;
}

/** A local studio reflection map, so the metal has something to mirror without any download. */
function StudioReflections({ phase, instant }: { phase: RingPhase; instant: boolean }) {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = texture;
    scene.environmentIntensity = 0;
    return () => {
      scene.environment = null;
      texture.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  useFrame((_, delta) => {
    const target = reached(phase, "open") ? 0.5 : reached(phase, "box") ? 0.3 : 0;
    scene.environmentIntensity = MathUtils.damp(scene.environmentIntensity, target, instant ? 100 : 0.8, delta);
  });
  return null;
}

function Lights({ phase, instant }: { phase: RingPhase; instant: boolean }) {
  const key = useRef<SpotLight>(null);
  const inner = useRef<PointLight>(null);

  useFrame((_, delta) => {
    const lambda = instant ? 100 : 0.9;
    if (key.current) {
      const target = reached(phase, "box") ? 3.4 : 0;
      key.current.intensity = MathUtils.damp(key.current.intensity, target, lambda, delta);
    }
    if (inner.current) {
      const target = reached(phase, "ring") ? 2.2 : reached(phase, "open") ? 1.2 : 0;
      inner.current.intensity = MathUtils.damp(inner.current.intensity, target, lambda, delta);
    }
  });

  return (
    <>
      <spotLight
        ref={key}
        position={[0, 8, 3.6]}
        angle={0.42}
        penumbra={0.9}
        decay={0}
        intensity={0}
        color="#ffe6c8"
      />
      <pointLight position={[-3, 2, -3]} decay={0} intensity={0.45} color="#a03a55" />
      {/* The golden reflection that spills out as the lid lifts. */}
      <pointLight ref={inner} position={[0, 1.9, 1.15]} distance={5} decay={1.4} intensity={0} color="#ffcf94" />
    </>
  );
}

function RoundedBox({
  args,
  radius,
  smoothness,
  position,
  children,
}: {
  args: [number, number, number];
  radius: number;
  smoothness: number;
  position: [number, number, number];
  children: React.ReactNode;
}) {
  const geometry = useMemo(
    () => new RoundedBoxGeometry(args[0], args[1], args[2], smoothness, radius),
    [args, radius, smoothness],
  );
  return (
    <mesh geometry={geometry} position={position}>
      {children}
    </mesh>
  );
}

/** Small golden glints drifting around the ring. */
function Glints() {
  const points = useRef<Points>(null);
  const { positions, sprite } = useMemo(() => {
    const values = new Float32Array(36 * 3);
    for (let i = 0; i < values.length; i += 3) {
      values[i] = (Math.random() - 0.5) * 2.2;
      values[i + 1] = (Math.random() - 0.5) * 1.7;
      values[i + 2] = (Math.random() - 0.5) * 1.6;
    }
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 32;
    const c = canvas.getContext("2d")!;
    const g = c.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, "rgba(255,226,180,1)");
    g.addColorStop(1, "rgba(255,226,180,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 32, 32);
    return { positions: new BufferAttribute(values, 3), sprite: new CanvasTexture(canvas) };
  }, []);

  useFrame(({ clock }) => {
    if (!points.current) return;
    points.current.rotation.y = clock.elapsedTime * 0.09;
    const material = points.current.material as PointsMaterial;
    material.opacity = 0.55 + 0.3 * Math.sin(clock.elapsedTime * 1.3);
  });

  return (
    <points ref={points} position={[0, 1.95, 0.2]}>
      <bufferGeometry>
        <primitive attach="attributes-position" object={positions} />
      </bufferGeometry>
      <pointsMaterial
        map={sprite}
        size={0.07}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

function Velvet() {
  return (
    <meshPhysicalMaterial
      color="#4a1527"
      roughness={0.95}
      sheen={0.7}
      sheenColor="#a33a5a"
      sheenRoughness={0.5}
      envMapIntensity={0.5}
    />
  );
}

/** A dark lining, so the gold and the stone are the brightest things on screen. */
function Lining() {
  return (
    <meshPhysicalMaterial
      color="#210b14"
      roughness={0.88}
      sheen={0.9}
      sheenColor="#a77b63"
      sheenRoughness={0.55}
      envMapIntensity={0.35}
    />
  );
}

function Gold({ color = "#d9a77f", roughness = 0.17 }: { color?: string; roughness?: number }) {
  return <meshStandardMaterial color={color} metalness={1} roughness={roughness} envMapIntensity={2.2} />;
}

function Diamond() {
  const geometry = useMemo(() => {
    const profile = [
      new Vector2(0.001, -0.17),
      new Vector2(0.185, 0),
      new Vector2(0.185, 0.018),
      new Vector2(0.105, 0.105),
      new Vector2(0.001, 0.105),
    ];
    return new LatheGeometry(profile, 10);
  }, []);

  return (
    <mesh geometry={geometry}>
      <meshPhysicalMaterial
        color="#ffffff"
        metalness={0.72}
        roughness={0.02}
        flatShading
        clearcoat={1}
        emissive="#fff3e0"
        emissiveIntensity={0.32}
        envMapIntensity={6}
      />
    </mesh>
  );
}

function Ring({ phase, instant }: { phase: RingPhase; instant: boolean }) {
  const group = useRef<Group>(null);
  const spinner = useRef<Group>(null);
  const RADIUS = 0.4;
  const STONE_Y = RADIUS + 0.2;

  useFrame(({ clock }, delta) => {
    if (!group.current || !spinner.current) return;
    const open = reached(phase, "open");
    group.current.visible = open;
    if (!open) return;
    const rise = reached(phase, "ring") ? RING_SEATED_Y + 0.1 : RING_SEATED_Y;
    group.current.position.y = MathUtils.damp(group.current.position.y, rise, instant ? 100 : 0.8, delta);
    // A slow sway so the stone keeps catching the light.
    spinner.current.rotation.y = Math.sin(clock.elapsedTime * 0.55) * 0.42;
  });

  const prongs = [0, 1, 2, 3].map((i) => {
    const angle = Math.PI / 4 + (i * Math.PI) / 2;
    return (
      <mesh
        key={i}
        position={[Math.cos(angle) * 0.13, STONE_Y - 0.03, Math.sin(angle) * 0.13]}
        rotation={[Math.sin(angle) * 0.3, 0, -Math.cos(angle) * 0.3]}
      >
        <cylinderGeometry args={[0.012, 0.02, 0.22, 8]} />
        <Gold color="#e6c9ae" />
      </mesh>
    );
  });

  return (
    <group ref={group} position={[0, RING_HIDDEN_Y, 0.12]} rotation={[-0.1, 0, 0]} visible={false}>
      <group ref={spinner}>
        <mesh>
          <torusGeometry args={[RADIUS, 0.042, 16, 64]} />
          <Gold />
        </mesh>
        <mesh position={[0, RADIUS + 0.045, 0]}>
          <cylinderGeometry args={[0.1, 0.05, 0.08, 16]} />
          <Gold color="#e6c9ae" />
        </mesh>
        {prongs}
        <group position={[0, STONE_Y, 0]}>
          <Diamond />
        </group>
      </group>
    </group>
  );
}

function Box({ phase, instant }: { phase: RingPhase; instant: boolean }) {
  const root = useRef<Group>(null);
  const lid = useRef<Group>(null);
  const shown = useRef(0);

  useFrame((_, delta) => {
    if (root.current) {
      const visible = reached(phase, "box");
      root.current.visible = visible;
      shown.current = MathUtils.damp(shown.current, visible ? 1 : 0, instant ? 100 : 1, delta);
      const scale = 0.9 + 0.1 * shown.current;
      root.current.scale.setScalar(scale);
      root.current.position.y = -0.3 * (1 - shown.current);
      // Turns from three-quarter view to face her as the camera moves in.
      const turn = reached(phase, "open") ? 0 : -0.34;
      root.current.rotation.y = MathUtils.damp(root.current.rotation.y, turn, instant ? 100 : 0.65, delta);
    }
    if (lid.current) {
      const target = reached(phase, "open") ? LID_OPEN_ANGLE : 0;
      lid.current.rotation.x = MathUtils.damp(lid.current.rotation.x, target, instant ? 100 : 0.85, delta);
    }
  });

  return (
    <group ref={root} rotation={[0, -0.34, 0]} visible={false}>
      {/* Base */}
      <RoundedBox args={[2.2, 1, 2.2]} radius={0.09} smoothness={3} position={[0, 0.5, 0]}>
        <Velvet />
      </RoundedBox>
      {/* Gold trim around the opening */}
      <RoundedBox args={[2.1, 0.035, 2.1]} radius={0.015} smoothness={2} position={[0, 1, 0]}>
        <Gold roughness={0.28} />
      </RoundedBox>
      {/* Cushion */}
      <RoundedBox args={[1.96, 0.13, 1.96]} radius={0.06} smoothness={3} position={[0, 1.03, 0]}>
        <Lining />
      </RoundedBox>
      {/* The slit that holds the ring */}
      <mesh position={[0, 1.098, 0.12]}>
        <boxGeometry args={[0.95, 0.006, 0.09]} />
        <meshStandardMaterial color="#0d0508" roughness={1} />
      </mesh>

      {/* Lid, hinged along the back edge */}
      <group ref={lid} position={[0, 1.04, -1.1]}>
        <RoundedBox args={[2.2, 0.56, 2.2]} radius={0.09} smoothness={3} position={[0, 0.28, 1.1]}>
          <Velvet />
        </RoundedBox>
        <mesh position={[0, -0.006, 1.1]}>
          <boxGeometry args={[1.98, 0.012, 1.98]} />
          <Lining />
        </mesh>
      </group>

      {/* Hinges and clasp */}
      {[-0.62, 0.62].map((x) => (
        <mesh key={x} position={[x, 1.04, -1.11]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.035, 0.3, 12]} />
          <Gold />
        </mesh>
      ))}
      <RoundedBox args={[0.24, 0.13, 0.03]} radius={0.012} smoothness={2} position={[0, 0.95, 1.105]}>
        <Gold />
      </RoundedBox>

      <Ring phase={phase} instant={instant} />
    </group>
  );
}

/** A soft shadow that grounds the box on the dark stage. */
function FloorShadow({ phase, instant }: { phase: RingPhase; instant: boolean }) {
  const mesh = useRef<Mesh>(null);
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const c = canvas.getContext("2d")!;
    const g = c.createRadialGradient(128, 128, 30, 128, 128, 128);
    g.addColorStop(0, "rgba(0,0,0,.9)");
    g.addColorStop(0.55, "rgba(0,0,0,.55)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
    return new CanvasTexture(canvas);
  }, []);

  useFrame((_, delta) => {
    const material = mesh.current?.material as MeshBasicMaterial | undefined;
    if (!material) return;
    const target = reached(phase, "box") ? 1 : 0;
    material.opacity = MathUtils.damp(material.opacity, target, instant ? 100 : 0.8, delta);
  });

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[5.4, 5.4]} />
      <meshBasicMaterial map={texture} transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

export default function RingBox({ phase, instant = false }: { phase: RingPhase; instant?: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      camera={{ fov: FOV, position: [0, 3.5, 14], near: 0.1, far: 100 }}
      className="!absolute inset-0"
      aria-hidden
    >
      <ambientLight intensity={0.12} color="#ffdfc4" />
      <StudioReflections phase={phase} instant={instant} />
      <Lights phase={phase} instant={instant} />
      <FloorShadow phase={phase} instant={instant} />
      <Box phase={phase} instant={instant} />
      {reached(phase, "ring") && <Glints />}
      <CameraRig phase={phase} instant={instant} />
    </Canvas>
  );
}
