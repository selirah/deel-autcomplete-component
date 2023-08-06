import { useEffect, RefObject } from "react";

type Eventhandler = (event: MouseEvent) => void;

export const useOnClickOutside = (
  ref: RefObject<HTMLElement>,
  handler: Eventhandler
) => {
  useEffect(() => {
    const handleListener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) {
        return;
      }
      handler(e);
    };
    document.addEventListener("mousedown", handleListener);
    return () => {
      document.removeEventListener("mousedown", handleListener);
    };
  }, [ref, handler]);
};
