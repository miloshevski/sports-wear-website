import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
      <Image
        src="/images/cycling-banner.jpg"
        alt="Cycling Banner"
        width={800}
        height={400}
        className="rounded-lg shadow-lg mb-8"
      />
      <h1 className="text-4xl font-bold mb-4">Welcome to CycleFit</h1>
      <p className="text-lg text-center max-w-2xl mb-6">
        Discover the best cycling apparel and gear for your next adventure.
      </p>
      <Link
        href="/products"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Shop Now
      </Link>
    </div>
  );
}
