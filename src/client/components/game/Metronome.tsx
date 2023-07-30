import "./Metronome.css";

export const Metronome = ({ metronomeRef }: { metronomeRef: React.MutableRefObject<HTMLDivElement | null> }) => {
  return <div ref={metronomeRef} className="metronome"></div>;
}
