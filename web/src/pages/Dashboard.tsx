import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  // @ts-ignore
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const onConnectGmail = async () => {
    try {
      const res = await api.get("/gmail/connect", {
        // @ts-ignore
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      console.error("Failed to get connect URL", error);
    }
  };

  if (isLoading) {
    return <h3>Loading...</h3>;
  }

  return (
    <section className="heading">
      <h1>Welcome {user && user.email}</h1>
      <p>Tejas Dashboard</p>

      <div className="content">
        <button onClick={onConnectGmail} className="btn btn-block">
          Connect Gmail Account
        </button>
      </div>
    </section>
  );
}

export default Dashboard;
