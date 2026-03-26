import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ButtonWithTimestamp {
  label: string;
  appearAtSeconds: number;
}

interface Props {
  videoSrc: string;
  onVideoEnd: () => void;
  buttons: ButtonWithTimestamp[];
  onButtonTap: (index: number) => void;
  buttonsExiting: boolean;
}

const VideoScreen = ({ videoSrc, onVideoEnd, buttons, onButtonTap, buttonsExiting }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [visibleButtons, setVisibleButtons] = useState<Set<number>>(new Set());
  const videoEndedRef = useRef(false);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    videoEndedRef.current = false;
    setVisibleButtons(new Set());
    vid.play().catch(() => setVideoReady(true));
  }, [videoSrc]);

  const handleCanPlay = useCallback(() => setVideoReady(true), []);

  const handleEnded = useCallback(() => {
    if (!videoEndedRef.current) {
      videoEndedRef.current = true;
      // Show all remaining buttons when video ends naturally
      setVisibleButtons(new Set(buttons.map((_, i) => i)));
      videoRef.current?.pause();
      onVideoEnd();
    }
  }, [onVideoEnd, buttons]);

  // Check timestamps during playback to show buttons individually
  const handleTimeUpdate = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const currentTime = vid.currentTime;

    setVisibleButtons((prev) => {
      let changed = false;
      const next = new Set(prev);
      buttons.forEach((btn, i) => {
        if (btn.appearAtSeconds > 0 && currentTime >= btn.appearAtSeconds && !prev.has(i)) {
          next.add(i);
          changed = true;
        }
      });
      if (!changed) return prev;

      // If all buttons are now visible, pause video and notify parent
      if (next.size === buttons.length && !videoEndedRef.current) {
        videoEndedRef.current = true;
        vid.pause();
        onVideoEnd();
      }
      return next;
    });
  }, [buttons, onVideoEnd]);

  // Placeholder: simulate video ending
  useEffect(() => {
    if (!videoSrc || videoSrc.startsWith("placeholder")) {
      // Show buttons one by one for placeholder, then call onVideoEnd
      const timers: ReturnType<typeof setTimeout>[] = [];
      buttons.forEach((btn, i) => {
        const delay = btn.appearAtSeconds > 0 ? btn.appearAtSeconds * 1000 : 3000;
        timers.push(setTimeout(() => {
          setVisibleButtons((prev) => {
            const next = new Set(prev);
            next.add(i);
            if (next.size === buttons.length && !videoEndedRef.current) {
              videoEndedRef.current = true;
              onVideoEnd();
            }
            return next;
          });
        }, delay));
      });
      return () => timers.forEach(clearTimeout);
    }
  }, [videoSrc, onVideoEnd, buttons]);

  const isPlaceholder = !videoSrc || videoSrc.startsWith("placeholder");
  const allVisible = visibleButtons.size === buttons.length && buttons.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="absolute inset-0 z-20 bg-foreground"
    >
      <div className="absolute inset-0">
        {isPlaceholder ? (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(180deg, hsl(228 30% 12%) 0%, hsl(228 40% 8%) 100%)" }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }} className="flex flex-col items-center">
              <div className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-primary/30" />
              </div>
              <p className="text-primary-foreground/60 text-sm font-medium">{allVisible ? "" : "Promoter is speaking..."}</p>
            </motion.div>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={videoSrc}
            className="w-full h-full object-cover"
            playsInline
            onCanPlay={handleCanPlay}
            onEnded={handleEnded}
            onTimeUpdate={handleTimeUpdate}
          />
        )}

        <AnimatePresence>
          {anyVisible && !buttonsExiting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-0"
              style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", background: "rgba(0,0,0,0.2)" }}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="absolute top-0 left-0 right-0 z-10 flex justify-center pt-12">
        <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-white/50">Samsung</span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-12 flex flex-col gap-3">
        <AnimatePresence>
          {buttons.map((btn, i) =>
            visibleButtons.has(i) && (
              <motion.button
                key={btn.label}
                initial={{ opacity: 0, y: 60 }}
                animate={buttonsExiting ? { opacity: 0, y: 80 } : { opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 80 }}
                transition={{ duration: buttonsExiting ? 0.35 : 0.6, ease: [0.23, 1, 0.32, 1] }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onButtonTap(i)}
                className="w-full py-4 rounded-2xl text-[15px] font-semibold text-white glass-morph active:bg-white/25 transition-colors"
              >
                {btn.label}
              </motion.button>
            )
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default VideoScreen;
