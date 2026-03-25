import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import galaxyHero from "@/assets/galaxy-hero.png";
import { MessageCircle, ChevronDown } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background px-6 pt-20 pb-12">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface via-background to-background" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="text-sm font-semibold tracking-[0.15em] uppercase text-primary mb-4"
        >
          Virtual Promoter
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] text-foreground mb-4"
        >
          Your Personal{" "}
          <span className="text-gradient-samsung">Galaxy Guide</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="text-lg text-muted-foreground max-w-md mb-8"
        >
          Explore features, compare specs, and get instant answers — powered by Samsung AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="flex gap-3"
        >
          <Button variant="samsung" size="lg">
            <MessageCircle className="w-5 h-5" />
            Talk to Promoter
          </Button>
          <Button variant="samsung-outline" size="lg">
            Explore Features
          </Button>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="mt-12 relative"
        >
          <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl scale-150" />
          <img
            src={galaxyHero}
            alt="Samsung Galaxy S24 Ultra"
            width={400}
            height={480}
            className="relative z-10 drop-shadow-2xl"
          />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
