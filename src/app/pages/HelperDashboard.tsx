import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import {
  Power,
  MapPin,
  DollarSign,
  Clock,
  Star,
  Check,
  X,
  TrendingUp,
  Package,
  Bell,
} from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";

interface BookingRequest {
  id: string;
  serviceType?: string;
  distance: string;
  earnings: string;
  estimatedTime: string;
  customerRating: number;
  location: any;
  [key: string]: any; 
}

export function HelperDashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<BookingRequest | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const navigate = useNavigate();

  // Route Protection
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/login");
    } else {
      try {
        if (JSON.parse(userStr).role !== "helper") {
          navigate("/profile");
        }
      } catch {}
    }
  }, [navigate]);
  
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"available" | "accepted" | "rejected">("available");
  
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [acceptedRequests, setAcceptedRequests] = useState<BookingRequest[]>([]);
  const [rejectedRequests, setRejectedRequests] = useState<BookingRequest[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const p = await api.getProfile();
        if (p) {
           setProfile({ ...p, serviceType: (p.serviceType || "").toLowerCase() }); 
           setIsOnline(p.isOnline || false);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!profile) return;

    const unsub = api.pollHelperBookings(({ pending, accepted, rejected }) => {
      let available = pending.filter((req: any) => {
         const reqService = (req.serviceType || "").toLowerCase();
         const myService = (profile.serviceType || "").toLowerCase();
         if (myService && reqService !== myService) return false;
         if ((req.rejectedBy || []).includes(profile.uid)) return false;
         return true;
      }).map((req: any) => ({
        ...req,
        distance: "2.5 km",
        earnings: "₹" + (Math.floor(Math.random() * 500) + 200),
        estimatedTime: "1 hour",
        customerRating: 4.8,
        location: req.location?.address || req.location || "Customer Location"
      }));

      const hasRealAvailableRequests = available.length > 0;

      // Only show demo fallback if there are no pending requests to process
      if (!hasRealAvailableRequests) {
        available = [
          {
            id: "demo-1",
            serviceType: profile.serviceType || "General",
            distance: "1.2 km",
            earnings: "₹450",
            estimatedTime: "2 hours",
            customerRating: 4.9,
            location: "123 Main St, Indiranagar"
          }
        ];
      }

      setBookingRequests(available);
      
      setAcceptedRequests(accepted.map((req: any) => ({ ...req, distance: "2.5 km", earnings: "₹600", estimatedTime: "1 hour", customerRating: 4.8, location: req.location?.address || req.location || "Customer Location" })));
      setRejectedRequests(rejected.map((req: any) => ({ ...req, distance: "2.5 km", earnings: "₹600", estimatedTime: "1 hour", customerRating: 4.8, location: req.location?.address || req.location || "Customer Location" })));

      if (isOnline && hasRealAvailableRequests && !showRequestModal && !currentRequest) {
        setCurrentRequest(available[0]);
        setShowRequestModal(true);
      }
    });

    return () => unsub();
  }, [profile, showRequestModal, currentRequest, isOnline]);

  useEffect(() => {
    if (!profile) return;
    let watchId: number;

    const updateHelperStatus = async (online: boolean, loc?: { lat: number; lng: number }) => {
      try {
        const data: any = { isOnline: online };
        if (loc) data.location = loc;
        await api.updateProfile(data);
      } catch (err) { }
    };

    if (isOnline) {
      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          (pos) => updateHelperStatus(true, { lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => console.error("Location watch error", err),
          { enableHighAccuracy: true }
        );
      } else {
        updateHelperStatus(true);
      }
    } else {
      updateHelperStatus(false);
    }

    return () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, [isOnline, profile]);

  const handleToggleAvailability = async () => {
    const newState = !isOnline;
    setIsOnline(newState);
    if (profile) {
       await api.updateProfile({ isOnline: newState });
    }
  };

  const handleAcceptRequest = async () => {
    if (currentRequest) {
      try {
        await api.acceptBooking(currentRequest.id);
        toast.success("Job accepted successfully!");
      } catch (error) {
        console.error("Error accepting booking:", error);
      }
    }
    setShowRequestModal(false);
    setCurrentRequest(null);
  };

  const handleRejectRequest = async () => {
    if (currentRequest) {
       try {
           await api.rejectBooking(currentRequest.id);
           toast.info("Job rejected");
       } catch (error) {
           console.error("Error rejecting booking:", error);
       }
    }
    setShowRequestModal(false);
    setCurrentRequest(null);
  };

  const stats = [
    {
      label: "Today's Earnings",
      value: "₹1,850",
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      label: "Completed Jobs",
      value: "12",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      label: "Your Rating",
      value: "4.8",
      icon: Star,
      color: "bg-yellow-500",
      iconColor: "text-white"
    },
    {
      label: "Hours Active",
      value: "6.5h",
      icon: Clock,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Helper Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage your availability and bookings
              </p>
            </div>

            {/* Availability Toggle */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-card rounded-2xl shadow-lg p-6 min-w-[280px] border border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-card-foreground">
                  Availability Status
                </span>
                <button
                  onClick={handleToggleAvailability}
                  className={`relative w-14 h-8 rounded-full transition-colors ${isOnline ? "bg-green-500" : "bg-muted"
                    }`}
                >
                  <motion.div
                    animate={{ x: isOnline ? 24 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-500" : "bg-muted-foreground"
                    } animate-pulse`}
                />
                <span
                  className={`font-semibold ${isOnline ? "text-green-600" : "text-muted-foreground"
                    }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow border border-border"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor || "text-white"}`} />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-card-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Service Area Tabs */}
          <div className="flex gap-4 mb-6 border-b border-border pb-2 overflow-x-auto">
              <button 
                  className={`pb-2 px-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${activeTab === "available" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`} 
                  onClick={() => setActiveTab("available")}
              >
                  Available Requests ({bookingRequests.length})
              </button>
              <button 
                  className={`pb-2 px-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${activeTab === "accepted" ? "border-green-500 text-green-500" : "border-transparent text-muted-foreground hover:text-foreground"}`} 
                  onClick={() => setActiveTab("accepted")}
              >
                  My Jobs ({acceptedRequests.length})
              </button>
              <button 
                  className={`pb-2 px-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${activeTab === "rejected" ? "border-red-500 text-red-500" : "border-transparent text-muted-foreground hover:text-foreground"}`} 
                  onClick={() => setActiveTab("rejected")}
              >
                  Rejected / History ({rejectedRequests.length})
              </button>
          </div>

          {/* Request List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl shadow-lg p-6 border border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-card-foreground capitalize">
                {activeTab} Bookings
              </h2>
            </div>

            {!isOnline && activeTab === "available" ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Power className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-2">You are currently offline</p>
                <p className="text-sm text-muted-foreground/80">
                  Turn on availability to start receiving new booking requests
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {(activeTab === "available" ? bookingRequests : activeTab === "accepted" ? acceptedRequests : rejectedRequests).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No {activeTab} requests at the moment.
                  </div>
                ) : (
                  (activeTab === "available" ? bookingRequests : activeTab === "accepted" ? acceptedRequests : rejectedRequests).map((request, index) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-2 rounded-xl p-6 transition-all border-border hover:border-sidebar-border hover:shadow-md bg-card"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-bold text-card-foreground">
                              {request.serviceType || "Service"}
                            </h3>
                            {activeTab === "accepted" && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full border border-green-200">Accepted</span>}
                            {activeTab === "rejected" && <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full border border-red-200">Rejected</span>}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span className="text-sm">{request.location?.address || request.location || "Location"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm">
                                {new Date(request.scheduledTime || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {activeTab === "available" && (
                          <div className="flex gap-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setCurrentRequest(request);
                                setShowRequestModal(true);
                              }}
                              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                            >
                              <Check className="w-5 h-5" />
                              View
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Booking Request Modal */}
      <AnimatePresence>
        {showRequestModal && currentRequest && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleRejectRequest}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-8 border border-border">
                <div className="text-center mb-6">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                    className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Bell className="w-8 h-8 text-primary" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-card-foreground mb-2">
                    New Booking Request!
                  </h3>
                  <p className="text-muted-foreground">
                    A customer needs your service
                  </p>
                </div>

                <div className="bg-secondary/50 rounded-xl p-6 mb-6 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Service Type</p>
                    <p className="text-lg font-bold text-foreground">
                      {currentRequest.serviceType || "Service"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Distance</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <p className="font-semibold text-foreground">
                          {currentRequest.distance}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Earnings</p>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <p className="font-semibold text-green-600">
                          {currentRequest.earnings}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Location</p>
                    <p className="font-semibold text-foreground">
                      {currentRequest.location}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAcceptRequest}
                    className="flex-1 px-6 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Accept Job
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRejectRequest}
                    className="flex-1 px-6 py-4 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Reject
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
