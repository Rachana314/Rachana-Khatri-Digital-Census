import { useParams, Link } from "react-router-dom";

export default function QrCode() {
  const { householdId } = useParams();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Household QR</h1>
          <p className="text-black/60 font-medium mt-1">
            QR code for verification and tracking (UI placeholder for now).
          </p>
        </div>
        <Link to="/user/forms" className="rounded-2xl px-4 py-2 font-bold border hover:bg-black/5">
          Back
        </Link>
      </div>

      <div className="rounded-3xl bg-white border shadow-sm p-6">
        <div className="font-extrabold">Household ID: <span className="text-black/70">{householdId}</span></div>

        <div className="mt-5 rounded-2xl border bg-gray-50 p-10 flex items-center justify-center">
          <div className="text-black/50 font-extrabold">
            QR IMAGE WILL SHOW HERE
          </div>
        </div>

        <div className="mt-5 flex gap-3 flex-wrap">
          <button className="rounded-2xl px-4 py-2 font-extrabold bg-black text-white hover:opacity-90">
            Download (later)
          </button>
          <button className="rounded-2xl px-4 py-2 font-bold border hover:bg-black/5">
            Share (later)
          </button>
        </div>
      </div>
    </div>
  );
}
