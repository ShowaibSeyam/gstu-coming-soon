"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  GraduationCap, Mail, Lock, User,
  Eye, EyeOff, ArrowRight, CheckCircle,
} from "lucide-react";

export default function LoginPage() {
  const { login, register, user, loading, getDashboardPath } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState("login"); // "login" | "signup"

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  // Signup fields
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [showSignupPwd, setShowSignupPwd] = useState(false);

  // Shared state
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace(getDashboardPath?.() || "/");
    }
  }, [user, loading, router]);

  const switchMode = (m) => {
    setMode(m);
    setErrorMsg("");
  };

  /* ─── Login ─── */
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      router.replace(getDashboardPath?.() || "/");
    } catch {
      setErrorMsg("Invalid email or password. Please try again.");
      setIsSubmitting(false);
    }
  };

  /* ─── Sign Up ─── */
  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (signupPassword !== signupConfirm) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(signupName, signupEmail, signupPassword);
      await login(signupEmail, signupPassword);
      router.replace(getDashboardPath?.() || "/dashboard/student");
    } catch (err) {
      const msg = err?.message || "";
      if (msg.toLowerCase().includes("exist") || msg.toLowerCase().includes("duplicate")) {
        setErrorMsg("An account with this email already exists.");
      } else {
        setErrorMsg(msg || "Sign up failed. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <span>Loading…</span>
      </div>
    );
  }

  return (
    <div className="auth-centered-page">
      <div className="auth-card">

        {/* ── Header ── */}
        <div className="auth-card-header">
          <GraduationCap size={44} color="#60a5fa" />
          <h1 className="auth-card-title">GSTU Hub</h1>
          <p className="auth-card-sub">Gopalganj Science &amp; Technology University</p>
        </div>

        {/* ── Tabs ── */}
        <div className="auth-tabs">
          <button
            id="tab-login"
            className={`auth-tab ${mode === "login" ? "auth-tab-active" : ""}`}
            onClick={() => switchMode("login")}
          >
            Sign In
          </button>
          <button
            id="tab-signup"
            className={`auth-tab ${mode === "signup" ? "auth-tab-active" : ""}`}
            onClick={() => switchMode("signup")}
          >
            Create Account
          </button>
        </div>

        {/* ── Error message ── */}
        {errorMsg && (
          <div className="auth-alert auth-alert-error">{errorMsg}</div>
        )}

        {/* ── LOGIN FORM ── */}
        {mode === "login" && (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrap">
                <Mail size={16} className="auth-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className="auth-input"
                  placeholder="your@university.edu"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="login-password"
                  type={showLoginPwd ? "text" : "password"}
                  className="auth-input auth-input-pwd"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowLoginPwd((v) => !v)}
                  tabIndex={-1}
                >
                  {showLoginPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="auth-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="auth-btn-loading">
                  <span className="auth-mini-spinner" /> Signing in…
                </span>
              ) : (
                <span className="auth-btn-content">
                  Sign In <ArrowRight size={16} />
                </span>
              )}
            </button>

            <p className="auth-switch-text">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => switchMode("signup")}
              >
                Create one free
              </button>
            </p>
          </form>
        )}

        {/* ── SIGN UP FORM ── */}
        {mode === "signup" && (
          <form className="auth-form" onSubmit={handleSignup}>
            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <div className="auth-input-wrap">
                <User size={16} className="auth-input-icon" />
                <input
                  id="signup-name"
                  type="text"
                  className="auth-input"
                  placeholder="e.g. Rahim Hossain"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrap">
                <Mail size={16} className="auth-input-icon" />
                <input
                  id="signup-email"
                  type="email"
                  className="auth-input"
                  placeholder="your@university.edu"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="signup-password"
                  type={showSignupPwd ? "text" : "password"}
                  className="auth-input auth-input-pwd"
                  placeholder="Min. 6 characters"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowSignupPwd((v) => !v)}
                  tabIndex={-1}
                >
                  {showSignupPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Confirm Password</label>
              <div className="auth-input-wrap">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="signup-confirm"
                  type={showSignupPwd ? "text" : "password"}
                  className="auth-input auth-input-pwd"
                  placeholder="Re-enter your password"
                  value={signupConfirm}
                  onChange={(e) => setSignupConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="auth-role-note">
              <CheckCircle size={13} color="#34d399" />
              <span>
                New accounts are registered as <strong>Student</strong>.
                A super admin can promote you to Teacher.
              </span>
            </div>

            <button
              id="signup-submit"
              type="submit"
              className="auth-submit-btn auth-submit-green"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="auth-btn-loading">
                  <span className="auth-mini-spinner" /> Creating account…
                </span>
              ) : (
                <span className="auth-btn-content">
                  Create Account <ArrowRight size={16} />
                </span>
              )}
            </button>

            <p className="auth-switch-text">
              Already have an account?{" "}
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => switchMode("login")}
              >
                Sign in
              </button>
            </p>
          </form>
        )}

      </div>
    </div>
  );
}
