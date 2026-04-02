import { Link, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Role Parsing Logic
  let userRole = null;
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try { userRole = JSON.parse(userStr).role; } catch (e) {}
  }
  const isLoggedIn = !!localStorage.getItem("token");
  
  // Separation Flags
  const isHelper = isLoggedIn && userRole === "helper";
  const isCustomer = isLoggedIn && userRole === "user";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload(); // Hard flush states and re-initialize Guest view
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md border-b border-border z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">Q</span>
            </div>
            <span className="font-bold text-xl text-foreground">QuickHelp</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isHelper ? (
              <>
                 <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Website Home</Link>
                 <Link to="/helper-dashboard" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Helper Dashboard</Link>
                 <Link to="/profile" className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium">Profile Settings</Link>
                 <button onClick={handleLogout} className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors font-medium">Logout</button>
              </>
            ) : isCustomer ? (
              <>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Home</Link>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors font-medium">About</Link>
                <Link to="/book" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Book Service</Link>
                <Link to="/ai-diagnosis" className="text-muted-foreground hover:text-foreground transition-colors font-medium">AI Diagnosis</Link>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Contact</Link>
                <Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Help</Link>
                <Link to="/profile" className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium">User Profile</Link>
                <button onClick={handleLogout} className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors font-medium">Logout</button>
              </>
            ) : (
              <>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Home</Link>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors font-medium">About</Link>
                <Link to="/book" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Book Service</Link>
                <Link to="/ai-diagnosis" className="text-muted-foreground hover:text-foreground transition-colors font-medium">AI Diagnosis</Link>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Contact</Link>
                <Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Help</Link>
                <Link to="/login" className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium">Helper Portal</Link>
                <Link to="/login" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">Login</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Menu className="w-6 h-6 text-foreground" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-t border-border"
          >
            <div className="px-4 py-4 space-y-3">
              {isHelper ? (
                <>
                  <Link to="/" onClick={closeMenu} className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors font-medium">Website Home</Link>
                  <Link to="/helper-dashboard" onClick={closeMenu} className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors font-medium">Helper Dashboard</Link>
                  <Link to="/profile" onClick={closeMenu} className="block px-4 py-2 bg-primary/10 text-primary rounded-lg transition-colors font-medium">Profile Settings</Link>
                  <button onClick={() => { closeMenu(); handleLogout(); }} className="block w-full text-left px-4 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors font-medium">Logout</button>
                </>
              ) : isCustomer ? (
                <>
                  <Link to="/" onClick={closeMenu} className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors font-medium">Home</Link>
                  <Link to="/about" onClick={closeMenu} className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors font-medium">About</Link>
                  <Link to="/book" onClick={closeMenu} className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors font-medium">Book Service</Link>
                  <Link to="/ai-diagnosis" onClick={closeMenu} className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors font-medium">AI Diagnosis</Link>
                  <Link to="/contact" onClick={closeMenu} className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors font-medium">Contact Us</Link>
                  <Link to="/help" onClick={closeMenu} className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors font-medium">Help</Link>
                  <Link to="/profile" onClick={closeMenu} className="block px-4 py-2 bg-primary/10 text-primary rounded-lg transition-colors font-medium">User Profile</Link>
                  <button onClick={() => { closeMenu(); handleLogout(); }} className="block w-full text-left px-4 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors font-medium">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/" onClick={closeMenu} className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors font-medium">Home</Link>
                  <Link to="/about" onClick={closeMenu} className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors font-medium">About</Link>
                  <Link to="/book" onClick={closeMenu} className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors font-medium">Book Service</Link>
                  <Link to="/ai-diagnosis" onClick={closeMenu} className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors font-medium">AI Diagnosis</Link>
                  <Link to="/contact" onClick={closeMenu} className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors font-medium">Contact Us</Link>
                  <Link to="/help" onClick={closeMenu} className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors font-medium">Help</Link>
                  <Link to="/login" onClick={closeMenu} className="block px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium">Helper Portal</Link>
                  <Link to="/login" onClick={closeMenu} className="block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">Login</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
