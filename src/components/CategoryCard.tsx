import { useNavigate } from "react-router-dom";
import type { Category } from "@/data/mockData";

export default function CategoryCard({ category }: { category: Category }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/categorie/${category.id}`)}
      className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl shadow-sm hover:shadow-md transition-all animate-scale-in min-h-[110px]"
    >
      <span className="text-4xl">{category.icon}</span>
      <span className="text-base font-extrabold text-center leading-tight">{category.name}</span>
    </button>
  );
}