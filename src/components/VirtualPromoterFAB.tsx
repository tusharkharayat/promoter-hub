import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";

const VirtualPromoterFAB = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* FAB Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-5 z-50 w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-elegant"
      >
        <MessageCircle className="w-6 h-6 text-primary-foreground" />
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-primary animate-pulse-ring" />
      </motion.button>

      {/* Chat Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background w-full max-w-lg rounded-t-[2rem] border-t border-border p-6 pb-8 min-h-[60vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-foreground">Samsung Virtual Promoter</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-accent inline-block" />
                    Online — Ask me anything
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 rounded-full bg-surface flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-foreground" />
                </button>
              </div>

              {/* Chat area */}
              <div className="flex-1 space-y-4 mb-6">
                <div className="bg-surface rounded-2xl rounded-tl-md p-4 max-w-[80%]">
                  <p className="text-sm text-foreground">
                    Hi! 👋 I'm your Samsung Virtual Promoter. I can help you explore the Galaxy S24 Ultra, compare models, or find the best deals. What would you like to know?
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {["Camera specs", "Best price", "Compare with S23"].map((q) => (
                    <button
                      key={q}
                      className="text-xs font-medium px-4 py-2 rounded-pill border border-border bg-background text-foreground hover:bg-surface transition-colors samsung-glide"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  className="flex-1 h-12 px-5 rounded-pill bg-surface border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5 text-primary-foreground" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VirtualPromoterFAB;
