import { useCallback, useEffect, useState } from "react";

import { GameState, MatchFoundEvent, ServerAckEvent } from "./models";
import { socket } from "./socket";

import "./App.css";
import { Menu } from "./components/menu";
import { Queue } from "./components/queue";
import { Game } from "./components/game";

function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.Menu);
  const [myID, setMyID] = useState<string>("");
  const [opponentID, setOpponentID] = useState<string>("");

  useEffect(() => {
    function handleServerAck(data: ServerAckEvent) {
      console.log("server ack received");
      console.log(data);
      setMyID(data.id);
    }

    function handleMatchFound(data: MatchFoundEvent) {
      console.log("match found received");
      console.log(data);
      setOpponentID(data.opponentID);
      setGameState(GameState.Game);
    }

    socket.on("server-ack", handleServerAck);
    socket.on("match-found", handleMatchFound);

    return () => {
      socket.off("server-ack", handleServerAck);
      socket.off("match-found", handleMatchFound);
    };
  }, []);

  const handleQueue = useCallback(() => {
    setGameState(GameState.Queueing);
    socket.emit("start-queue");
  }, []);

  const renderGameState = useCallback(() => {
    switch (gameState) {
      case GameState.Menu:
        return <Menu myID={myID} handleQueue={handleQueue} />;
      case GameState.Queueing:
        return <Queue myID={myID} />;
      case GameState.Game:
        if (myID && opponentID) {
          return <Game myID={myID} opponentID={opponentID} />;
        } else {
          return "something went wrong";
        }
      default:
        return "oops";
    }
  }, [gameState, handleQueue, myID, opponentID]);

  return <div className="App">{renderGameState()}</div>;
}

export default App;
