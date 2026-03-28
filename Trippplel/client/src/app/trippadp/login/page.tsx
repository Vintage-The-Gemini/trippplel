"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/adminApi";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminLogin(username, password);
      const { user, token } = res.data;
      if (user.role !== "admin") {
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
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 text-sm focus:border-[#CCFF00] focus:outline-none placeholder-zinc-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#CCFF00] text-black font-black text-sm uppercase tracking-widest py-3 hover:bg-white transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
