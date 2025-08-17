import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface TokenHandlerProps {
  setUser: (user: any) => void;
}

const TokenHandler: React.FC<TokenHandlerProps> = ({ setUser }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);

      fetch("https://contactpro-backend.vercel.app/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
            navigate("/dashboard", { replace: true });
          } else {
            navigate("/login");
          }
        })
        .catch(() => {
          navigate("/login");
        });
    }
  }, [location, navigate, setUser]);

  return null;
};

export default TokenHandler;
