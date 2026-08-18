import { useNavigate } from "react-router-dom";
import { MapPin, Star, BadgeCheck } from "lucide-react";
import { formatPrice, getArtisan, type Product } from "@/data/mockData";
// import { Product, getArtisan, formatPrice } from "@/data/mockData";

export default function ProductCard({ product, localisation, rating, verified }: { product: Product; localisation?: string; rating?: number; verified?: boolean }) {
  const navigate = useNavigate();
  const artisan = getArtisan(product.artisanId);
  const displayLocation = localisation || artisan?.localisation;
  const displayRating = rating ?? artisan?.rating;

  return (
    <button
      onClick={() => navigate(`/produit/${product.id}`)}
      className="bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all animate-fade-in text-left w-full"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <div className="flex items-center gap-1">
          <h3 className="font-bold text-sm line-clamp-1 flex-1">{product.title}</h3>
          {verified && (
            <BadgeCheck size={16} className="text-primary shrink-0" aria-label="Artisan certifié" />
          )}
        </div>
        <p className="text-accent font-extrabold text-base mt-1">{formatPrice(product.price)}</p>
        {displayLocation && (
          <div className="flex items-center gap-1 mt-1.5 text-muted-foreground">
            <MapPin size={12} />
            <span className="text-xs truncate">{displayLocation}</span>
          </div>
        )}
        {displayRating != null && (
          <div className="flex items-center gap-1 mt-1">
            <Star size={12} className="fill-accent text-accent" />
            <span className="text-xs font-semibold">{displayRating}</span>
          </div>
        )}
      </div>
    </button>
  );
}
