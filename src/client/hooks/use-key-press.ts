import { useCallback, useEffect } from "react";

type KeyPressCallback = (event: KeyboardEvent) => void;

export function useKeyPress(key: string, callback: KeyPressCallback) {
  const onEvent = useCallback(
    (event: KeyboardEvent) => {
      console.log({ key: event.key });
      if (!event.repeat && key === event.key.toLowerCase()) {
        callback(event);
      }
    },
    [callback, key]
  );

  useEffect(() => {
    window.addEventListener("keydown", onEvent);

    return () => {
      window.removeEventListener("keydown", onEvent);
    };
  }, [onEvent]);
}
