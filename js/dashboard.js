
/**
 * GymPilot - Dashboard Controller (dashboard.js)
 */

// Helper: Escape HTML special characters to prevent DOM XSS attacks
function escapeHTML(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Helper: Parse local YYYY-MM-DD dates without UTC timezone shifts
function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  
  // Clean off any timestamp component (e.g., 'YYYY-MM-DDTHH:MM:SS')
  const cleanStr = String(dateStr).split("T")[0];
  const parts = cleanStr.split("-");
  
  if (parts.length === 3) {
    const [year, month, day] = parts.map(Number);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month - 1, day);
    }
  }
  
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

document.addEventListener("DOMContentLoaded", () => {
  const addmemberbtn = document.getElementById("addmember");
  const managebtn = document.getElementById("managesubscription");
  const viewmaintablebtn = document.getElementById("maintable");
  const searchTable = document.getElementById("searchTable");
  const searchcontent = document.getElementById("searchcontent");

  if (addmemberbtn) {
    addmemberbtn.addEventListener("click", () => {
      window.location.href = "addform.html";
    });
  }

  if (managebtn) {
    managebtn.addEventListener("click", () => {
      window.location.href = "members.html";
    });
  }

  if (viewmaintablebtn) {
    viewmaintablebtn.addEventListener("click", () => {
      window.location.href = "members.html";
    });
  }

  if (searchTable) {
    searchTable.hidden = true;
  }

  if (searchcontent) {
    searchcontent.addEventListener("input", handleSearch);
  }

  initDashboard();
});

// Initialize dashboard data and alerts with error boundary handling
async function initDashboard() {
  const messagebox = document.getElementById("messagebox");
  try {
    if (typeof loadMembers === "function") {
      await loadMembers();
    } else {
      console.warn("loadMembers() function is not defined globally.");
    }
    showAlerts();
  } catch (error) {
    console.error("Failed to initialize dashboard:", error);
    if (messagebox) {
      messagebox.textContent = "⚠️ Error loading member data. Please refresh the page.";
    }
  }
}

// Display active alerts for expired and expiring memberships
function showAlerts() {
  const messagebox = document.getElementById("messagebox");
  if (!messagebox) return;

  const membersList = window.members || [];
  const alerts = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  membersList.forEach((member) => {
    if (!member.doe) return;

    const doe = parseLocalDate(member.doe);
    if (!doe) return;

    doe.setHours(0, 0, 0, 0);

    const diffTime = doe - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const safeName = escapeHTML(member.name);

    if (diffDays < 0) {
      alerts.push(`🔴 <strong>${safeName}</strong> - Expired (${Math.abs(diffDays)} days ago)`);
    } else if (diffDays <= 7) {
      alerts.push(`🟠 <strong>${safeName}</strong> - Expiring in ${diffDays} days`);
    }
  });

  if (membersList.length === 0) {
    messagebox.textContent = "No Members Found. Add your first member.";
  } else if (alerts.length === 0) {
    messagebox.textContent = "✅ No alerts. All members are active.";
  } else {
    messagebox.innerHTML = alerts.join("<br>");
  }
}

// Handle real-time member search and status rendering
function handleSearch() {
  const searchcontent = document.getElementById("searchcontent");
  const searchTable = document.getElementById("searchTable");
  const searchTableBody = document.getElementById("searchTableBody");
  const searchMessage = document.getElementById("searchMessage");

  if (!searchcontent || !searchTable || !searchTableBody || !searchMessage) return;

  const query = searchcontent.value.trim().toLowerCase();
  const membersList = window.members || [];

  searchTableBody.innerHTML = "";
  searchMessage.textContent = "";

  if (!query) {
    searchTable.hidden = true;
    return;
  }

  const results = membersList.filter(member =>
    (member.name || "").toLowerCase().includes(query) ||
    (member.phone || "").toLowerCase().includes(query)
  );

  if (results.length === 0) {
    searchTable.hidden = true;
    searchMessage.textContent = "No members found.";
    return;
  }

  searchTable.hidden = false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  results.forEach((member) => {
    const serialNumber = membersList.findIndex(s => s.id === member.id) + 1;
    let status = "N/A";
    let daysLeft = "N/A";

    if (member.doe) {
      const doe = parseLocalDate(member.doe);
      if (doe) {
        doe.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((doe - today) / (1000 * 60 * 60 * 24));
        daysLeft = diffDays;

        if (diffDays < 0) {
          status = "🔴 Expired";
        } else if (diffDays <= 7) {
          status = "🟡 Expiring Soon";
        } else {
          status = "🟢 Active";
        }
      }
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${serialNumber}</td>
      <td>${escapeHTML(member.name)}</td>
      <td>${escapeHTML(member.phone)}</td>
      <td>${escapeHTML(member.plandetails)}</td>
      <td>${escapeHTML(member.planduration)}</td>
      <td>${daysLeft}</td>
      <td>${status}</td>
    `;
    searchTableBody.appendChild(row);
  });
}