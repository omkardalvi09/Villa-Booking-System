import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer
      aria-label="Site footer"
      className="bg-[#121212] text-[#B3B3B3] border-t border-[#333333] mt-0"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top row */}
        <div className="flex flex-col items-center justify-between gap-6 py-8 md:flex-row">
          {/* Brand */}
          <div className="text-center md:text-left">
            <span className="text-xl font-semibold tracking-wide text-[#6A0DAD]">
              Stavilo
            </span>
            <p className="mt-1 text-sm text-[#FFD369]/80">
              Boutique villas inspired by nature.
            </p>
          </div>

          {/* Links */}
          <nav aria-label="Footer" className="flex items-center gap-6 text-sm">
            <Link
              to="/villas"
              className="hover:text-[#FFD369] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#333333] transition-colors"
            >
              Villas
            </Link>
            <Link
              to="/rooms"
              className="hover:text-[#FFD369] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#333333] transition-colors"
            >
              Rooms
            </Link>
            <Link
              to="/about"
              className="hover:text-[#FFD369] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#333333] transition-colors"
            >
              About
            </Link>
            <Link
              to="/owner"
              className="hover:text-[#FFD369] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#333333] transition-colors"
            >
              Owner
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-full border border-[#333333]/50 bg-[#6A0DAD] px-4 py-1.5 font-medium text-[#ffffff] shadow-sm transition-colors hover:bg-[#FFD369] hover:text-[#6A0DAD] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#333333]"
            >
              Contact
            </Link>
          </nav>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#333333] to-transparent" />

        {/* Bottom row */}
        <div className="flex items-center justify-center py-6 text-xs text-[#B3B3B3]/90">
          <p className='flex'>© {new Date().getFullYear()} Stavilo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer