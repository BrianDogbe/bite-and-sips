import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import OrderTracking from "./pages/OrderTracking";
import OrderSuccess from "./pages/OrderSuccess";
import Home from "./pages/Home";

function App() {
  const { pathname } = useLocation();
  const isKitchen = pathname.startsWith("/kitchen");

  return (
    <>
      {!isKitchen && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/tracking" element={<OrderTracking />} />
        <Route path="/success" element={<OrderSuccess />} />

        {/* Hidden kitchen dashboard — not linked from the customer site */}
        <Route path="/kitchen/login" element={<Login />} />
        <Route
          path="/kitchen"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* Old paths redirect via Navigate in Login/ProtectedRoute targets */}
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>

      {!isKitchen && <Footer />}
    </>
  );
}

export default App;
