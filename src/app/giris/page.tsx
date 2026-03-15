"use client";

import { useState, useRef, useEffect } from "react";
import { Library, Lock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GirisPage() {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return; // Sadece rakam

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError("");

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // 4 hane girildiğinde otomatik kontrol
    if (index === 3 && value) {
      const fullPin = [...newPin.slice(0, 3), value.slice(-1)].join("");
      if (fullPin.length === 4) {
        submitPin(fullPin);
      }
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function submitPin(pinCode: string) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinCode }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Yanlış PIN. Tekrar deneyin.");
        setPin(["", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError("Bağlantı hatası. Tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-4">
      <div className="w-full max-w-sm">
        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-purple-500/30 mb-6">
            <Library className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Kitap Rafım</h1>
          <p className="text-zinc-400 mt-2 text-sm">Kişisel dijital kütüphanenize giriş yapın</p>
        </div>

        {/* PIN Input */}
        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 p-8 shadow-2xl">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Lock className="w-4 h-4 text-zinc-400" />
            <span className="text-sm text-zinc-400 font-medium">4 Haneli PIN</span>
          </div>

          <div className="flex gap-3 justify-center mb-6">
            {pin.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                disabled={loading}
                className="w-14 h-16 text-center text-2xl font-bold bg-zinc-800 border-2 border-zinc-700 rounded-xl text-white
                  focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:outline-none
                  transition-all duration-200 disabled:opacity-50
                  placeholder:text-zinc-600"
                placeholder="•"
              />
            ))}
          </div>

          {error && (
            <div className="text-center text-red-400 text-sm mb-4 animate-pulse">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 text-purple-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Kontrol ediliyor...</span>
            </div>
          )}
        </div>

        <p className="text-center text-zinc-600 text-xs mt-6">
          © 2026 Kitap Rafım — Kişisel Dijital Kütüphane
        </p>
      </div>
    </div>
  );
}
