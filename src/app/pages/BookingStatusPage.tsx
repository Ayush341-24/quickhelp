import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MapPin,
  Phone,
  MessageCircle,
  Navigation,
  Clock,
  XCircle,
  Loader2,
  CheckCircle2,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Navbar } from "../components/Navbar";
import { api } from "@/services/api";
import { db } from "@/firebase";
import { doc, onSnapshot } from "firebase/firestore";

type BookingStatus = "searching" | "assigned" | "on-the-way" | "no-helper";

export function BookingStatusPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<BookingStatus>("searching");
  const [assignedHelper, setAssignedHelper] = useState<any>(null);

  const { bookingId, service, address } = location.state || {};

  useEffect(() => {
    if (!bookingId) {
      navigate("/book");
      return;
    }

    // Join room logic removed (handled by Firestore listeners)


    // Fetch initial status
    const fetchBooking = async () => {
      try {
        const booking = await api.getBooking(bookingId);
        if (booking.status === "accepted" || booking.status === "in-progress") {
          setStatus("assigned");
          if (booking.helper) {
            setAssignedHelper({
              name: booking.helper.name,
              rating: booking.helper.rating || 4.8,
              distance: "2.5 km", // You would calculate this
              photo:
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", // Mock photo
            });
            setStatus("on-the-way");
          }
        }
      } catch (err) {
        console.error("Error fetching booking:", err);
      }
    };
    fetchBooking();

    // Listen for updates using Firestore onSnapshot
    const unsubscribe = onSnapshot(doc(db, "bookings", bookingId), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        if (data.status === "accepted") {
          setStatus("assigned");
          // In a real app, fetch helper details from data.helperId
          // For now, mock or if you stored helper details in booking
          setAssignedHelper({
            name: data.helperName || "John Doe",
            rating: 4.8,
            distance: "2.5 km",
            photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
          });
          setStatus("on-the-way"); // Or wait for distinct status
        } else if (data.status === "in-progress") {
          setStatus("on-the-way");
        }
      }
    });

    return () => unsubscribe();
  }, [bookingId, navigate]);

  // Fallback timeout to simulate "No Helper" if still searching after 30s
  useEffect(() => {
    if (status === "searching") {
      const timer = setTimeout(() => {
        // status remains searching, or we could set to 'no-helper' if we want a timeout
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [status]);



  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Status Progress */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl shadow-lg p-6 mb-6 border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${status !== "no-helper" ? "bg-primary" : "bg-muted"
                    }`}
                >
                  {status === "searching" ? (
                    <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
                  ) : status !== "no-helper" ? (
                    <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
                  ) : (
                    <span className="w-2 h-2 bg-background rounded-full" />
                  )}
                </div>
                <span
                  className={`font-semibold ${status !== "no-helper"
                    ? "text-foreground"
                    : "text-muted-foreground"
                    }`}
                >
                  Searching
                </span>
              </div>

              <div className="flex-1 h-1 bg-muted mx-4 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{
                    width:
                      status === "assigned" || status === "on-the-way"
                        ? "100%"
                        : "0%",
                  }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-primary"
                />
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${status === "assigned" || status === "on-the-way"
                    ? "bg-primary"
                    : "bg-muted"
                    }`}
                >
                  {status === "assigned" || status === "on-the-way" ? (
                    <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
                  ) : (
                    <span className="w-2 h-2 bg-background rounded-full" />
                  )}
                </div>
                <span
                  className={`font-semibold ${status === "assigned" || status === "on-the-way"
                    ? "text-foreground"
                    : "text-muted-foreground"
                    }`}
                >
                  Assigned
                </span>
              </div>

              <div className="flex-1 h-1 bg-muted mx-4 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{
                    width: status === "on-the-way" ? "100%" : "0%",
                  }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-primary"
                />
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${status === "on-the-way" ? "bg-primary" : "bg-muted"
                    }`}
                >
                  {status === "on-the-way" ? (
                    <Navigation className="w-5 h-5 text-primary-foreground" />
                  ) : (
                    <span className="w-2 h-2 bg-background rounded-full" />
                  )}
                </div>
                <span
                  className={`font-semibold ${status === "on-the-way"
                    ? "text-foreground"
                    : "text-muted-foreground"
                    }`}
                >
                  On the Way
                </span>
              </div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Searching State */}
            {status === "searching" && (
              <motion.div
                key="searching"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card rounded-2xl shadow-lg p-12 border border-border"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Loader2 className="w-10 h-10 text-primary" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-card-foreground mb-3">
                    Searching for Helper...
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Finding the best available helper near you
                  </p>
                  <div className="bg-primary/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-primary">
                      <MapPin className="w-5 h-5" />
                      <p className="text-sm">{address}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Helper Assigned State */}
            {(status === "assigned" || status === "on-the-way") &&
              assignedHelper && (
                <motion.div
                  key="assigned"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-card rounded-2xl shadow-lg overflow-hidden border border-border"
                >
                  {/* Success Banner */}
                  <div className="bg-green-600 p-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle2 className="w-8 h-8" />
                      <h2 className="text-2xl font-bold">Helper Assigned!</h2>
                    </div>
                    <p className="text-green-100">
                      {status === "assigned"
                        ? "Your helper will contact you shortly"
                        : "Helper is on the way to your location"}
                    </p>
                  </div>

                  {/* Helper Card */}
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                      <img
                        src={assignedHelper.photo}
                        alt={assignedHelper.name}
                        className="w-20 h-20 rounded-2xl object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-card-foreground mb-1">
                          {assignedHelper.name}
                        </h3>
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold text-card-foreground">
                              {assignedHelper.rating}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{assignedHelper.distance} away</span>
                          </div>
                        </div>
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          {service?.name || assignedHelper.serviceType} Specialist
                        </span>
                      </div>
                    </div>

                    {/* ETA Countdown */}
                    {status === "on-the-way" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="bg-primary/10 rounded-xl p-4 mb-6"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-primary-foreground" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg">
                              {service?.name || "Service"}
                            </h3>
                            <p className="text-muted-foreground">
                              {new Date().toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                              {" • "}
                              {new Date().toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                      >
                        <Phone className="w-5 h-5" />
                        Call Helper
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-card text-card-foreground rounded-xl font-semibold border-2 border-border hover:border-sidebar-border transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Message
                      </motion.button>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-muted-foreground">
                            Estimated Cost
                          </span>
                          <span className="font-semibold">
                            ₹{service?.price || 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Duration</span>
                          <span>~45 mins</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            {/* No Helper Available State */}
            {status === "no-helper" && (
              <motion.div
                key="no-helper"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card rounded-2xl shadow-lg p-12 border border-border"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 10,
                    }}
                    className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <XCircle className="w-12 h-12 text-orange-500" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-card-foreground mb-3">
                    No Helpers Available
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    We couldn't find any helpers nearby at the moment.
                    <br />
                    Please try again in a few minutes.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.location.reload()}
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Try Again
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/book")}
                      className="px-6 py-3 bg-card text-card-foreground rounded-xl font-semibold border-2 border-border hover:border-sidebar-border transition-colors"
                    >
                      Change Service
                    </motion.button>
                  </div>

                  <div className="mt-8 p-4 bg-primary/10 rounded-xl">
                    <p className="text-sm text-primary font-medium">
                      💡 <span className="font-semibold">Tip:</span> Helpers are
                      usually more available during weekdays and daytime hours
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
