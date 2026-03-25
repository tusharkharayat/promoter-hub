import { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import LanguageSelection from "@/components/LanguageSelection";
import VideoScreen from "@/components/VideoScreen";
import { supabase } from "@/integrations/supabase/client";

type AppState =
  | "language-select"
  | "playing-video"
  | "show-buttons"
  | "buttons-exiting";

const INTRO_BUTTONS = ["Power user", "Professional", "Everyday essential"];

const CATEGORY_BUTTONS: Record<string, string[]> = {
  "Power user": ["Galaxy S25 Ultra", "Galaxy Z Fold 6", "Galaxy Tab S10", "Galaxy Watch Ultra"],
  "Professional": ["Galaxy S25+", "Galaxy Book 6", "Galaxy Buds 3 Pro", "SmartThings"],
  "Everyday essential": ["Galaxy A56", "Galaxy S25 FE", "Galaxy Buds 3", "Galaxy Fit 3"],
};

const PRODUCT_BUTTONS: Record<string, string[]> = {
  "Galaxy Book 6": ["Performance & Specs", "AI Features", "Design & Display", "Where to Buy"],
  // Default for other products
};

const toNodeKey = (label: string) =>
  label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const Index = () => {
  const [state, setState] = useState<AppState>("language-select");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [currentButtons, setCurrentButtons] = useState<string[]>(INTRO_BUTTONS);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const videoKeyRef = useRef(0);
  const videoMapRef = useRef<Record<string, string>>({});

  // Load video URLs from DB
  useEffect(() => {
    supabase
      .from("flow_videos")
      .select("node_key, video_url")
      .then(({ data }) => {
        if (data) {
          const map: Record<string, string> = {};
          data.forEach((row) => {
            if (row.video_url) map[row.node_key] = row.video_url;
          });
          videoMapRef.current = map;
        }
      });
  }, []);

  const getVideoForNode = useCallback((nodeKey: string) => {
    return videoMapRef.current[nodeKey] || null;
  }, []);

  const handleLanguageSelect = useCallback((code: string) => {
    setSelectedLanguage(code);
    videoKeyRef.current += 1;
    setCurrentVideoUrl(getVideoForNode("intro"));
    setState("playing-video");
  }, [getVideoForNode]);

  const handleVideoEnd = useCallback(() => {
    setState("show-buttons");
  }, []);

  const handleButtonTap = useCallback((index: number) => {
    const tappedLabel = currentButtons[index];
    setState("buttons-exiting");

    setTimeout(() => {
      const nextButtons =
        CATEGORY_BUTTONS[tappedLabel] ||
        PRODUCT_BUTTONS[tappedLabel] ||
        ["Learn more", "Compare specs", "View offers", "Watch demo"];
      setCurrentButtons(nextButtons);
      videoKeyRef.current += 1;
      setCurrentVideoUrl(getVideoForNode(toNodeKey(tappedLabel)));
      setState("playing-video");
    }, 500);
  }, [currentButtons, getVideoForNode]);

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
          videoSrc={currentVideoUrl || `placeholder-${videoKeyRef.current}`}
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
