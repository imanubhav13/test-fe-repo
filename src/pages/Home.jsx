import { useEffect, useRef, useState } from "react";
import SheetsAccess from "../components/SheetAccess";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPE =
  "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";

const Login = () => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("google_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [resetForm, setResetForm] = useState(false);

  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem("google_access_token");
  });

  const buttonRef = useRef(null);
  const tokenClientRef = useRef(null);

  const getUserInfo = async (token) => {
    try {
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Failed to fetch user info:", res.status);
        return null;
      }

      const data = await res.json();
      // console.log("User info:", data);
      setUser(data);
      localStorage.setItem("google_user", JSON.stringify(data));
    } catch (error) {
      console.error(error);
    }
  };

  const toggleReset = () => {
    setResetForm(!resetForm);
  };

  const resetGoogleSession = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("google_user");
    localStorage.removeItem("google_access_token");

    tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: (tokenResponse) => {
        const token = tokenResponse.access_token;
        setAccessToken(token);
        localStorage.setItem("google_access_token", token);
        getUserInfo(token);
      },
    });
  };

  useEffect(() => {
    const waitForGoogle = setInterval(() => {
      if (window.google) {
        clearInterval(waitForGoogle);

        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPE,
          prompt: "consent select_account",
          callback: (tokenResponse) => {
            const token = tokenResponse.access_token;
            // console.log("Access Token:", token);
            setAccessToken(token);
            localStorage.setItem("google_access_token", token);
            getUserInfo(token);
          },
        });

        if (buttonRef.current) {
          buttonRef.current.onclick = () => {
            tokenClientRef.current.requestAccessToken();
          };
        }
      }
    }, 100);
  }, []);

  // If token is in localStorage but user isn't yet loaded (on refresh)
  useEffect(() => {
    if (accessToken && !user) {
      getUserInfo(accessToken);
    }
  }, [accessToken]);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-xs opacity-85 scale-110 z-0"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      ></div>

      <div
        className={`relative z-10 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 w-full ${
          !user ? "max-w-sm" : "max-w-4xl"
        } space-y-6`}
      >
        {!user ? (
          <>
            <div className="text-2xl font-bold text-gray-800 text-center">
              333 acres
            </div>
            <button
              ref={buttonRef}
              id="getAccess"
              className="w-full py-3 px-6 bg-primary text-white rounded-lg font-semibold cursor-pointer transition"
            >
              Login
            </button>
          </>
        ) : (
          <div className="flex flex-col xl:flex-row gap-8 text-left">
            {/* Left section */}
            <div className="flex flex-col gap-4 lg:min-w-[200px]">
              <div className="flex flex-row justify-between items-center">
                <div className="text-2xl font-bold text-gray-800">
                  333 acres
                </div>
                <div className="flex flex-row gap-5 xs:gap-2 items-center">
                  <span
                    className="w-fit underline rounded-lg font-semibold cursor-pointer transition hover:text-primary"
                    onClick={toggleReset}
                  >
                    reset
                  </span>
                  <span
                    className="w-fit underline rounded-lg font-semibold cursor-pointer transition hover:text-primary"
                    onClick={resetGoogleSession}
                  >
                    Use different email
                  </span>
                </div>
              </div>
              <p className="text-gray-700 text-lg font-medium">
                Welcome, {user?.name}
              </p>
            </div>

            {/* Right section */}
            <div className="flex-1">
              <SheetsAccess
                accessToken={accessToken}
                userInfo={user}
                resetForm={resetForm}
                toggleReset={toggleReset}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
