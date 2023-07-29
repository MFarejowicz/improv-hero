import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
  myName: string;
}

export function Queue({ myName }: Props) {
  return (
    <>
      <h1>improv hero</h1>
      <h2>your name: {myName}</h2>
      <h2>queueing</h2>
      <FontAwesomeIcon icon={faSpinner} spin />
    </>
  );
}
