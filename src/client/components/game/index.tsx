import { useCallback, useEffect, useRef, useState } from "react";
import { socket } from "../../socket";
import {
  StartingPlayerEvent,
  GameStateEvent,
  HealthStateEvent,
  ReceiveJamEvent,
  GameState,
  Note,
} from "../../models";
import { useSFX } from "../../hooks/use-sfx";
import { useKeyPress } from "../../hooks/use-key-press";

// ENSURE THIS STAYS IN SYNC with server/main GameState
interface Props {
  myID: string;
  opponentID: string;
}

export function Game({ myID, opponentID }: Props) {
  const [gameState, setGameState] = useState<GameState>(GameState.Start);
  const [firstPlayer, setFirstPlayer] = useState<string>("");
  const [myHP, setMyHP] = useState<number>(100);
  const [opponentHP, setOpponentHP] = useState<number>(100);
  const song = useRef<Note[]>([]);
  const songStart = useRef(new Date());
  const playSound = useSFX();
  const [jamToPlay, setJamToPlay] = useState<Note[]>([]);

  const recordNote = useCallback((sound: string) => {
    const now = new Date();
    const note: Note = {
      time: now.getTime() - songStart.current.getTime(),
      sound,
    };
    song.current.push(note);
  }, []);

  const playNote = useCallback(
    (note: string) => {
      playSound(note);
      recordNote(note);
    },
    [playSound, recordNote]
  );

  useKeyPress("s", () => playNote("piano-a"));
  useKeyPress("d", () => playNote("piano-b"));
  useKeyPress("f", () => playNote("piano-c"));
  useKeyPress("j", () => playNote("piano-d"));
  useKeyPress("k", () => playNote("piano-e"));
  useKeyPress("l", () => playNote("piano-f"));

  useEffect(() => {
    function handleStartingPlayer(data: StartingPlayerEvent) {
      // console.log("starting player received");
      // console.log(data);
      setGameState(GameState.FirstPlayer);
      setFirstPlayer(data.startingPlayer);
    }

    function handleGameState(data: GameStateEvent) {
      // console.log("game state received");
      // console.log(data);
      setGameState(data.state);
      if (data.state === GameState.Improv) {
        song.current = [];
        songStart.current = new Date();
      }

      if (data.state === GameState.BeforeAwaitReplay) {
        socket.emit("submit-jam", { jam: song.current });
      }
    }

    function handleHealthState(data: HealthStateEvent) {
      // console.log("health state received");
      // console.log(data);
      Object.entries(data).forEach(([id, newHealth]) => {
        if (id === myID) {
          setMyHP(newHealth);
        } else {
          setOpponentHP(newHealth);
        }
      });
    }

    function handleReceiveJam(data: ReceiveJamEvent) {
      // console.log("receive jam received");
      // console.log(data);
      setJamToPlay(data.jam);
    }

    socket.on("starting-player", handleStartingPlayer);
    socket.on("game-state", handleGameState);
    socket.on("health-state", handleHealthState);
    socket.on("receive jam", handleReceiveJam);

    return () => {
      socket.off("starting-player", handleStartingPlayer);
      socket.off("game-state", handleGameState);
      socket.off("health-state", handleHealthState);
      socket.off("receive jam", handleReceiveJam);
    };
  }, [myID]);

  const renderGameState = useCallback(() => {
    switch (gameState) {
      case GameState.Start:
        return null;
      case GameState.FirstPlayer:
        return <div>{`the first player is ${myID === firstPlayer ? "ME" : "OPPONENT"}`}</div>;
      case GameState.BeforeImprov:
        return <div>{"get ready to jam!"}</div>;
      case GameState.Improv:
        return <div>{"you are now jamming"}</div>;
      case GameState.BeforeAwaitImprov:
        return <div>{"your opponent is about to jam"}</div>;
      case GameState.AwaitImprov:
        return <div>{"wait for your opponent's jam"}</div>;
      case GameState.BeforeAwaitReplay:
        return <div>{"your opponent is about to replay your jam"}</div>;
      case GameState.AwaitReplay:
        return <div>{"wait for your opponent to replay your jam"}</div>;
      case GameState.BeforeReplay:
        return <div>{"get ready to replay your opponent's jam"}</div>;
      case GameState.Replay:
        return (
          <div>
            <div>{"replay your opponent's jam"}</div>
            <div>{"the jam looks like: "}</div>
            <div>{JSON.stringify(jamToPlay)}</div>
          </div>
        );
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
  }, [firstPlayer, gameState, jamToPlay, myHP, myID, opponentHP]);

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
