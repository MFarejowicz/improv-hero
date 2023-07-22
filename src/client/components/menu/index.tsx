interface Props {
  myID: string | undefined;
  handleQueue: () => void;
}

export function Menu({ myID, handleQueue }: Props) {
  return (
    <>
      <h1>improv hero</h1>
      <h2>your id: {myID}</h2>
      <button disabled={!myID} onClick={handleQueue}>
        queue
      </button>
    </>
  );
}
