// components/chat/ProductCard.tsx

import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="border rounded-lg p-3 hover:shadow-md transition bg-white dark:bg-gray-800">
      {/* Product Name */}
      <h3 className="font-semibold text-sm mb-1 line-clamp-1">
        {product.name}
      </h3>

      {/* Brand */}
      {product.brand && (
        <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
      )}

      {/* Price */}
      <p className="text-lg font-bold text-blue-600 mb-2">
        €{product.price.toFixed(2)}
      </p>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-2">
        <span className="text-yellow-500">★</span>
        <span className="text-sm">{product.rating}/5</span>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
        {product.description}
      </p>

      {/* Stock Status */}
      <div className="flex items-center justify-between">
        <span
          className={`text-xs px-2 py-1 rounded ${
            product.stock > 0
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </span>

        <button className="text-xs text-blue-600 hover:underline">
          View Details
        </button>
      </div>
    </div>
  );
}
