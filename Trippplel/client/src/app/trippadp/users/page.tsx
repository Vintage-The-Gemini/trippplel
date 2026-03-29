"use client";
import { useEffect, useState } from "react";
import { getAdminUsers, createAdminUser, revokeUserAccess } from "@/lib/adminApi";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const ALL_PERMISSIONS = [
  { key: "dashboard", label: "Dashboard", description: "View stats & overview" },
  { key: "products", label: "Products", description: "Add, edit, delete products" },
  { key: "orders", label: "Orders", description: "View & update order status" },
  { key: "finances", label: "Finances", description: "View revenue & analytics" },
];

const PRESETS = [
  { label: "Viewer", permissions: ["dashboard"] },
  { label: "Orders Manager", permissions: ["dashboard", "orders"] },
  { label: "Store Manager", permissions: ["dashboard", "products", "orders"] },
  { label: "Full Access", permissions: ["dashboard", "products", "orders", "finances"] },
];

interface StaffUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    permissions: [] as string[],
  });

  useEffect(() => {
    getAdminUsers()
      .then((res) => setUsers(res.data.users))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleFormPerm = (key: string) => {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter((p) => p !== key)
        : [...f.permissions, key],
    }));
  };

  const applyPreset = (perms: string[]) => {
    setForm((f) => ({ ...f, permissions: perms }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.permissions.length === 0) {
      toast.error("Select at least one permission");
      return;
    }
    setSubmitting(true);
    try {
      const res = await createAdminUser(form);
      setUsers((prev) => [res.data.user, ...prev]);
      setForm({ name: "", username: "", password: "", permissions: [] });
      setShowForm(false);
      toast.success("User created");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to create user";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePermissionToggle = async (userId: string, currentPerms: string[], key: string) => {
    const updated = currentPerms.includes(key)
      ? currentPerms.filter((p) => p !== key)
      : [...currentPerms, key];

    setSaving(userId);
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(
        `${API_URL}/admin/users/${userId}/permissions`,
        { permissions: updated },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, permissions: updated } : u))
      );
      toast.success("Permissions updated");
    } catch {
      toast.error("Failed to update");
    } finally {
      setSaving(null);
    }
  };

  const handleRevoke = async (id: string, name: string) => {
    if (!confirm(`Revoke all access for "${name}"?`)) return;
    try {
      await revokeUserAccess(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("Access revoked");
    } catch {
      toast.error("Failed");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-zinc-500 text-xs uppercase tracking-widest">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-4xl font-black text-white"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Users & Roles
          </h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
            Assign any combination of permissions per user
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-[#CCFF00] text-black text-xs font-black uppercase tracking-widest px-5 py-2.5 hover:bg-white transition-colors"
        >
          {showForm ? "Cancel" : "+ New User"}
        </button>
      </div>

      {/* Permissions legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {ALL_PERMISSIONS.map((p) => (
          <div key={p.key} className="bg-zinc-900 border border-zinc-800 p-3">
            <p className="text-xs font-black uppercase tracking-wider text-[#CCFF00] mb-1">
              {p.label}
            </p>
            <p className="text-[10px] text-zinc-500">{p.description}</p>
          </div>
        ))}
      </div>

      {/* Create user form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-zinc-900 border border-zinc-800 p-6 mb-8 space-y-5"
        >
          <h2 className="text-xs font-black uppercase tracking-widest text-white">
            Create New Staff User
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Full Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm focus:border-[#CCFF00] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Username</label>
              <input
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                required
                className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm focus:border-[#CCFF00] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                minLength={6}
                className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm focus:border-[#CCFF00] focus:outline-none"
              />
            </div>
          </div>

          {/* Presets */}
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Quick Presets</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset.permissions)}
                  className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 border border-zinc-600 text-zinc-400 hover:border-[#CCFF00] hover:text-white transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Permission checkboxes */}
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
              Permissions — select any combination
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ALL_PERMISSIONS.map((perm) => (
                <label
                  key={perm.key}
                  className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${
                    form.permissions.includes(perm.key)
                      ? "border-[#CCFF00] bg-[#CCFF00]/5"
                      : "border-zinc-700 hover:border-zinc-500"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.permissions.includes(perm.key)}
                    onChange={() => toggleFormPerm(perm.key)}
                    className="accent-[#CCFF00] w-4 h-4"
                  />
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-white">
                      {perm.label}
                    </p>
                    <p className="text-[9px] text-zinc-500 mt-0.5">{perm.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-[#CCFF00] text-black font-black text-xs uppercase tracking-widest px-6 py-2.5 hover:bg-white transition-colors disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create User"}
          </button>
        </form>
      )}

      {/* Users table */}
      {users.length === 0 ? (
        <p className="text-zinc-600 text-sm">No staff users yet.</p>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user._id}
              className="bg-zinc-900 border border-zinc-800 p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-black text-white uppercase tracking-wide">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    @{user.email}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {user.role === "super_admin" ? (
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-[#CCFF00] text-black">
                      Super Admin
                    </span>
                  ) : (
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-zinc-700 text-zinc-300">
                      Staff
                    </span>
                  )}
                  {user.role !== "super_admin" && (
                    <button
                      onClick={() => handleRevoke(user._id, user.name)}
                      className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>

              {/* Permission checkboxes per user */}
              {user.role !== "super_admin" ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {ALL_PERMISSIONS.map((perm) => {
                    const active = user.permissions.includes(perm.key);
                    const isSavingThis = saving === user._id;
                    return (
                      <button
                        key={perm.key}
                        onClick={() =>
                          handlePermissionToggle(user._id, user.permissions, perm.key)
                        }
                        disabled={isSavingThis}
                        className={`flex items-center gap-2 p-2.5 border text-left transition-colors disabled:opacity-50 ${
                          active
                            ? "border-[#CCFF00] bg-[#CCFF00]/10 text-white"
                            : "border-zinc-700 text-zinc-500 hover:border-zinc-500"
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 border flex-shrink-0 flex items-center justify-center ${
                            active ? "border-[#CCFF00] bg-[#CCFF00]" : "border-zinc-600"
                          }`}
                        >
                          {active && (
                            <span className="text-black text-[8px] font-black">✓</span>
                          )}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {perm.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                  Full access — all permissions
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
