import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import BookingPage from "./pages/BookingPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import TrackOrderPage from "./pages/TrackOrderPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCreateEvent from "./pages/admin/AdminCreateEvent";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AboutPage from "./pages/AboutPage";
import TermsPage from "./pages/TermsPage";
import DigitalCardPage from "./pages/DigitalCardPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import FlowerShop from "./pages/FlowerShop";
import RentalShop from "./pages/RentalShop";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/events" component={EventsPage} />
      <Route path="/events/:slug" component={EventDetailPage} />
      <Route path="/booking/:eventId" component={BookingPage} />
      <Route path="/order/:orderNumber" component={OrderConfirmationPage} />
      <Route path="/track" component={TrackOrderPage} />
      <Route path="/my-orders" component={MyOrdersPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/events" component={AdminEvents} />
      <Route path="/admin/events/create" component={AdminCreateEvent} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/notifications" component={AdminNotifications} />
      <Route path="/admin/coupons" component={AdminCoupons} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/about" component={AboutPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/card" component={DigitalCardPage} />
      <Route path="/payment-success" component={PaymentSuccessPage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/flowers" component={FlowerShop} />
      <Route path="/rentals" component={RentalShop} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster position="top-center" richColors />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
