import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const specs = [
  {
    category: "Display",
    details: '6.8" Dynamic AMOLED 2X, QHD+, 120Hz adaptive refresh rate, 2600 nits peak brightness',
  },
  {
    category: "Processor",
    details: "Snapdragon 8 Gen 3 for Galaxy, 4nm process, Adreno 750 GPU",
  },
  {
    category: "Camera System",
    details: "200MP Wide + 12MP Ultra-Wide + 50MP 5x Telephoto + 10MP 3x Telephoto, 12MP Front",
  },
  {
    category: "Battery & Charging",
    details: "5000mAh, 45W Super Fast Charging, 15W Wireless, Wireless PowerShare",
  },
  {
    category: "Storage & Memory",
    details: "12GB RAM, 256GB / 512GB / 1TB internal storage",
  },
  {
    category: "Build & Design",
    details: "Titanium frame, Corning Gorilla Armor, IP68 water & dust resistance, 162.3 x 79 x 8.6mm, 232g",
  },
];

const SpecsAccordion = () => {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold tracking-[0.15em] uppercase text-primary mb-3">
            Specifications
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Under the Hood
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
        >
          <Accordion type="single" collapsible className="space-y-2">
            {specs.map((spec) => (
              <AccordionItem
                key={spec.category}
                value={spec.category}
                className="border border-border rounded-lg px-5 data-[state=open]:shadow-soft transition-shadow duration-300"
              >
                <AccordionTrigger className="text-foreground font-semibold text-sm hover:no-underline py-5">
                  {spec.category}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm pb-5 leading-relaxed">
                  {spec.details}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default SpecsAccordion;
