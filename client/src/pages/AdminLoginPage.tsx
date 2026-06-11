import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const adminLogin = trpc.auth.adminLogin.useMutation({
    onSuccess: () => {
      toast.success("تم تسجيل الدخول بنجاح", { description: "مرحباً بك في لوحة التحكم" });
      // Force full page reload to refresh auth state
      window.location.href = "/admin";
    },
    onError: (err) => {
      toast.error("خطأ في تسجيل الدخول", {
        description: err.message || "كلمة المرور غير صحيحة",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    adminLogin.mutate({ password });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0a0f 0%, #0d1117 40%, #0f1923 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Cairo', 'Segoe UI', sans-serif",
        direction: "rtl",
      }}
    >
      {/* Background decorative elements */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{
          position: "absolute", top: "20%", right: "15%",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: "25%", left: "10%",
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)",
        }} />
      </div>

      <div style={{
        width: "100%",
        maxWidth: 420,
        margin: "0 16px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(212,175,55,0.15)",
        borderRadius: 16,
        padding: "48px 40px",
        backdropFilter: "blur(20px)",
        boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.05)",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            width: 72, height: 72, margin: "0 auto 16px",
            background: "linear-gradient(135deg, #d4af37, #f5d060)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32,
            boxShadow: "0 8px 24px rgba(212,175,55,0.3)",
          }}>
            🔐
          </div>
          <h1 style={{
            fontSize: 24, fontWeight: 700,
            color: "#f5d060",
            margin: "0 0 6px",
            letterSpacing: "-0.5px",
          }}>
            لوحة تحكم المسؤول
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0 }}>
            Expert Plan — دخول خاص بصاحب الموقع
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: "block",
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(255,255,255,0.7)",
              marginBottom: 8,
              letterSpacing: "0.5px",
            }}>
              كلمة المرور السرية
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور..."
                autoFocus
                style={{
                  width: "100%",
                  padding: "14px 48px 14px 16px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(212,175,55,0.2)",
                  borderRadius: 10,
                  color: "#fff",
                  fontSize: 15,
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => { e.target.style.borderColor = "rgba(212,175,55,0.6)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(212,175,55,0.2)"; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  left: 14, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "rgba(255,255,255,0.4)", fontSize: 18, padding: 0,
                  lineHeight: 1,
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={adminLogin.isPending || !password.trim()}
            style={{
              width: "100%",
              padding: "14px",
              background: adminLogin.isPending || !password.trim()
                ? "rgba(212,175,55,0.3)"
                : "linear-gradient(135deg, #d4af37, #f5d060)",
              border: "none",
              borderRadius: 10,
              color: adminLogin.isPending || !password.trim() ? "rgba(255,255,255,0.5)" : "#0a0a0f",
              fontSize: 16,
              fontWeight: 700,
              cursor: adminLogin.isPending || !password.trim() ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              fontFamily: "inherit",
              letterSpacing: "0.5px",
            }}
          >
            {adminLogin.isPending ? "جاري التحقق..." : "دخول إلى لوحة التحكم"}
          </button>
        </form>

        {/* Security note */}
        <div style={{
          marginTop: 28,
          padding: "12px 16px",
          background: "rgba(212,175,55,0.05)",
          border: "1px solid rgba(212,175,55,0.1)",
          borderRadius: 8,
          textAlign: "center",
        }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", margin: 0, lineHeight: 1.6 }}>
            🔒 هذه الصفحة مخصصة لصاحب الموقع فقط.<br />
            لا تشارك كلمة المرور مع أي شخص.
          </p>
        </div>

        {/* Back link */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <a
            href="/"
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.3)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.color = "rgba(212,175,55,0.7)"; }}
            onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.color = "rgba(255,255,255,0.3)"; }}
          >
            ← العودة إلى الموقع
          </a>
        </div>
      </div>
    </div>
  );
}
