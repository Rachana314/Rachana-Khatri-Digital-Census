import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="bg-[#1A1A1A]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            Digital household census for local government
          </h1>

          <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl">
            Citizens submit household data online. Admin verifies and locks records,
            and authorities view population insights for planning and development.
          </p>

          <div className="mt-6">
            <Link
              to="/enter"
              className="rounded-lg bg-[#FA6800] px-6 py-3 text-sm font-bold text-white hover:opacity-90 transition"
            >
              Enter
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="scroll-mt-24 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">Services</h2>
          <p className="mt-2 text-[#1A1A1A]/70 max-w-2xl">
            Digital submission, verification, secure storage, and population insights.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="scroll-mt-24 py-16 bg-[#5273FF]/5">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">How It Works</h2>
          <p className="mt-2 text-[#1A1A1A]/70 max-w-2xl">
            Submit → Verify → Lock → Use data for planning.
          </p>
        </div>
      </section>

      {/* NEWS */}
      <section id="news" className="scroll-mt-24 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">News</h2>
          <p className="mt-2 text-[#1A1A1A]/70">Official updates and notices.</p>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="scroll-mt-24 py-16 bg-[#1A1A1A] text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Contact Us</h2>
          <p className="mt-2 text-white/80">Ward office support for submissions and verification.</p>
        </div>
      </section>

      {/* PRIVACY */}
      <section id="privacy" className="scroll-mt-24 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">Privacy</h2>
          <p className="mt-2 text-[#1A1A1A]/70 max-w-2xl">
            Data is verified, controlled, and securely stored.
          </p>
        </div>
      </section>
    </div>
  );
}
