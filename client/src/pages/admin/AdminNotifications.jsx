import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api'; 
import { Link } from 'react-router-dom'; 

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    apiFetch('/api/admin/notifications')
      .then(data => {
        setNotifications(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    if(!window.confirm(`Are you sure you want to ${status} this request?`)) return;
    try {
      await apiFetch(`/api/admin/requests/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      fetchNotifications(); 
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (loading) return <div className="p-10 text-center font-black text-zinc-400">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-black mb-8 text-zinc-900">User Change Requests</h2>
      
      <div className="space-y-6">
        {notifications.length === 0 ? (
          <div className="p-10 text-center border-2 border-dashed rounded-3xl text-zinc-400 font-bold">
            No notifications found.
          </div>
        ) : (
          notifications.map((note) => {
            // FIX: This ensures the link uses the HH-ID string (e.g. HH-177...)
            const displayHHID = note.householdId?.householdId || "N/A";

            return (
              <div key={note._id} className="p-6 bg-white border-2 border-orange-500 rounded-3xl shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-black uppercase">
                      {note.type?.replace('_', ' ')}
                    </span>
                    <h3 className="font-black text-xl mt-2 text-zinc-900">
                      Household: {displayHHID}
                    </h3>
                    <p className="text-zinc-500 text-sm font-bold">Requested by: {note.user?.name || "Unknown User"}</p>
                  </div>
                  <span className="text-zinc-400 font-bold text-sm">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 mb-6">
                  <p className="text-zinc-700 font-semibold mb-2">
                    <strong>User's Note:</strong> {note.note || "No note provided."}
                  </p>

                  {/* DISPLAY NEWBORN DATA */}
                  {note.type === 'add_newborn' && note.newbornData && (
                    <div className="mt-3 pt-3 border-t border-zinc-200">
                      <p className="text-xs font-black text-orange-600 mb-2 uppercase tracking-widest">New Member Info</p>
                      <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <p><strong>Name:</strong> {note.newbornData.fullName}</p>
                        <p><strong>Gender:</strong> {note.newbornData.gender}</p>
                        <p><strong>DOB:</strong> {note.newbornData.dob}</p>
                        <p><strong>Relation:</strong> {note.newbornData.relation}</p>
                      </div>
                    </div>
                  )}

                  {/* DISPLAY DELETE DATA */}
                  {note.type === 'delete_member' && (
                    <div className="mt-3 pt-3 border-t border-zinc-200">
                      <p className="text-sm font-black text-rose-600 uppercase">
                        Action: Remove Member at Index {note.memberIndex}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <Link 
                    to={`/admin/households/${displayHHID}`} 
                    className="bg-zinc-900 text-white px-6 py-3 rounded-2xl font-black hover:bg-zinc-800 transition"
                  >
                    View Full Form
                  </Link>
                  <button 
                    onClick={() => handleStatusUpdate(note._id, 'approved')} 
                    className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-emerald-700"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(note._id, 'rejected')} 
                    className="bg-rose-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-rose-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}