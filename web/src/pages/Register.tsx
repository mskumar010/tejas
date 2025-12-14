import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { register, reset } from "@/features/auth/authSlice";
import type { AppDispatch, RootState } from "@/store";
import { Mail, Lock, Loader, UserPlus } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { email, password, confirmPassword } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess || user) {
      navigate("/dashboard");
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
    } else {
      const userData = {
        email,
        password,
      };

      dispatch(register(userData));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-app transition-colors duration-200 p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full bg-surface rounded-2xl shadow-xl overflow-hidden border border-border-base">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-main mb-2">
              Create Account
            </h1>
            <p className="text-text-muted">
              Join to start organizing your job hunt
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-text-main"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-text-muted" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  className="block w-full pl-10 pr-3 py-3 border border-border-base rounded-xl bg-app text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-text-main"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-muted" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  className="block w-full pl-10 pr-3 py-3 border border-border-base rounded-xl bg-app text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  placeholder="Create password"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-text-main"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-muted" />
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={onChange}
                  className="block w-full pl-10 pr-3 py-3 border border-border-base rounded-xl bg-app text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-2"
            >
              {isLoading ? (
                <Loader className="animate-spin h-5 w-5" />
              ) : (
                <>
                  Register Account
                  <UserPlus className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4">
            <a
              href={`${import.meta.env.VITE_API_URL}/auth/google-signin`}
              className="w-full flex items-center justify-center py-3 px-4 border border-border-base rounded-xl shadow-sm text-sm font-medium text-text-main bg-surface hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5 mr-2"
              />
              Continue with Google
            </a>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-muted">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:opacity-80 hover:underline"
              >
                Login instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
