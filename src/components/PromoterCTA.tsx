import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageCircle, Video, HelpCircle } from "lucide-react";

const actions = [
  {
    icon: MessageCircle,
    title: "Chat with AI",
    description: "Get instant answers about specs, pricing, and availability",
  },
  {
    icon: Video,
    title: "Watch Demo",
    description: "See the latest features in action with a guided walkthrough",
  },
  {
    icon: HelpCircle,
    title: "Compare Models",
    description: "Find the perfect Galaxy device for your needs",
  },
];

const PromoterCTA = () => {
  return (
    <section className="py-24 px-6 bg-surface">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold tracking-[0.15em] uppercase text-primary mb-3">
            Your Virtual Promoter
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            How Can I Help You?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your AI-powered Samsung expert is ready to assist you right here, right now.
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          {actions.map((action, i) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: i * 0.12,
                ease: [0.23, 1, 0.32, 1],
              }}
              className="group bg-background rounded-lg p-6 border border-border hover:shadow-elegant transition-all duration-500 samsung-glide cursor-pointer hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mb-5">
                <action.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                {action.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {action.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mt-12"
        >
          <Button variant="samsung" size="lg">
            <MessageCircle className="w-5 h-5" />
            Start a Conversation
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default PromoterCTA;
