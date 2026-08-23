import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import BottomNav from "@/components/BottomNav";
import { categories } from "@/data/mockData";

export default function Categories() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-extrabold">Catégories</h1>
      </header>

      <div className="px-4 mt-6 grid grid-cols-2 gap-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => navigate(`/categorie/${cat.id}`)}
            className="relative overflow-hidden rounded-2xl h-40 animate-fade-in"
          >
            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent flex items-end p-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-primary-foreground font-extrabold text-lg">{cat.name}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
