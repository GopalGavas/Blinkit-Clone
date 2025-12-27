import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import Axios from "../../api/axios";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get("code");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleVerify = async () => {
    if (!code) {
      setMessage("Invalid verification link");
      return;
    }

    try {
      setLoading(true);
      const res = await Axios.get(`/user/verify-email?code=${code}`);

      if (res.data.success) {
        setMessage("Email verified successfully 🎉");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(res.data.message || "Verification failed");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-96 text-center">
        <h2 className="text-lg font-semibold mb-4">Verify your email</h2>

        <p className="text-sm text-gray-600 mb-6">
          Is this your email address?
        </p>

        {message && <p className="mb-4 text-sm text-red-500">{message}</p>}

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          {loading ? "Verifying..." : "Yes, verify my email"}
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
