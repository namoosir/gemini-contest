import { useEffect, useState } from "react";

let recognition: any = null;

if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.lan = "en-US";
  recognition.interimResults = true;
}

const useSpeechRecognition = () => {
  const [text, setText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      setText((prevText) => prevText + finalTranscript);
      setInterimText(interimTranscript);
    };

    recognition.onend = () => {
      if (isListening) {
        console.log("Recognition ended prematurely, starting up again...");
        recognition.start();
      } else {
        console.log("Recognition ended");
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Recognition error: ", event);
      setIsListening(false);
    };

    return () => {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
    };
  }, [isListening]);

  const startListening = () => {
    if (!isListening) {
      setText("");
      setInterimText("");
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (isListening) {
      setIsListening(false);
      recognition.stop();
    }
  };

  return {
    text: text + interimText,
    startListening,
    stopListening,
    isListening,
    hasRecognitionSupport: !!recognition,
  };
};

export default useSpeechRecognition;
