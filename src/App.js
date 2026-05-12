import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ConsumerEcommerceDashboard from "./pages/consumer-ecommerce/pages/App";
import ConsumerEcommerceDelivery from "./pages/consumer-ecommerce/pages/DeliveryPage";
import ConsumerNearbyStores from "./pages/consumer-ecommerce/pages/NearbyStoresPage";
import ConsumerNearMe from "./pages/consumer-ecommerce/pages/NearMePage";
import AdsPage from "./pages/consumer-ecommerce/pages/AdsPage";
import SocietyPage from "./pages/consumer-ecommerce/pages/SocietyPage";
import BusinessRegistrationPage from "./pages/consumer-ecommerce/pages/BusinessRegistrationPage";
import ConsumerScannerPage from "./pages/consumer-ecommerce/pages/ConsumerScannerPage";
import CartPage from "./pages/consumer-ecommerce/pages/CartPage";
import TriPayPage from "./pages/consumer-ecommerce/pages/TriPayPage";
import TriEatPage from "./pages/consumer-ecommerce/pages/TriEatPage";
import TriTripPage from "./pages/consumer-ecommerce/pages/TriTripPage";
import TriPickDropPage from "./pages/consumer-ecommerce/pages/TriPickDropPage";
import TriInventoryBillingPage from "./pages/consumer-ecommerce/pages/TriInventoryBillingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Navigate to="/consumer-ecommerce" replace />} /> */}
        <Route path="/" element={<ConsumerEcommerceDashboard />} />
        <Route path="/consumer-ecommerce/delivery" element={<ConsumerEcommerceDelivery />} />
        <Route path="/consumer-ecommerce/nearby-stores" element={<ConsumerNearbyStores />} />
        <Route path="/consumer-ecommerce/near-me" element={<ConsumerNearMe />} />
        <Route path="/consumer-ecommerce/ads" element={<AdsPage />} />
        <Route path="/consumer-ecommerce/society" element={<SocietyPage />} />
        <Route path="/consumer-ecommerce/business" element={<BusinessRegistrationPage />} />
        <Route path="/consumer-ecommerce/scanner" element={<ConsumerScannerPage />} />
        <Route path="/consumer-ecommerce/cart" element={<CartPage />} />
        <Route path="/consumer-ecommerce/tripay" element={<TriPayPage />} />
        <Route path="/consumer-ecommerce/trieat" element={<TriEatPage />} />
        <Route path="/consumer-ecommerce/tritrip" element={<TriTripPage />} />
        <Route path="/consumer-ecommerce/tripickdrop" element={<TriPickDropPage />} />
        <Route path="/business/inventory-billing" element={<TriInventoryBillingPage />} />
        
        {/* Catch all to home */}
        <Route path="*" element={<Navigate to="/consumer-ecommerce" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
