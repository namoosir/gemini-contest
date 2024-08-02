import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import Sphere from './sphere'

const Scene = () => {
  return (
    <div className='h-full'>
      <Canvas>
        <PerspectiveCamera makeDefault fov={30} position={[0, 0, 20]}>
        </PerspectiveCamera>
        <Sphere />
      </Canvas>
    </div>
  )
}

export default Scene