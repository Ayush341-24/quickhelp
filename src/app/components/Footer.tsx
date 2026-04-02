import { Link } from "react-router-dom";
import {
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Mail,
    Phone,
    MapPin,
    ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-secondary pt-16 pb-8 border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Info */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                                <span className="text-primary-foreground font-bold text-xl">Q</span>
                            </div>
                            <span className="font-bold text-xl text-foreground">QuickHelp</span>
                        </Link>
                        <p className="text-muted-foreground leading-relaxed">
                            Connecting you with trusted local helpers for all your daily needs.
                            Fast, reliable, and secure service delivery guaranteed.
                        </p>
                        <div className="flex space-x-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                                <motion.a
                                    key={index}
                                    href="#"
                                    whileHover={{ y: -4 }}
                                    className="w-10 h-10 bg-background rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:shadow-md transition-all border border-border"
                                >
                                    <Icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-foreground text-lg mb-6">Quick Links</h3>
                        <ul className="space-y-4">
                            {[
                                { label: "Home", path: "/" },
                                { label: "About Us", path: "/about" },
                                { label: "Services", path: "/book" },
                                { label: "Contact", path: "/contact" },
                                { label: "Help Center", path: "/help" },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link
                                        to={link.path}
                                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                                    >
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="group-hover:translate-x-1 transition-transform">
                                            {link.label}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Popular Services */}
                    <div>
                        <h3 className="font-bold text-foreground text-lg mb-6">Popular Services</h3>
                        <ul className="space-y-4">
                            {[
                                "Home Cleaning",
                                "Plumbing Repair",
                                "Electrical Help",
                                "Painting",
                                "Moving & Packing",
                            ].map((service) => (
                                <li key={service}>
                                    <Link
                                        to="/book"
                                        className="text-muted-foreground hover:text-primary transition-colors block hover:translate-x-1 transition-transform"
                                    >
                                        {service}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter/Contact */}
                    <div>
                        <h3 className="font-bold text-foreground text-lg mb-6">Get in Touch</h3>
                        <div className="space-y-4 mb-6">
                            <div className="flex items-start gap-3 text-muted-foreground">
                                <MapPin className="w-5 h-5 text-primary shrink-0" />
                                <span>123 Tech Park, Sector 5, Bangalore 560001</span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Phone className="w-5 h-5 text-primary shrink-0" />
                                <span>+91 98765 43210</span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Mail className="w-5 h-5 text-primary shrink-0" />
                                <span>support@quickhelp.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-muted-foreground text-sm text-center md:text-left">
                        © {currentYear} QuickHelp. All rights reserved.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                        <Link to="#" className="hover:text-primary transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="#" className="hover:text-primary transition-colors">
                            Terms of Service
                        </Link>
                        <Link to="#" className="hover:text-primary transition-colors">
                            Cookie Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
