import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.isAdmin) {
    return (
      <h1 className="text-center text-red-600 mt-32 text-xl">Access Denied</h1>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-32 p-10 bg-white rounded-2xl shadow-lg border text-center">
      <h1 className="text-3xl font-bold mb-4 text-zinc-800">
        Добредојде Ана/Марио/Аце
      </h1>
      <p className="mb-10 text-zinc-600 text-lg">
        Логиран како <span className="font-semibold">{session.user.email}</span>
      </p>

      <div className="flex flex-col items-center gap-6">
        <Link href="/admin/add">
          <button className="w-64 py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-sm">
            ➕ Додади продукт
          </button>
        </Link>

        <Link href="/admin/orders">
          <button className="w-64 py-4 text-lg bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-sm">
            📦 Прегледај нарачки
          </button>
        </Link>

        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="w-64 py-4 text-lg bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-sm"
          >
            🔓 Одјава
          </button>
        </form>
      </div>
    </div>
  );
}
