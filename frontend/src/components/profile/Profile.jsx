import "./Profile.css";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import clientServer from "../../config/axios.js"
import { updateProfile } from "../../app/action/auth.action.js";

export function Profile({ onClose }) {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.loggedInUser);
  const isLoading = useSelector((state) => state.auth.isLoading);

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || "");
  const [about, setAbout] = useState(user?.about || "");
  const [imageUrl, setImageUrl] = useState(user?.profilePic || null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);


  const handleProfilePicture = async (e) => {
    const file = e.target.files[0];

    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    ) {
      alert("Please select a JPG, PNG, or WEBP image.");
      return;
    }

    setProfilePhoto(URL.createObjectURL(file));


    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setIsUploading(true);
      const response = await clientServer.post("/upload-image", formData, {
        headers: {
          authorization: "bearer " + localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("response : ", response);
      setImageUrl(response.data.imageUrl);

    } catch (err) {
      console.log(err);
    } finally {
      setIsUploading(false);
    }
  };
  const handleEdit = () => {
    setUsername(user?.username || "");
    setAbout(user?.about || "");
    setImageUrl(user?.profilePic || null);
    setProfilePhoto(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setUsername(user?.username || "");
    setAbout(user?.about || "");
    setImageUrl(user?.profilePic || null);
    setProfilePhoto(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!username.trim()) return;

    const result = await dispatch(
      updateProfile({

        username: username.trim(),
        about: about.trim(),
        profilePic: imageUrl,

      })
    );

    if (updateProfile.fulfilled.match(result)) {
      setIsEditing(false);
    }
  };

  return (
    <div className="profile-page">

      <div className="profile-page-header">
        <button
          className="profile-back"
          onClick={onClose}
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>

        <h2>Profile</h2>
      </div>

      <div className="profile-page-content">

        <div className="profile-photo-section">

          <div className="profile-large-image">
            <img
              src={profilePhoto || user?.profilePic}
              alt={user?.username || "Profile"}
            />

            {isEditing && (
              <><button
                className="profile-photo-edit"
                onClick={() => fileInputRef.current?.click()}
              >
                <i className="fa-solid fa-camera"></i>
              </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicture}
                  style={{ display: "none" }}
                /></>
            )}
          </div>

          {!isEditing && (
            <button
              className="profile-edit-button"
              onClick={handleEdit}
            >
              <i className="fa-solid fa-pen"></i>
              Edit Profile
            </button>
          )}

        </div>

        <div className="profile-details">

          <div className="profile-field">

            <div className="profile-field-icon">
              <i className="fa-solid fa-user"></i>
            </div>

            <div className="profile-field-content">
              <span>Username</span>

              {isEditing ? (
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                />
              ) : (
                <p>{user?.username || "Not set"}</p>
              )}
            </div>

          </div>

          <div className="profile-field">

            <div className="profile-field-icon">
              <i className="fa-solid fa-envelope"></i>
            </div>

            <div className="profile-field-content">
              <span>Email</span>
              <p>{user?.email || "Not set"}</p>
            </div>

          </div>

          <div className="profile-field">

            <div className="profile-field-icon">
              <i className="fa-solid fa-circle-info"></i>
            </div>

            <div className="profile-field-content">
              <span>About</span>

              {isEditing ? (
                <input
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  maxLength={120}
                />
              ) : (
                <p>
                  {user?.about || "Hey there! I am using Let's Chat."}
                </p>
              )}
            </div>

          </div>

        </div>

        {isEditing && (
          <div className="profile-edit-actions">

            <button
              className="profile-cancel-button"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </button>

            <button
              className="profile-save-button"
              onClick={handleSave}
              disabled={isLoading || isUploading || !username.trim()}
            >
              {isUploading
                ? "Uploading..."
                : isLoading
                  ? "Saving..."
                  : "Save"}
            </button>

          </div>
        )}

      </div>

    </div>
  );
}