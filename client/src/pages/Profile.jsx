import { useEffect, useRef, useState } from "react";
import Axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import AddressSection from "./AddressSection";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const avatarRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
  });

  const [password, setPassword] = useState("");

  /* ---------------- INIT FORM ---------------- */
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        mobile: user.mobile || "",
      });
    }
  }, [user]);

  /* ---------------- AVATAR HANDLERS ---------------- */
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreviewAvatar(URL.createObjectURL(file));
    setRemoveAvatar(false);
  };

  const cancelAvatarSelection = () => {
    setPreviewAvatar(null);
    avatarRef.current.value = "";
  };

  const handleRemoveAvatar = () => {
    setRemoveAvatar(true);
    setPreviewAvatar(null);
    avatarRef.current.value = "";
  };

  /* ---------------- UPDATE PROFILE ---------------- */
  const handleUpdate = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("mobile", form.mobile);

      if (password) formData.append("password", password);
      if (removeAvatar) formData.append("removeAvatar", "true");
      if (avatarRef.current?.files[0])
        formData.append("file", avatarRef.current.files[0]);

      const res = await Axios.put("/user/update-user", formData);

      if (res.data.success) {
        updateUser(res.data.data); // update auth context
        setPassword("");
        setPreviewAvatar(null);
        setRemoveAvatar(false);
        avatarRef.current.value = "";
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">My Profile</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* AVATAR */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-28 h-28 rounded-full overflow-hidden border">
            {previewAvatar ? (
              <img
                src={previewAvatar}
                alt="preview"
                className="w-full h-full object-cover"
              />
            ) : user.avatar && !removeAvatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-green-600 text-white flex items-center justify-center text-3xl font-bold">
                {user.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <input
            ref={avatarRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => avatarRef.current.click()}
            className="px-4 py-2 border rounded text-sm hover:bg-gray-100"
          >
            {user.avatar ? "Change Avatar" : "Upload Avatar"}
          </button>

          {previewAvatar && (
            <p className="text-xs text-gray-500 text-center mt-1">
              {avatarRef.current.files[0]?.name}
            </p>
          )}

          <div className="flex gap-3">
            {previewAvatar && (
              <button
                onClick={cancelAvatarSelection}
                className="text-sm text-gray-600 underline"
              >
                Cancel selection
              </button>
            )}

            {user.avatar && !removeAvatar && (
              <button
                onClick={handleRemoveAvatar}
                className="text-red-500 text-sm mt-2"
              >
                Remove Avatar
              </button>
            )}
          </div>
        </div>

        {/* FORM (VERTICAL) */}
        <div className="space-y-4">
          <div>
            <label className="text-sm">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm">Email</label>
            <input
              value={user.email}
              disabled
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>

          <div>
            <label className="text-sm">Mobile</label>
            <input
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* UPDATE BUTTON */}
        <div className="flex justify-center">
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </div>
      <AddressSection />
    </div>
  );
};

export default Profile;
