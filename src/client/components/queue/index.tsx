import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
  myID: string | undefined;
}

export function Queue({ myID }: Props) {
  return (
    <>
      <h1>improv hero</h1>
      <h2>your id: {myID}</h2>
      <h2>queueing</h2>
      <FontAwesomeIcon icon={faSpinner} spin />
    </>
  );
}
