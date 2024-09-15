import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, AccumulativeShadows, RandomizedLight } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';
import AuthButtons from '../components/AuthButtons';
import MicButton from '../components/Mic';
import DropDown from '../components/DropDown';
import Component from '../components/DropDown';
import ChatHistory from '../components/MessageBubble';
import { useAuth } from "@clerk/nextjs";
import { useRouter } from 'next/router';


const questionMapping = {
  "Math": {
    "HW 1": {
      "Question #1": "Simplify this expression 3(2x+4)-5x",
      "Question #2": "Solve for x: 2x + 5 = 13",
      "Question #3": "Find the slope of the line passing through points (2,3) and (4,7)"
    },
    "HW 2": {
      "Question #1": "Factor the expression: x^2 + 5x + 6",
      "Question #2": "Solve the quadratic equation: x^2 - 4x - 5 = 0",
      "Question #3": "Find the area of a circle with radius 5 units"
    },
    "HW 3": {
      "Question #1": "Simplify the radical expression: √(32)",
      "Question #2": "Solve the system of equations: 2x + y = 7, x - y = 1",
      "Question #3": "Find the volume of a sphere with radius 3 units"
    }
  },
  "Chemistry": {
    "Assignment #1": {
      "Question #1": "Balance this chemical equation: H2 + O2 -> H2O",
      "Question #2": "Calculate the molarity of a solution containing 4 grams of NaOH in 500 mL of solution",
      "Question #3": "Name the compound: Fe2O3"
    },
    "Assignment #2": {
      "Question #1": "What is the pH of a 0.01 M HCl solution?",
      "Question #2": "Draw the Lewis structure for CO2",
      "Question #3": "Calculate the empirical formula of a compound that is 40% carbon, 6.7% hydrogen, and 53.3%"
    },
    "Assignment #3": {
      "Question #1": "Define the term 'isotope'",
      "Question #2": "What is the difference between an exothermic and endothermic reaction?",
      "Question #3": "Calculate the number of moles in 50 grams of CaCO3"
    }
  },
  "English": {
    "Assignment": {
      "Question #1": "Analyze the main theme in Shakespeare's 'Romeo and Juliet'",
      "Question #2": "Compare and contrast the writing styles of Ernest Hemingway and F. Scott Fitzgerald",
      "Question #3": "Explain the significance of the symbolism in George Orwell's '1984'"
    }
  }
};

function Model({ url, animationUrl, animationSpeed = 1 }) {
  const fbx = useLoader(FBXLoader, url);
  const animationFbx = useLoader(FBXLoader, animationUrl);
  const mixerRef = useRef();
  const actionRef = useRef();

  useEffect(() => {
    if (fbx && animationFbx) {
      fbx.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.color = new THREE.Color(0xFFDD99);
          }
        }
      });

      const mixer = new THREE.AnimationMixer(fbx);
      const action = mixer.clipAction(animationFbx.animations[0]);
      action.setDuration(action.getClip().duration / animationSpeed); // Adjust animation speed
      action.play();
      mixerRef.current = mixer;
      actionRef.current = action;
    }
  }, [fbx, animationFbx, animationSpeed]);

  useFrame((_, delta) => {
    if (mixerRef.current) mixerRef.current.update(delta);
  });

  return fbx ? <primitive object={fbx} scale={0.1} /> : null;
}

function CameraController() {
  const { camera, scene } = useThree();
  const controlsRef = useRef();

  useEffect(() => {
    if (controlsRef.current) {
      camera.position.set(-8, 8, 8);
      camera.lookAt(scene.position);
      controlsRef.current.update();
    }
  }, [camera, scene]);

  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={false}
      enablePan={false}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={Math.PI / 2}
    />
  );
}

