import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ArrowDown, ArrowUpRight, Crosshair, Menu } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const phases = [
  ['00 / THE FLOOR', 'Before motion, precision.'],
  ['01 / SYSTEMS ONLINE', 'A quiet network comes to life.'],
  ['02 / COMPONENTS', 'Every element, exactly placed.'],
  ['03 / ASSEMBLY', 'Millimeter-perfect engineering.'],
  ['04 / INSIDE THE MACHINE', 'A closer look at what moves.'],
  ['05 / COMPLETION', 'Built to move with purpose.'],
];

const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const mat = (color, metalness = 0.5, roughness = 0.42, extra = {}) => <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} {...extra} />;

function Box({ position, scale, color = '#283238', roughness = .43, metalness = .66, radius = 0, ...props }) {
  return <mesh position={position} scale={scale} castShadow receiveShadow {...props}><boxGeometry args={[1, 1, 1, 2, 2, 2]} />{mat(color, metalness, roughness)}</mesh>;
}
function Cylinder({ position, args = [.3, .3, .18, 32], color = '#67747a', rotation, metalness = .8, roughness = .27, ...props }) {
  return <mesh position={position} rotation={rotation} castShadow receiveShadow {...props}><cylinderGeometry args={args} />{mat(color, metalness, roughness)}</mesh>;
}
function Rod({ a, b, radius = .1, color = '#b5c1c3', dark = false }) {
  const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b), mid = start.clone().add(end).multiplyScalar(.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize());
  return <mesh position={mid} quaternion={q} castShadow><cylinderGeometry args={[radius, radius * .91, start.distanceTo(end), 16]} />{mat(dark ? '#303a3e' : color, .86, .25)}</mesh>;
}

function Gear({ radius = .44, teeth = 12, thickness = .13, color = '#c6c7bd' }) {
  return <group>
    <mesh castShadow receiveShadow><cylinderGeometry args={[radius * .78, radius * .78, thickness, 48]} />{mat(color, .91, .24)}</mesh>
    <Cylinder position={[0, thickness * .55, 0]} args={[radius * .39, radius * .39, thickness * .18, 40]} color="#69787b" />
    {Array.from({ length: teeth }, (_, i) => <Box key={i} position={[Math.cos(i * Math.PI * 2 / teeth) * radius * .91, 0, Math.sin(i * Math.PI * 2 / teeth) * radius * .91]} scale={[radius * .34, thickness, radius * .22]} color={color} metalness={.91} roughness={.23} />)}
    {Array.from({ length: 8 }, (_, i) => <Cylinder key={`b${i}`} position={[Math.cos(i * Math.PI / 4) * radius * .6, thickness * .6, Math.sin(i * Math.PI / 4) * radius * .6]} args={[.018, .018, .012, 10]} color="#333c3e" />)}
  </group>;
}

function Bearing({ radius = .32, position }) {
  return <group position={position}><Cylinder args={[radius, radius, .14, 48]} color="#6a7475" /><Cylinder position={[0, .085, 0]} args={[radius * .71, radius * .71, .035, 48]} color="#1c282c" />
    <Cylinder position={[0, .11, 0]} args={[radius * .45, radius * .45, .045, 40]} color="#c2b992" />
    <Cylinder position={[0, .14, 0]} args={[radius * .27, radius * .27, .07, 32]} color="#22292b" />
    {Array.from({ length: 8 }, (_, i) => <Cylinder key={i} position={[Math.cos(i * Math.PI / 4) * radius * .84, .101, Math.sin(i * Math.PI / 4) * radius * .84]} args={[.022, .022, .014, 10]} color="#bac5c3" />)}
  </group>;
}

