import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../lib/api";
import { uploadDoc } from "../../lib/upload";

export default function HouseholdNew() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

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
  const [status, setStatus] = useState("draft");

  // ✅ citizenshipNo added here
  const [household, setHousehold] = useState({
    ward: "",
    address: "",
    citizenshipNo: "",
  });

  const [members, setMembers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [docType, setDocType] = useState("Citizenship");

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);

  // ✅ can edit until admin verifies
  const canEdit = status !== "verified";

  // load existing data if user is editing
  useEffect(() => {
    const loadEdit = async () => {
      if (!editId) return;

      try {
        setError("");
        setLoadingEdit(true);

        const data = await apiFetch(`/api/households/${editId}`);

        setHouseholdId(data.householdId);
        setStatus(data.status || "draft");

        setHousehold({
          ward: data.ward || "",
          address: data.address || "",
          citizenshipNo: data.citizenshipNo || "",
        });

        setMembers(Array.isArray(data.members) ? data.members : []);
        setDocuments(Array.isArray(data.documents) ? data.documents : []);

        // if already verified, user should not edit
        if (data.status === "verified") {
          navigate(`/user/household/${editId}`, { replace: true });
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoadingEdit(false);
      }
    };

    loadEdit();
    // eslint-disable-next-line
  }, [editId]);

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const saveDraft = async () => {
    if (!canEdit) throw new Error("This household is verified. You cannot edit.");

    setSaving(true);
    setError("");

    try {
      // ✅ citizenshipNo is required now
      const payload = {
        ward: household.ward,
        address: household.address,
        citizenshipNo: household.citizenshipNo,
        members,
        documents,
      };

      // simple validation
      if (!payload.ward || !payload.address || !payload.citizenshipNo) {
        throw new Error("Ward, address and citizenship number are required.");
      }

      // create
      if (!householdId) {
        const created = await apiFetch("/api/households", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setHouseholdId(created.householdId);
        setStatus(created.status || "draft");
        return created.householdId;
      }

      // update
      const updated = await apiFetch(`/api/households/${householdId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setStatus(updated.status || status);
      return householdId;
    } catch (e) {
      throw new Error(e.message || "Could not save draft.");
    } finally {
      setSaving(false);
    }
  };

  const goNext = async () => {
    setError("");
    try {
      // autosave when moving forward
      if (step < 3) await saveDraft();
      setStep((s) => Math.min(s + 1, steps.length - 1));
    } catch (e) {
      setError(e.message);
    }
  };

  const handleUpload = async (file) => {
    if (!canEdit) return;

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
    if (!canEdit) return;

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
      {/* page header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            {editId ? "Edit household" : t("household.title")}
          </h1>
          <p className="text-black/60 font-medium mt-1">
            {editId
              ? `Editing: ${editId} (status: ${status})`
              : t("household.subtitle")}
          </p>
        </div>

        <Link
          to="/user/forms"
          className="rounded-2xl px-4 py-2 font-bold border hover:bg-black/5 transition"
        >
          {t("household.backToForms")}
        </Link>
      </div>

      {loadingEdit && (
        <div className="p-6 bg-white border rounded-3xl font-bold text-black/60">
          Loading household...
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5">
          <div className="font-extrabold text-rose-700">Error</div>
          <div className="text-rose-700/80 mt-1">{error}</div>
        </div>
      )}

      {!canEdit && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
          <div className="font-extrabold text-amber-700">Verified</div>
          <div className="text-amber-700/80 mt-1">
            This household is verified. You cannot edit now.
          </div>
          <Link
            to={`/user/household/${householdId || editId}`}
            className="inline-block mt-3 rounded-2xl px-4 py-2 font-extrabold bg-zinc-900 text-white"
          >
            Open household view
          </Link>
        </div>
      )}

      <div className="rounded-3xl bg-white border shadow-sm p-5">
        {/* steps */}
        <div className="flex flex-wrap gap-2">
          {steps.map((label, idx) => (
            <div
              key={idx}
              className={`rounded-2xl px-4 py-2 text-sm font-extrabold border ${
                idx === step
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-zinc-50 text-black/60"
              }`}
            >
              {idx + 1}. {label}
            </div>
          ))}
        </div>

        <div className="mt-6">
          {/* STEP 1 */}
          {step === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-extrabold">Citizenship No</label>

                {/* Good practice: don't allow changing citizenship no in edit mode */}
                <input
                  disabled={!canEdit || !!editId}
                  className="mt-2 w-full rounded-2xl border p-3 disabled:bg-zinc-100"
                  value={household.citizenshipNo}
                  onChange={(e) =>
                    setHousehold({ ...household, citizenshipNo: e.target.value })
                  }
                  placeholder="e.g. 12-01-99999"
                />

                {editId && (
                  <div className="text-xs text-black/50 font-semibold mt-2">
                    Citizenship number is fixed after first save.
                  </div>
                )}
              </div>

              <div>
                <label className="font-extrabold">{t("household.info.ward")}</label>
                <input
                  disabled={!canEdit}
                  className="mt-2 w-full rounded-2xl border p-3 disabled:bg-zinc-100"
                  value={household.ward}
                  onChange={(e) =>
                    setHousehold({ ...household, ward: e.target.value })
                  }
                  placeholder={t("household.info.wardPh")}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-extrabold">{t("household.info.address")}</label>
                <input
                  disabled={!canEdit}
                  className="mt-2 w-full rounded-2xl border p-3 disabled:bg-zinc-100"
                  value={household.address}
                  onChange={(e) =>
                    setHousehold({ ...household, address: e.target.value })
                  }
                  placeholder={t("household.info.addressPh")}
                />
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 1 && (
            <div className="space-y-4">
              <button
                disabled={!canEdit}
                onClick={() =>
                  setMembers((prev) => [
                    ...prev,
                    {
                      name: "",
                      age: "",
                      gender: "Male",
                      maritalStatus: "Single",
                      education: "",
                      occupation: "",
                      disability: false,
                      disabilityDetail: "",
                    },
                  ])
                }
                className="rounded-2xl px-5 py-3 font-extrabold bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 transition disabled:opacity-50"
              >
                + {t("household.members.add")}
              </button>

              {members.length === 0 && (
                <div className="text-black/60 font-semibold">
                  Add at least one member to continue.
                </div>
              )}

              {members.map((m, idx) => (
                <div key={idx} className="rounded-3xl border p-5 bg-white space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="font-extrabold">
                      {t("household.members.member", { n: idx + 1 })}
                    </div>
                    <button
                      disabled={!canEdit}
                      onClick={() => setMembers((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-rose-600 font-extrabold hover:underline disabled:opacity-50"
                    >
                      {t("common.remove")}
                    </button>
                  </div>

                  {/* Name + Age */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-extrabold text-sm">Full Name</label>
                      <input
                        disabled={!canEdit}
                        className="mt-2 rounded-2xl border p-3 w-full disabled:bg-zinc-100"
                        value={m.name}
                        onChange={(e) => {
                          const copy = [...members];
                          copy[idx].name = e.target.value;
                          setMembers(copy);
                        }}
                        placeholder="Full name"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-sm">Age</label>
                      <input
                        disabled={!canEdit}
                        type="number"
                        className="mt-2 rounded-2xl border p-3 w-full disabled:bg-zinc-100"
                        value={m.age}
                        onChange={(e) => {
                          const copy = [...members];
                          copy[idx].age = e.target.value;
                          setMembers(copy);
                        }}
                        placeholder="Age"
                      />
                    </div>
                  </div>

                  {/* Gender + Marital */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-extrabold text-sm">Gender</label>
                      <select
                        disabled={!canEdit}
                        className="mt-2 rounded-2xl border p-3 w-full disabled:bg-zinc-100"
                        value={m.gender || "Male"}
                        onChange={(e) => {
                          const copy = [...members];
                          copy[idx].gender = e.target.value;
                          setMembers(copy);
                        }}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-extrabold text-sm">Marital Status</label>
                      <select
                        disabled={!canEdit}
                        className="mt-2 rounded-2xl border p-3 w-full disabled:bg-zinc-100"
                        value={m.maritalStatus || "Single"}
                        onChange={(e) => {
                          const copy = [...members];
                          copy[idx].maritalStatus = e.target.value;
                          setMembers(copy);
                        }}
                      >
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                  </div>

                  {/* Education + Occupation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-extrabold text-sm">Education</label>
                      <input
                        disabled={!canEdit}
                        className="mt-2 rounded-2xl border p-3 w-full disabled:bg-zinc-100"
                        value={m.education || ""}
                        onChange={(e) => {
                          const copy = [...members];
                          copy[idx].education = e.target.value;
                          setMembers(copy);
                        }}
                        placeholder="e.g. SEE, +2, Bachelor"
                      />
                    </div>

                    <div>
                      <label className="font-extrabold text-sm">Occupation</label>
                      <input
                        disabled={!canEdit}
                        className="mt-2 rounded-2xl border p-3 w-full disabled:bg-zinc-100"
                        value={m.occupation || ""}
                        onChange={(e) => {
                          const copy = [...members];
                          copy[idx].occupation = e.target.value;
                          setMembers(copy);
                        }}
                        placeholder="e.g. Student, Teacher, Farmer"
                      />
                    </div>
                  </div>

                  {/* Disability */}
                  <div className="rounded-2xl border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-extrabold">Disability</div>
                        <div className="text-black/60 text-sm font-medium">
                          Tick if the member has a disability.
                        </div>
                      </div>

                      <input
                        disabled={!canEdit}
                        type="checkbox"
                        className="h-5 w-5"
                        checked={!!m.disability}
                        onChange={(e) => {
                          const copy = [...members];
                          copy[idx].disability = e.target.checked;
                          if (!e.target.checked) copy[idx].disabilityDetail = "";
                          setMembers(copy);
                        }}
                      />
                    </div>

                    {m.disability && (
                      <div className="mt-3">
                        <label className="font-extrabold text-sm">Disability Details</label>
                        <input
                          disabled={!canEdit}
                          className="mt-2 rounded-2xl border p-3 w-full disabled:bg-zinc-100"
                          value={m.disabilityDetail || ""}
                          onChange={(e) => {
                            const copy = [...members];
                            copy[idx].disabilityDetail = e.target.value;
                            setMembers(copy);
                          }}
                          placeholder="Describe disability"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 3 (same as your code) */}
          {step === 2 && (
            <div className="rounded-3xl border p-5 bg-white">
              <div className="font-extrabold text-lg">{t("household.documents.title")}</div>
              <div className="text-black/60 font-medium mt-1">{t("household.documents.subtitle")}</div>

              <div className="mt-4 flex flex-wrap gap-3 items-center">
                <select
                  disabled={!canEdit}
                  className="rounded-2xl border p-3 disabled:bg-zinc-100"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                >
                  <option value="Citizenship">{t("household.documents.citizenship")}</option>
                  <option value="Birth Certificate">{t("household.documents.birth")}</option>
                  <option value="License">{t("household.documents.license")}</option>
                </select>

                <input
                  disabled={!canEdit || uploading}
                  type="file"
                  accept="image/*,application/pdf"
                  className="rounded-2xl border p-3 disabled:bg-zinc-100"
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

          {/* STEP 4 */}
          {step === 3 && (
            <div className="rounded-3xl border p-5 bg-white space-y-5">
              <div className="font-extrabold text-lg">{t("household.review.title")}</div>
              <button
                onClick={submitForVerification}
                disabled={saving || uploading || !canEdit}
                className="rounded-2xl px-5 py-3 font-extrabold bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 transition disabled:opacity-50"
              >
                {saving ? "Submitting..." : t("household.review.submit")}
              </button>
            </div>
          )}
        </div>

        {/* bottom buttons */}
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
            disabled={step === steps.length - 1 || saving || uploading || !canEdit}
            className="rounded-2xl px-5 py-3 font-extrabold bg-zinc-900 text-white hover:opacity-90 disabled:opacity-50 transition"
          >
            {t("common.next")}
          </button>
        </div>
      </div>
    </div>
  );
}