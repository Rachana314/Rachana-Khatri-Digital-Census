console.log("✅ HouseholdNew NEW FILE LOADED");
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../lib/api";
import { uploadDoc } from "../../lib/upload";

export default function HouseholdNew() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const steps = useMemo(
    () => [
      t("household.steps.info"),
      t("household.steps.members"),
      t("household.steps.documents"),
      t("household.steps.review"),
    ],
    [t]
  );

  const [step, setStep] = useState(0);
  const [householdId, setHouseholdId] = useState(null);

  const [household, setHousehold] = useState({ ward: "", address: "" });
  const [members, setMembers] = useState([]);
  const [documents, setDocuments] = useState([]); // [{type,url}]
  const [docType, setDocType] = useState("Citizenship");

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const saveDraft = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        ward: household.ward,
        address: household.address,
        members,
        documents,
      };

      if (!householdId) {
        const created = await apiFetch("/api/households", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setHouseholdId(created.householdId);
        return created.householdId;
      } else {
        await apiFetch(`/api/households/${householdId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        return householdId;
      }
    } catch (e) {
      throw new Error(e.message || "Could not save draft.");
    } finally {
      setSaving(false);
    }
  };

  const goNext = async () => {
    setError("");
    try {
      // autosave whenever moving forward
      if (step < 3) await saveDraft();
      setStep((s) => Math.min(s + 1, steps.length - 1));
    } catch (e) {
      setError(e.message);
    }
  };

  const handleUpload = async (file) => {
    setUploading(true);
    setError("");
    try {
      let id = householdId;
      if (!id) id = await saveDraft();

      const result = await uploadDoc(id, docType, file);
      setDocuments(result.item?.documents || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const submitForVerification = async () => {
    setSaving(true);
    setError("");
    try {
      const id = householdId || (await saveDraft());
      await apiFetch(`/api/households/${id}/submit`, { method: "POST" });
      navigate("/user/forms");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">{t("household.title")}</h1>
          <p className="text-black/60 font-medium mt-1">{t("household.subtitle")}</p>
        </div>
        <Link to="/user/forms" className="rounded-2xl px-4 py-2 font-bold border hover:bg-black/5 transition">
          {t("household.backToForms")}
        </Link>
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5">
          <div className="font-extrabold text-rose-700">Error</div>
          <div className="text-rose-700/80 mt-1">{error}</div>
        </div>
      )}

      <div className="rounded-3xl bg-white border shadow-sm p-5">
        {/* Stepper */}
        <div className="flex flex-wrap gap-2">
          {steps.map((label, idx) => (
            <div
              key={idx}
              className={`rounded-2xl px-4 py-2 text-sm font-extrabold border ${
                idx === step ? "bg-zinc-900 text-white border-zinc-900" : "bg-zinc-50 text-black/60"
              }`}
            >
              {idx + 1}. {label}
            </div>
          ))}
        </div>

        <div className="mt-6">
          {/* Step 1 */}
          {step === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-extrabold">{t("household.info.ward")}</label>
                <input
                  className="mt-2 w-full rounded-2xl border p-3"
                  value={household.ward}
                  onChange={(e) => setHousehold({ ...household, ward: e.target.value })}
                  placeholder={t("household.info.wardPh")}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-extrabold">{t("household.info.address")}</label>
                <input
                  className="mt-2 w-full rounded-2xl border p-3"
                  value={household.address}
                  onChange={(e) => setHousehold({ ...household, address: e.target.value })}
                  placeholder={t("household.info.addressPh")}
                />
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 1 && (
            <div className="space-y-4">
              <button
                onClick={() =>
                  setMembers((prev) => [
                    ...prev,
                    { name: "", age: "", gender: "Male", maritalStatus: "Single", education: "", occupation: "" },
                  ])
                }
                className="rounded-2xl px-5 py-3 font-extrabold bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 transition"
              >
                {t("household.members.add")}
              </button>

              {members.map((m, idx) => (
                <div key={idx} className="rounded-3xl border p-5 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-extrabold">{t("household.members.member", { n: idx + 1 })}</div>
                    <button
                      onClick={() => setMembers((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-rose-600 font-extrabold hover:underline"
                    >
                      {t("common.remove")}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      className="rounded-2xl border p-3"
                      placeholder={t("household.members.fullName")}
                      value={m.name}
                      onChange={(e) => {
                        const copy = [...members];
                        copy[idx].name = e.target.value;
                        setMembers(copy);
                      }}
                    />
                    <input
                      className="rounded-2xl border p-3"
                      placeholder={t("household.members.age")}
                      value={m.age}
                      onChange={(e) => {
                        const copy = [...members];
                        copy[idx].age = e.target.value;
                        setMembers(copy);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 3 */}
          {step === 2 && (
            <div className="rounded-3xl border p-5 bg-white">
              <div className="font-extrabold text-lg">{t("household.documents.title")}</div>
              <div className="text-black/60 font-medium mt-1">{t("household.documents.subtitle")}</div>

              <div className="mt-4 flex flex-wrap gap-3 items-center">
                <select className="rounded-2xl border p-3" value={docType} onChange={(e) => setDocType(e.target.value)}>
                  <option value="Citizenship">{t("household.documents.citizenship")}</option>
                  <option value="Birth Certificate">{t("household.documents.birth")}</option>
                  <option value="License">{t("household.documents.license")}</option>
                </select>

                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="rounded-2xl border p-3"
                  disabled={uploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    await handleUpload(file);
                    e.target.value = "";
                  }}
                />
              </div>

              <div className="mt-5 space-y-2">
                {documents.length === 0 ? (
                  <div className="text-black/60 font-semibold">{t("household.documents.none")}</div>
                ) : (
                  documents.map((d, i) => (
                    <div key={i} className="rounded-2xl border p-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-extrabold">{d.type}</div>
                        <a className="text-blue-700 underline break-all" href={d.url} target="_blank" rel="noreferrer">
                          {d.url}
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 3 && (
            <div className="rounded-3xl border p-5 bg-white space-y-5">
              <div className="font-extrabold text-lg">{t("household.review.title")}</div>
              <button
                onClick={submitForVerification}
                disabled={saving}
                className="rounded-2xl px-5 py-3 font-extrabold bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 transition disabled:opacity-50"
              >
                {saving ? "Submitting..." : t("household.review.submit")}
              </button>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={goBack}
            disabled={step === 0 || saving || uploading}
            className="rounded-2xl px-5 py-3 font-extrabold border disabled:opacity-50 hover:bg-black/5 transition"
          >
            {t("common.back")}
          </button>

          <button
            onClick={goNext}
            disabled={step === steps.length - 1 || saving || uploading}
            className="rounded-2xl px-5 py-3 font-extrabold bg-zinc-900 text-white hover:opacity-90 disabled:opacity-50 transition"
          >
            {t("common.next")}
          </button>
        </div>
      </div>
    </div>
  );
}
