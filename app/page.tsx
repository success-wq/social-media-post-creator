import Script from "next/script";
import LogoutButton from "./logout-button";

export default function Page() {
  return (
    <>
      <div className="container">
        <div className="header">
          <button className="live-demo-btn" type="button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3" fill="currentColor" />
            </svg>
            LIVE
          </button>
          <h1 className="title">Social Media Post Creator</h1>
          <p className="subtitle">
            Create multiple social media posts for different pages and platforms
          </p>
          <div style={{ marginTop: 16 }}>
            <LogoutButton />
          </div>
        </div>

        <div className="form-nav">
          <div className="form-tabs" id="formTabs"></div>
          <button className="add-form-btn" id="addFormBtn" type="button">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 5v10M5 10h10"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </svg>
            Add Form
          </button>
        </div>

        <div className="forms-container" id="formsContainer"></div>

        <div className="submit-section">
          <button className="clear-all-btn" id="clearAllBtn" type="button">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 5l10 10M15 5l-10 10"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </svg>
            Clear All
          </button>
          <button className="submit-all-btn" id="submitAllBtn" type="button">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M16 10l-6 6-6-6"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Submit All Forms
          </button>
        </div>

        <div
          className="loading-overlay"
          id="loadingOverlay"
          style={{ display: "none" }}
        >
          <div className="spinner"></div>
          <p>Processing posts...</p>
        </div>
      </div>

      <Script src="/script.js" strategy="afterInteractive" />
    </>
  );
}
