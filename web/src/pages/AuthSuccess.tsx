import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader } from "lucide-react";
import { toast } from "react-hot-toast";

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    const id = searchParams.get("id");

    if (token) {
      if (email && id) {
        // Construct user object
        const userObj = {
          _id: id,
          email: email,
          token: token,
        };
        // Save to local storage
        localStorage.setItem("user", JSON.stringify(userObj));
      } else {
        // Fallback for just token (legacy or error)
        localStorage.setItem("user", JSON.stringify({ token }));
      }

      toast.success("Login Successful!");

      // Force reload/navigate to trigger authSlice initial state check
      window.location.href = "/dashboard";
    } else {
      toast.error("Login Failed: No token received.");
      navigate("/login");
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-app text-primary">
      <Loader className="animate-spin w-12 h-12 mb-4" />
      <h2 className="text-xl font-semibold">Completing Login...</h2>
    </div>
  );
};

export default AuthSuccess;
