import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Navbar } from "../components/Navbar";
import {
    ChevronDown,
    Search,
    MessageCircle,
    Phone,
    FileText,
} from "lucide-react";

const faqs = [
    {
        question: "How do I book a service?",
        answer:
            "You can book a service by clicking on the 'Book Now' button on the home page. Select your service type, enter your location, and choose a convenient time slot.",
    },
    {
        question: "Is there a cancellation fee?",
        answer:
            "Cancellations made 2 hours prior to the scheduled time are free of charge. Late cancellations may incur a small fee to compensate our helpers.",
    },
    {
        question: "How are helpers verified?",
        answer:
            "All our helpers undergo a rigorous background check, including identity verification and criminal record screening, to ensure your safety.",
    },
    {
        question: "What payment methods do you accept?",
        answer:
            "We accept all major credit/debit cards, UPI, and net banking. Cash on delivery is also available for select services.",
    },
    {
        question: "What if I'm not satisfied with the service?",
        answer:
            "Your satisfaction is our priority. If you're not happy with the service, please contact our support team within 24 hours, and we will make it right.",
    },
];

export function HelpPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredFaqs = faqs.filter(
        (faq) =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl font-bold text-foreground mb-4">
                            Help Center
                        </h1>
                        <p className="text-lg text-muted-foreground mb-8">
                            Find answers to common questions or get in touch with our team.
                        </p>

                        {/* Search */}
                        <div className="relative max-w-xl mx-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search for help..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-secondary rounded-xl border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground/50"
                            />
                        </div>
                    </motion.div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-card p-6 rounded-2xl border border-border shadow-md hover:shadow-lg transition-all cursor-pointer group"
                        >
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-bold text-lg mb-2 text-card-foreground">
                                Guides
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Read tutorials and guides on how to use our platform effectively.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-card p-6 rounded-2xl border border-border shadow-md hover:shadow-lg transition-all cursor-pointer group"
                        >
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <MessageCircle className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-bold text-lg mb-2 text-card-foreground">
                                Chat Support
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Chat with our support team for instant assistance.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-card p-6 rounded-2xl border border-border shadow-md hover:shadow-lg transition-all cursor-pointer group"
                        >
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Phone className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-bold text-lg mb-2 text-card-foreground">
                                Call Us
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Directly call our customer care line for urgent issues.
                            </p>
                        </motion.div>
                    </div>

                    {/* FAQS */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2 className="text-2xl font-bold text-foreground mb-6">
                            Frequently Asked Questions
                        </h2>
                        <div className="space-y-4">
                            {filteredFaqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="bg-card rounded-xl border border-border overflow-hidden"
                                >
                                    <button
                                        onClick={() =>
                                            setOpenIndex(openIndex === index ? null : index)
                                        }
                                        className="w-full flex items-center justify-between p-6 text-left"
                                    >
                                        <span className="font-semibold text-foreground">
                                            {faq.question}
                                        </span>
                                        <ChevronDown
                                            className={`w-5 h-5 text-muted-foreground transition-transform ${openIndex === index ? "rotate-180" : ""
                                                }`}
                                        />
                                    </button>
                                    <AnimatePresence>
                                        {openIndex === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="px-6 pb-6 text-muted-foreground border-t border-border/50 pt-4">
                                                    {faq.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
