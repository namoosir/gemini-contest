import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import vertexShader from "../../shaders/sphereVertexShader.glsl";
import fragmentShader from "../../shaders/sphereFragmentShader.glsl";
import { useMemo, useRef } from "react";
import { calculateAverageFrequency } from "@/utils";

interface Props {
  audioContext?: AudioContext
  analyser?: AnalyserNode;
}

const Sphere = (props: Props) => {
  const amplitude = useRef<number>(1)
  const mesh = useRef<THREE.Mesh<THREE.IcosahedronGeometry, THREE.ShaderMaterial>>(null);

  const uniforms = useMemo(() => {
    const customColor = new THREE.Color(0.13, 0.77, 0.36);
    return {
      u_time: { value: 0 },
      u_intensity: { value: 0.2 },
      u_color: { value: customColor },
      u_frequency: { value: 1 }
    };
  }, []);

  useFrame((state) => {
    const { clock } = state;
    if (!mesh.current) return

    mesh.current.material.uniforms.u_time.value =
      0.4 * clock.getElapsedTime();

    mesh.current.rotation.x += 0.0001;
    mesh.current.rotation.z += 0.0001;
    
    const smoothingFactor = 0.1
    let newFrequency;

    if (!props.analyser || !props.audioContext || props.audioContext.state === 'closed') {
      newFrequency = 1
    } else {
      newFrequency = calculateAverageFrequency(props.analyser);
    }

    amplitude.current = amplitude.current + smoothingFactor * (newFrequency - amplitude.current);

    mesh.current.material.uniforms.u_frequency.value = amplitude.current / 5
  });

  return (
    <mesh ref={mesh}>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <icosahedronGeometry args={[4, 30]} />
      <shaderMaterial
        /* eslint-disable-next-line react/no-unknown-property */
        vertexShader={vertexShader}
        /* eslint-disable-next-line react/no-unknown-property */
        fragmentShader={fragmentShader}
        /* eslint-disable-next-line react/no-unknown-property */
        uniforms={uniforms}
        /* eslint-disable-next-line react/no-unknown-property */
        wireframe
      />
    </mesh>
  );
};

export default Sphere;
