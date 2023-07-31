import "./Board.css";

type ColumnRef = React.MutableRefObject<HTMLDivElement | null>;

type BoardProps = {
  columnRefs: ColumnRef[];
}

export function Board({ columnRefs }: BoardProps) {
  return (
    <div className="board-container">
      <Column letter="s" columnRef={columnRefs[0]} />
      <Column letter="d" columnRef={columnRefs[1]} />
      <Column letter="f" columnRef={columnRefs[2]} />
      <Column letter="g" columnRef={columnRefs[3]} />
      <Column letter="h" columnRef={columnRefs[4]} />
      <Column letter="j" columnRef={columnRefs[5]} />
    </div>
  );
}

type ColumnProps = {
  letter: string;
  columnRef: ColumnRef;
}

export function Column({ letter, columnRef }: ColumnProps) {
  return (
    <div ref={columnRef} className="note-column">
      <div className="letter-indicator">
        <div>{letter}</div>
      </div>
    </div>
  );
}
