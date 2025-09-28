import Link from "next/link";
import Image from "next/image";
import CategoryScroll from "@/components/CategoryScroll";

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
    <>
      <div className="sm:hidden">
        <CategoryScroll />
      </div>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-800 px-4 sm:px-6 pt-16">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center relative">
          <div className="relative">
            <Image
              src="/fitactive.png"
              alt="Cycling Banner"
              width={250}
              height={250}
              className="max-w-xs sm:max-w-sm mb-8 sm:mb-12 drop-shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-100/20 to-transparent rounded-full blur-3xl"></div>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-tight">
            Добредојдовте во нашата онлајн продавница
          </h1>

          <p className="text-lg sm:text-xl max-w-2xl mb-8 sm:mb-12 text-gray-600 leading-relaxed">
            Премиум облека за велосипедизам дизајнирана за перформанси, удобност
            и стил. Купете дресови, шорцеви, ракавици и многу повеќе.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link
              href="/shop"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium"
            >
              Прегледајте ја нашата колекција
            </Link>
            <Link
              href="/cart"
              className="bg-white text-gray-700 border-2 border-gray-200 text-lg px-8 py-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
            >
              Кошничка
            </Link>
          </div>
        </section>
        {/* Size Shortcuts */}
        <section className="mt-20 sm:mt-32">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12 text-center bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
              Купувај по големина
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 sm:gap-6">
              {["XS", "S", "M", "L", "XL", "2XL"].map((size) => (
                <Link
                  key={size}
                  href={`/shop?size=${encodeURIComponent(size)}`}
                  className="group relative bg-white hover:bg-blue-600 text-blue-600 hover:text-white border-2 border-blue-200 hover:border-blue-600 px-6 py-4 rounded-2xl transition-all duration-300 font-bold text-lg text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <span className="relative z-10">{size}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Categories */}
        <section className="mt-20 sm:mt-32 pb-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12 text-center bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
              Избрани категории
            </h2>
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-500 mb-4">Нема достапни категории.</p>
                <Link href="/shop" className="btn-primary inline-block">
                  Прегледај продавница
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    href={`/shop?category=${encodeURIComponent(cat.name)}`}
                    className="group relative bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 border-2 border-gray-200 hover:border-blue-300 rounded-2xl p-6 sm:p-8 flex items-center justify-center text-lg sm:text-xl font-bold text-center text-gray-700 hover:text-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-2 min-h-[120px]"
                  >
                    <span className="relative z-10">{cat.name}</span>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
