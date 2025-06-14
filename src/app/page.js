import Link from 'next/link';
import Image from 'next/image';

// 👇 server-side fetch
async function getCategories() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/categories`, {
    cache: 'no-store', // disable caching for fresh data
  });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export default async function Home() {
  const categories = await getCategories();

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
          Добредојдовте во нашата онлајн продавница
        </h1>
        <p className="text-lg max-w-2xl mb-6">
          Премиум облека за велосипедизам дизајнирана за перформанси, удобност и стил.
          Купете дресови, шорцеви, ракавици и многу повеќе.
        </p>
        <Link
          href="/shop"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Прегледајте ја нашата колекција
        </Link>
      </section>

      {/* Featured Categories */}
      <section className="mt-24">
        <h2 className="text-3xl font-bold mb-8 text-center">Избрани категории</h2>
        {categories.length === 0 ? (
          <p className="text-center text-gray-500">Нема достапни категории.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="border rounded-xl p-6 flex items-center justify-center text-lg font-semibold text-center hover:shadow-md transition"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Call to Action */}
      <section className="mt-24 bg-blue-100 rounded-xl p-10 text-center">
        <h2 className="text-2xl font-bold mb-2">Останете во водство</h2>
        <p className="mb-4">
          Пријавете се за новости за нови производи и ексклузивни попусти.
        </p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
          Пријави се
        </button>
      </section>
    </div>
  );
}
