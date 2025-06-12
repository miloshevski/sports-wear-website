import ProductCard from "@/components/ProductCard";

async function getProducts() {
  const res = await fetch("https://sports-wear-website.vercel.app/api/products", {
    cache: "no-store",
  });
  return res.json();
}

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Shop</h1>

      {/* Filters can go here later */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
  {products.map((product) => (
    <ProductCard key={product._id} product={product} />
  ))}
</div>

    </div>
  );
}
