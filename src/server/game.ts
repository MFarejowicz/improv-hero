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

interface Note {
  time: number;
  sound: string;
}

// Thanks chatGPT
// TODO: account for empty arrays?
export function calculateHitTiming(targetNotes: Note[], playerPerformance: Note[]) {
  const timingWindows = {
    perfect: 50, // Define the timing windows (in milliseconds) for each hit type
    great: 100,
    good: 200,
  };

  const maxPossibleScore = targetNotes.length * 100; // The maximum possible score

  let totalScore = 0;
  // let totalHits = 0;
  let totalPerfectHits = 0;
  let totalGreatHits = 0;
  let totalGoodHits = 0;

  const playerUsed = new Set(); // To keep track of player notes already used

  for (let i = 0; i < targetNotes.length; i++) {
    const targetNote = targetNotes[i];
    let minTimingDiff = Infinity;
    let matchedPlayerNote = null;

    for (let j = 0; j < playerPerformance.length; j++) {
      const playerNote = playerPerformance[j];

      // Check if the player note is within the timing window of the target note
      const timingDiff = Math.abs(targetNote.time - playerNote.time);

      if (
        targetNote.sound === playerNote.sound && // Check if pitches match
        timingDiff <= timingWindows.good &&
        !playerUsed.has(playerNote)
      ) {
        // We have a valid match within the timing window, the player note is not used yet, and pitches match
        if (timingDiff < minTimingDiff) {
          // Update with the closest player note within the timing window
          minTimingDiff = timingDiff;
          matchedPlayerNote = playerNote;
        }
      }
    }

    if (matchedPlayerNote) {
      // Calculate the hit timing
      const hitTiming = Math.abs(targetNote.time - matchedPlayerNote.time);

      // Evaluate the hit timing and assign a score based on the timing window
      if (hitTiming <= timingWindows.perfect) {
        totalPerfectHits++;
      } else if (hitTiming <= timingWindows.great) {
        totalGreatHits++;
      } else if (hitTiming <= timingWindows.good) {
        totalGoodHits++;
      }

      // totalHits++;
      playerUsed.add(matchedPlayerNote); // Mark the player note as used
    }
  }

  // Calculate the final normalized score based on the number of hits and hit levels
  totalScore = totalPerfectHits * 100 + totalGreatHits * 80 + totalGoodHits * 50;
  totalScore = Math.min(totalScore, maxPossibleScore); // Cap the score to the maximum possible score
  const normalizedScore = (totalScore / maxPossibleScore) * 100;

  // Calculate accuracy percentage
  // const accuracy = (totalHits / targetNotes.length) * 100;

  return Math.round(normalizedScore);

  // return {
  //   totalScore,
  //   accuracy: Math.round(accuracy),
  //   totalPerfectHits,
  //   totalGreatHits,
  //   totalGoodHits,
  //   totalMissed: targetNotes.length - totalHits,
  // };
}
