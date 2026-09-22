/* ==========================================
   GYMPILOT - GLOBAL BRANDED ALERT & CONFIRM OVERRIDE
   ========================================== */

(function () {
  // 1. Inject Theme Styles into <head>
  const alertStyles = `
    .custom-alert-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.82);
      backdrop-filter: blur(8px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 99999;
    }
    .custom-alert-overlay.hidden {
      display: none !important;
    }
    .custom-alert-box {
      background: #111f15;
      border: 1.5px solid #22c55e;
      border-radius: 16px;
      padding: 2rem;
      width: 90%;
      max-width: 390px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.95), 0 0 35px rgba(34, 197, 94, 0.3);
      animation: modalPop 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .custom-alert-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .alert-logo {
      height: 32px;
      width: auto;
    }
    .custom-alert-header h3 {
      font-family: 'Orbitron', sans-serif;
      color: #22c55e;
      letter-spacing: 1.5px;
      font-size: 1.2rem;
      margin: 0;
    }
    .custom-alert-box p {
      color: #ffffff;
      font-family: 'Poppins', sans-serif;
      font-size: 0.95rem;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }
    .custom-alert-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
    }
    .btn-modal-ok {
      background: #22c55e;
      color: #070d09;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      font-family: 'Orbitron', sans-serif;
      font-weight: 700;
      cursor: pointer;
      width: 100%;
      transition: all 0.2s ease;
    }
    .btn-modal-ok:hover {
      background: #16a34a;
      box-shadow: 0 0 15px rgba(34, 197, 94, 0.5);
    }
    .btn-modal-danger {
      background: #ef4444;
      color: #ffffff;
      border: none;
      padding: 0.75rem 1.25rem;
      border-radius: 10px;
      font-family: 'Orbitron', sans-serif;
      font-weight: 700;
      cursor: pointer;
      flex: 1;
      transition: all 0.2s ease;
    }
    .btn-modal-danger:hover {
      background: #dc2626;
      box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
    }
    .btn-modal-cancel {
      background: transparent;
      color: #ffffff;
      border: 1.5px solid #1e3a27;
      padding: 0.75rem 1.25rem;
      border-radius: 10px;
      font-family: 'Orbitron', sans-serif;
      font-weight: 600;
      cursor: pointer;
      flex: 1;
      transition: all 0.2s ease;
    }
    .btn-modal-cancel:hover {
      background: rgba(255, 255, 255, 0.08);
    }
    @keyframes modalPop {
      0% { transform: scale(0.85); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    /* ==========================================
       MEDIA QUERIES FOR MOBILE & TABLETS
       ========================================== */

    /* Small Tablets and Large Mobile Devices (<= 600px) */
    @media (max-width: 600px) {
      .custom-alert-box {
        width: 88%;
        max-width: 340px;
        padding: 1.5rem 1.25rem;
        border-radius: 14px;
      }

      .custom-alert-header {
        gap: 0.5rem;
        margin-bottom: 0.85rem;
      }

      .alert-logo {
        height: 26px;
      }

      .custom-alert-header h3 {
        font-size: 1.05rem;
        letter-spacing: 1.2px;
      }

      .custom-alert-box p {
        font-size: 0.88rem;
        margin-bottom: 1.25rem;
      }

      .custom-alert-actions {
        gap: 0.5rem;
      }

      .btn-modal-ok,
      .btn-modal-danger,
      .btn-modal-cancel {
        padding: 0.65rem 1rem;
        font-size: 0.85rem;
        border-radius: 8px;
      }
    }

    /* Small Mobile Devices (<= 380px) */
    @media (max-width: 380px) {
      .custom-alert-box {
        width: 92%;
        padding: 1.25rem 1rem;
      }

      .custom-alert-actions {
        flex-direction: column-reverse; /* Stacks Cancel below Confirm/OK on ultra-narrow screens */
      }

      .btn-modal-ok,
      .btn-modal-danger,
      .btn-modal-cancel {
        width: 100%;
      }
    }
  `;

  const styleNode = document.createElement("style");
  styleNode.textContent = alertStyles;
  document.head.appendChild(styleNode);

  // 2. Inject Modal Structure into <body>
  function injectModalHTML() {
    if (!document.getElementById("customAlertOverlay")) {
      const modalHTML = `
        <div id="customAlertOverlay" class="custom-alert-overlay hidden">
            <div class="custom-alert-box">
                <div class="custom-alert-header">
                    <img src="./assets/logo.png" alt="GymPilot Logo" class="alert-logo">
                    <h3>GYMPILOT</h3>
                </div>
                <p id="customAlertText">Notification</p>
                <div id="customAlertContainer" class="custom-alert-actions">
                    <button id="customAlertOkBtn" class="btn-modal-ok">OK</button>
                </div>
            </div>
        </div>
      `;
      document.body.insertAdjacentHTML("beforeend", modalHTML);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectModalHTML);
  } else {
    injectModalHTML();
  }
})();
/**
 * GLOBAL OVERRIDE: window.alert
 */
window.alert = function (message) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("customAlertOverlay");
    const textElem = document.getElementById("customAlertText");
    const actionContainer = document.getElementById("customAlertContainer");

    if (!overlay || !textElem || !actionContainer) {
      console.log("Alert:", message);
      resolve();
      return;
    }

    textElem.textContent = message;

    actionContainer.innerHTML = `
      <button id="customAlertOkBtn" class="btn-modal-ok">
        OK
      </button>
    `;

    overlay.classList.remove("hidden");

    document.getElementById("customAlertOkBtn").onclick = function () {
      overlay.classList.add("hidden");
      resolve();
    };
  });
};


/**
 * GLOBAL OVERRIDE: window.confirm
 */
window.confirm = function (message) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("customAlertOverlay");
    const textElem = document.getElementById("customAlertText");
    const actionContainer = document.getElementById("customAlertContainer");

    if (!overlay || !textElem || !actionContainer) {
      resolve(false);
      return;
    }

    textElem.textContent = message;

    actionContainer.innerHTML = `
      <button id="customConfirmCancelBtn" class="btn-modal-cancel">
        Cancel
      </button>

      <button id="customConfirmOkBtn" class="btn-modal-danger">
        Confirm
      </button>
    `;

    overlay.classList.remove("hidden");

    document.getElementById("customConfirmOkBtn").onclick = function () {
      overlay.classList.add("hidden");
      resolve(true);
    };

    document.getElementById("customConfirmCancelBtn").onclick = function () {
      overlay.classList.add("hidden");
      resolve(false);
    };
  });
};
