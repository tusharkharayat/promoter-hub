import { motion } from "framer-motion";
import samsungLogo from "@/assets/samsung-logo.png";

const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border"
    >
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <img
          src={samsungLogo}
          alt="Samsung"
          className="h-5 w-auto"
        />
        <span className="text-xs font-semibold tracking-[0.1em] uppercase text-primary">
          Virtual Promoter
        </span>
      </div>
    </motion.header>
  );
};

export default Header;
