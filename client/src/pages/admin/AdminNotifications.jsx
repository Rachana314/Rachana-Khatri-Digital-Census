import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { Link } from 'react-router-dom';

const BellIcon = ({ hasUnread }) => (
  <div className="relative inline-flex">
    <svg className="w-7 h-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
    {hasUnread && (
      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gray-800 rounded-full border-2 border-white" />
    )}
  </div>
);

const TypeIcon = ({ type }) => {
  if (type === 'add_newborn') return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
  if (type === 'delete_member') return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
    </svg>
  );
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
};

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('readNotifIds') || '[]')); }
    catch { return new Set(); }
  });
  const [filter, setFilter] = useState('all');

  const saveReadIds = (ids) => {
    localStorage.setItem('readNotifIds', JSON.stringify([...ids]));
  };

  const markAsRead = (id) => {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  };

  const markAllRead = () => {
    const next = new Set(notifications.map(n => n._id));
    setReadIds(next);
    saveReadIds(next);
  };

  const fetchNotifications = () => {
    apiFetch('/api/admin/notifications')
      .then(data => { setNotifications(data); setLoading(false); })
      .catch(err => { console.error("Fetch error:", err); setLoading(false); });
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleStatusUpdate = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this request?`)) return;
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

  const unreadCount = notifications.filter(n => !readIds.has(n._id)).length;
  const readCount = notifications.filter(n => readIds.has(n._id)).length;

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !readIds.has(n._id);
    if (filter === 'read') return readIds.has(n._id);
    return true;
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm font-medium">Loading notifications...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">

      {/*Header*/}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <BellIcon hasUnread={unreadCount > 0} />
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Notifications</h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">User Change Requests</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-lg transition duration-200"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: notifications.length },
          { label: "Unread", value: unreadCount },
          { label: "Read", value: readCount },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
            <p className="text-xs font-semibold text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {['all', 'unread', 'read'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 capitalize transition duration-150 -mb-px
              ${filter === tab
                ? 'border-gray-800 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            {tab}
            {tab === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 bg-gray-800 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-gray-200 rounded-2xl">
            <BellIcon hasUnread={false} />
            <p className="mt-3 text-gray-400 text-sm font-medium">
              No {filter !== 'all' ? filter : ''} notifications found.
            </p>
          </div>
        ) : (
          filtered.map((note) => {
            const isRead = readIds.has(note._id);
            const displayHHID = note.householdId?.householdId || "N/A";
            const typeLabel = note.type?.replace('_', ' ') || 'request';
            const isAddNewborn = note.type === 'add_newborn';
            const isDeleteMember = note.type === 'delete_member';

            return (
              <div
                key={note._id}
                onClick={() => markAsRead(note._id)}
                className={`relative p-5 bg-white rounded-2xl border transition duration-200 cursor-default
                  ${isRead ? 'border-gray-200' : 'border-gray-400'}`}
              >
                {/* Unread indicator */}
                {!isRead && (
                  <span className="absolute top-5 right-5 w-2 h-2 rounded-full bg-gray-800" />
                )}

                {/* Top Row */}
                <div className="flex items-start gap-3 mb-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center">
                    <TypeIcon type={note.type} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wide bg-gray-100 text-gray-600">
                        {typeLabel}
                      </span>
                      {!isRead && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-800 text-white">
                          New
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 mt-1 text-sm">
                      Household: <span className="font-mono">{displayHHID}</span>
                    </h3>
                    <p className="text-gray-400 text-xs font-medium mt-0.5">
                      {note.user?.name || "Unknown User"} · {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Note Box */}
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-4 text-sm text-gray-600">
                  <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide block mb-1">Note</span>
                  {note.note || "No note provided."}
                </div>

                {/* Newborn Data */}
                {isAddNewborn && note.newbornData && (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">New Member Info</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">
                      <p><span className="text-gray-400 text-xs block">Name</span>{note.newbornData.fullName}</p>
                      <p><span className="text-gray-400 text-xs block">Gender</span>{note.newbornData.gender}</p>
                      <p><span className="text-gray-400 text-xs block">DOB</span>{note.newbornData.dob}</p>
                      <p><span className="text-gray-400 text-xs block">Relation</span>{note.newbornData.relation}</p>
                    </div>
                  </div>
                )}

                {/* Delete Data */}
                {isDeleteMember && (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-4">
                    <p className="text-sm font-semibold text-gray-600">
                      Action: Remove Member at Index {note.memberIndex}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <Link
                    to={`/admin/households/${displayHHID}`}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 hover:border-gray-400 transition duration-200"
                  >
                    View Full Form
                  </Link>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStatusUpdate(note._id, 'approved'); }}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition duration-200"
                  >
                    Approve
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStatusUpdate(note._id, 'rejected'); }}
                    className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 hover:border-gray-400 transition duration-200"
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