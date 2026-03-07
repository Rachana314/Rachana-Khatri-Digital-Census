import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import { uploadDoc } from "../../lib/upload";

export default function HouseholdNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const steps = useMemo(() => ["Household", "Members", "Photo", "Review"], []);
  const [step, setStep] = useState(0);

  const [householdId, setHouseholdId] = useState(null);
  const [status, setStatus] = useState("draft");

  // Main household information
  const [household, setHousehold] = useState({ ward: "", address: "" });

  // Household members list
  const [members, setMembers] = useState([]);

  // Draft state for one member before adding to members list
  // Added more demographic fields for analytics use in admin dashboard
  const [memberDraft, setMemberDraft] = useState({
    name: "",
    age: "",
    gender: "Male",
    maritalStatus: "Single",
    education: "",
    occupation: "",
    disability: false,
    disabilityDetail: "",
  });

  // Uploaded documents
  const [documents, setDocuments] = useState([]);

  const [loadingEdit, setLoadingEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Verified data cannot be edited
  const canEdit = status !== "verified";

  useEffect(() => {
    if (!editId) return;

    const load = async () => {
      try {
        setLoadingEdit(true);
        setError("");

        const data = await apiFetch(`/api/households/${editId}`);

        setHouseholdId(data.householdId);
        setStatus(data.status || "draft");
        setHousehold({
          ward: data.ward || "",
          address: data.address || "",
        });
        setMembers(Array.isArray(data.members) ? data.members : []);
        setDocuments(Array.isArray(data.documents) ? data.documents : []);

        if ((data.status || "").toLowerCase() === "verified") {
          navigate(`/user/household/${editId}`, { replace: true });
        }
      } catch (e) {
        setError(e.message || "Failed to load household");
      } finally {
        setLoadingEdit(false);
      }
    };

    load();
  }, [editId, navigate]);

  const hasPhoto =
    Array.isArray(documents) && documents.some((doc) => doc?.type === "Photo");

  const validateStep = (s) => {
    if (s === 0) {
      if (!household.ward.trim()) throw new Error("Ward is required.");
      if (!household.address.trim()) throw new Error("Address is required.");
    }

    if (s === 1) {
      if (members.length === 0) throw new Error("Add at least one member.");

      for (let i = 0; i < members.length; i++) {
        if (!String(members[i]?.name || "").trim()) {
          throw new Error(`Member ${i + 1}: Name is required.`);
        }
      }
    }

    if (s === 2) {
      if (!hasPhoto) throw new Error("Upload at least one photo.");
    }
  };

  // Save current form as draft
  const saveDraft = async () => {
    if (!canEdit) throw new Error("This record is verified. You cannot edit.");

    const payload = {
      ward: household.ward.trim(),
      address: household.address.trim(),
      members,
      documents,
    };

    if (!payload.ward || !payload.address) {
      throw new Error("Ward and address are required.");
    }

    if (!householdId) {
      const created = await apiFetch("/api/households", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setHouseholdId(created.householdId);
      setStatus(created.status || "draft");
      return created.householdId;
    }

    const updated = await apiFetch(`/api/households/${householdId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    setStatus(updated.status || status);
    return householdId;
  };

  const next = async () => {
    if (saving || uploading) return;
    setError("");

    try {
      validateStep(step);
      setSaving(true);

      if (step < steps.length - 1) {
        await saveDraft();
      }

      setStep((x) => Math.min(x + 1, steps.length - 1));
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const back = () => setStep((x) => Math.max(x - 1, 0));

  // Add member to members list
  // Includes demographic fields needed for analytics charts later
  const addMember = () => {
    if (!canEdit) return;
    setError("");

    const name = memberDraft.name.trim();
    if (!name) {
      setError("Member name is required.");
      return;
    }

    const age = memberDraft.age === "" ? null : Number(memberDraft.age);

    setMembers((prev) => [
      ...prev,
      {
        name,
        age,
        gender: memberDraft.gender || "Male",
        maritalStatus: memberDraft.maritalStatus || "Single",
        education: memberDraft.education.trim(),
        occupation: memberDraft.occupation.trim(),
        disability: !!memberDraft.disability,
        disabilityDetail: memberDraft.disability
          ? memberDraft.disabilityDetail.trim()
          : "",
      },
    ]);

    // Reset member draft after adding
    setMemberDraft({
      name: "",
      age: "",
      gender: "Male",
      maritalStatus: "Single",
      education: "",
      occupation: "",
      disability: false,
      disabilityDetail: "",
    });
  };

  const removeMember = (idx) => {
    if (!canEdit) return;
    setMembers((prev) => prev.filter((_, i) => i !== idx));
  };

  // Upload household photo
  const uploadPhoto = async (file) => {
    if (!canEdit || !file) return;

    setUploading(true);
    setError("");

    try {
      let id = householdId;

      if (!id) {
        id = await saveDraft();
      }

      const res = await uploadDoc(id, "Photo", file);
      const nextDocs = res?.item?.documents;

      if (!Array.isArray(nextDocs)) {
        throw new Error("Upload did not return documents.");
      }

      setDocuments(nextDocs);
    } catch (e) {
      setError(e.message || "Photo upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Submit final household form
  const submit = async () => {
    if (!canEdit || saving || uploading) return;

    setSaving(true);
    setError("");

    try {
      validateStep(0);
      validateStep(1);
      validateStep(2);

      const id = householdId || (await saveDraft());

      await apiFetch(`/api/households/${id}/submit`, {
        method: "POST",
      });

      navigate("/user/forms");
    } catch (e) {
      setError(e.message || "Submit failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            {editId ? "Edit household" : "Household form"}
          </h1>
          <p className="text-black/60 font-medium mt-1">
            {editId ? `Editing: ${editId} (status: ${status})` : ""}
          </p>
        </div>

        <Link
          to="/user/forms"
          className="rounded-2xl px-4 py-2 font-bold border hover:bg-black/5 transition"
        >
          Back
        </Link>
      </div>

      {loadingEdit && (
        <div className="p-6 bg-white border rounded-3xl font-bold text-black/60">
          Loading...
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
          <div className="text-amber-700/80 mt-1">This record is locked.</div>
          <Link
            to={`/user/household/${householdId || editId}`}
            className="inline-block mt-3 rounded-2xl px-4 py-2 font-extrabold bg-zinc-900 text-white"
          >
            Open household view
          </Link>
        </div>
      )}

      <div className="rounded-3xl bg-white border shadow-sm p-5">
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
          {step === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-extrabold">Ward</label>
                <input
                  disabled={!canEdit}
                  className="mt-2 w-full rounded-2xl border p-3 disabled:bg-zinc-100"
                  value={household.ward}
                  onChange={(e) =>
                    setHousehold({ ...household, ward: e.target.value })
                  }
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-extrabold">Address</label>
                <input
                  disabled={!canEdit}
                  className="mt-2 w-full rounded-2xl border p-3 disabled:bg-zinc-100"
                  value={household.address}
                  onChange={(e) =>
                    setHousehold({ ...household, address: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              {/* Expanded member fields for analytics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <input
                  disabled={!canEdit}
                  className="rounded-2xl border p-3 disabled:bg-zinc-100"
                  placeholder="Name"
                  value={memberDraft.name}
                  onChange={(e) =>
                    setMemberDraft({ ...memberDraft, name: e.target.value })
                  }
                />

                <input
                  disabled={!canEdit}
                  type="number"
                  className="rounded-2xl border p-3 disabled:bg-zinc-100"
                  placeholder="Age"
                  value={memberDraft.age}
                  onChange={(e) =>
                    setMemberDraft({ ...memberDraft, age: e.target.value })
                  }
                />

                <select
                  disabled={!canEdit}
                  className="rounded-2xl border p-3 disabled:bg-zinc-100"
                  value={memberDraft.gender}
                  onChange={(e) =>
                    setMemberDraft({ ...memberDraft, gender: e.target.value })
                  }
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>

                <select
                  disabled={!canEdit}
                  className="rounded-2xl border p-3 disabled:bg-zinc-100"
                  value={memberDraft.maritalStatus}
                  onChange={(e) =>
                    setMemberDraft({
                      ...memberDraft,
                      maritalStatus: e.target.value,
                    })
                  }
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Divorced">Divorced</option>
                </select>

                <input
                  disabled={!canEdit}
                  className="rounded-2xl border p-3 disabled:bg-zinc-100"
                  placeholder="Education"
                  value={memberDraft.education}
                  onChange={(e) =>
                    setMemberDraft({
                      ...memberDraft,
                      education: e.target.value,
                    })
                  }
                />

                <input
                  disabled={!canEdit}
                  className="rounded-2xl border p-3 disabled:bg-zinc-100"
                  placeholder="Occupation"
                  value={memberDraft.occupation}
                  onChange={(e) =>
                    setMemberDraft({
                      ...memberDraft,
                      occupation: e.target.value,
                    })
                  }
                />

                <label className="flex items-center gap-2 rounded-2xl border p-3">
                  <input
                    disabled={!canEdit}
                    type="checkbox"
                    checked={memberDraft.disability}
                    onChange={(e) =>
                      setMemberDraft({
                        ...memberDraft,
                        disability: e.target.checked,
                      })
                    }
                  />
                  Disability
                </label>

                {memberDraft.disability && (
                  <input
                    disabled={!canEdit}
                    className="rounded-2xl border p-3 sm:col-span-2"
                    placeholder="Disability Detail"
                    value={memberDraft.disabilityDetail}
                    onChange={(e) =>
                      setMemberDraft({
                        ...memberDraft,
                        disabilityDetail: e.target.value,
                      })
                    }
                  />
                )}
              </div>

              <button
                disabled={!canEdit}
                onClick={addMember}
                className="rounded-2xl px-5 py-3 font-extrabold bg-zinc-900 text-white disabled:opacity-50"
              >
                Add member
              </button>

              <div className="space-y-2">
                {members.map((m, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border p-3 flex justify-between gap-3"
                  >
                    <div className="font-semibold">
                      {m.name} {m.age ? `(${m.age})` : ""} — {m.gender}

                      <div className="text-sm text-black/60 mt-1">
                        Marital: {m.maritalStatus || "-"} | Education:{" "}
                        {m.education || "-"} | Occupation: {m.occupation || "-"}
                      </div>

                      <div className="text-sm text-black/60">
                        Disability:{" "}
                        {m.disability
                          ? `Yes${
                              m.disabilityDetail
                                ? ` (${m.disabilityDetail})`
                                : ""
                            }`
                          : "No"}
                      </div>
                    </div>

                    <button
                      disabled={!canEdit}
                      onClick={() => removeMember(i)}
                      className="font-extrabold text-rose-600 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-2xl border p-4">
                <div className="font-extrabold mb-2">Upload photo</div>
                <input
                  disabled={!canEdit}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => uploadPhoto(e.target.files?.[0])}
                />
                {uploading && (
                  <div className="mt-2 text-sm font-bold text-black/60">
                    Uploading...
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {documents.length > 0 ? (
                  documents.map((d, i) => (
                    <div key={i} className="rounded-2xl border p-3 text-sm">
                      <div className="font-bold">{d.type || "Document"}</div>
                      <div>{d.originalName || d.url}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-black/60 font-semibold">
                    No photo uploaded yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-2xl border p-4">
                <div className="font-extrabold mb-2">Household</div>
                <div>Ward: {household.ward}</div>
                <div>Address: {household.address}</div>
              </div>

              <div className="rounded-2xl border p-4">
                <div className="font-extrabold mb-2">Members</div>
                {members.map((m, i) => (
                  <div key={i} className="text-sm mb-2">
                    <div>
                      {i + 1}. {m.name} {m.age ? `(${m.age})` : ""} — {m.gender}
                    </div>
                    <div className="text-black/60">
                      Marital: {m.maritalStatus || "-"} | Education:{" "}
                      {m.education || "-"} | Occupation: {m.occupation || "-"}
                    </div>
                    <div className="text-black/60">
                      Disability:{" "}
                      {m.disability
                        ? `Yes${
                            m.disabilityDetail ? ` (${m.disabilityDetail})` : ""
                          }`
                        : "No"}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border p-4">
                <div className="font-extrabold mb-2">Photos</div>
                {documents.map((d, i) => (
                  <div key={i} className="text-sm">
                    {i + 1}. {d.type} — {d.originalName || d.url}
                  </div>
                ))}
              </div>

              <button
                disabled={!canEdit || saving || uploading}
                onClick={submit}
                className="rounded-2xl px-5 py-3 font-extrabold bg-emerald-600 text-white disabled:opacity-50"
              >
                {saving ? "Submitting..." : "Submit for verification"}
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={back}
            disabled={step === 0 || saving || uploading}
            className="rounded-2xl px-5 py-3 font-extrabold border disabled:opacity-50 hover:bg-black/5 transition"
          >
            Back
          </button>

          <button
            onClick={next}
            disabled={step === steps.length - 1 || saving || uploading || !canEdit}
            className="rounded-2xl px-5 py-3 font-extrabold bg-zinc-900 text-white hover:opacity-90 disabled:opacity-50 transition"
          >
            {saving ? "Saving..." : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}