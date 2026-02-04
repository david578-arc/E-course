import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const OAuth2Success = () => {
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState("Logging in, please wait...");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const email = urlParams.get("email");
    const name = urlParams.get("name");

    if (token && email && name) {
      localStorage.setItem("token", token);
      localStorage.setItem("username", name);
      localStorage.setItem("email", email);

      axios.get(`http://localhost:8080/users/status/${email}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => {
        const isNewUser = res.data.newUser;
        const isVerified = res.data.verified;

        if (!isVerified) {
          setStatusMessage("A verification email has been sent. Please verify your email to continue.");
          return;
        }

        if (isNewUser) {
          navigate("/complete-profile");
        } else {
          axios.get(`http://localhost:8080/users/role/${email}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          })
          .then(roleRes => {
            const role = roleRes.data.role || "USER";
            localStorage.setItem("role", role);
            navigate(role.toUpperCase() === "ADMIN" ? "/adminhome" : "/home");
          })
          .catch(err => {
            console.error("Role fetch failed:", err);
            localStorage.setItem("role", "USER");
            navigate("/home");
          });
        }
      })
      .catch(err => {
        console.error("User status check failed:", err);
        setStatusMessage("Error during login. Please try again.");
      });
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return <div style={{ textAlign: "center", marginTop: "100px" }}>{statusMessage}</div>;
};

export default OAuth2Success;
