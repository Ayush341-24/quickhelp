import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { api } from "../../services/api";
import { toast } from "sonner";
import { User, Mail, Phone, MapPin, Award, Star, Trophy, Gift, ArrowLeft, Clock, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

export function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });

    const [myBookings, setMyBookings] = useState<any[]>([]);

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (!user || user.role === "helper") return;

        const fetchBookings = async () => {
            try {
                const bookings = await api.getMyBookings();
                setMyBookings(bookings || []);
            } catch (err) { }
        };
        fetchBookings();
        const interval = setInterval(fetchBookings, 1000);
        return () => clearInterval(interval);
    }, [user]);

    const fetchProfile = async () => {
        try {
            const profile = await api.getProfile();
            if (profile) {
                setUser(profile);
                setFormData({
                    name: profile.name || "",
                    email: profile.email || "",
                    phone: profile.phone || "",
                });
            }
            setLoading(false);
        } catch (error) {
            console.error("Profile view auth:", error);
            setLoading(false);
            // Ignore error - handles unauthenticated redirects below
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const updatedProfile = await api.updateProfile(formData);
            setUser(updatedProfile);
            setEditing(false);
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Failed to update profile");
        }
    };

    const handleCancelBooking = async (id: string) => {
        try {
            await api.cancelBooking(id);
            toast.success("Booking cancelled successfully.");
        } catch (error) {
            toast.error("Failed to cancel booking.");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user) return <div className="min-h-screen flex items-center justify-center">Please login first</div>;

    const isHelper = user.role === "helper";

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <Link to={isHelper ? "/helper-dashboard" : "/"} className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Profile Card */}
                        <div className="md:col-span-1">
                            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                                <div className="flex flex-col items-center">
                                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                        <User className="w-10 h-10 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-bold">{user.name}</h2>
                                    <p className="text-muted-foreground capitalize">
                                        {user.role} {isHelper && user.serviceType ? `• ${user.serviceType}` : ""}
                                    </p>

                                    {isHelper && (
                                        <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-sm font-medium">
                                            <Star className="w-4 h-4 fill-current" />
                                            <span>{user.rating || "5.0"} Rating</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 space-y-4">
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-sm">{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Phone className="w-4 h-4" />
                                        <span className="text-sm">{user.phone || "No phone added"}</span>
                                    </div>
                                    {isHelper && (
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-sm">Bangalore, India</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-8">
                            {/* Rewards & Gamification Section */}
                            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        {isHelper ? <Trophy className="w-5 h-5 text-yellow-500" /> : <Award className="w-5 h-5 text-primary" />}
                                        {isHelper ? "Your Achievements" : "Loyalty Rewards"}
                                    </h3>
                                    {isHelper && <span className="text-sm font-medium text-primary">Level: {user.level || "Bronze"}</span>}
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {isHelper ? (
                                        <>
                                            <div className="bg-background/50 p-4 rounded-xl text-center">
                                                <div className="text-2xl font-bold text-primary">{user.points || 0}</div>
                                                <div className="text-xs text-muted-foreground mt-1">Total Points</div>
                                            </div>
                                            <div className="bg-background/50 p-4 rounded-xl text-center">
                                                <div className="text-2xl font-bold text-green-600">{user.completedJobs || 0}</div>
                                                <div className="text-xs text-muted-foreground mt-1">Jobs Done</div>
                                            </div>
                                            <div className="bg-background/50 p-4 rounded-xl text-center border border-yellow-500/20">
                                                <div className="text-2xl font-bold text-yellow-600">Gold</div>
                                                <div className="text-xs text-muted-foreground mt-1">Next Tier</div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {user.badges && user.badges.length > 0 ? user.badges.map((badge: string, i: number) => (
                                                <div key={i} className="bg-background/50 p-3 rounded-xl flex flex-col items-center gap-2 text-center">
                                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                                        <Award className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <span className="text-sm font-medium">{badge}</span>
                                                </div>
                                            )) : (
                                                    <div className="bg-background/50 p-3 rounded-xl flex flex-col items-center justify-center gap-2 text-center text-muted-foreground border border-dashed border-border h-full min-h-[100px]">
                                                        <Award className="w-6 h-6 opacity-40 mb-1" />
                                                        <span className="text-sm">Newbie</span>
                                                    </div>
                                                )}
                                        </>
                                    )}
                                </div>

                                {!isHelper && (
                                    <div className="mt-6 pt-6 border-t border-border border-dashed">
                                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                            <Gift className="w-4 h-4 text-pink-500" />
                                            Available Coupons
                                        </h4>
                                        <div className="space-y-2">
                                            {user.coupons?.length > 0 ? user.coupons.map((coupon: any, i: number) => (
                                                <div key={i} className="bg-background p-3 rounded-lg border border-dashed border-primary/30 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-mono font-bold text-primary">{coupon.code}</p>
                                                        <p className="text-xs text-muted-foreground">Expires: {new Date(coupon.validUntil).toLocaleDateString()}</p>
                                                    </div>
                                                    <span className="font-bold text-green-600">{coupon.discount}% OFF</span>
                                                </div>
                                            )) : (
                                                <div className="text-sm text-muted-foreground italic">No active coupons available. Book more services to earn rewards!</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Booking History for Users */}
                            {!isHelper && (
                                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-primary" />
                                            Your Bookings
                                        </h3>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {myBookings.length > 0 ? myBookings.slice().reverse().map((booking: any) => (
                                            <div key={booking.id} className="relative bg-secondary/50 rounded-xl p-4 border border-border flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                                <div>
                                                    <h4 className="font-semibold">{booking.serviceType || "Service Request"}</h4>
                                                    <p className="text-sm text-muted-foreground mt-1">Booked: {new Date(booking.createdAt).toLocaleDateString()}</p>
                                                    {booking.helperName && (
                                                        <p className="text-sm font-medium text-primary mt-1">Helper: {booking.helperName}</p>
                                                    )}
                                                </div>
                                                <div className="flex flex-col sm:items-end gap-2">
                                                    {booking.status === "accepted" && (
                                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-sm font-medium">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            Accepted
                                                        </div>
                                                    )}
                                                    {booking.status === "pending" && (
                                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-sm font-medium">
                                                            <Clock className="w-4 h-4" />
                                                            Pending
                                                        </div>
                                                    )}
                                                    {booking.status === "cancelled" && (
                                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-600 rounded-full text-sm font-medium">
                                                            <XCircle className="w-4 h-4" />
                                                            Cancelled
                                                        </div>
                                                    )}
                                                    
                                                    {booking.status === "pending" && (
                                                        <button 
                                                          onClick={() => handleCancelBooking(booking.id)}
                                                          className="mt-1 text-xs text-red-500 hover:text-red-600 hover:underline font-medium"
                                                        >
                                                            Cancel Request
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-8">
                                                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <XCircle className="w-8 h-8 text-muted-foreground opacity-50" />
                                                </div>
                                                <p className="text-muted-foreground">You haven't booked any services yet.</p>
                                                <Link to="/book" className="mt-4 inline-block px-4 py-2 bg-primary/10 text-primary font-medium rounded-lg hover:bg-primary/20 transition-colors">
                                                    Book Now
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Edit Profile Form */}
                            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold">Personal Details</h3>
                                    <button
                                        onClick={() => setEditing(!editing)}
                                        className="text-sm text-primary hover:underline"
                                    >
                                        {editing ? "Cancel" : "Edit Details"}
                                    </button>
                                </div>

                                <form onSubmit={handleUpdate} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
                                            <div className="relative">
                                               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                   <User className="h-4 w-4 text-muted-foreground" />
                                               </div>
                                               <input
                                                   disabled={!editing}
                                                   type="text"
                                                   value={formData.name}
                                                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                   className="w-full pl-10 pr-4 py-2.5 bg-secondary rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 transition-all outline-none"
                                               />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                                            <div className="relative">
                                               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                   <Mail className="h-4 w-4 text-muted-foreground" />
                                               </div>
                                               <input
                                                   disabled={!editing}
                                                   type="email"
                                                   value={formData.email}
                                                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                   className="w-full pl-10 pr-4 py-2.5 bg-secondary rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 transition-all outline-none"
                                               />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-1">Phone</label>
                                            <div className="relative">
                                               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                   <Phone className="h-4 w-4 text-muted-foreground" />
                                               </div>
                                               <input
                                                   disabled={!editing}
                                                   type="tel"
                                                   placeholder="Add your phone number"
                                                   value={formData.phone}
                                                   onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                   className="w-full pl-10 pr-4 py-2.5 bg-secondary rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 transition-all outline-none placeholder:text-muted-foreground/50"
                                               />
                                            </div>
                                        </div>
                                    </div>

                                    {editing && (
                                        <motion.button
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            type="submit"
                                            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                                        >
                                            Save Changes
                                        </motion.button>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
