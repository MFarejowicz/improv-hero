interface Props {
  myID: string | undefined;
  myName: string;
  generateNewName: () => void;
  handleQueue: () => void;
}

import "./Menu.css";

export function Menu({ myID, myName, generateNewName, handleQueue }: Props) {
  return (
    <>
      <h1>improv hero</h1>
      <>
        <h2>your name: {myName}</h2>
        <button id="reroll-button" disabled={!myName} onClick={generateNewName}>&#8635;</button>
      </>
      <button id="queue-button" disabled={!myID} onClick={handleQueue}>
        queue
      </button>
    </>
  );
}
