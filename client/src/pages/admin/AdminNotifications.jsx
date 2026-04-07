import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api'; 
import { Link } from 'react-router-dom'; 

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/admin/notifications')
      .then(data => {
        setNotifications(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center font-black text-zinc-400">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-black mb-8 text-zinc-900">User Change Requests</h2>
      
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="p-10 text-center border-2 border-dashed rounded-3xl text-zinc-400 font-bold">
            No notifications found.
          </div>
        ) : (
          notifications.map((note) => {
            // FIX: Use householdId if available, otherwise fallback to the user ID 
            // to prevent the /undefined error in the URL.
            const targetId = note.householdId || note.user;
            
            return (
              <div key={note._id} className="p-6 bg-white border-2 border-orange-500 rounded-3xl shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-black uppercase">
                      {note.type}
                    </span>
                    <h3 className="font-black text-xl mt-2 text-zinc-900">{note.title}</h3>
                  </div>
                  <span className="text-zinc-400 font-bold text-sm">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-zinc-600 mt-3 font-semibold">
                  {note.msg}
                </p>
                
                <div className="mt-6">
                  {targetId ? (
                    <Link 
                      to={`/admin/households/${targetId}`} 
                      className="inline-block bg-zinc-900 text-white px-8 py-3 rounded-2xl font-black hover:bg-zinc-800 transition"
                    >
                      Go to Household
                    </Link>
                  ) : (
                    <div className="text-rose-600 font-black text-sm bg-rose-50 p-3 rounded-xl inline-block border border-rose-200">
                      ID missing in record
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}