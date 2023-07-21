import { useCallback, useEffect, useState } from "react";

import { socket } from "./socket";

import "./App.css";

enum GameState {
  Menu,
  Queueing,
  Game,
}

function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.Menu);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onHello(data: any) {
      console.log("hello received");
      console.log(data);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("hello from server", onHello);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("hello from server", onHello);
    };
  }, []);

  const handleQueue = useCallback(() => {
    setGameState(GameState.Queueing);
    socket.emit("queue", { name: "test" });
  }, []);

  const renderGameState = useCallback(() => {
    switch (gameState) {
      case GameState.Menu:
        return (
          <>
            <h1>improv hero</h1>
            <button onClick={handleQueue}>queue</button>
          </>
        );
      case GameState.Queueing:
        return (
          <>
            <h1>improv hero</h1>
            <h2>queueing</h2>
          </>
        );
      case GameState.Game:
        return (
          <>
            <h2>gaming</h2>
          </>
        );
      default:
        return "oops";
    }
  }, [gameState]);

  return <div className="App">{renderGameState()}</div>;
}

export default App;
