import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";
import OrderTracking from "./pages/OrderTracking";
import OrderSuccess from "./pages/OrderSuccess";
import Home from "./pages/Home";

function App() {
  return (
    <>
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/tracking" element={<OrderTracking />} />
        <Route path="/success" element={<OrderSuccess />} />
       
      </Routes>
    </>
  );
}

export default App;