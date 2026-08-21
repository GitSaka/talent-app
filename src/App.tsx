import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";



import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Inscription from "./pages/Inscription";
import { AuthProvider } from "@/components/AuthProvider"; // Ajuste le chemin si besoin (ex: "../components/AuthProvider")
import ProductDetail from "./pages/ProductDetail";
import CategoryDetail from "./pages/CategoryDetail";
import APropos from "./pages/APropos";
import Avis from "./pages/Avis";

// On initialise le client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        {/* Le composant Toaster permet d'afficher les notifications (toast.success / toast.error) */}
        <Toaster position="top-center" richColors />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/inscription" element={<Inscription />} />
          {/* On ajoutera les autres routes ici (connexion, etc.) */}
          <Route path="/produit/:id" element={<ProductDetail />} />
          <Route path="/categorie/:id" element={<CategoryDetail />} />
          <Route path="/a-propos" element={<APropos />} />
          <Route path="/avis" element={<Avis />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;