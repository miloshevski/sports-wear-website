import Image from "next/image";

export default function ProductCard({ product }) {
  return (
    <div className="border rounded-xl p-4 hover:shadow-lg transition">
      <Image
        src={product.image}
        alt={product.name}
        width={300}
        height={200}
        className="rounded mb-4"
      />
      <h3 className="text-xl font-semibold">{product.name}</h3>
      <p className="text-blue-600 font-bold">${product.price.toFixed(2)}</p>
    </div>
  );
}
