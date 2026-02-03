import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Header() {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  const navClass = ({ isActive }) =>
    [
      "font-bold text-base sm:text-lg",              // bigger titles
      "tracking-wide",                               // clean spacing look
      "hover:text-[#FA6800] transition-colors",      // orange hover
      isActive ? "text-[#FA6800]" : "text-white",
    ].join(" ");

  return (
    <header className="bg-[#EF4136] text-white shadow-md">
      <div className="mx-auto max-w-7xl px-2">
        {/* Increased header height */}
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Left Corner (no text) */}
          <Link to="/" onClick={closeMenu} className="flex items-center">
            <img
              src={logo}
              alt="Digital Census Logo"
              className="h-12 w-12 object-contain"
            />
          </Link>

          {/* Desktop Nav (center area) */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            <NavLink to="/" end className={navClass}>
              Home
            </NavLink>
            <NavLink to="/services" className={navClass}>
              Services
            </NavLink>
            <NavLink to="/how-it-works" className={navClass}>
              How It Works
            </NavLink>
            <NavLink to="/news" className={navClass}>
              News
            </NavLink>
            <NavLink to="/contact" className={navClass}>
              Contact Us
            </NavLink>
            <NavLink to="/privacy-policy" className={navClass}>
              Privacy
            </NavLink>
          </nav>

          {/* Right Corner Actions */}
          <div className="flex items-center gap-3">
            {/* Desktop Enter Button */}
            <Link
              to="/enter"
              className="hidden md:inline-flex bg-[#FA6800] hover:bg-orange-600 text-white px-5 py-2 rounded-md font-bold transition"
            >
              Enter
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md bg-white/10 hover:bg-white/20 transition"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              <span className="text-2xl leading-none">☰</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {open && (
        <div className="md:hidden border-t border-white/20">
          <div className="px-4 py-4 space-y-3">
            <NavLink to="/" end onClick={closeMenu} className={navClass}>
              Home
            </NavLink>
            <NavLink to="/services" onClick={closeMenu} className={navClass}>
              Services
            </NavLink>
            <NavLink to="/how-it-works" onClick={closeMenu} className={navClass}>
              How It Works
            </NavLink>
            <NavLink to="/news" onClick={closeMenu} className={navClass}>
              News
            </NavLink>
            <NavLink to="/contact" onClick={closeMenu} className={navClass}>
              Contact Us
            </NavLink>
            <NavLink to="/privacy-policy" onClick={closeMenu} className={navClass}>
              Privacy
            </NavLink>

            {/* Mobile Enter Button */}
            <Link
              to="/enter"
              onClick={closeMenu}
              className="block bg-[#FA6800] hover:bg-orange-600 text-center py-2 rounded-md font-bold transition"
            >
              Enter
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
