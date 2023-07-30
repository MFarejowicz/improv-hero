import { useCallback, useEffect, useMemo, useRef } from "react";
import pianoA from "../assets/audio/piano-a.wav";
import pianoB from "../assets/audio/piano-b.wav";
import pianoC from "../assets/audio/piano-c.wav";
import pianoD from "../assets/audio/piano-d.wav";
import pianoE from "../assets/audio/piano-e.wav";
import pianoF from "../assets/audio/piano-f.wav";
import metronome from "../assets/audio/metronome.wav";
import backing from "../assets/audio/backing.wav";

// a universal volume, everything is hella loud for some reason
const GAIN = 0.25;

interface AudioBuffers {
  [key: string]: {
    path: string;
    buffer: AudioBuffer | null;
  };
}

export function useSFX() {
  const audioBuffers = useRef<AudioBuffers>({
    "piano-a": {
      path: pianoA,
      buffer: null,
    },
    "piano-b": {
      path: pianoB,
      buffer: null,
    },
    "piano-c": {
      path: pianoC,
      buffer: null,
    },
    "piano-d": {
      path: pianoD,
      buffer: null,
    },
    "piano-e": {
      path: pianoE,
      buffer: null,
    },
    "piano-f": {
      path: pianoF,
      buffer: null,
    },
    "metronome": {
      path: metronome,
      buffer: null,
    },
    "backing": {
      path: backing,
      buffer: null,
    }
  });
  const audioContext = useMemo(() => new window.AudioContext(), []);

  // on mount, fetch (i.e. load) each audio file,
  // decode into an audio buffer, and stick it in the map
  useEffect(() => {
    const fetchAudio = async (name: string, path: string) => {
      const response = await fetch(path);
      const arrayBuffer = await response.arrayBuffer();
      const decodedAudio = await audioContext.decodeAudioData(arrayBuffer);
      audioBuffers.current[name].buffer = decodedAudio;
    };
    Object.entries(audioBuffers.current).forEach(([key, value]) => {
      fetchAudio(key, value.path);
    });
  }, [audioContext]);

  // TODO: make "play" take an instrument name and MIDI pitch, then
  // use those params to dynamically play any sound
  const play = useCallback(
    (name: string) => {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffers.current[name].buffer;
      const gainNode = audioContext.createGain();
      gainNode.gain.value = GAIN;
      gainNode.connect(audioContext.destination);
      source.connect(gainNode);
      source.start(0);
    },
    [audioBuffers, audioContext]
  );

  return play;
}
