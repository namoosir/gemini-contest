import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import vertexShader from '../../shaders/sphereVertexShader.glsl'
import fragmentShader from '../../shaders/sphereFragmentShader.glsl'
import { useMemo, useRef } from 'react';

const Sphere = () => {
  const mesh = useRef<THREE.Mesh>();
  const uniforms = useMemo(() => {
    return {
      u_time: { value: 0 },
      u_intensity: { value: 0.3 },
    };
  }, []);


  useFrame((state) => {
    const { clock } = state;
    if (mesh.current) {
      mesh.current.material.uniforms.u_time.value =
        0.4 * clock.getElapsedTime();

      mesh.current.rotation.x += 0.0001
      mesh.current.rotation.z += 0.0001
    }
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[4, 30]} />
      <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} wireframe />
    </mesh>
  )
}

export default Sphere