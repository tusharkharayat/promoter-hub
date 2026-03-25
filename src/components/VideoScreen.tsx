import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  /** Currently a placeholder — pass a real video URL later */
  videoSrc: string;
  /** Called when the video finishes playing */
  onVideoEnd: () => void;
  /** The 3 action button labels */
  buttons: string[];
  /** Called when a button is tapped */
  onButtonTap: (index: number) => void;
  /** Whether to show buttons (video has ended) */
  showButtons: boolean;
  /** Whether buttons are exiting (user tapped one) */
  buttonsExiting: boolean;
}

const VideoScreen = ({
  videoSrc,
  onVideoEnd,
  buttons,
  onButtonTap,
  showButtons,
  buttonsExiting,
}: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    vid.play().catch(() => {
      // autoplay blocked — show anyway
      setVideoReady(true);
    });
  }, [videoSrc]);

  const handleCanPlay = useCallback(() => {
    setVideoReady(true);
  }, []);

  const handleEnded = useCallback(() => {
    onVideoEnd();
  }, [onVideoEnd]);

  // For placeholder: simulate video ending after 3s if no real video
  useEffect(() => {
    if (!videoSrc || videoSrc.startsWith("placeholder")) {
      const t = setTimeout(() => {
        setVideoReady(true);
        onVideoEnd();
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [videoSrc, onVideoEnd]);

  const isPlaceholder = !videoSrc || videoSrc.startsWith("placeholder");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="absolute inset-0 z-20 bg-foreground"
    >
      {/* Video / Placeholder */}
      <div className="absolute inset-0">
        {isPlaceholder ? (
          /* Placeholder: gradient with avatar silhouette */
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(180deg, hsl(228 30% 12%) 0%, hsl(228 40% 8%) 100%)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              className="flex flex-col items-center"
            >
              {/* Avatar circle placeholder */}
              <div className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-primary/30" />
              </div>
              <p className="text-primary-foreground/60 text-sm font-medium">
                {showButtons ? "" : "Promoter is speaking..."}
              </p>
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
          />
        )}

        {/* Blur overlay when buttons are showing */}
        <AnimatePresence>
          {showButtons && !buttonsExiting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-0"
              style={{
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                background: "rgba(0,0,0,0.2)",
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Samsung wordmark top */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-center pt-12">
        <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-white/50">
          Samsung
        </span>
      </div>

      {/* Action Buttons */}
      <AnimatePresence>
        {showButtons && (
          <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-12 flex flex-col gap-3">
            {buttons.map((label, i) => (
              <motion.button
                key={label}
                initial={{ opacity: 0, y: 60 }}
                animate={
                  buttonsExiting
                    ? { opacity: 0, y: 80 }
                    : { opacity: 1, y: 0 }
                }
                transition={{
                  delay: buttonsExiting ? i * 0.05 : 0.15 + i * 0.08,
                  duration: buttonsExiting ? 0.35 : 0.6,
                  ease: [0.23, 1, 0.32, 1],
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onButtonTap(i)}
                className="w-full py-4 rounded-2xl text-[15px] font-semibold text-white glass-morph active:bg-white/25 transition-colors"
              >
                {label}
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VideoScreen;
