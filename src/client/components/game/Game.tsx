import { useCallback, useEffect, useRef, useState } from "react";
import { socket } from "../../socket";
import {
  StartingPlayerEvent,
  GameStateEvent,
  HealthStateEvent,
  SendImprovEvent,
  ReceiveImprovEvent,
  SendReplayEvent,
  GameState,
  Note,
} from "../../models";
import { useSFX } from "../../hooks/use-sfx";
import { useKeyPress } from "../../hooks/use-key-press";
import { Board } from "./Board";
import { Metronome } from "./Metronome";

const TEMPO = 80; // keep consistent with server
const ONE_BEAT = (1000 * 60) / 80; // 80 bpm = 750ms

interface Props {
  myID: string;
  myName: string;
  opponentID: string;
  opponentName: string;
}

export function Game({ myID, myName, opponentID, opponentName }: Props) {
  const [gameState, setGameState] = useState<GameState>(GameState.Start);

  const [firstPlayer, setFirstPlayer] = useState<string>("");

  const [myHP, setMyHP] = useState<number>(100);
  const [opponentHP, setOpponentHP] = useState<number>(100);

  const metronomeRef = useRef<HTMLDivElement | null>(null);

  const playSound = useSFX();

  const improv = useRef<Note[]>([]);
  const improvStart = useRef(new Date());

  const [oppImprovToReplay, setOppImprovToReplay] = useState<Note[]>([]);

  const replay = useRef<Note[]>([]);
  const replayStart = useRef(new Date());

  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);

  const recordNote = useCallback(
    (sound: string) => {
      const now = new Date();
      const start =
        gameState === GameState.Improv
          ? improvStart.current.getTime()
          : replayStart.current.getTime();
      const note: Note = {
        time: now.getTime() - start,
        sound,
      };
      if (gameState === GameState.Improv) {
        improv.current.push(note);
      } else if (gameState === GameState.Replay) {
        replay.current.push(note);
      }
    },
    [gameState]
  );

  const playNote = useCallback(
    (note: string) => {
      playSound(note);
      recordNote(note);
    },
    [playSound, recordNote]
  );

  // handle key presses
  // TODO: probably disable when not your turn
  useKeyPress("s", () => playNote("piano-a"));
  useKeyPress("d", () => playNote("piano-b"));
  useKeyPress("f", () => playNote("piano-c"));
  useKeyPress("g", () => playNote("piano-d"));
  useKeyPress("h", () => playNote("piano-e"));
  useKeyPress("j", () => playNote("piano-f"));
  useKeyPress(" ", () => playNote("metronome"));

  // handle socket stuff
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
        improv.current = [];
        improvStart.current = new Date();
        setTime(0);
        setIsActive(true);
        playSound("backing");
      }

      if (data.state === GameState.Replay) {
        playSound("backing");
      }

      if ([GameState.BeforeAwaitImprov, GameState.BeforeAwaitReplay].includes(data.state)) {
        playSound('metronome');
        const beat = setInterval(() => playSound('metronome'), ONE_BEAT);
        setTimeout(() => clearInterval(beat), ONE_BEAT * 7);
      }

      if ([
        GameState.Improv,
        GameState.BeforeImprov,
        GameState.BeforeAwaitImprov,
        GameState.BeforeReplay,
        GameState.Replay,
        GameState.AwaitReplay,
        GameState.BeforeAwaitReplay
      ].includes(data.state)) {
        if (metronomeRef.current != null) {
          metronomeRef.current.classList.add('bang');
        }
      } else {
        if (metronomeRef.current != null) {
          metronomeRef.current.classList.remove('bang');
        }
      }

      if (data.state === GameState.Replay) {
        replay.current = [];
        replayStart.current = new Date();
        setTime(0);
        setIsActive(true);
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleSendImprov(data: SendImprovEvent, ack: (arg: any) => void) {
      // console.log("send improv received");
      // console.log(data);
      ack(improv.current);
      setIsActive(false);
    }

    function handleReceiveImprov(data: ReceiveImprovEvent) {
      // console.log("receive improv received");
      // console.log(data);
      setOppImprovToReplay(data.improv);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleSendReplay(data: SendReplayEvent, ack: (arg: any) => void) {
      ack(replay.current);
      setIsActive(false);
    }

    socket.on("starting-player", handleStartingPlayer);
    socket.on("game-state", handleGameState);
    socket.on("health-state", handleHealthState);
    socket.on("send-improv", handleSendImprov);
    socket.on("receive-improv", handleReceiveImprov);
    socket.on("send-replay", handleSendReplay);

    return () => {
      socket.off("starting-player", handleStartingPlayer);
      socket.off("game-state", handleGameState);
      socket.off("health-state", handleHealthState);
      socket.off("send-improv", handleSendImprov);
      socket.off("receive-improv", handleReceiveImprov);
      socket.off("send-replay", handleSendReplay);
    };
  }, [myID, gameState, metronomeRef]);

  // handle on screen timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setTime((time) => time + 10);
      }, 10);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  // handle visuals
  const renderGameState = useCallback(() => {
    switch (gameState) {
      case GameState.Start:
        return <div>{"waiting to start the game"}</div>;
      case GameState.FirstPlayer:
        return (
          <div>
            <span>{"the first player is "}</span>
            <strong>{myID === firstPlayer ? myName : opponentName}</strong>
          </div>
        );
      case GameState.BeforeImprov:
        return <div>{"get ready to improv!"}</div>;
      case GameState.Improv:
        return (
          <div>
            <div>{"you are now improv-ing"}</div>
            <div>{`time: ${time}`}</div>
          </div>
        );
      case GameState.BeforeAwaitImprov:
        return <div>{"your opponent is about to improv"}</div>;
      case GameState.AwaitImprov:
        return <div>{"wait for your opponent's improv"}</div>;
      case GameState.BeforeAwaitReplay:
        return <div>{"your opponent is about to replay your improv"}</div>;
      case GameState.AwaitReplay:
        return <div>{"wait for your opponent to replay your improv"}</div>;
      case GameState.BeforeReplay:
        return <div>{"get ready to replay your opponent's improv"}</div>;
      case GameState.Replay:
        return (
          <div>
            <div>{"replay your opponent's improv"}</div>
            <div>{`time: ${time}`}</div>
          </div>
        );
      case GameState.GameResults:
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
  }, [firstPlayer, gameState, myHP, myID, oppImprovToReplay, opponentHP, time, myName, opponentName]);

  return (
    <div>
      <h1>improv hero</h1>
      <h2>tempo: 80</h2>
      <h3>
        your name: {myName}, your HP: {myHP}
      </h3>
      <h3>
        opponent name: {opponentName}, opponent HP: {opponentHP}
      </h3>
      <br />
      <Metronome metronomeRef={metronomeRef} />
      <br />
      <Board />
      <br />
      {renderGameState()}
    </div>
  );
}
