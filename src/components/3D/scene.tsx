import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { Bloom, ChromaticAberration, DepthOfField, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction, KernelSize } from 'postprocessing'
import Sphere from './sphere'
import { Suspense } from 'react'

interface Props {
  audioContext?: AudioContext
  analyser?: AnalyserNode;
}

const Scene = (props: Props) => {
  return (
    <div className='h-full'>
      <Canvas>
        <PerspectiveCamera makeDefault fov={30} position={[0, 0, 20]} />
        <Suspense fallback={null}>
          <Sphere {...props} />
        </Suspense>
        <EffectComposer>
          <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} />
          <Bloom
            kernelSize={KernelSize.LARGE}
            luminanceThreshold={0}
            luminanceSmoothing={0.5}
            height={700}
          />
          <Noise opacity={0.02} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL} // blend mode
            /* @ts-expect-error: Suppress TypeScript error */
            offset={[0.0035, 0.0035]} // color offset
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
}

export default Scene