import { motion } from "framer-motion";

const FooterInfo = () => {
  return (
    <footer className="py-16 pb-28 px-6 bg-surface">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto text-center"
      >
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          © 2026 Samsung India Electronics Pvt. Ltd. All rights reserved. Galaxy S24 Ultra specifications may vary by region. Images are for illustration purposes only.
        </p>
        <div className="flex justify-center gap-6 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors samsung-glide">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors samsung-glide">Terms</a>
          <a href="#" className="hover:text-foreground transition-colors samsung-glide">Support</a>
        </div>
      </motion.div>
    </footer>
  );
};

export default FooterInfo;
