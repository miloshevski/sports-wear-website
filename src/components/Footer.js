export default function Footer() {
  return (
    <footer className="mt-20 border-t border-zinc-200 py-8 bg-white text-center text-sm text-zinc-500">
      <p>&copy; {new Date().getFullYear()} CycleFit. All rights reserved.</p>
      <div className="mt-2 flex justify-center gap-4">
        <a href="#" className="hover:text-blue-600 transition">
          Instagram
        </a>
        <a href="#" className="hover:text-blue-600 transition">
          GitHub
        </a>
        <a
          href="mailto:info@cyclefit.com"
          className="hover:text-blue-600 transition"
        >
          Email
        </a>
      </div>
    </footer>
  );
}
