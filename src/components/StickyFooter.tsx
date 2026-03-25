import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShoppingCart, MapPin } from "lucide-react";

const StickyFooter = () => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border px-4 py-3"
    >
      <div className="max-w-lg mx-auto flex gap-3">
        <Button variant="samsung" size="lg" className="flex-1">
          <ShoppingCart className="w-5 h-5" />
          Buy Now
        </Button>
        <Button variant="samsung-outline" size="lg" className="flex-1">
          <MapPin className="w-5 h-5" />
          Find Store
        </Button>
      </div>
    </motion.div>
  );
};

export default StickyFooter;
