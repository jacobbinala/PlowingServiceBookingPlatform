import { useState } from "react";

const initialProperties = [
  {
    id: 1,
    nickname: "Main House",
    address: "142 Elmwood Drive",
    city: "London",
    province: "ON",
    postalCode: "N6A 1B2",
    notes: "Side gate is locked — use front driveway only.",
  },
  {
    id: 2,
    nickname: "Rental Unit",
    address: "88 Ridgeway Ave",
    city: "London",
    province: "ON",
    postalCode: "N5W 3M4",
    notes: "Tenant: Sarah. Call before arrival.",
  },
];

const emptyForm = {
  nickname: "",
  address: "",
  city: "",
  province: "ON",
  postalCode: "",
  notes: "",
};

export default function PropertyManagerProfile() {
  const [properties, setProperties] = useState(initialProperties);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!form.nickname || !form.address || !form.city || !form.postalCode) return;
    if (editingId !== null) {
      setProperties(properties.map((p) => (p.id === editingId ? { ...form, id: editingId } : p)));
      setEditingId(null);
    } else {
      setProperties([...properties, { ...form, id: Date.now() }]);
    }
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleEdit = (property) => {
    setForm({ ...property });
    setEditingId(property.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setProperties(properties.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-mono p-6">
      {/* Header */}
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.3em] text-cyan-400 uppercase mb-1">Property Manager</p>
            <h1 className="text-3xl font-bold tracking-tight text-white">My Properties</h1>
            <p className="text-slate-400 text-sm mt-1">{properties.length} location{properties.length !== 1 ? "s" : ""} saved</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm px-4 py-2.5 rounded-lg transition-colors"
          >
            <span className="text-lg leading-none">+</span> Add Property
          </button>
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div className="mb-6 border border-cyan-500/30 bg-slate-900 rounded-xl p-6">
            <h2 className="text-sm tracking-widest text-cyan-400 uppercase mb-5">
              {editingId ? "Edit Property" : "New Property"}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Nickname</label>
                <input
                  name="nickname"
                  value={form.nickname}
                  onChange={handleChange}
                  placeholder="e.g. Main House, Rental Unit"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Street Address</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="123 Main St"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">City</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="London"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Postal Code</label>
                <input
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  placeholder="N6A 1B2"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Province</label>
                <select
                  name="province"
                  value={form.province}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                >
                  {["AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Special Notes <span className="normal-case text-slate-600">(optional)</span></label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Gate codes, crew instructions, access info..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder:text-slate-600 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSubmit}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm px-6 py-2.5 rounded-lg transition-colors"
              >
                {editingId ? "Save Changes" : "Add Property"}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}
                className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-6 py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Property Cards */}
        <div className="space-y-4">
          {properties.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <p className="text-4xl mb-3">🏠</p>
              <p className="text-sm">No properties saved yet. Add one above.</p>
            </div>
          )}
          {properties.map((prop) => (
            <div key={prop.id} className="border border-slate-800 bg-slate-900 rounded-xl p-5 hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full tracking-widest uppercase">
                      {prop.nickname}
                    </span>
                  </div>
                  <p className="text-white font-semibold">{prop.address}</p>
                  <p className="text-slate-400 text-sm">{prop.city}, {prop.province} · {prop.postalCode}</p>
                  {prop.notes && (
                    <p className="mt-2 text-xs text-slate-500 border-l-2 border-slate-700 pl-3 italic">{prop.notes}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(prop)}
                    className="text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  {deleteConfirm === prop.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDelete(prop.id)}
                        className="text-xs text-red-400 hover:text-red-300 border border-red-800 hover:border-red-600 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-xs text-slate-400 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(prop.id)}
                      className="text-xs text-slate-500 hover:text-red-400 border border-slate-700 hover:border-red-800 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}