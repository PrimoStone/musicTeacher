import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface PitchDetectorProps {
  onPitchDetected: (notePosition: number) => void;
}

const PitchDetector: React.FC<PitchDetectorProps> = ({ onPitchDetected }) => {
  const [isListening, setIsListening] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const startListening = useCallback(async () => {
    const context = new AudioContext();
    const analyserNode = context.createAnalyser();
    analyserNode.fftSize = 2048;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = context.createMediaStreamSource(stream);
      source.connect(analyserNode);
      setAudioContext(context);
      setAnalyser(analyserNode);
      setIsListening(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
      setAnalyser(null);
    }
    setIsListening(false);
  }, [audioContext]);

  useEffect(() => {
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);

    const detectPitch = () => {
      analyser.getFloatTimeDomainData(dataArray);
      const fundamentalFreq = autoCorrelate(dataArray, audioContext!.sampleRate);
      
      if (fundamentalFreq > -1) {
        const notePosition = freqToNotePosition(fundamentalFreq);
        onPitchDetected(notePosition);
      }

      if (isListening) {
        requestAnimationFrame(detectPitch);
      }
    };

    detectPitch();

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [analyser, audioContext, isListening, onPitchDetected]);

  return (
    <button
      onClick={isListening ? stopListening : startListening}
      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
    >
      {isListening ? <MicOff className="mr-2" /> : <Mic className="mr-2" />}
      {isListening ? 'Stop Listening' : 'Start Listening'}
    </button>
  );
};

function autoCorrelate(buffer: Float32Array, sampleRate: number): number {
  const SIZE = buffer.length;
  const MAX_SAMPLES = Math.floor(SIZE / 2);
  let bestOffset = -1;
  let bestCorrelation = 0;
  let rms = 0;
  let foundGoodCorrelation = false;

  for (let i = 0; i < SIZE; i++) {
    const val = buffer[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1;

  for (let offset = 0; offset < MAX_SAMPLES; offset++) {
    let correlation = 0;

    for (let i = 0; i < MAX_SAMPLES; i++) {
      correlation += Math.abs(buffer[i] - buffer[i + offset]);
    }
    correlation = 1 - correlation / MAX_SAMPLES;

    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestOffset = offset;
    }

    if (correlation > 0.9) {
      foundGoodCorrelation = true;
    } else if (foundGoodCorrelation) {
      break;
    }
  }

  if (bestCorrelation > 0.01) {
    return sampleRate / bestOffset;
  }
  return -1;
}

function freqToNotePosition(freq: number): number {
  const C1 = 32.70; // Frequency of C1
  const C2 = 65.41; // Frequency of C2
  const semitones = 12 * Math.log2(freq / C1);
  const notePosition = Math.round(semitones);
  return Math.max(0, Math.min(13, notePosition)); // 0 to 13 represents C1 to C2
}

export default PitchDetector;