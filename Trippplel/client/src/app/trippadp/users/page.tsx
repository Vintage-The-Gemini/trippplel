"use client";
import { useEffect, useState } from "react";
import {
  getAdminUsers,
  createAdminUser,
  updateUserRole,
  revokeUserAccess,
} from "@/lib/adminApi";
import toast from "react-hot-toast";

type Role = "admin" | "orders_manager" | "viewer";

interface StaffUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const ROLES: { value: Role; label: string; description: string }[] = [
  { value: "admin", label: "Admin", description: "Products, orders, finances" },
  { value: "orders_manager", label: "Orders Manager", description: "Orders only" },
  { value: "viewer", label: "Viewer", description: "Dashboard read-only" },
];

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-[#CCFF00] text-black",
  admin: "bg-blue-500/20 text-blue-400",
  orders_manager: "bg-purple-500/20 text-purple-400",
  viewer: "bg-zinc-700 text-zinc-400",
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  orders_manager: "Orders Manager",
  viewer: "Viewer",
};

export default function UsersPage() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    role: "orders_manager" as Role,
  });

  useEffect(() => {
    getAdminUsers()
      .then((res) => setUsers(res.data.users))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createAdminUser(form);
      setUsers((prev) => [res.data.user, ...prev]);
      setForm({ name: "", username: "", password: "", role: "orders_manager" });
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

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await updateUserRole(id, role);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role } : u))
      );
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleRevoke = async (id: string, name: string) => {
    if (!confirm(`Revoke staff access for "${name}"?`)) return;
    try {
      await revokeUserAccess(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("Access revoked");
    } catch {
      toast.error("Failed to revoke access");
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
            Manage staff access
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-[#CCFF00] text-black text-xs font-black uppercase tracking-widest px-5 py-2.5 hover:bg-white transition-colors"
        >
          {showForm ? "Cancel" : "+ New User"}
        </button>
      </div>

      {/* Role legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        {ROLES.map((r) => (
          <div key={r.value} className="bg-zinc-900 border border-zinc-800 p-4">
            <span
              className={`inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 mb-2 ${ROLE_COLORS[r.value]}`}
            >
              {r.label}
            </span>
            <p className="text-xs text-zinc-500">{r.description}</p>
          </div>
        ))}
      </div>

      {/* Create user form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-zinc-900 border border-zinc-800 p-6 mb-8 space-y-4"
        >
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-300 mb-2">
            Create New Staff User
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm focus:border-[#CCFF00] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                Username
              </label>
              <input
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                required
                className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm focus:border-[#CCFF00] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                minLength={6}
                className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm focus:border-[#CCFF00] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                Role
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
                className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm focus:border-[#CCFF00] focus:outline-none"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
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
        <p className="text-zinc-600 text-sm">No staff users yet. Create one above.</p>
      ) : (
        <div className="border border-zinc-800">
          <div className="grid grid-cols-[1fr_120px_150px_120px] gap-4 px-4 py-2 border-b border-zinc-800 text-[10px] text-zinc-500 uppercase tracking-widest">
            <span>User</span>
            <span>Username</span>
            <span>Role</span>
            <span>Actions</span>
          </div>

          {users.map((user) => (
            <div
              key={user._id}
              className="grid grid-cols-[1fr_120px_150px_120px] gap-4 px-4 py-4 border-b border-zinc-800 items-center hover:bg-zinc-900 transition-colors"
            >
              <div>
                <p className="text-sm font-bold text-white">{user.name}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>

              <span className="text-xs font-mono text-zinc-400">{user.email}</span>

              <div>
                {user.role === "super_admin" ? (
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 ${ROLE_COLORS.super_admin}`}>
                    {ROLE_LABELS.super_admin}
                  </span>
                ) : (
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 text-white px-2 py-1 text-xs font-bold uppercase focus:border-[#CCFF00] focus:outline-none cursor-pointer"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                {user.role !== "super_admin" && (
                  <button
                    onClick={() => handleRevoke(user._id, user.name)}
                    className="text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 border border-zinc-700 hover:border-red-400 px-2.5 py-1 transition-colors"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
