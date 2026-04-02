import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "../components/Navbar";
import {
  Sparkles,
  Droplet,
  Zap,
  ChefHat,
  Paintbrush,
  Wrench,
  MapPin,
  Clock,
  Calendar,
  Check,
} from "lucide-react";

const services = [
  { id: "cleaning", name: "Cleaning", icon: Sparkles, color: "bg-blue-500" },
  { id: "plumbing", name: "Plumbing", icon: Droplet, color: "bg-cyan-500" },
  { id: "electrician", name: "Electrician", icon: Zap, color: "bg-yellow-500" },
  { id: "cooking", name: "Cooking", icon: ChefHat, color: "bg-orange-500" },
  { id: "painting", name: "Painting", icon: Paintbrush, color: "bg-purple-500" },
  { id: "repairs", name: "Repairs", icon: Wrench, color: "bg-red-500" },
];

import { api } from "@/services/api";
import { toast } from "sonner";
import { BookingMap } from "../components/BookingMap";

export function BookingPage() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: 12.9716, lng: 77.5946 });
  const [bookingTime, setBookingTime] = useState("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    if (!selectedService || !address) return;

    setLoading(true);
    try {
      // For demo purposes, if no user is logged in, we might need to handle that.
      // Assuming a simplistic flow or that we might need to register/login first.

      const bookingData = {
        serviceType: selectedService,
        location: {
          lat: coordinates.lat,
          lng: coordinates.lng,
          address: address
        },
        scheduledTime: bookingTime === "now" ? new Date().toISOString() : (scheduledDate ? new Date(scheduledDate).toISOString() : new Date(Date.now() + 86400000).toISOString()),
        notes: "Looking for immediate help"
      };

      const result = await api.createBooking(bookingData);

      if (result.id) {
        toast.success("Booking Request Sent!");
        navigate("/booking-status", {
          state: {
            bookingId: result.id,
            service: services.find((s) => s.id === selectedService),
            address,
            bookingTime,
          },
        });
      } else {
        // If 401, maybe redirect to login or show error
        if (result.message === 'Not authorized, no token') {
          toast.error("Please login to book a service");
          // navigate('/login'); // We don't have a login page yet
        } else {
          toast.error(result.message || "Failed to book");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = selectedService && address.trim().length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Book a Service
            </h1>
            <p className="text-lg text-muted-foreground">
              Select a service and we'll find the best helper for you
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl shadow-lg p-8 border border-border"
          >
            {/* Service Selection */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-foreground mb-4">
                Select Service Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {services.map((service) => (
                  <motion.button
                    key={service.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedService(service.id)}
                    className={`relative p-6 rounded-xl border-2 transition-all ${selectedService === service.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-sidebar-border bg-card"
                      }`}
                  >
                    <div
                      className={`w-12 h-12 ${service.color} rounded-xl flex items-center justify-center mb-3 mx-auto`}
                    >
                      <service.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-semibold text-card-foreground text-center">
                      {service.name}
                    </p>
                    {selectedService === service.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* When to Schedule */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-foreground mb-4">
                When do you need the service?
              </label>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setBookingTime("now")}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${bookingTime === "now"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-sidebar-border bg-card"
                    }`}
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Right Now</p>
                    <p className="text-sm text-muted-foreground">Within 15 minutes</p>
                  </div>
                  {bookingTime === "now" && (
                    <Check className="w-5 h-5 text-primary ml-auto" />
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setBookingTime("later")}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${bookingTime === "later"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-sidebar-border bg-card"
                    }`}
                >
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Schedule Later</p>
                    <p className="text-sm text-muted-foreground">Pick a time</p>
                  </div>
                  {bookingTime === "later" && (
                    <Check className="w-5 h-5 text-primary ml-auto" />
                  )}
                </motion.button>
              </div>

              {/* Date Time Picker for Later */}
              <AnimatePresence>
                {bookingTime === "later" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <input
                      type="datetime-local"
                      className="w-full p-4 bg-input-background border-2 border-border rounded-xl focus:border-primary focus:outline-none text-foreground color-scheme-dark"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Address Input & Interactive Map */}
            <div className="mb-8">
              <label
                className="block text-lg font-semibold text-foreground mb-4"
              >
                Service Location
              </label>
              
              <div className="bg-card p-4 rounded-xl border border-border mb-4">
                <p className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Your Address
                </p>
                <p className="text-muted-foreground break-words">{address || "Tap 'Use Default' or pin on the map below"}</p>
              </div>

              <BookingMap 
                 onLocationChange={(lat, lng, addr) => {
                     setCoordinates({ lat, lng });
                     setAddress(addr);
                 }}
              />
              
              <p className="text-sm text-muted-foreground mt-4 flex items-center gap-2">
                Helper will be assigned based on proximity to this pinned location.
              </p>
            </div>

            {/* Estimated Time Badge */}
            {selectedService && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-8"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-900">
                      Estimated Arrival Time
                    </p>
                    <p className="text-green-700">Within 15 minutes</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Book Now Button */}
            <motion.button
              whileHover={isFormValid && !loading ? { scale: 1.02 } : {}}
              whileTap={isFormValid && !loading ? { scale: 0.98 } : {}}
              onClick={handleBooking}
              disabled={!isFormValid || loading}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${isFormValid && !loading
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30"
                : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
            >
              {loading ? "Processing..." : isFormValid ? "Book Now" : "Please select service and enter address"}
            </motion.button>

            {/* Info */}
            <div className="mt-6 p-4 bg-primary/10 rounded-xl">
              <p className="text-sm text-primary">
                💡 <span className="font-semibold">Pro Tip:</span> All our helpers are
                verified and background checked for your safety
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
