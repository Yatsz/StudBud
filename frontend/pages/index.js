import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, AccumulativeShadows, RandomizedLight } from '@react-three/drei';
import AuthButtons from '../components/AuthButtons';
import MicButton from '../components/Mic';




function Model({ url }) {
  const { scene } = useGLTF(url);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
}

function CameraController() {
  const { camera, scene } = useThree();
  const controlsRef = useRef();

  useEffect(() => {
    if (controlsRef.current) {
      camera.position.set(-50, 50, 50);
      camera.lookAt(scene.position);
      controlsRef.current.update();
    }
  }, [camera, scene]);

  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });

  return <OrbitControls ref={controlsRef} />;
}

function ThreeScene({ modelUrl }) {
  return (
    <Canvas shadows style={{ width: '556px', height: '513px' }}>
      <color attach="background" args={['#ffffff']} />
      <CameraController />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[50, 50, 50]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <Suspense fallback={null}>
        <Model url={modelUrl} />
        <Environment preset="sunset" background={false} />
        <AccumulativeShadows temporal frames={60} alphaTest={0.85} scale={10} position={[0, -0.5, 0]}>
          <RandomizedLight amount={8} radius={5} ambient={0.5} intensity={1} position={[5, 3, 2]} bias={0.001} />
        </AccumulativeShadows>
      </Suspense>
    </Canvas>
  );
}

function handleMicClick() {
  console.log('Mic clicked');
}

export default function Home() {
  const [modelUrl, setModelUrl] = useState('');

  useEffect(() => {
    setModelUrl('/models/Beaver.glb');
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
    <div className="flex flex-row justify-between items-center p-4">
      <div>Welcome</div>
      <AuthButtons />
    </div>
    <div className="flex flex-row flex-grow">
      <div className="w-[556px] h-[513px]">
        {modelUrl && <ThreeScene modelUrl={modelUrl} />}
      </div>
      <div className="w-[463px] h-[513px] bg-gray-300 rounded-tr-[100px] rounded-bl-[100px] ml-[60px]"></div>
    </div>
    <div>
    <MicButton onClick={handleMicClick} />
    </div>
    
</div>

  );
}