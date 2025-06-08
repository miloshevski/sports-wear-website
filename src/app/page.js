import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 px-6 pt-24">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center">
        <Image
          src="/fitactive.png"
          alt="Cycling Banner"
          width={300}
          height={300}
          className="rounded-lg shadow-lg mb-10"
        />
        <h1 className="text-5xl font-extrabold mb-4">
          Welcome to Sports Wear MK
        </h1>
        <p className="text-lg max-w-2xl mb-6">
          Premium cycling apparel designed for performance, comfort, and style.
          Shop jerseys, bib shorts, gloves, and more.
        </p>
        <Link
          href="/products"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Shop Now
        </Link>
      </section>

      {/* Featured Categories */}
      <section className="mt-24">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Featured Categories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              name: "Jerseys",
              image: "/images/jersey1.jpg",
              href: "/products/jerseys",
            },
            {
              name: "Shorts",
              image: "/images/shorts1.jpg",
              href: "/products/shorts",
            },
            {
              name: "Gloves",
              image: "/images/gloves1.jpg",
              href: "/products/gloves",
            },
            {
              name: "Jackets",
              image: "/images/jacket1.jpg",
              href: "/products/jackets",
            },
          ].map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="border rounded-xl overflow-hidden hover:shadow-md transition"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                width={500}
                height={300}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 text-center font-semibold">{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="mt-24 bg-blue-100 rounded-xl p-10 text-center">
        <h2 className="text-2xl font-bold mb-2">Stay Ahead of the Pack</h2>
        <p className="mb-4">
          Subscribe for updates on new releases and exclusive deals.
        </p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
          Subscribe
        </button>
      </section>
    </div>
  );
}
