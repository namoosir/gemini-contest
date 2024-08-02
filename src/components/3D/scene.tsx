import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import Sphere from './sphere'

interface Props {
  audioContext?: AudioContext
  analyser?: AnalyserNode;
}

const Scene = (props: Props) => {
  return (
    <div className='h-full'>
      <Canvas>
        <PerspectiveCamera makeDefault fov={30} position={[0, 0, 20]} />
        <Sphere {...props} />
      </Canvas>
    </div>
  )
}

export default Scene