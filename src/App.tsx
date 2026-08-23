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
import Login from "./pages/Login";
import Affiliation from "./pages/Affiliation";
import Categories from "./pages/Categories";
import Publier from "./pages/Publier";
import Messages from "./pages/Messages";
import Profil from "./pages/Profil";
import Aide from "./pages/Aide";
import Parametres from "./pages/Parametres";
import Verification from "./pages/verification";
import MonCompte from "./pages/MonCompte";
import Publicite from "./pages/Publicite";
import Chat from "./pages/Chat";
import MesCommandes from "./pages/MesCommandes";
import AdminProduits from "./pages/AdminProduits";
import AdminDashboard from "./pages/AdminDashboard";
import AdminParametres from "./pages/AdminParametres";
import AdminMonetisation from "./pages/AdminMonetisation";
import AdminAllProduits from "./pages/AdminAllProduits";

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
          <Route path="/categories" element={<Categories />} />
          <Route path="/chat/:userId" element={<Chat />} />
          <Route path="/a-propos" element={<APropos />} />
          <Route path="/publicite" element={<Publicite />} />
          <Route path="/publier" element={<Publier />} />
           <Route path="/mes-commandes" element={<MesCommandes />} />
            <Route path="/mes-produits" element={<AdminProduits />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/parametres" element={<AdminParametres />} />
            <Route path="/admin/monetisation" element={<AdminMonetisation />} />
            <Route path="/admin/produits" element={<AdminAllProduits />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/affiliation" element={<Affiliation />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/parametres" element={<Parametres />} />
          <Route path="/aide" element={<Aide />} />
          <Route path="/avis" element={<Avis />} />
          <Route path="/mon-compte" element={<MonCompte/>} />
          
          <Route path="*" element={<NotFound />} />
          <Route path="/connexion" element={<Login />} />
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;