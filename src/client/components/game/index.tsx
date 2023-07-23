import { useCallback, useEffect, useState } from "react";
import { socket } from "../../socket";
import { StartingPlayerEvent, GameStateEvent, HealthStateEvent } from "../../models";

// ENSURE THIS STAYS IN SYNC with server/main GameState
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
  const [myHP, setMyHP] = useState<number>(100);
  const [opponentHP, setOpponentHP] = useState<number>(100);

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
      setGameState(data.state);
    }

    function handleHealthState(data: HealthStateEvent) {
      console.log("health state received");
      console.log(data);
      Object.entries(data).forEach(([id, newHealth]) => {
        if (id === myID) {
          setMyHP(newHealth);
        } else {
          setOpponentHP(newHealth);
        }
      });
    }

    socket.on("starting-player", handleStartingPlayer);
    socket.on("game-state", handleGameState);
    socket.on("health-state", handleHealthState);

    return () => {
      socket.off("starting-player", handleStartingPlayer);
      socket.off("game-state", handleGameState);
      socket.off("health-state", handleHealthState);
    };
  }, [myID]);

  const renderGameState = useCallback(() => {
    switch (gameState) {
      case GameState.Start:
        return null;
      case GameState.FirstPlayer:
        return <div>the first player is {myID === firstPlayer ? "ME" : "OPPONENT"}</div>;
      case GameState.Improv:
        return <div>you are now jamming</div>;
      case GameState.AwaitImprov:
        return <div>{"wait for your opponent's jam"}</div>;
      case GameState.AwaitReplay:
        return <div>wait for your opponent to replay your jam</div>;
      case GameState.Replay:
        return <div>{"replay your opponent's jam"}</div>;
      case GameState.Results:
        return (
          <div>
            <div>jam complete!</div>
            <div>{myHP > 0 ? "YOU WIN!" : "YOU LOSE!"}</div>
            <div>your final HP: {myHP}</div>
            <div>opponent final HP: {opponentHP}</div>
          </div>
        );
      default:
        break;
    }
  }, [firstPlayer, gameState, myHP, myID, opponentHP]);

  return (
    <>
      <h1>improv hero</h1>
      <h2>gaming</h2>
      <h3>
        my ID: {myID}, my HP: {myHP}
      </h3>
      <h3>
        opponent ID: {opponentID}, opponent HP: {opponentHP}
      </h3>
      <br />
      {renderGameState()}
    </>
  );
}
