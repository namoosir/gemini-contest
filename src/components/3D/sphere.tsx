import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import vertexShader from "../../shaders/sphereVertexShader.glsl";
import fragmentShader from "../../shaders/sphereFragmentShader.glsl";
import { useMemo, useRef } from "react";
import { calculateAmplitudeFromAnalyser } from "@/utils";

interface Props {
  audioContext?: AudioContext
  analyser?: AnalyserNode;
}

const Sphere = (props: Props) => {
  const amplitude = useRef<number>(0)
  const mesh = useRef<THREE.Mesh>();

  const uniforms = useMemo(() => {
    const customColor = new THREE.Color(0.13, 0.77, 0.36);
    return {
      u_time: { value: 0 },
      u_intensity: { value: 0.3 },
      u_color: { value: customColor },
    };
  }, []);

  useFrame((state) => {
    const { clock } = state;
    if (!mesh.current) return

    mesh.current.material.uniforms.u_time.value =
      0.4 * clock.getElapsedTime();

    mesh.current.rotation.x += 0.001;
    mesh.current.rotation.z += 0.001;

    if (!props.analyser) return;

    if (props.audioContext?.state === 'closed') {
      mesh.current.material.uniforms.u_intensity.value = amplitude.current = 0
    } else {
      const newAmplitude = (calculateAmplitudeFromAnalyser(props.analyser) - 1.5) / 3.5
      const smoothingFactor = 0.1
  
      amplitude.current = amplitude.current + smoothingFactor * (newAmplitude - amplitude.current);
  
      // mesh.current.material.uniforms.u_intensity.value = amplitude * 10
      mesh.current.material.uniforms.u_intensity.value = amplitude.current
    }
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[4, 30]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        wireframe
      />
    </mesh>
  );
};

export default Sphere;
