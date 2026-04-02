import { Link } from "react-router";
import { motion } from "motion/react";
import { Navbar } from "../components/Navbar";
import {
  Sparkles,
  Clock,
  Shield,
  Star,
  Wrench,
  Droplet,
  Zap,
  ChefHat,
  Paintbrush,
  ArrowRight,
} from "lucide-react";
import { Hologram } from "../components/Hologram";
import { Footer } from "../components/Footer";
import { Chatbot } from "../components/Chatbot";
import { UserLocationMap } from "../components/UserLocationMap";
const services = [
  {
    name: "Cleaning",
    icon: Sparkles,
    color: "bg-blue-500",
    description: "Professional home cleaning",
  },
  {
    name: "Plumbing",
    icon: Droplet,
    color: "bg-cyan-500",
    description: "Expert plumbers at your service",
  },
  {
    name: "Electrician",
    icon: Zap,
    color: "bg-yellow-500",
    description: "Licensed electricians",
  },
  {
    name: "Cooking",
    icon: ChefHat,
    color: "bg-orange-500",
    description: "Chef services for your meals",
  },
  {
    name: "Painting",
    icon: Paintbrush,
    color: "bg-purple-500",
    description: "Professional painting services",
  },
  {
    name: "Repairs",
    icon: Wrench,
    color: "bg-red-500",
    description: "Home repair & maintenance",
  },
];

const features = [
  {
    icon: Clock,
    title: "15-Min Service",
    description: "Get help within 15 minutes",
  },
  {
    icon: Shield,
    title: "Verified Helpers",
    description: "All helpers are background checked",
  },
  {
    icon: Star,
    title: "Top Rated",
    description: "Only 4.5+ star professionals",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Hologram className="p-8 rounded-3xl bg-background/50 backdrop-blur-sm border border-white/10">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full mb-6"
              >
                <span className="font-medium">✨ Trusted by 10,000+ customers</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Book Trusted House Help
                <br />
                <span className="text-primary">in Under 15 Minutes</span>
              </h1>

              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Smart auto-assignment connects you with verified helpers instantly.
                Professional service at your doorstep.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/book">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    Book a Service
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-8 py-4 bg-card text-card-foreground rounded-xl font-semibold border-2 border-border hover:border-sidebar-border transition-colors"
                >
                  Learn More
                </motion.button>
              </div>
            </Hologram>
          </motion.div>



          {/* Real-time User GPS Map */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-12 max-w-4xl mx-auto"
          >
            <div className="bg-card p-6 rounded-3xl shadow-xl border border-border">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-card-foreground flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  Live GPS Tracking
                </h3>
                <p className="text-sm text-muted-foreground">Locating helpers near you...</p>
              </div>
              <UserLocationMap />
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-card p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-border"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-card-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section >

      {/* Services Section */}
      < section className="py-20 px-4 sm:px-6 lg:px-8 bg-background" >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Popular Services
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose from our wide range of home services
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {services.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                className="bg-card p-6 rounded-2xl border-2 border-border hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer"
              >
                <div
                  className={`w-14 h-14 ${service.color} rounded-xl flex items-center justify-center mb-4 mx-auto`}
                >
                  <service.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-card-foreground text-center mb-1">
                  {service.name}
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/book">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors"
              >
                View All Services
              </motion.button>
            </Link>
          </div>
        </div>
      </section >

      {/* How It Works */}
      < section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30" >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Get help in 3 simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Select Service",
                description: "Choose the service you need from our categories",
              },
              {
                step: "2",
                title: "Auto-Assignment",
                description: "Our smart system finds the nearest verified helper",
              },
              {
                step: "3",
                title: "Get Service",
                description: "Helper arrives within 15 minutes to assist you",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="bg-card p-8 rounded-2xl shadow-md border border-border">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-3 text-center">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-center">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-blue-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* CTA Section */}
      < section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-primary/80" >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to get started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Book your first service now and experience instant help
            </p>
            <Link to="/book">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-background text-primary rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Book Service Now
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section >

      {/* Footer */}
      < Footer />
      <Chatbot />
    </div >
  );
}
