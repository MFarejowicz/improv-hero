import { useCallback, useEffect, useState } from "react";
import { socket } from "../../socket";
import { StartingPlayerEvent, GameStateEvent } from "../../models";

enum GameState {
  Start,
  FirstPlayer,
  Improv,
  AwaitImprov,
  Replay,
  AwaitReplay,
  Results,
}
interface Props {
  myID: string;
  opponentID: string;
}

export function Game({ myID, opponentID }: Props) {
  const [gameState, setGameState] = useState<GameState>(GameState.Start);
  const [firstPlayer, setFirstPlayer] = useState<string>("");

  useEffect(() => {
    function handleStartingPlayer(data: StartingPlayerEvent) {
      console.log("starting player received");
      console.log(data);
      setGameState(GameState.FirstPlayer);
      setFirstPlayer(data.startingPlayer);
    }

    function handleGameState(data: GameStateEvent) {
      console.log("game state received");
      console.log(data);
    }

    socket.on("starting-player", handleStartingPlayer);
    socket.on("game-state", handleGameState);

    return () => {
      socket.off("starting-player", handleStartingPlayer);
      socket.off("game-state", handleGameState);
    };
  }, []);

  const renderGameState = useCallback(() => {
    switch (gameState) {
      case GameState.Start:
        return null;
      case GameState.FirstPlayer:
        return <div>the first player is {myID === firstPlayer ? "ME" : "OPPONENT"}</div>;
      default:
        break;
    }
  }, [firstPlayer, gameState, myID]);

  return (
    <>
      <h1>improv hero</h1>
      <h2>gaming</h2>
      <h3>your id: {myID}</h3>
      <h3>opponent id: {opponentID}</h3>
      <br />
      {renderGameState()}
    </>
  );
}
