import Icon from "@mdi/react";
import { Button } from "./ui/button";
import { mdiMicrophone, mdiMicrophoneOff } from "@mdi/js";

interface Props {
  isRecording: boolean;
  stopRecording: () => void;
  amplitude: number;
}

const AnimatedMic: React.FC<Props> = (props: Props) => {
  const FACTOR = 34

  return (
    <div
      className="rounded-full flex items-center justify-center bg-muted"
      style={{
        height: `${props.amplitude * FACTOR}px`,
        width: `${props.amplitude * FACTOR}px`,
      }}
    >
      <Button
        className="absolute h-20 w-20 rounded-full"
        variant={props.isRecording ? "destructive" : "secondary"}
        disabled={!props.isRecording}
        onClick={() => {
          console.log('clicked', props.isRecording)
          if (props.isRecording)
            props.stopRecording()
        }}
      >
        <Icon
          path={props.isRecording ? mdiMicrophone : mdiMicrophoneOff}
          className="h-8 w-8"
        />
      </Button>
    </div>
  );
};

export default AnimatedMic;