function Product({ progressRef }) {
  const chassis = useRef(), core = useRef(), top = useRef(), left = useRef(), right = useRef(), board = useRef(), shaft = useRef(), gearL = useRef(), gearR = useRef();
  useFrame(() => {
    const p = progressRef.current;
    const exploded = smooth(.60, .70, p) * (1 - smooth(.76, .86, p));
    const build = smooth(.27, .53, p);
    const o = exploded;
    if (chassis.current) chassis.current.position.y = -.09 - (1 - build) * 1.8;
    if (core.current) core.current.position.y = .43 + o * .40 - (1 - build) * 1.5;
    if (shaft.current) { shaft.current.position.y = .72 + o * .65 - (1 - build) * 1.5; shaft.current.rotation.y = p * 4; }
    if (gearL.current) { gearL.current.position.x = -.56 - o * .55; gearL.current.position.y = .67 + o * .25 - (1 - build) * 1.5; gearL.current.rotation.y = p * 2.1; }
    if (gearR.current) { gearR.current.position.x = .56 + o * .55; gearR.current.position.y = .67 + o * .25 - (1 - build) * 1.5; gearR.current.rotation.y = -p * 2.1; }
    if (board.current) { board.current.position.y = .69 - (1 - build) * 1.5; board.current.position.z = o * .75; }
    if (top.current) top.current.position.y = 1.35 + o * 1.1 - (1 - build) * 1.5;
    if (left.current) { left.current.position.x = -.86 - o * .8; left.current.position.y = .51 + o * .3 - (1 - build) * 1.5; }
    if (right.current) { right.current.position.x = .86 + o * .8; right.current.position.y = .51 + o * .3 - (1 - build) * 1.5; }
  });
  return <group position={[0, .12, 0]} rotation={[.02, -.28, 0]}>
    <group ref={chassis}>
      <Box position={[0, 0, 0]} scale={[1.7, .27, .95]} color="#3e484a" />
      <Box position={[0, .16, 0]} scale={[1.49, .06, .77]} color="#b3b6a8" roughness={.24} />
      <Box position={[0, .24, 0]} scale={[1.23, .09, .62]} color="#202a2d" />
      {[-.66, -.34, 0, .34, .66].map((x) => <Box key={x} position={[x, .18, .39]} scale={[.035, .12, .035]} color="#d49549" />)}
      {[-.72, .72].map((x) => [-.36, .36].map((z) => <Cylinder key={`${x}-${z}`} position={[x, .19, z]} args={[.04, .04, .03, 16]} color="#dbd5c1" />))}
    </group>
    <group ref={core}>
      <Box position={[0, .52, 0]} scale={[1.1, .43, .68]} color="#29373a" />
      <Box position={[0, .75, .02]} scale={[.8, .06, .5]} color="#a7ad9f" roughness={.24} />
      <Box position={[0, .50, .354]} scale={[.7, .23, .018]} color="#171f20" />
      {Array.from({ length: 12 }, (_, i) => <Box key={i} position={[-.31 + i * .056, .51, .37]} scale={[.025, .15, .016]} color="#b18443" metalness={.79} />)}
      <Bearing position={[0, 0, 0]} />
    </group>
    <group ref={shaft} position={[0, .72, 0]}>
      <Cylinder position={[0, 0, 0]} args={[.09, .09, .89, 32]} color="#bdc2b7" />
      <Cylinder position={[0, .23, 0]} args={[.20, .20, .08, 40]} color="#c5c5b8" />
      <Cylinder position={[0, -.25, 0]} args={[.17, .17, .07, 40]} color="#8c9690" />
      <Cylinder position={[0, .39, 0]} args={[.13, .13, .06, 32]} color="#d1aa5c" />
    </group>
    <group ref={gearL} position={[-.56, .67, 0]}><Gear radius={.30} teeth={12} color="#c0c4b6" /></group>
    <group ref={gearR} position={[.56, .67, 0]}><Gear radius={.30} teeth={12} color="#c0c4b6" /></group>
    <group ref={board} position={[0, .69, 0]}>
      <Box position={[0, 0, 0]} scale={[1.24, .035, .75]} color="#193b39" roughness={.37} metalness={.31} />
      {[-.42, .42].map((x) => <Box key={x} position={[x, .04, .03]} scale={[.28, .07, .32]} color="#262e31" />)}
      {Array.from({ length: 11 }, (_, i) => <Cylinder key={i} position={[-.52 + i * .104, .025, .29]} args={[.016, .016, .014, 8]} color="#cd9e56" />)}
    </group>
    <group ref={left} position={[-.86, .51, 0]}><Box position={[0, 0, 0]} scale={[.27, .87, .76]} color="#aab1aa" roughness={.27} />
      <Box position={[.03, -.02, .392]} scale={[.17, .51, .018]} color="#394447" />
      {[-.29, -.09, .11, .31].map((y) => <Cylinder key={y} position={[0, y, .411]} args={[.027, .027, .024, 16]} rotation={[Math.PI/2,0,0]} color="#ddaf5f" />)}
    </group>
    <group ref={right} position={[.86, .51, 0]}><Box position={[0, 0, 0]} scale={[.27, .87, .76]} color="#aab1aa" roughness={.27} />
      <Box position={[-.03, -.02, .392]} scale={[.17, .51, .018]} color="#394447" />
      {[-.29, -.09, .11, .31].map((y) => <Cylinder key={y} position={[0, y, .411]} args={[.027, .027, .024, 16]} rotation={[Math.PI/2,0,0]} color="#ddaf5f" />)}
    </group>
    <group ref={top} position={[0,1.35,0]}>
      <mesh scale={[1.8,.32,1.08]} castShadow receiveShadow><boxGeometry args={[1,1,1,2,2,2]}/>{mat('#e1ded2',.58,.26)}</mesh>
      <Cylinder position={[0, .18, 0]} args={[.34, .34, .05, 40]} color="#b7aa83" />
      <Cylinder position={[0, .22, 0]} args={[.19, .19, .035, 32]} color="#313b3d" />
      {Array.from({ length: 12 }, (_, i) => <Cylinder key={i} position={[Math.cos(i * Math.PI/6)*.74, .175, Math.sin(i * Math.PI/6)*.42]} args={[.026,.026,.014,12]} color="#353d3e" />)}
    </group>
  </group>;
}

