// Types de données
export type Category = {
  id: string;
  name: string;
  icon: string;
  image: string;
};

export type Artisan = {
  id: string;
  name: string;
  metier: string;
  description: string;
  localisation: string;
  phone: string;
  whatsapp: string;
  avatar: string;
  rating: number;
  reviewCount: number;
};

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  artisanId: string;
  delai: string;
};

export type Review = {
  id: string;
  clientName: string;
  artisanId: string;
  note: number;
  commentaire: string;
  date: string;
};

// Catégories (utilisation d'images par défaut fiables pour éviter les erreurs d'assets manquants)
export const categories: Category[] = [
  { id: "menuiserie", name: "Bois & Meubles", icon: "🪵", image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=500&auto=format&fit=crop" },
  { id: "soudure", name: "Métallique", icon: "⚒️", image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500&auto=format&fit=crop" },
  { id: "aluminium", name: "Aluminium", icon: "🪟", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop" },
  { id: "mode", name: "Mode", icon: "👗", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&auto=format&fit=crop" },
  { id: "decoration", name: "Décoration", icon: "🎨", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop" },
  { id: "autres", name: "Autres", icon: "✨", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop" },
];

export const artisans: Artisan[] = [
  {
    id: "a1",
    name: "Koffi Houénou",
    metier: "Menuisier",
    description: "Artisan menuisier avec 15 ans d'expérience à Cotonou. Spécialisé dans les meubles sur mesure en bois massif.",
    localisation: "Cotonou, Bénin",
    phone: "+22997001122",
    whatsapp: "+22997001122",
    avatar: "",
    rating: 4.8,
    reviewCount: 24,
  },
  {
    id: "a2",
    name: "Kossi Apelete",
    metier: "Cordonnier",
    description: "Artisan cordonnier spécialisé dans les chaussures et accessoires en cuir fait main.",
    localisation: "Porto-Novo, Bénin",
    phone: "+22996112233",
    whatsapp: "+22996112233",
    avatar: "",
    rating: 4.9,
    reviewCount: 42,
  },
  {
    id: "a3",
    name: "Sènou Adandé",
    metier: "Soudeur",
    description: "Expert en soudure métallique. Portails, grilles, balcons et structures métalliques sur mesure.",
    localisation: "Abomey-Calavi, Bénin",
    phone: "+22995223344",
    whatsapp: "+22995223344",
    avatar: "",
    rating: 4.6,
    reviewCount: 18,
  },
  {
    id: "a4",
    name: "Fifamè Dossou",
    metier: "Décoratrice",
    description: "Artisane spécialisée dans la décoration intérieure. Poteries, tissages et objets d'art.",
    localisation: "Parakou, Bénin",
    phone: "+22994334455",
    whatsapp: "+22994334455",
    avatar: "",
    rating: 4.7,
    reviewCount: 31,
  },
];

export const products: Product[] = [
  {
    id: "p1",
    title: "Table en bois massif",
    description: "Belle table de salle à manger en bois massif iroko, fabriquée à la main.",
    price: 150000,
    category: "menuiserie",
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=500&auto=format&fit=crop",
    artisanId: "a1",
    delai: "2 semaines",
  },
  {
    id: "p2",
    title: "Chaussures en cuir fait main",
    description: "Chaussures habillées en cuir véritable, cousues main.",
    price: 55000,
    category: "mode",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&auto=format&fit=crop",
    artisanId: "a2",
    delai: "1 semaine",
  },
  {
    id: "p3",
    title: "Portail en fer forgé",
    description: "Portail décoratif en fer forgé avec motifs floraux.",
    price: 250000,
    category: "soudure",
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500&auto=format&fit=crop",
    artisanId: "a3",
    delai: "3 semaines",
  },
  {
    id: "p4",
    title: "Ensemble vases artisanaux",
    description: "Collection de vases en terre cuite peints à la main.",
    price: 45000,
    category: "decoration",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop",
    artisanId: "a4",
    delai: "1 semaine",
  },
];

export const reviews: Review[] = [
  { id: "r1", clientName: "Cossi B.", artisanId: "a1", note: 5, commentaire: "Excellent travail ! La table est magnifique.", date: "2026-02-15" },
  { id: "r2", clientName: "Grâce K.", artisanId: "a2", note: 5, commentaire: "Chaussures parfaites. Merci !", date: "2026-03-01" },
];

// Fonctions utilitaires
export function getArtisan(id: string) {
  return artisans.find((a) => a.id === id);
}

export function getProductsByCategory(categoryId: string) {
  return products.filter((p) => p.category === categoryId);
}

export function getProductsByArtisan(artisanId: string) {
  return products.filter((p) => p.artisanId === artisanId);
}

export function getReviewsByArtisan(artisanId: string) {
  return reviews.filter((r) => r.artisanId === artisanId);
}

export function formatPrice(price: number) {
  return price.toLocaleString("fr-FR") + " FCFA";
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return products.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );
}

export function searchArtisans(query: string): Artisan[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return artisans.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.metier.toLowerCase().includes(q) ||
      a.localisation.toLowerCase().includes(q)
  );
}