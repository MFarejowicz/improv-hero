import "./Hero.css";

export function Hero({ width = 100 }: { width?: number }) {
  return (
    <div className="Hero">
      <img className="Hero-bod" src="/Hero-bod.png" style={{ width: width }} />
      <img
        className="Hero-head"
        src="/Hero-head.png"
        style={{ width: width }}
      />
    </div>
  );
}
