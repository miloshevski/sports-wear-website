export default function Footer() {
  return (
    <footer className="mt-20 border-t border-zinc-200 px-4 sm:px-8 py-6 sm:py-8 bg-white text-center text-sm text-zinc-500">
      <p>&copy; {new Date().getFullYear()} Sportska Oprema. All rights reserved.</p>

      <div className="mt-3 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <a
          href="https://www.instagram.com/sports.wear.mk/"
          className="hover:text-blue-600 transition text-sm sm:text-base"
        >
          Instagram
        </a>
        {/* You can easily add more social links here in future */}
        {/* <a href="#" className="hover:text-blue-600 transition">Facebook</a> */}
      </div>
    </footer>
  );
}
