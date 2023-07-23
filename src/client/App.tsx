import { useCallback, useEffect, useState } from "react";

import { PageState, MatchFoundEvent, ServerAckEvent } from "./models";
import { socket } from "./socket";
import { Menu } from "./components/menu";
import { Queue } from "./components/queue";
import { Game } from "./components/game";

import "./App.css";

function App() {
  const [pageState, setPageState] = useState<PageState>(PageState.Menu);
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
    socket.emit("start-queue");
  }, []);

  const renderPageState = useCallback(() => {
    switch (pageState) {
      case PageState.Menu:
        return <Menu myID={myID} handleQueue={handleQueue} />;
      case PageState.Queueing:
        return <Queue myID={myID} />;
      case PageState.Game:
        if (myID && opponentID) {
          return <Game myID={myID} opponentID={opponentID} />;
        } else {
          return "something went wrong";
        }
      default:
        return "something went wrong";
    }
  }, [pageState, handleQueue, myID, opponentID]);

  return <div className="App">{renderPageState()}</div>;
}

export default App;
