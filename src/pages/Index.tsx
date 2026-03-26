import { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import LanguageSelection from "@/components/LanguageSelection";
import VideoScreen from "@/components/VideoScreen";
import { supabase } from "@/integrations/supabase/client";

type AppState = "language-select" | "playing-video" | "show-buttons" | "buttons-exiting";

interface FlowButton {
  label: string;
  target_node_key: string | null;
  appear_at_seconds: number;
}

const toNodeKey = (label: string) =>
  label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const Index = () => {
  const [state, setState] = useState<AppState>("language-select");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [currentButtons, setCurrentButtons] = useState<FlowButton[]>([]);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const videoKeyRef = useRef(0);
  const videoMapRef = useRef<Record<string, string>>({});
  const buttonMapRef = useRef<Record<string, FlowButton[]>>({});

  // Load video URLs and buttons from DB
  useEffect(() => {
    Promise.all([
      supabase.from("flow_videos").select("node_key, video_url"),
      supabase.from("flow_buttons").select("*").order("sort_order"),
    ]).then(([videosRes, buttonsRes]) => {
      if (videosRes.data) {
        const map: Record<string, string> = {};
        videosRes.data.forEach((row) => {
          if (row.video_url) map[row.node_key] = row.video_url;
        });
        videoMapRef.current = map;
      }
      if (buttonsRes.data) {
        const map: Record<string, FlowButton[]> = {};
        buttonsRes.data.forEach((row: any) => {
          const key = row.node_key;
          if (!map[key]) map[key] = [];
          map[key].push({
            label: row.label,
            target_node_key: row.target_node_key,
            appear_at_seconds: Number(row.appear_at_seconds) || 0,
          });
        });
        buttonMapRef.current = map;
      }
    });
  }, []);

  const getVideoForNode = useCallback((nodeKey: string) => {
    return videoMapRef.current[nodeKey] || null;
  }, []);

  const getButtonsForNode = useCallback((nodeKey: string) => {
    return buttonMapRef.current[nodeKey] || [];
  }, []);

  const handleLanguageSelect = useCallback((code: string) => {
    setSelectedLanguage(code);
    videoKeyRef.current += 1;
    setCurrentVideoUrl(getVideoForNode("intro"));
    setCurrentButtons(getButtonsForNode("intro"));
    setState("playing-video");
  }, [getVideoForNode, getButtonsForNode]);

  const handleVideoEnd = useCallback(() => {
    setState("show-buttons");
  }, []);

  const handleButtonTap = useCallback((index: number) => {
    const tappedButton = currentButtons[index];
    if (!tappedButton) return;
    setState("buttons-exiting");

    setTimeout(() => {
      const targetKey = tappedButton.target_node_key || toNodeKey(tappedButton.label);
      const nextButtons = getButtonsForNode(targetKey);
      setCurrentButtons(nextButtons.length > 0 ? nextButtons : []);
      videoKeyRef.current += 1;
      setCurrentVideoUrl(getVideoForNode(targetKey));
      setState("playing-video");
    }, 500);
  }, [currentButtons, getVideoForNode, getButtonsForNode]);

  const buttonsWithTimestamps = currentButtons.map((b) => ({
    label: b.label,
    appearAtSeconds: b.appear_at_seconds,
  }));

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
          buttons={buttonsWithTimestamps}
          onButtonTap={handleButtonTap}
          buttonsExiting={state === "buttons-exiting"}
        />
      )}
    </div>
  );
};

export default Index;
