import { motion } from "motion/react";
import { Navbar } from "../components/Navbar";
import {
    Users,
    Briefcase,
    CheckCircle,
    Wrench,
    Zap,
    Droplet,
    Truck,
    Paintbrush,
    Clock,
} from "lucide-react";
import { useEffect, useState } from "react";

const services = [
    {
        icon: Wrench,
        title: "Plumbing",
        description: "Expert solutions for leaks, clogs, and pipe installations.",
    },
    {
        icon: Zap,
        title: "Electrical",
        description: "Safe and reliable electrical repairs and installations.",
    },
    {
        icon: Droplet,
        title: "Cleaning",
        description: "Deep cleaning services for homes and offices.",
    },
    {
        icon: Paintbrush,
        title: "Painting",
        description: "Professional interior and exterior painting services.",
    },
    {
        icon: Truck,
        title: "Moving",
        description: "Hassle-free moving and packing assistance.",
    },
    {
        icon: Clock,
        title: "Instant Help",
        description: "Quick assistance for urgent household tasks.",
    },
];

const stats = [
    {
        icon: Users,
        label: "Total Users",
        value: 15000,
        suffix: "+",
    },
    {
        icon: Briefcase,
        label: "Active Partners",
        value: 1200,
        suffix: "+",
    },
    {
        icon: CheckCircle,
        label: "Services Completed",
        value: 45000,
        suffix: "+",
    },
];

function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;


        // For large numbers, increment by a chunk to keep animation smooth and fast
        const step = Math.max(1, Math.floor(end / (duration * 60)));

        const timer = setInterval(() => {
            start += step;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 1000 / 60); // 60 FPS

        return () => clearInterval(timer);
    }, [value, duration]);

    return <span>{count.toLocaleString()}</span>;
}

export function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-20"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                            About QuickHelp
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            Connecting you with trusted local helpers for all your daily needs.
                            Fast, reliable, and secure.
                        </p>
                    </motion.div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2, duration: 0.5 }}
                                className="bg-card p-8 rounded-2xl border border-border shadow-lg text-center hover:scale-105 transition-transform"
                            >
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <stat.icon className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-4xl font-bold text-foreground mb-2">
                                    <AnimatedCounter value={stat.value} />
                                    {stat.suffix}
                                </h3>
                                <p className="text-muted-foreground font-medium">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Mission Content */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="bg-secondary/30 rounded-3xl p-8 md:p-12 mb-24"
                    >
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-3xl font-bold text-foreground mb-6">
                                Our Mission
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                At QuickHelp, we believe that finding reliable help shouldn't be a
                                hassle. Our platform is built on trust, transparency, and
                                efficiency. We empower local service providers by connecting them
                                with customers who need their expertise, creating a community where
                                everyone thrives. Whether it's a leaky faucet or a house move,
                                we're here to make your life easier.
                            </p>
                        </div>
                    </motion.div>

                    {/* Services Section */}
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl font-bold text-foreground text-center mb-12"
                        >
                            Our Services
                        </motion.h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {services.map((service, index) => (
                                <motion.div
                                    key={service.title}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-card p-6 rounded-2xl border border-border shadow-md hover:shadow-xl hover:border-primary/50 transition-all group"
                                >
                                    <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <service.icon className="w-6 h-6 text-foreground group-hover:text-primary-foreground transition-colors" />
                                    </div>
                                    <h3 className="text-xl font-bold text-card-foreground mb-2">
                                        {service.title}
                                    </h3>
                                    <p className="text-muted-foreground">{service.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
