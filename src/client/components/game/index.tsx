interface Props {
  myID: string;
  opponentID: string;
}

export function Game({ myID, opponentID }: Props) {
  return (
    <>
      <h1>improv hero</h1>
      <h2>gaming</h2>
      <h3>your id: {myID}</h3>
      <h3>opponent id: {opponentID}</h3>
    </>
  );
}
