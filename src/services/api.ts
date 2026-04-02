// LocalStorage Mock Offline Engine

const generateId = () => Math.random().toString(36).substr(2, 9);
const getStore = (key: string) => JSON.parse(localStorage.getItem(`app_${key}`) || '[]');
const setStore = (key: string, data: any) => localStorage.setItem(`app_${key}`, JSON.stringify(data));

export const api = {
    register: async (userData: any) => {
        const { email, password, name, role, ...otherData } = userData;
        const users = getStore('users');
        if (users.find((u: any) => u.email === email)) throw new Error("Email already exists");
        
        const userDoc = {
            uid: generateId(),
            name,
            email,
            password,
            role,
            ...otherData,
            badges: role === 'user' ? ['Newbie'] : [],
            coupons: [],
            points: 0,
            createdAt: new Date().toISOString(),
            isOnline: false
        };
        
        users.push(userDoc);
        setStore('users', users);
        localStorage.setItem("user", JSON.stringify(userDoc));
        return { ...userDoc, token: 'mock-token' };
    },
    
    login: async (credentials: any) => {
        const { email, password } = credentials;
        const users = getStore('users');
        const user = users.find((u: any) => u.email === email && u.password === password);
        
        if (!user) throw new Error("Invalid email or password");
        localStorage.setItem("user", JSON.stringify({ ...user, isOnline: false }));
        return { ...user, token: 'mock-token' };
    },
    
    logout: async () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    },
    
    getProfile: async () => {
        const localUser = localStorage.getItem("user");
        if (!localUser) throw new Error("Not authenticated");
        return JSON.parse(localUser);
    },
    
    updateProfile: async (data: any) => {
        const localUser = localStorage.getItem("user");
        if (!localUser) throw new Error("Not authenticated");
        const currentUser = JSON.parse(localUser);
        
        const users = getStore('users');
        const userIndex = users.findIndex((u: any) => u.uid === currentUser.uid);
        
        if (userIndex >= 0) {
            users[userIndex] = { ...users[userIndex], ...data };
            setStore('users', users);
            localStorage.setItem("user", JSON.stringify(users[userIndex]));
            return users[userIndex];
        }
        
        // update purely in localStorage if not found in db
        const updatedLocal = { ...currentUser, ...data };
        localStorage.setItem("user", JSON.stringify(updatedLocal));
        return updatedLocal;
    },
    
    getHelpers: async (params: any) => {
        const users = getStore('users');
        let helpers = users.filter((u: any) => u.role === "helper");
        
        if (params?.serviceType) {
            helpers = helpers.filter((h: any) => (h.serviceType || "").toLowerCase() === params.serviceType.toLowerCase());
        }
        return helpers.map((h: any) => ({ id: h.uid, ...h }));
    },
    
    subscribeToLiveHelpers: (callback: (helpers: any[]) => void) => {
        const interval = setInterval(() => {
            const users = getStore('users');
            const liveHelpers = users.filter((u: any) => u.role === "helper" && u.isOnline);
            callback(liveHelpers.map((h: any) => ({ id: h.uid, ...h })));
        }, 1000);
        
        return () => clearInterval(interval);
    },
    
    updateLocation: async (location: { lat: number; lng: number }) => {
        await api.updateProfile({ location, isOnline: true });
    },
    
    createBooking: async (bookingData: any) => {
        const localUserStr = localStorage.getItem("user");
        const user = localUserStr ? JSON.parse(localUserStr) : null;
        
        const booking = {
            id: generateId(),
            userId: user?.uid || "guest_user_id",
            userName: user?.name || "Guest User",
            ...bookingData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            rejectedBy: []
        };
        
        const bookings = getStore('bookings');
        bookings.push(booking);
        setStore('bookings', bookings);
        
        return booking;
    },
    
    getBooking: async (id: string) => {
        const bookings = getStore('bookings');
        const booking = bookings.find((b: any) => b.id === id);
        if (booking) return booking;
        throw new Error("Booking not found");
    },
    
    getMyBookings: async () => {
        const localUserStr = localStorage.getItem("user");
        if (!localUserStr) throw new Error("Not authenticated");
        const user = JSON.parse(localUserStr);
        
        const bookings = getStore('bookings');
        return bookings.filter((b: any) => b.userId === user.uid);
    },

    acceptBooking: async (bookingId: string) => {
        if (bookingId.startsWith("demo-")) return;
        const localUserStr = localStorage.getItem("user");
        if (!localUserStr) throw new Error("Not authenticated");
        const user = JSON.parse(localUserStr);

        const bookings = getStore('bookings');
        const idx = bookings.findIndex((b: any) => b.id === bookingId);
        if (idx >= 0) {
            bookings[idx].status = 'accepted';
            bookings[idx].helperId = user.uid;
            bookings[idx].helperName = user.name;
            bookings[idx].acceptedAt = new Date().toISOString();
            setStore('bookings', bookings);
        }
    },

    rejectBooking: async (bookingId: string) => {
        if (bookingId.startsWith("demo-")) return;
        const localUserStr = localStorage.getItem("user");
        if (!localUserStr) throw new Error("Not authenticated");
        const user = JSON.parse(localUserStr);

        const bookings = getStore('bookings');
        const idx = bookings.findIndex((b: any) => b.id === bookingId);
        if (idx >= 0) {
            bookings[idx].rejectedBy = [...(bookings[idx].rejectedBy || []), user.uid];
            setStore('bookings', bookings);
        }
    },

    cancelBooking: async (bookingId: string) => {
        const localUserStr = localStorage.getItem("user");
        if (!localUserStr) throw new Error("Not authenticated");
        const user = JSON.parse(localUserStr);

        const bookings = getStore('bookings');
        const idx = bookings.findIndex((b: any) => b.id === bookingId && b.userId === user.uid);
        if (idx >= 0) {
            bookings[idx].status = 'cancelled';
            setStore('bookings', bookings);
        } else {
            throw new Error("Booking not found or access denied");
        }
    },

    pollHelperBookings: (callback: (data: any) => void) => {
        const interval = setInterval(() => {
            const localUserStr = localStorage.getItem("user");
            if (!localUserStr) return;
            const user = JSON.parse(localUserStr);
            const uid = user.uid;
            
            const bookings = getStore('bookings');
            
            const pending = bookings.filter((b: any) => b.status === "pending");
            const accepted = bookings.filter((b: any) => b.status === "accepted" && b.helperId === uid);
            const rejected = bookings.filter((b: any) => (b.rejectedBy || []).includes(uid));

            callback({ pending, accepted, rejected });
        }, 1000);
        return () => clearInterval(interval);
    }
};