function RobotArm({ side, progressRef, activeAt }) {
  const root = useRef(), upper = useRef(), lower = useRef(), wrist = useRef(), lamp = useRef();
  const s = side;
  useFrame(() => {
    const p = progressRef.current;
    const active = smooth(activeAt, activeAt + .075, p);
    const reach = smooth(activeAt + .06, activeAt + .22, p) * (1 - smooth(activeAt + .26, activeAt + .39, p));
    const idle = p > activeAt ? 0 : Math.sin(p * 8 + (s > 0 ? 1.2 : 0)) * .025;
    if (root.current) root.current.rotation.y = s * (.12 + reach * .42) + idle;
    if (upper.current) { upper.current.rotation.z = -.52 + reach * .54 + idle; }
    if (lower.current) lower.current.rotation.z = .88 - reach * .93 - idle * .5;
    if (wrist.current) wrist.current.rotation.z = -.27 + reach * .3;
    if (lamp.current) lamp.current.intensity = .35 + active * 2.5;
  });
  return <group position={[s * 3.15, 0, -.05]} scale={[s, 1, 1]}>
    <Cylinder position={[0, .12, 0]} args={[.56, .62, .24, 32]} color="#30393b" />
    <Cylinder position={[0, .34, 0]} args={[.37, .44, .18, 32]} color="#dda24f" />
    <group ref={root} position={[0, .43, 0]}>
      <Box position={[0, .18, 0]} scale={[.52, .48, .54]} color="#d59b49" />
      <Cylinder position={[0, .42, 0]} args={[.23,.23,.16,32]} color="#242c2e" />
      <group ref={upper} position={[0, .44, 0]}>
        <Rod a={[0,0,0]} b={[0,.98,.05]} radius={.19} color="#d9a250" />
        <Box position={[0,.48,.01]} scale={[.34,.73,.36]} color="#d9a250" />
        <Cylinder position={[0,.93,0]} args={[.25,.25,.20,32]} color="#313b3e" />
        <Cylinder ref={lamp} position={[0,.94,.105]} args={[.13,.13,.015,24]} color="#f2ad53" />
        <group ref={lower} position={[0,.98,.05]}>
          <Rod a={[0,0,0]} b={[0,.92,0]} radius={.13} color="#d9a250" />
          <Box position={[0,.45,.03]} scale={[.22,.72,.23]} color="#c8954c" />
          <Cylinder position={[0,.9,0]} args={[.17,.17,.14,28]} color="#313b3e" />
          <group ref={wrist} position={[0,.96,0]}>
            <Rod a={[0,0,0]} b={[0,.32,0]} radius={.075} />
            <Box position={[0,.30,0]} scale={[.25,.13,.24]} color="#343e41" />
            <Box position={[-.085,.44,.02]} scale={[.035,.23,.055]} color="#cbd0c8" />
            <Box position={[.085,.44,.02]} scale={[.035,.23,.055]} color="#cbd0c8" />
          </group>
        </group>
      </group>
    </group>
  </group>;
}

