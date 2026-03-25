import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import LanguageSelection from "@/components/LanguageSelection";
import VideoScreen from "@/components/VideoScreen";

type AppState =
  | "language-select"
  | "intro-video"
  | "show-buttons"
  | "buttons-exiting"
  | "category-video";

const BUTTON_LABELS = ["Power user", "Professional", "Everyday essential"];

const Index = () => {
  const [state, setState] = useState<AppState>("language-select");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<number>(-1);

  const handleLanguageSelect = useCallback((code: string) => {
    setSelectedLanguage(code);
    setState("intro-video");
  }, []);

  const handleIntroVideoEnd = useCallback(() => {
    setState("show-buttons");
  }, []);

  const handleButtonTap = useCallback((index: number) => {
    setSelectedCategory(index);
    setState("buttons-exiting");

    // Wait for exit animation, then play category video
    setTimeout(() => {
      setState("category-video");
    }, 500);
  }, []);

  const handleCategoryVideoEnd = useCallback(() => {
    // After category video ends, show buttons again
    setState("show-buttons");
  }, []);

  return (
    <div className="fixed inset-0 bg-foreground overflow-hidden">
      <AnimatePresence mode="wait">
        {state === "language-select" && (
          <LanguageSelection
            key="lang"
            onSelect={handleLanguageSelect}
          />
        )}
      </AnimatePresence>

      {state !== "language-select" && (
        <>
          {(state === "intro-video" ||
            state === "show-buttons" ||
            state === "buttons-exiting") && (
            <VideoScreen
              videoSrc="placeholder-intro"
              onVideoEnd={handleIntroVideoEnd}
              buttons={BUTTON_LABELS}
              onButtonTap={handleButtonTap}
              showButtons={
                state === "show-buttons" || state === "buttons-exiting"
              }
              buttonsExiting={state === "buttons-exiting"}
            />
          )}

          {state === "category-video" && (
            <VideoScreen
              videoSrc={`placeholder-category-${selectedCategory}`}
              onVideoEnd={handleCategoryVideoEnd}
              buttons={BUTTON_LABELS}
              onButtonTap={handleButtonTap}
              showButtons={false}
              buttonsExiting={false}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Index;