function ThreeScene({ modelUrl, animationUrl }) {
  return (
    <Canvas shadows style={{ width: '1300px', height: '1300px' }}>
      <CameraController />
      <ambientLight intensity={1} />
      <directionalLight
        position={[50, 50, 50]}
        intensity={2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <Suspense fallback={null}>
        <Model url={modelUrl} animationUrl={animationUrl} />
        <Environment preset="studio" background={false} />
      </Suspense>
    </Canvas>
  );
}



export default function Home() {
  const [modelUrl, setModelUrl] = useState('');
  const [animationUrl, setAnimationUrl] = useState('');
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [messages, setMessages] = useState([]);
  const [selections, setSelections] = useState(['', '', '']);
  const [isRecording, setIsRecording] = useState(false);
  // const [audioUrl, setAudioUrl] = useState(null);
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [question, setQuestion] = useState('');
  const [conversationContext, setConversationContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);




  useEffect(() => {
  if (selections.every(selection => selection !== '')) {
    const newQuestion = generateQuestion(selections);
    setQuestion(newQuestion);
    
    // Clear messages and reset conversationContext with the new question
    setMessages([]);
    setConversationContext(`Question: ${newQuestion}\n\n`);
  }
}, [selections]);

  const generateQuestion = (selections) => {
    const [subject, assignment, questionNumber] = selections;
    return questionMapping[subject]?.[assignment]?.[questionNumber] || "Question not found";
  };
  

  const handleMicClick = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
          // const audioUrl = URL.createObjectURL(audioBlob);
          // setAudioUrl(audioUrl);
          sendAudioToAPI(audioBlob);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    } else {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToAPI = async (audioBlob) => {
    console.log('Sending audio to API...');
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.mp3');
    
    try {
      const response = await fetch('http://localhost:8000/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API response:', result.result.text);
      if (result.result.text) {
        // Update messages state with the new transcription
        setConversationContext(prevContext => prevContext + `Student Response: ${result.result.text}\n\n`);
        // Call assess endpoint with the transcription
        await assessTranscription(conversationContext + `Student Response: ${result.result.text}\n\n`);
      } else {
        console.error('No transcription text in API response');
        setMessages(prevMessages => [...prevMessages, "Error: No transcription received"]);
      }
    } catch (error) {
      console.error('Error sending audio to API:', error);
      setMessages(prevMessages => [...prevMessages, "Error transcribing audio"]);
    }
  };
  
  const assessTranscription = async (transcription) => {
    console.log('Sending audio to asessing...');
    console.log('Conversation context:', transcription);

    try {
      const response = await fetch('http://localhost:8000/assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({transcription}),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log('Assessment response:', result.assessment);
  
      if (result.assessment) {
        // Update messages state with the assessment
        setConversationContext(prevContext => prevContext + `Assessment: ${result.assessment}\n\n`);

        await textToVoice(result.assessment);
      } else {
        console.error('No assessment in API response');
        setMessages(prevMessages => [...prevMessages, "Error: No assessment received"]);
      }
    } catch (error) {
      console.error('Error sending assessment request:', error);
      setMessages(prevMessages => [...prevMessages, "Error getting assessment"]);
    }
  };

  const textToVoice = async (text) => {
    console.log('Sending text to voice...');

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/text_to_voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: text }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      if (result.audio_output) {
        // Play the audio
        setMessages(prevMessages => [...prevMessages, `Assessment: ${text}`]);
        playAudio(result.audio_output);
      } else {
        console.error('No audio output in response');
      }
    } catch (error) {
      console.error('Error in text-to-voice conversion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  
  
  const playAudio = (base64Audio) => {
    console.log('Playing audio...');
    // Convert base64 to blob
    const byteCharacters = atob(base64Audio);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'audio/mp3' });
  
    // Create audio element and play
    const audio = new Audio(URL.createObjectURL(blob));
    audio.play();
  };

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setMessages(prevMessages => [
  //       ...prevMessages,
  //       `New message ${prevMessages.length + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.`
  //     ]);
  //   }, 10000); // Add a new message every 3 seconds

  //   return () => clearInterval(timer);
  // }, []);


  useEffect(() => {
    setModelUrl('/models/Beaver_LOD1.fbx');
    setAnimationUrl('/models/Beaver_Animations.fbx'); // Add animation file path
  }, []);

  useEffect(() => {
    console.log('Current selections:', selections);
    // You can perform any action based on the selections here
  }, [selections]);
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/');
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded || !userId) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen w-screen flex flex-col bg-cover bg-center bg-no-repeat relative overflow-hidden"  style={{backgroundImage: "url('mainback.png')",  height: '100vh',
      width: '100vw'}}>
    <div className="flex flex-row justify-between items-center ml-[100px] mt-[54px] mr-[54px]">
    <Component selections={selections} setSelections={setSelections} />
    <AuthButtons />
    </div>
    <div className="flex justify-between flex-grow mt-[48px] relative">
    <div className="w-[533px] h-[72px] bg-[#F7F5ED] ml-[100px] rounded-[100px] flex items-center justify-center">
            <p className="text-[20px] font-medium text-black text-center px-4">{question}</p>
          </div>
        <div className="mt-[-360px] ml-auto mr-[54px] self-center">
          <ChatHistory messages={messages} isLoading={isLoading} />
        </div>
</div>
  <div className="absolute bottom-[180px] left-[-250px] w-[600px] h-[600px]">
      {modelUrl && animationUrl && (
        <ThreeScene modelUrl={modelUrl} animationUrl={animationUrl} animationSpeed={animationSpeed} />
      )}
    </div>
    <div className="absolute bottom-[54px] right-[54px]">
    {/* {audioUrl && (
          <audio controls src={audioUrl} className="mr-4">
            Your browser does not support the audio element.
          </audio>
        )} */}
    <MicButton onClick={handleMicClick} isRecording={isRecording} />
    </div>
    
</div>

  );
}