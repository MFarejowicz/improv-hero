import { useCallback, useEffect, useState } from "react";

import { PageState, MatchFoundEvent, ServerAckEvent } from "./models";
import { useRandomName } from './hooks/use-random-name';
import { socket } from "./socket";
import { Menu } from "./components/menu/Menu";
import { Queue } from "./components/queue";
import { Game } from "./components/game/Game";

import "./App.css";

function App() {
  const [pageState, setPageState] = useState<PageState>(PageState.Menu);
  const [myID, setMyID] = useState<string>("");
  const [opponentID, setOpponentID] = useState<string>("");

  const [myName, generateNewName] = useRandomName();
  const [opponentName, setOpponentName] = useState<string>("");

  useEffect(() => {
    function handleServerAck(data: ServerAckEvent) {
      // console.log("server ack received");
      // console.log(data);
      setMyID(data.id);
    }

    function handleMatchFound(data: MatchFoundEvent) {
      // console.log("match found received");
      // console.log(data);
      setOpponentID(data.opponentID);
      setOpponentName(data.opponentName);
      setPageState(PageState.Game);
    }

    socket.on("server-ack", handleServerAck);
    socket.on("match-found", handleMatchFound);

    return () => {
      socket.off("server-ack", handleServerAck);
      socket.off("match-found", handleMatchFound);
    };
  }, []);

  const handleQueue = useCallback(() => {
    setPageState(PageState.Queueing);
    socket.emit("start-queue", myName);
  }, [myName]);

  const renderPageState = useCallback(() => {
    switch (pageState) {
      case PageState.Menu:
        return <Menu myID={myID} myName={myName} generateNewName={generateNewName} handleQueue={handleQueue} />;
      case PageState.Queueing:
        return <Queue myName={myName} />;
      case PageState.Game:
        if (myID && opponentID) {
          return <Game myID={myID} myName={myName} opponentID={opponentID} opponentName={opponentName} />;
        } else {
          return "something went wrong";
        }
      default:
        return "something went wrong";
    }
  }, [pageState, handleQueue, myID, myName, opponentID]);

  return <div className="App">{renderPageState()}</div>;
}

export default App;
