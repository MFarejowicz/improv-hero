import "./Board.css";

export function Board() {
  return (
    <div className="board-container">
      <Column letter="s" />
      <Column letter="d" />
      <Column letter="f" />
      <Column letter="g" />
      <Column letter="h" />
      <Column letter="j" />
    </div>
  );
}

type ColumnProps = {
  letter: string;
}

export function Column({ letter }: ColumnProps) {
  return (
    <div className="note-column">
      <div className="letter-indicator">
        <div>{letter}</div>
      </div>
    </div>
  );
}
