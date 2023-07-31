import { useEffect, useState } from "react";

const ADJECTIVES = [
  "adventurous",
  "belated",
  "chirpy",
  "dazzling",
  "enormous",
  "frivolous",
  "glamorous",
  "heinous",
  "implacable",
  "jazzy",
  "kingly",
  "lackadaisical",
  "mysterious",
  "nostalgic",
  "omniscient",
  "prickly",
  "quaint",
  "respectful",
  "salty",
  "tricky",
  "unconscious",
  "villainous",
  "wiggly",
  "wonderful",
  "zonked"
];

const NOUNS = [
  "antelope",
  "bee",
  "cat",
  "dog",
  "emu",
  "frog",
  "giraffe",
  "hippo",
  "iguana",
  "kudzu",
  "leopard",
  "monkey",
  "narwhal",
  "otter",
  "penguin",
  "quail",
  "rat",
  "snake",
  "tiger",
  "viper",
  "walrus",
  "zebra"
];

export function useRandomName(): [string, () => void] {
  const [name, setName] = useState<string>("");

  useEffect(() => {
    if (name === "") {
      setName(generateRandomName());
    }
  }, [name]);

  const generateNewName = () => {
    setName(generateRandomName());
  }

  return [name, generateNewName];
}

const generateRandomName = (): string => {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adjective} ${noun}`;
}