function Factory({ progressRef, reduced }) {
  const conveyor = useRef(), rollers = useRef([]), scene = useRef(), p = progressRef;
  useFrame((state, delta) => {
    const q = p.current;
    if (scene.current) {
      const targetX = q < .25 ? 0 : q < .44 ? -.16 : q < .58 ? 0 : q < .82 ? .08 : 0;
      const targetZ = 0;
      scene.current.position.x = THREE.MathUtils.damp(scene.current.position.x, targetX, 3, delta);
      scene.current.position.z = THREE.MathUtils.damp(scene.current.position.z, targetZ, 2.3, delta);
      scene.current.rotation.y = THREE.MathUtils.damp(scene.current.rotation.y, q > .58 && q < .85 ? -.08 : 0, 2, delta);
    }
    if (conveyor.current) conveyor.current.position.z = -((state.clock.elapsedTime * .38) % .46);
    rollers.current.forEach((roller) => { if (roller) roller.rotation.x += delta * 1.35; });
  });
  return <group ref={scene}>
    <ambientLight intensity={.45} />
    <hemisphereLight args={['#adced6', '#172023', .72]} />
    <directionalLight position={[-5, 9, 5]} intensity={2.1} color="#deeff0" castShadow shadow-mapSize={[1024,1024]} />
    <directionalLight position={[5, 5, -5]} intensity={2.8} color="#64b4c8" />
    <pointLight position={[0, 4, 1]} intensity={38} distance={14} color="#e6a753" />
    <pointLight position={[-4, 2, -2]} intensity={22} distance={12} color="#31b7d8" />
    <Box position={[0,-.32,-2]} scale={[18,.35,28]} color="#182124" roughness={.69} />
    <Box position={[0,6,-7]} scale={[18,.2,.2]} color="#334247" />
    {[-7,-5,-3,3,5,7].map((x) => <group key={x}>
      <Box position={[x,3,-2]} scale={[.15,6,.16]} color="#344044" />
      {[-7,-2,3,8].map((z) => <Box key={z} position={[x,5.8,z-4]} scale={[.18,.13,.18]} color="#55cae4" metalness={.1} roughness={.25} />)}
    </group>)}
    {Array.from({length:9},(_,i)=><group key={`beam${i}`} position={[0,0,-9+i*2.5]}>
      <Box position={[0,5.5,0]} scale={[16,.14,.16]} color="#354145" />
      <Box position={[0,5.22,0]} scale={[2.5,.04,.48]} color="#445053" />
      <mesh position={[0,5.16,0]}><boxGeometry args={[1.7,.045,.32]}/><meshBasicMaterial color="#daedda" /></mesh>
      <pointLight position={[0,4.85,0]} intensity={5} distance={6} color="#d1e5d8" />
    </group>)}
    {[-1.9,1.9].map((x)=><group key={x} position={[x,-.05,-1]}>
      <Box position={[0,.17,0]} scale={[.19,.35,17]} color="#6c797a" />
      <Box position={[0,.38,0]} scale={[.42,.07,17]} color="#242e31" />
      <Box position={[0,.43,0]} scale={[.12,.05,17]} color="#acb4ac" roughness={.27} />
      {Array.from({length:14},(_,i)=><Cylinder key={i} ref={(node) => { rollers.current[i + (x > 0 ? 14 : 0)] = node; }} position={[0,-.01,-7.3+i*1.1]} args={[.21,.21,.56,20]} rotation={[0,0,Math.PI/2]} color="#151c1e" />)}
    </group>)}
    <group ref={conveyor}>
      {Array.from({length:34},(_,i)=><Box key={i} position={[0,.035,7-i*.46]} scale={[3.62,.028,.035]} color={i%4===0?'#858c86':'#303a3c'} metalness={.83} roughness={.33} />)}
    </group>
    <RobotArm side={-1} progressRef={p} activeAt={.12}/>
    <RobotArm side={1} progressRef={p} activeAt={.18}/>
    <group position={[0,.28,0]}>
      <Box position={[0,0,0]} scale={[3.4,.22,2.1]} color="#263134" />
      <Box position={[0,.14,0]} scale={[2.65,.10,1.75]} color="#78817c" roughness={.31} />
      <Product progressRef={p}/>
    </group>
    <group position={[-2.2,.52,2.0]}>
      <Box position={[0,0,0]} scale={[.58,.34,.55]} color="#252e31" />
      <Box position={[0,.27,.04]} scale={[.44,.04,.32]} color="#172c30" />
      <mesh position={[0,.3,.05]}><planeGeometry args={[.35,.22]}/><meshBasicMaterial color="#40ccdf" /></mesh>
      <pointLight position={[0,.5,.1]} intensity={.6 + smooth(.1,.15,p.current)*2} color="#49dcf2" distance={1.4}/>
    </group>
    <Sparkles count={reduced?18:65} scale={[9,4,15]} size={1.4} speed={reduced?0:.18} opacity={.4} color="#9ac8ca" />
    <gridHelper args={[36,36,'#26383a','#172427']} position={[0,-.13,0]} />
  </group>;
}

