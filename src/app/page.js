import Link from "next/link";
import Image from "next/image";

async function getCategories() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/categories`,
    {
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export default async function Home() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-white text-zinc-900 px-4 sm:px-6 pt-24">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center">
        <Image
          src="/fitactive.png"
          alt="Cycling Banner"
          width={200}
          height={200}
          className="max-w-xs sm:max-w-sm mb-6 sm:mb-10"
        />
        <h1 className="text-3xl sm:text-5xl font-extrabold mb-4">
          Добредојдовте во нашата онлајн продавница
        </h1>

        <p className="text-base sm:text-lg max-w-xl mb-6 sm:mb-8">
          Премиум облека за велосипедизам дизајнирана за перформанси, удобност и
          стил. Купете дресови, шорцеви, ракавици и многу повеќе.
        </p>
        <Link
          href="/shop"
          className="bg-blue-600 text-white text-base sm:text-lg px-5 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Прегледајте ја нашата колекција
        </Link>
      </section>
      {/* Size Shortcuts */}
      <section className="mt-16 sm:mt-24">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
          Купувај по големина
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {["XS", "S", "M", "L", "XL", "2XL"].map((size) => (
            <Link
              key={size}
              href={`/shop?size=${encodeURIComponent(size)}`}
              className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-full transition font-semibold"
            >
              {size}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Categories */}
      <section className="mt-16 sm:mt-24">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
          Избрани категории
        </h2>
        {categories.length === 0 ? (
          <p className="text-center text-gray-500">Нема достапни категории.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="border rounded-xl p-4 sm:p-6 flex items-center justify-center text-base sm:text-lg font-semibold text-center hover:shadow-md transition"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
