import { useRef, useState } from "react";

export function useGestureIntent() {
  const [intent, setIntent] = useState("none"); // none | study | navigate
  const timerRef = useRef(null);

  function clear() {
    clearTimeout(timerRef.current);
    timerRef.current = null;
    setIntent("none");
  }

  function begin(type, callback, delay = 500) {
    if (intent !== "none") return; // hard lock

    setIntent(type);

    timerRef.current = setTimeout(() => {
      callback?.();
    }, delay);
  }

  return {
    intent,
    isStudy: intent === "study",
    isNavigate: intent === "navigate",

    beginStudy: (cb, delay) => begin("study", cb, delay),
    beginNavigate: (cb, delay) => begin("navigate", cb, delay),

    cancel: clear,
  };
}
