"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/adminApi";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const STAFF_ROLES = ["viewer", "orders_manager", "admin", "super_admin"];

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [waking, setWaking] = useState(true);

  // Ping server on mount so it's awake before user hits submit
  useEffect(() => {
    axios
      .get(`${API_URL}/health`)
      .catch(() => {})
      .finally(() => setWaking(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminLogin(username, password);
      const { user, token } = res.data;
      if (!STAFF_ROLES.includes(user.role)) {
        toast.error("Access denied");
        return;
      }
      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminUser", JSON.stringify(user));
      router.push("/trippadp");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1
            className="text-5xl font-black text-white"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            TRPP<span className="text-[#CCFF00]">.</span>
          </h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mt-2">
            Admin Access
          </p>
          {waking && (
            <p className="text-zinc-600 text-[10px] uppercase tracking-widest mt-3 animate-pulse">
              Connecting...
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 text-sm focus:border-[#CCFF00] focus:outline-none placeholder-zinc-600"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 pr-12 text-sm focus:border-[#CCFF00] focus:outline-none placeholder-zinc-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading || waking}
            className="w-full bg-[#CCFF00] text-black font-black text-sm uppercase tracking-widest py-3 hover:bg-white transition-colors disabled:opacity-50 mt-2"
          >
            {waking ? "Waking server..." : loading ? "..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
