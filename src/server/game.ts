import { Socket } from "socket.io";

export class Game {
  roomID: string;
  player1: Socket;
  player2: Socket;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #currentJam: any | null;

  constructor(roomID: string, player1: Socket, player2: Socket) {
    this.roomID = roomID;
    this.player1 = player1;
    this.player2 = player2;
    this.#currentJam = null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set currentJam(jam: any) {
    this.#currentJam = jam;
  }

  get currentJam() {
    return this.#currentJam;
  }
}
