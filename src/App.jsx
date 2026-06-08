import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Menu from "./components/Menu/Menu";
import Cart from "./components/Cart/Cart";
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
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/tracking" element={<OrderTracking />} />
        <Route path="/success" element={<OrderSuccess />} />
      </Routes>
    </>
  );
}

export default App;