import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, User, Phone, Briefcase, ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../services/api";
import { Navbar } from "../components/Navbar";

export function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Route Protection
    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            navigate("/profile");
        }
    }, [navigate]);

    // Form States
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "user",
        serviceType: "Cleaning", // Default for helper
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let response;
            if (isLogin) {
                response = await api.login({
                    email: formData.email,
                    password: formData.password,
                });
            } else {
                response = await api.register(formData);
            }

            if (response && response.token) {
                localStorage.setItem("token", response.token);
                localStorage.setItem("user", JSON.stringify(response));
                toast.success(isLogin ? "Welcome back!" : "Account created successfully!");

                // Redirect based on role and flush state
                if (response.role === "helper") {
                    window.location.href = "/helper-dashboard";
                } else {
                    window.location.href = "/profile";
                }
            } else {
                toast.error(response.message || "Authentication failed");
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                        {/* Header Toggle */}
                        <div className="flex border-b border-border">
                            <button
                                className={`flex-1 py-4 text-center font-semibold transition-colors ${isLogin ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-muted-foreground"}`}
                                onClick={() => setIsLogin(true)}
                            >
                                Login
                            </button>
                            <button
                                className={`flex-1 py-4 text-center font-semibold transition-colors ${!isLogin ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-muted-foreground"}`}
                                onClick={() => setIsLogin(false)}
                            >
                                Sign Up
                            </button>
                        </div>

                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-center mb-6">
                                {isLogin ? "Welcome Back" : "Create Account"}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <AnimatePresence mode="popLayout">
                                    {!isLogin && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-4 overflow-hidden"
                                        >
                                            {/* Name */}
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <input
                                                    required={!isLogin}
                                                    type="text"
                                                    name="name"
                                                    placeholder="Full Name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 pr-4 py-3 bg-secondary rounded-lg border border-border focus:border-primary focus:outline-none transition-colors"
                                                />
                                            </div>

                                            {/* Phone */}
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <input
                                                    required={!isLogin}
                                                    type="tel"
                                                    name="phone"
                                                    placeholder="Phone Number"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 pr-4 py-3 bg-secondary rounded-lg border border-border focus:border-primary focus:outline-none transition-colors"
                                                />
                                            </div>

                                            {/* Role Selection */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, role: "user" })}
                                                    className={`py-2 rounded-lg border transition-all ${formData.role === "user" ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-sidebar-border"}`}
                                                >
                                                    Customer
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, role: "helper" })}
                                                    className={`py-2 rounded-lg border transition-all ${formData.role === "helper" ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-sidebar-border"}`}
                                                >
                                                    Service Provider
                                                </button>
                                            </div>

                                            {/* Helper Specific: Service Type */}
                                            {formData.role === "helper" && (
                                                <div className="relative animate-in fade-in slide-in-from-top-2">
                                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                                                    <select
                                                        name="serviceType"
                                                        value={formData.serviceType}
                                                        onChange={handleChange}
                                                        className="w-full pl-10 pr-4 py-3 bg-secondary rounded-lg border border-border focus:border-primary focus:outline-none transition-colors appearance-none"
                                                    >
                                                        <option value="Cleaning">Cleaning</option>
                                                        <option value="Plumbing">Plumbing</option>
                                                        <option value="Electrical">Electrical</option>
                                                        <option value="Painting">Painting</option>
                                                        <option value="Moving">Moving</option>
                                                        <option value="Cooking">Cooking</option>
                                                        <option value="Repairs">Repairs</option>
                                                    </select>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Email */}
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        placeholder="Email Address"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-secondary rounded-lg border border-border focus:border-primary focus:outline-none transition-colors"
                                    />
                                </div>

                                {/* Password */}
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        required
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-10 py-3 bg-secondary rounded-lg border border-border focus:border-primary focus:outline-none transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 group"
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            {isLogin ? "Login Now" : "Create Account"}
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-muted-foreground">
                                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                                    <button
                                        onClick={() => setIsLogin(!isLogin)}
                                        className="ml-1 text-primary hover:underline font-semibold"
                                    >
                                        {isLogin ? "Sign Up" : "Login"}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
