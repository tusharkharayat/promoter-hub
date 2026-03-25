import { useState, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import LanguageSelection from "@/components/LanguageSelection";
import VideoScreen from "@/components/VideoScreen";

type AppState =
  | "language-select"
  | "playing-video"
  | "show-buttons"
  | "buttons-exiting";

const INTRO_BUTTONS = ["Power user", "Professional", "Everyday essential"];

const CATEGORY_BUTTONS: Record<string, string[]> = {
  "Power user": ["Galaxy S25 Ultra", "Galaxy Z Fold 6", "Galaxy Tab S10", "Galaxy Watch Ultra"],
  "Professional": ["Galaxy S25+", "Galaxy Book 5 Pro", "Galaxy Buds 3 Pro", "SmartThings"],
  "Everyday essential": ["Galaxy A56", "Galaxy S25 FE", "Galaxy Buds 3", "Galaxy Fit 3"],
};

const Index = () => {
  const [state, setState] = useState<AppState>("language-select");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [currentButtons, setCurrentButtons] = useState<string[]>(INTRO_BUTTONS);
  const videoKeyRef = useRef(0);

  const handleLanguageSelect = useCallback((code: string) => {
    setSelectedLanguage(code);
    videoKeyRef.current += 1;
    setState("playing-video");
  }, []);

  const handleVideoEnd = useCallback(() => {
    setState("show-buttons");
  }, []);

  const handleButtonTap = useCallback((index: number) => {
    const tappedLabel = currentButtons[index];
    setState("buttons-exiting");

    setTimeout(() => {
      // Determine next set of buttons
      const nextButtons = CATEGORY_BUTTONS[tappedLabel] || [
        "Learn more",
        "Compare specs",
        "View offers",
        "Watch demo",
      ];
      setCurrentButtons(nextButtons);
      videoKeyRef.current += 1;
      setState("playing-video");
    }, 500);
  }, [currentButtons]);

  return (
    <div className="fixed inset-0 bg-foreground overflow-hidden">
      <AnimatePresence mode="wait">
        {state === "language-select" && (
          <LanguageSelection key="lang" onSelect={handleLanguageSelect} />
        )}
      </AnimatePresence>

      {state !== "language-select" && (
        <VideoScreen
          key={videoKeyRef.current}
          videoSrc={`placeholder-${videoKeyRef.current}`}
          onVideoEnd={handleVideoEnd}
          buttons={currentButtons}
          onButtonTap={handleButtonTap}
          showButtons={state === "show-buttons" || state === "buttons-exiting"}
          buttonsExiting={state === "buttons-exiting"}
        />
      )}
    </div>
  );
};

export default Index;
