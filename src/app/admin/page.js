import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <h1 className="text-2xl text-red-600 font-semibold">
          Access Denied ❌
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 text-center">
        <h1 className="text-3xl font-bold mb-4 text-zinc-800 dark:text-zinc-100">
          Добредојде Ана / Марио / Аце 🎉
        </h1>
        <p className="mb-10 text-zinc-600 dark:text-zinc-300 text-lg">
          Логиран како{" "}
          <span className="font-semibold">{session.user.email}</span>
        </p>

        <div className="flex flex-col items-center gap-5">
          <Link href="/admin/add">
            <button className="w-64 py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-md">
              + Додади продукт
            </button>
          </Link>

          <Link href="/admin/products">
            <button className="w-64 py-4 text-lg bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all shadow-md">
              🔀 Сортирај продукти
            </button>
          </Link>

          <Link href="/admin/orders">
            <button className="w-64 py-4 text-lg bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-md">
              📦 Прегледај нарачки
            </button>
          </Link>

          <Link href="/admin/history">
            <button className="w-64 py-4 text-lg bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl transition-all shadow-md">
              🕓 Историја на нарачки
            </button>
          </Link>

          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-64 py-4 text-lg bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-md"
            >
              🔓 Одјава
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
