import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import { uploadDoc } from "../../lib/upload";

export default function HouseholdNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  // Removed "Photo" as a separate step
  const steps = useMemo(() => ["Household", "Members", "Review"], []);
  const [step, setStep] = useState(0);

  const [householdId, setHouseholdId] = useState(null);
  const [status, setStatus] = useState("draft");

  const [household, setHousehold] = useState({ ward: "", address: "" });
  const [members, setMembers] = useState([]);

  // Added photoFile to the member draft state
  const [memberDraft, setMemberDraft] = useState({
    name: "",
    age: "",
    gender: "Male",
    maritalStatus: "Single",
    education: "",
    occupation: "",
    disability: false,
    disabilityDetail: "",
    photoFile: null, 
  });

  const [documents, setDocuments] = useState([]);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const canEdit = status !== "verified";

  useEffect(() => {
    if (!editId) return;
    const load = async () => {
      try {
        setLoadingEdit(true);
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

  const validateStep = (s) => {
    if (s === 0) {
      if (!household.ward.trim()) throw new Error("Ward is required.");
      if (!household.address.trim()) throw new Error("Address is required.");
    }
    if (s === 1) {
      if (members.length === 0) throw new Error("Add at least one member.");
    }
  };

  const saveDraft = async () => {
    if (!canEdit) throw new Error("This record is verified. You cannot edit.");
    const payload = {
      ward: household.ward.trim(),
      address: household.address.trim(),
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
    }

    await apiFetch(`/api/households/${householdId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return householdId;
  };

  const addMember = async () => {
    if (!canEdit) return;
    setError("");

    if (!memberDraft.name.trim()) {
      setError("Member name is required.");
      return;
    }

    setSaving(true);
    try {
      let currentId = householdId;
      if (!currentId) {
        currentId = await saveDraft();
      }

      let uploadedPhotoUrl = "";
      if (memberDraft.photoFile) {
        const res = await uploadDoc(currentId, "MemberPhoto", memberDraft.photoFile);
        // Assuming your backend returns the newly added document in the list
        uploadedPhotoUrl = res?.item?.documents?.at(-1)?.url || "";
      }

      const newMember = {
        name: memberDraft.name.trim(),
        age: memberDraft.age === "" ? null : Number(memberDraft.age),
        gender: memberDraft.gender,
        maritalStatus: memberDraft.maritalStatus,
        education: memberDraft.education.trim(),
        occupation: memberDraft.occupation.trim(),
        disability: !!memberDraft.disability,
        disabilityDetail: memberDraft.disability ? memberDraft.disabilityDetail.trim() : "",
        photo: uploadedPhotoUrl, 
      };

      setMembers((prev) => [...prev, newMember]);
      
      // Reset draft
      setMemberDraft({
        name: "", age: "", gender: "Male", maritalStatus: "Single",
        education: "", occupation: "", disability: false, disabilityDetail: "",
        photoFile: null
      });
    } catch (e) {
      setError(e.message || "Failed to add member");
    } finally {
      setSaving(false);
    }
  };

  const removeMember = (idx) => {
    if (!canEdit) return;
    setMembers((prev) => prev.filter((_, i) => i !== idx));
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

  const submit = async () => {
    if (!canEdit || saving) return;
    setSaving(true);
    try {
      validateStep(0);
      validateStep(1);
      const id = householdId || (await saveDraft());
      await apiFetch(`/api/households/${id}/submit`, { method: "POST" });
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
          <h1 className="text-2xl sm:text-3xl font-extrabold">{editId ? "Edit household" : "Household form"}</h1>
          <p className="text-black/60 font-medium mt-1">{editId ? `Editing: ${editId}` : ""}</p>
        </div>
        <Link to="/user/forms" className="rounded-2xl px-4 py-2 font-bold border hover:bg-black/5 transition">Back</Link>
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5">
          <div className="font-extrabold text-rose-700">Error</div>
          <div className="text-rose-700/80 mt-1">{error}</div>
        </div>
      )}

      <div className="rounded-3xl bg-white border shadow-sm p-5">
        <div className="flex flex-wrap gap-2">
          {steps.map((label, idx) => (
            <div key={idx} className={`rounded-2xl px-4 py-2 text-sm font-extrabold border ${idx === step ? "bg-zinc-900 text-white border-zinc-900" : "bg-zinc-50 text-black/60"}`}>
              {idx + 1}. {label}
            </div>
          ))}
        </div>

        <div className="mt-6">
          {step === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-extrabold text-sm">Ward</label>
                <input disabled={!canEdit} className="mt-2 w-full rounded-2xl border p-3" value={household.ward} onChange={(e) => setHousehold({ ...household, ward: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="font-extrabold text-sm">Address</label>
                <input disabled={!canEdit} className="mt-2 w-full rounded-2xl border p-3" value={household.address} onChange={(e) => setHousehold({ ...household, address: e.target.value })} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <input disabled={!canEdit} className="rounded-2xl border p-3" placeholder="Full Name" value={memberDraft.name} onChange={(e) => setMemberDraft({ ...memberDraft, name: e.target.value })} />
                <input disabled={!canEdit} type="number" className="rounded-2xl border p-3" placeholder="Age" value={memberDraft.age} onChange={(e) => setMemberDraft({ ...memberDraft, age: e.target.value })} />
                <select disabled={!canEdit} className="rounded-2xl border p-3" value={memberDraft.gender} onChange={(e) => setMemberDraft({ ...memberDraft, gender: e.target.value })}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                
                {/* Photo Input Integration */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold uppercase ml-2 mb-1 text-black/40">Member Photo</label>
                  <input 
                    disabled={!canEdit} 
                    type="file" 
                    accept="image/*" 
                    className="text-xs border rounded-2xl p-2"
                    onChange={(e) => setMemberDraft({...memberDraft, photoFile: e.target.files?.[0]})}
                  />
                </div>

                <input disabled={!canEdit} className="rounded-2xl border p-3" placeholder="Education" value={memberDraft.education} onChange={(e) => setMemberDraft({ ...memberDraft, education: e.target.value })} />
                <input disabled={!canEdit} className="rounded-2xl border p-3" placeholder="Occupation" value={memberDraft.occupation} onChange={(e) => setMemberDraft({ ...memberDraft, occupation: e.target.value })} />
                
                <label className="flex items-center gap-2 rounded-2xl border p-3">
                  <input type="checkbox" checked={memberDraft.disability} onChange={(e) => setMemberDraft({ ...memberDraft, disability: e.target.checked })} />
                  Disability
                </label>
              </div>

              <button disabled={!canEdit || saving} onClick={addMember} className="rounded-2xl px-6 py-3 font-extrabold bg-zinc-900 text-white disabled:opacity-50">
                {saving ? "Processing..." : "Add Member"}
              </button>

              <div className="grid grid-cols-1 gap-2">
                {members.map((m, i) => (
                  <div key={i} className="rounded-2xl border p-3 flex items-center justify-between bg-zinc-50/50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-zinc-200 overflow-hidden border">
                        {m.photo ? <img src={m.photo} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-[8px]">NO PIC</div>}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{m.name} ({m.age})</div>
                        <div className="text-[10px] text-black/50">{m.gender} • {m.occupation}</div>
                      </div>
                    </div>
                    <button onClick={() => removeMember(i)} className="text-rose-600 font-bold text-xs p-2">Remove</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-2xl border p-4 bg-zinc-50">
                <div className="font-extrabold mb-2 uppercase text-xs text-black/40 tracking-widest">Review Summary</div>
                <div className="text-sm">Ward: {household.ward} | Address: {household.address}</div>
                <div className="mt-4 font-bold text-sm">Members ({members.length}):</div>
                <div className="mt-2 space-y-1">
                  {members.map((m, i) => (
                    <div key={i} className="text-xs flex items-center gap-2">
                      {i + 1}. {m.name} — {m.photo ? "✅ Photo Uploaded" : "❌ No Photo"}
                    </div>
                  ))}
                </div>
              </div>
              <button disabled={!canEdit || saving} onClick={submit} className="w-full sm:w-auto rounded-2xl px-8 py-4 font-extrabold bg-emerald-600 text-white">
                {saving ? "Submitting..." : "Submit for verification"}
              </button>
            </div>
          )}
        </div>

        <div className="mt-10 flex items-center justify-between border-t pt-6">
          <button onClick={back} disabled={step === 0 || saving} className="rounded-2xl px-5 py-3 font-extrabold border disabled:opacity-30">Back</button>
          <button onClick={next} disabled={step === steps.length - 1 || !canEdit || saving} className="rounded-2xl px-5 py-3 font-extrabold bg-zinc-900 text-white disabled:opacity-30">
            {saving ? "Saving..." : "Next Step"}
          </button>
        </div>
      </div>
    </div>
  );
}