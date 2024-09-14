import { useState, useEffect, Suspense } from 'react';
import Head from 'next/head';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function ThreeScene({ modelUrl }) {
  return (
    <Canvas style={{ height: '400px' }}>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      <Suspense fallback={null}>
        <Model url={modelUrl} />
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
}

export default function Home() {
  const [modelUrl, setModelUrl] = useState('');

  useEffect(() => {
    // Replace this URL with the path to your GLB model
    setModelUrl('../../public/models/model.glb');
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>My App with 3D Model</title>
        <meta name="description" content="A simple app with a 3D model" />
      </Head>
      <main className="flex-grow flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to My App</h1>
        <div className="w-full max-w-lg">
          <ThreeScene modelUrl={modelUrl} />
        </div>
        <p className="text-xl mt-4">This is a page with a 3D model.</p>
      </main>
    </div>
  );
}