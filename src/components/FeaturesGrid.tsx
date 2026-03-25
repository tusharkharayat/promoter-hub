import { motion } from "framer-motion";
import { Camera, Cpu, Battery, Shield, Sparkles, Smartphone } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "200MP Camera",
    description: "Capture every detail with AI-enhanced photography",
  },
  {
    icon: Cpu,
    title: "Snapdragon 8 Gen 3",
    description: "Ultimate performance for gaming and multitasking",
  },
  {
    icon: Battery,
    title: "5000mAh Battery",
    description: "All-day power with super fast charging",
  },
  {
    icon: Shield,
    title: "Knox Security",
    description: "Defense-grade security built into every layer",
  },
  {
    icon: Sparkles,
    title: "Galaxy AI",
    description: "Circle to Search, Live Translate, and more",
  },
  {
    icon: Smartphone,
    title: "Titanium Build",
    description: "Premium titanium frame with Gorilla Armor",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] as const },
  },
};

const FeaturesGrid = () => {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold tracking-[0.15em] uppercase text-primary mb-3">
            Key Highlights
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Engineered for the Epic
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative bg-surface rounded-lg p-6 border border-transparent hover:border-border transition-all duration-500 samsung-glide hover:shadow-elegant"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center mb-4 group-hover:bg-primary/12 transition-colors duration-300">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1 text-sm">
                {feature.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
