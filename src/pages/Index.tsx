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
  const [currentLoopVideoUrl, setCurrentLoopVideoUrl] = useState<string | null>(null);
  const videoKeyRef = useRef(0);
  const videoMapRef = useRef<Record<string, { video_url: string | null; loop_video_url: string | null }>>({});
  const buttonMapRef = useRef<Record<string, FlowButton[]>>({});

  const fetchFlowData = useCallback((lang: string) => {
    Promise.all([
      supabase.from("flow_videos").select("node_key, video_url, loop_video_url").eq("language", lang),
      supabase.from("flow_buttons").select("*").eq("language", lang).order("sort_order"),
    ]).then(([videosRes, buttonsRes]) => {
      if (videosRes.data) {
        const map: Record<string, { video_url: string | null; loop_video_url: string | null }> = {};
        videosRes.data.forEach((row: any) => {
          map[row.node_key] = { video_url: row.video_url, loop_video_url: row.loop_video_url };
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

  useEffect(() => {
    fetchFlowData("en");
  }, [fetchFlowData]);

  const getVideosForNode = useCallback((nodeKey: string) => {
    return videoMapRef.current[nodeKey] || { video_url: null, loop_video_url: null };
  }, []);

  const getButtonsForNode = useCallback((nodeKey: string) => {
    return buttonMapRef.current[nodeKey] || [];
  }, []);

  const handleLanguageSelect = useCallback(async (code: string) => {
    setSelectedLanguage(code);
    await fetchFlowData(code);
    videoKeyRef.current += 1;
    const node = videoMapRef.current["product-picker"] || { video_url: null, loop_video_url: null };
    setCurrentVideoUrl(node.video_url);
    setCurrentLoopVideoUrl(node.loop_video_url);
    setCurrentButtons(buttonMapRef.current["product-picker"] || []);
    setState("playing-video");
  }, [fetchFlowData]);

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
      const node = getVideosForNode(targetKey);
      setCurrentButtons(nextButtons.length > 0 ? nextButtons : []);
      videoKeyRef.current += 1;
      setCurrentVideoUrl(node.video_url);
      setCurrentLoopVideoUrl(node.loop_video_url);
      setState("playing-video");
    }, 500);
  }, [currentButtons, getVideosForNode, getButtonsForNode]);

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
          videoSrc={currentVideoUrl || (currentLoopVideoUrl ? "" : `placeholder-${videoKeyRef.current}`)}
          loopVideoSrc={currentLoopVideoUrl}
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
