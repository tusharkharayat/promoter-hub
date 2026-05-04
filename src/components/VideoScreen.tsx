import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ButtonWithTimestamp {
  label: string;
  appearAtSeconds: number;
}

interface Props {
  videoSrc: string;
  loopVideoSrc?: string | null;
  onVideoEnd: () => void;
  buttons: ButtonWithTimestamp[];
  onButtonTap: (index: number) => void;
  buttonsExiting: boolean;
}

const VideoScreen = ({ videoSrc, loopVideoSrc, onVideoEnd, buttons, onButtonTap, buttonsExiting }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const loopVideoRef = useRef<HTMLVideoElement>(null);
  const [visibleButtons, setVisibleButtons] = useState<Set<number>>(new Set());
  const [hasVideoEnded, setHasVideoEnded] = useState(false);
  const [showLoopVideo, setShowLoopVideo] = useState(false);
  const videoEndedRef = useRef(false);

  // Cross-fade transition duration
  const crossFadeDuration = 0.8;

  const hasMainVideo = !!videoSrc && !videoSrc.startsWith("placeholder");
  const loopOnly = !hasMainVideo && !!loopVideoSrc;

  useEffect(() => {
    const vid = videoRef.current;
    videoEndedRef.current = false;
    setHasVideoEnded(false);
    setShowLoopVideo(false);
    setVisibleButtons(new Set());

    // Loop-only node: skip main video, show loop + all buttons immediately
    if (loopOnly) {
      videoEndedRef.current = true;
      setHasVideoEnded(true);
      setShowLoopVideo(true);
      setVisibleButtons(new Set(buttons.map((_, i) => i)));
      setTimeout(() => {
        loopVideoRef.current?.play().catch(() => {});
      }, 50);
      onVideoEnd();
      return;
    }

    if (!vid) return;
    vid.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoSrc, loopVideoSrc]);

  const handleEnded = useCallback(() => {
    if (!videoEndedRef.current) {
      videoEndedRef.current = true;
      setHasVideoEnded(true);
      setVisibleButtons(new Set(buttons.map((_, i) => i)));

      // Start loop video instead of pausing on last frame
      if (loopVideoSrc) {
        setShowLoopVideo(true);
        // Start loop video playback
        setTimeout(() => {
          loopVideoRef.current?.play().catch(() => {});
        }, 50);
      } else {
        videoRef.current?.pause();
      }
      onVideoEnd();
    }
  }, [onVideoEnd, buttons, loopVideoSrc]);

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

      return changed ? next : prev;
    });
  }, [buttons]);

  // Placeholder fallback timers
  useEffect(() => {
    if (loopOnly) return;
    if (!videoSrc || !videoSrc.startsWith("placeholder")) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    buttons.forEach((btn, i) => {
      if (btn.appearAtSeconds > 0) {
        timers.push(
          setTimeout(() => {
            setVisibleButtons((prev) => {
              const next = new Set(prev);
              next.add(i);
              return next;
            });
          }, btn.appearAtSeconds * 1000)
        );
      }
    });

    const endDelay = Math.max(
      3000,
      ...buttons.map((btn) => (btn.appearAtSeconds > 0 ? btn.appearAtSeconds * 1000 : 0))
    );

    timers.push(
      setTimeout(() => {
        if (videoEndedRef.current) return;
        videoEndedRef.current = true;
        setHasVideoEnded(true);
        setVisibleButtons(new Set(buttons.map((_, i) => i)));
        onVideoEnd();
      }, endDelay)
    );

    return () => timers.forEach(clearTimeout);
  }, [videoSrc, onVideoEnd, buttons]);

  const isPlaceholder = (!videoSrc || videoSrc.startsWith("placeholder")) && !loopOnly;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: crossFadeDuration, ease: [0.23, 1, 0.32, 1] }}
      className="absolute inset-0 z-20 bg-foreground"
    >
      <div className="absolute inset-0">
        {isPlaceholder ? (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(180deg, hsl(228 30% 12%) 0%, hsl(228 40% 8%) 100%)" }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }} className="flex flex-col items-center">
              <div className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-primary/30" />
              </div>
              <p className="text-primary-foreground/60 text-sm font-medium">{hasVideoEnded ? "" : "Promoter is speaking..."}</p>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Main video - fades out when loop video takes over */}
            {hasMainVideo && (
              <motion.video
                ref={videoRef}
                src={videoSrc}
                className="absolute inset-0 w-full h-full object-cover"
                playsInline
                onEnded={handleEnded}
                onTimeUpdate={handleTimeUpdate}
                animate={{ opacity: showLoopVideo ? 0 : 1 }}
                transition={{ duration: crossFadeDuration, ease: [0.23, 1, 0.32, 1] }}
              />
            )}

            {/* Loop video - cross-fades in when main video ends, always blurred */}
            {loopVideoSrc && (
              <motion.video
                ref={loopVideoRef}
                src={loopVideoSrc}
                className="absolute inset-0 w-full h-full object-cover"
                playsInline
                loop
                muted
                initial={{ opacity: 0 }}
                animate={{ opacity: showLoopVideo ? 1 : 0 }}
                transition={{ duration: crossFadeDuration, ease: [0.23, 1, 0.32, 1] }}
                style={{ filter: "blur(6px)", WebkitFilter: "blur(6px)" }}
              />
            )}
          </>
        )}

        {/* Blur overlay - only when video ended AND no loop video (loop video has its own blur) */}
        <AnimatePresence>
          {hasVideoEnded && !buttonsExiting && !loopVideoSrc && (
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

        {/* Dark overlay for loop video readability */}
        <AnimatePresence>
          {showLoopVideo && !buttonsExiting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: crossFadeDuration, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-0"
              style={{ background: "rgba(0,0,0,0.2)" }}
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
