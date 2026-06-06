import { useState } from "react";
import { Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import logo from "../../assets/logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSigned, setKeepSigned] = useState(false);
  const { login, loading, error } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-gray-50 to-blue-50 flex flex-col items-center justify-center px-4">
      {/* Brand */}
      <div className="flex flex-col items-center mb-8 gap-2">
        <div className=" rounded-2xl flex items-center justify-center">
          <img src={logo} alt="logo" className="w-10 h-10" />
        </div>
        <h1 className="text-lg font-bold tracking-widest text-gray-900">
          PRESCRIPTO
        </h1>
        <p className="text-sm text-gray-500">Clinical Administration Portal</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
        <p className="text-sm text-gray-500 mb-6">
          Please enter your credentials to access the system.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@prescripto.com"
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-primary focus:bg-white transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-primary focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Security hint */}
            <div className="mt-2 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2 flex gap-2 items-start">
              <span className="w-4 h-4 mt-0.5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-2.5 h-2.5 stroke-white fill-none stroke-2"
                  viewBox="0 0 10 10"
                >
                  <polyline points="1.5,5 4,7.5 8.5,2.5" />
                </svg>
              </span>
              <div>
                <p className="text-[10px] font-bold text-primary tracking-widest mb-0.5">
                  SECURITY REQUIREMENTS
                </p>
                <p className="text-xs text-gray-600 leading-snug">
                  Password must include: uppercase letter, lowercase letter,
                  number, special character
                </p>
              </div>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                checked={keepSigned}
                onChange={(e) => setKeepSigned(e.target.checked)}
                className="accent-primary w-4 h-4"
              />
              Keep me signed in
            </label>
            {/* <button
              type="button"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Forgot password?
            </button> */}
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#008379] hover:bg-primary-dark text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In to Portal"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          {/* Don't have an account?{" "}
          <span className="text-primary font-semibold cursor-pointer hover:underline">
            Contact System Admin
          </span> */}
          <div className="flex justify-center gap-4 mt-2">
            <span className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
              Privacy Policy
            </span>
            <span className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
              Terms of Service
            </span>
          </div>
        </div>
      </div>

      {/* Encrypted badge */}
      {/* <div className="flex items-center gap-1.5 mt-6 text-gray-400 text-[11px] tracking-widest">
        <ShieldCheck size={13} />
        AES-256 ENCRYPTED ENVIRONMENT
      </div> */}
    </div>
  );
}
