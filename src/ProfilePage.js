import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  const [user, setUser] = useState({
    username: '',
    email: '',
    bio: '',
    phoneNumber: '',
    profilePicture: '',
    role: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const getCurrentUser = useCallback(() => {
    return {
      id: localStorage.getItem("userId"),
      username: localStorage.getItem("username") || localStorage.getItem("name"),
      email: localStorage.getItem("email"),
      role: localStorage.getItem("role"),
      authType: localStorage.getItem("authType"),
    };
  }, []);

  const checkAuth = useCallback(() => {
    const user = getCurrentUser();
    if (!user.email) {
      navigate('/login');
      return false;
    }
    return true;
  }, [getCurrentUser, navigate]);

  const fetchUserProfile = useCallback(async () => {
    if (!checkAuth()) return;

    const currentUser = getCurrentUser();

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`http://localhost:8080/users/email/${currentUser.email}`);
      const data = response.data;

      setUser({
        username: data.username || '',
        email: data.email || '',
        bio: data.bio || '',
        phoneNumber: data.phoneNumber || '',
        profilePicture: data.profilePicture || '',
        role: data.role || 'USER'
      });

      // Optionally update localStorage
      localStorage.setItem("username", data.username || '');
      localStorage.setItem("role", data.role || 'USER');
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [checkAuth, getCurrentUser]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2MB.");
      return;
    }

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!checkAuth()) return;

    try {
      setSaveStatus("saving");
      setError(null);

      const currentUser = getCurrentUser();

      const formData = new FormData();
      formData.append("username", user.username);
      formData.append("email", user.email);
      formData.append("bio", user.bio);
      formData.append("phoneNumber", user.phoneNumber);

      // Only admin can change role
      if (user.email === "admin@example.com") {
        formData.append("role", user.role);
      }

      if (previewImage && previewImage !== user.profilePicture) {
        const response = await fetch(previewImage);
        const blob = await response.blob();
        formData.append("profileImage", blob);
      }

      const updateRes = await axios.put(`http://localhost:8080/users/${currentUser.username}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const updatedData = updateRes.data;
      setUser({
        username: updatedData.username,
        email: updatedData.email,
        bio: updatedData.bio,
        phoneNumber: updatedData.phoneNumber,
        profilePicture: updatedData.profilePicture,
        role: updatedData.role
      });

      if (updatedData.username !== currentUser.username) {
        localStorage.setItem("username", updatedData.username);
      }
      localStorage.setItem("role", updatedData.role);

      setSaveStatus("success");
      setIsEditing(false);
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error("Save failed:", err);
      setError(err.response?.data?.message || "Failed to save profile.");
      setSaveStatus("error");
    }
  };

  const handleCancel = () => {
    fetchUserProfile();
    setIsEditing(false);
    setPreviewImage(null);
    setError(null);
    setSaveStatus(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isAdmin = user.email === "admin@example.com"; // 👈 define your admin email here

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 py-10 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">User Profile</h2>
          <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800">Logout</button>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading profile...</div>
        ) : error && !isEditing ? (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
        ) : (
          <>
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 mb-2 relative">
                <img
                  src={previewImage || user.profilePicture || "/defaultProfile.png"}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-2 border-gray-300"
                />
              </div>
              {isEditing && (
                <div className="w-full mt-2">
                  <label className="block mb-1 font-medium text-sm">Profile Picture</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm" />
                  <p className="text-xs text-gray-500 mt-1">Max size: 2MB</p>
                </div>
              )}
            </div>

            {error && isEditing && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Username</label>
                <input
                  type="text"
                  name="username"
                  value={user.username}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border p-2 rounded disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  disabled
                  className="w-full border p-2 rounded bg-gray-100 text-gray-500"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={user.phoneNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border p-2 rounded disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Bio</label>
                <textarea
                  name="bio"
                  value={user.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows="3"
                  className="w-full border p-2 rounded disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Role</label>
                {isEditing && isAdmin ? (
                  <select
                    name="role"
                    value={user.role}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="INSTRUCTOR">INSTRUCTOR</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    name="role"
                    value={user.role}
                    disabled
                    className="w-full border p-2 rounded bg-gray-100 text-gray-500"
                  />
                )}
              </div>

              <div className="flex justify-between mt-6">
                {isEditing ? (
                  <>
                    <button onClick={handleCancel} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                      Cancel
                    </button>
                    <button onClick={handleSave} disabled={saveStatus === "saving"} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      {saveStatus === "saving" ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
                    Edit Profile
                  </button>
                )}
              </div>

              {saveStatus === "success" && (
                <div className="bg-green-100 text-green-700 p-3 rounded mt-4">Profile updated successfully!</div>
              )}
              {saveStatus === "error" && (
                <div className="bg-red-100 text-red-700 p-3 rounded mt-4">{error || "Failed to save changes."}</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