function CameraRig({ progressRef, reduced }) {
  useFrame(({ camera }, dt) => {
    const p = progressRef.current;
    const close = smooth(.2,.42,p), hero = smooth(.82,.92,p);
    const x = THREE.MathUtils.lerp(0, .45, close) + Math.sin(p * Math.PI) * .15;
    const y = THREE.MathUtils.lerp(2.5, 2.1, close) + Math.sin(hero * Math.PI) * .17;
    const z = THREE.MathUtils.lerp(12.7, 8.3, close) - hero * 1.4;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, x, 2.6, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, y, 2.6, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, z, 2.6, dt);
    camera.lookAt(0, .9 + close * .12, -.25);
  });
  return null;
}

export default function App() {
  const root = useRef(null), progressRef = useRef(0), [progress, setProgress] = useState(0), [reduced, setReduced] = useState(false), [ready, setReady] = useState(false);
  const active = progress < .12 ? 0 : progress < .25 ? 1 : progress < .4 ? 2 : progress < .6 ? 3 : progress < .75 ? 4 : 5;
  const update = useCallback((v) => { progressRef.current = v; setProgress(v); }, []);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const check = () => setReduced(query.matches);
    check(); query.addEventListener?.('change', check);
    return () => query.removeEventListener?.('change', check);
  }, []);
  useEffect(() => {
    const lenis = new Lenis({ lerp: reduced ? 1 : .075, smoothWheel: !reduced, smoothTouch: false, syncTouch: false });
    const ticker = (time) => { lenis.raf(time * 1000); };
    gsap.ticker.add(ticker); gsap.ticker.lagSmoothing(0);
    const ctx = gsap.context(() => {
      const proxy = { value: 0 };
      gsap.to(proxy, { value: 1, ease: 'none', onUpdate: () => update(proxy.value), scrollTrigger: { trigger: '.experience', start: 'top top', end: 'bottom bottom', scrub: reduced ? 0 : 1, onUpdate: (self) => update(self.progress) } });
      ScrollTrigger.refresh();
    }, root);
    lenis.on('scroll', ScrollTrigger.update);
    return () => { ctx.revert(); gsap.ticker.remove(ticker); lenis.destroy(); };
  }, [reduced, update]);
  const phase = phases[active];
  return <main ref={root}>
    <div className="experience">
      <div className="pinned">
        <div className="canvas-wrap" aria-label="3D factory assembly scene">
          <Canvas fallback={<div className="canvas-fallback" style={{height:'100%',display:'grid',placeContent:'center',gap:16,textAlign:'center',background:'#0b1114',color:'#eef1e9',font:'11px DM Mono,monospace',letterSpacing:'.13em'}}>3D EXPERIENCE UNAVAILABLE <a href="#specs" style={{color:'#59d6df'}}>EXPLORE THE ENGINEERING ↓</a></div>} shadows dpr={[1, 1.6]} camera={{ position:[0,2.5,12.7], fov:39 }} gl={{ antialias:true, alpha:false, powerPreference:'high-performance' }} onCreated={({scene}) => { scene.background = new THREE.Color('#0b1114'); scene.fog = new THREE.Fog('#0b1114', 10, 28); setReady(true); }}>
            <CameraRig progressRef={progressRef} reduced={reduced}/><Factory progressRef={progressRef} reduced={reduced}/>
          </Canvas>
        </div>
        <div className="image-wash" />
        <header className="topbar">
          <a href="#top" className="brand"><span className="brand-mark"><span/></span><span>FUTURE<span className="brand-light">/</span>FACTORY<small>PRECISION SYSTEMS · EST. 2049</small></span></a>
          <nav><a href="#specs">THE PROCESS</a><a href="#specs">CAPABILITIES</a></nav>
          <button className="menu-button" aria-label="Go to engineering details" onClick={() => document.getElementById('specs')?.scrollIntoView({behavior: reduced ? 'auto' : 'smooth'})}><span>MENU</span><Menu size={16}/></button>
        </header>
        <div className="top-status"><span className="status-dot"/> SYSTEM <span className="status-rule"/> {ready ? 'ONLINE' : 'INITIALIZING'}</div>
        <div className="scene-heading" style={{ opacity: 1 - smooth(.1,.24,progress) }}>
          <span className="eyebrow"><Crosshair size={13}/> A NEW STANDARD OF MAKING</span>
          <h1>THE FUTURE<br/><span>FACTORY</span></h1>
          <p>Where precision finds its motion.</p>
          <div className="heading-index"><i/> 01 — 05 <span>ENGINEERED INTO EXISTENCE</span></div>
        </div>
        <div className="phase-copy" key={active}>
          <div className="phase-label"><span>0{active + 1}</span><i/> {phase[0].split('/ ')[1]}</div>
          <h2>{phase[1]}</h2>
        </div>
        <div className="product-label" style={{opacity: smooth(.59,.64,progress)*(1-smooth(.77,.82,progress))}}><i/> EXPLODED ASSEMBLY <span>01—05</span></div>
        <div className="hud-bottom">
          <div className="sound-label"><span className="sound-bars"><i/><i/><i/><i/></span> ANIMATION IN SYNC</div>
          <div className="scroll-prompt" style={{opacity: 1-smooth(.01,.06,progress)}}><span>SCROLL TO EXPLORE</span><ArrowDown size={15}/></div>
          <div className="scroll-meter"><span>SCROLL PROGRESS</span><div className="meter-track"><i style={{height:`${Math.max(2,progress*100)}%`}}/></div><b>{Math.round(progress*100).toString().padStart(2,'0')}<small>%</small></b></div>
        </div>
        <div className="hero-cta" style={{opacity:smooth(.88,.94,progress), pointerEvents:progress>.9?'auto':'none'}}><button onClick={()=>document.getElementById('specs')?.scrollIntoView({behavior:'smooth'})}>EXPLORE THE ENGINEERING <ArrowUpRight size={15}/></button></div>
        {reduced && <div className="motion-note">Reduced motion is on · scroll to step through the sequence</div>}
        <div className="frame-corner corner-tl"/><div className="frame-corner corner-tr"/><div className="frame-corner corner-bl"/><div className="frame-corner corner-br"/>
      </div>
    </div>
    <section id="specs" className="spec-section">
      <div><span className="eyebrow">MADE WITH INTENT</span><h2>Precision is a<br/><span>moving target.</span></h2></div>
      <div className="spec-grid"><div><b>01</b><span>REPEATABLE ACCURACY</span><strong>± 0.02 mm</strong></div><div><b>02</b><span>INTEGRATED DRIVE</span><strong>Direct torque</strong></div><div><b>03</b><span>CONTROL SYSTEM</span><strong>Adaptive core</strong></div></div>
    </section>
    <section className="insight-section line-section">
      <div className="insight-copy"><span className="eyebrow"><i/> 01 / AUTOMATED PRODUCTION</span><h2>Motion, made<br/><span>precise.</span></h2><p>Robotic workcells move in a measured rhythm. Every transfer, inspection, and placement brings the assembly closer to its final form.</p><div className="insight-foot"><span>CONTROLLED AT EVERY STEP</span><i/></div></div>
      <figure className="insight-media"><img src={`${import.meta.env.BASE_URL}images/factory-floor.png`} alt="Robotic arms working over an illuminated factory assembly line"/><figcaption><span>LINE 01</span><span>LIVE SYSTEM / 24:07:16</span></figcaption></figure>
    </section>
    <section className="insight-section cutaway-section">
      <figure className="insight-media"><img src={`${import.meta.env.BASE_URL}images/precision-cutaway.png`} alt="Exploded transparent cutaway showing the gears, shafts, and internal connections of a precision mechanism"/><figcaption><span>CORE ASSEMBLY</span><span>SECTION VIEW / 02</span></figcaption></figure>
      <div className="insight-copy"><span className="eyebrow"><i/> 02 / ENGINEERED WITHIN</span><h2>Every part<br/>has a <span>purpose.</span></h2><p>Precision gears, drive shafts, and electronic control meet inside one carefully aligned system. The details you cannot see are what make every movement dependable.</p><div className="insight-foot"><span>ASSEMBLED TO WORK AS ONE</span><i/></div></div>
    </section>
    <footer><a className="brand" href="#top"><span className="brand-mark"><span/></span><span>FUTURE<span className="brand-light">/</span>FACTORY<small>PRECISION SYSTEMS · EST. 2049</small></span></a><span>DESIGNED FOR WHAT'S NEXT.</span><span>© 2049 FUTURE SYSTEMS</span></footer>
  </main>;
}
