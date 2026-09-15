import "./Settings.css";

export function Settings({ onClose, onLogout }) {
  return (
    <div className="settings-page">

      <div className="settings-header">
        <button className="settings-back" onClick={onClose}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>

        <h2>Settings</h2>
      </div>

      <div className="settings-content">

        <div className="settings-section">
          <div className="settings-section-title">
            Account
          </div>

          <div className="settings-item">
            <div className="settings-item-icon">
              <i className="fa-solid fa-user"></i>
            </div>

            <div>
              <p>Account</p>
              <span>Manage your account information</span>
            </div>

            <i className="fa-solid fa-chevron-right settings-arrow"></i>
          </div>

          <div className="settings-item">
            <div className="settings-item-icon">
              <i className="fa-solid fa-lock"></i>
            </div>

            <div>
              <p>Privacy</p>
              <span>Control your privacy settings</span>
            </div>

            <i className="fa-solid fa-chevron-right settings-arrow"></i>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-title">
            Chat
          </div>

          <div className="settings-item">
            <div className="settings-item-icon">
              <i className="fa-solid fa-bell"></i>
            </div>

            <div>
              <p>Notifications</p>
              <span>Message and call notifications</span>
            </div>

            <i className="fa-solid fa-chevron-right settings-arrow"></i>
          </div>

          <div className="settings-item">
            <div className="settings-item-icon">
              <i className="fa-solid fa-palette"></i>
            </div>

            <div>
              <p>Appearance</p>
              <span>Customize how Let's Chat looks</span>
            </div>

            <i className="fa-solid fa-chevron-right settings-arrow"></i>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-title">
            Other
          </div>

          <div
            className="settings-item settings-logout"
            onClick={onLogout}
          >
            <div className="settings-item-icon">
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
            </div>

            <div>
              <p>Logout</p>
              <span>Sign out of your account</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}