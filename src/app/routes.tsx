import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { BookingPage } from "./pages/BookingPage";
import { BookingStatusPage } from "./pages/BookingStatusPage";
import { HelperDashboard } from "./pages/HelperDashboard";
import { ContactPage } from "./pages/ContactPage";
import { HelpPage } from "./pages/HelpPage";
import { AboutPage } from "./pages/AboutPage";
import { AuthPage } from "./pages/AuthPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AIDiagnosisPage } from "./pages/AIDiagnosisPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/about",
    element: <AboutPage />,
  },
  {
    path: "/book",
    Component: BookingPage,
  },
  {
    path: "/booking-status",
    element: <BookingStatusPage />,
  },
  {
    path: "/helper-dashboard",
    element: <HelperDashboard />,
  },
  {
    path: "/contact",
    element: <ContactPage />,
  },
  {
    path: "/help",
    element: <HelpPage />,
  },
  {
    path: "/login",
    element: <AuthPage />,
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
  {
    path: "/ai-diagnosis",
    element: <AIDiagnosisPage />,
  },
]);
