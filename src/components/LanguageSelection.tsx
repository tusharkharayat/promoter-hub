import { motion } from "framer-motion";

const languages = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "हिन्दी", native: "Hindi" },
  { code: "ta", label: "தமிழ்", native: "Tamil" },
  { code: "te", label: "తెలుగు", native: "Telugu" },
  { code: "bn", label: "বাংলা", native: "Bengali" },
  { code: "mr", label: "मराठी", native: "Marathi" },
  { code: "kn", label: "ಕನ್ನಡ", native: "Kannada" },
  { code: "ml", label: "മലയാളം", native: "Malayalam" },
  { code: "gu", label: "ગુજરાતી", native: "Gujarati" },
  { code: "pa", label: "ਪੰਜਾਬੀ", native: "Punjabi" },
];

interface Props {
  onSelect: (code: string) => void;
}

const LanguageSelection = ({ onSelect }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="absolute inset-0 flex flex-col bg-background z-30"
    >
      {/* Samsung header */}
      <div className="flex items-center justify-center pt-14 pb-4">
        <img
          src="/lovable-uploads/80f35529-fa10-4cf9-b7c2-907e4d5850ee.jpg"
          alt="Samsung"
          className="h-5 opacity-80"
          style={{ display: "none" }}
        />
        <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-muted-foreground">
          Samsung
        </span>
      </div>

      {/* Title */}
      <div className="flex flex-col items-center px-8 pt-4 pb-6">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="text-2xl font-bold text-foreground tracking-tight"
        >
          Choose your language
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="text-sm text-muted-foreground mt-1.5"
        >
          अपनी भाषा चुनें
        </motion.p>
      </div>

      {/* Language grid */}
      <div className="flex-1 px-6 overflow-hidden">
        <div className="grid grid-cols-2 gap-2.5">
          {languages.map((lang, i) => (
            <motion.button
              key={lang.code}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3 + i * 0.04,
                duration: 0.5,
                ease: [0.23, 1, 0.32, 1],
              }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(lang.code)}
              className="flex flex-col items-center justify-center py-4 px-3 rounded-2xl bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors duration-200 group"
            >
              <span className="text-base font-semibold leading-tight">
                {lang.label}
              </span>
              <span className="text-[11px] mt-1 text-muted-foreground group-hover:text-primary-foreground/70 transition-colors">
                {lang.native}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="py-6 text-center"
      >
        <p className="text-[10px] text-muted-foreground">
          Virtual Promoter · Powered by Samsung AI
        </p>
      </motion.div>
    </motion.div>
  );
};

export default LanguageSelection;
