console.log("members.js loaded");

let currentFilter = "all";

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split("-");
  if (parts.length !== 3) return new Date(dateStr);
  const [year, month, day] = parts.map(Number);
  return new Date(year, month - 1, day);
}

function refreshUI() {
  updatedashboard();
  renderTable();
}

function updatedashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let expiringSoon = 0;
  let expired = 0;

  const membersList = window.members || [];

  membersList.forEach((member) => {
    if (!member.doe) return;

    const doe = parseLocalDate(member.doe);
    if (!doe) return;

    const diffDays = Math.ceil((doe - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      expired++;
    } else if (diffDays <= 7) {
      expiringSoon++;
    }
  });

  const totalElem = document.getElementById("totalmembers");
  const expiringElem = document.getElementById("expiringsoon");
  const expiredElem = document.getElementById("expired");

  if (totalElem) totalElem.textContent = `Total number of Members: ${membersList.length}`;
  if (expiringElem) expiringElem.textContent = `🟡 Expiring Soon: ${expiringSoon}`;
  if (expiredElem) expiredElem.textContent = `🔴 Expired: ${expired}`;
}

function filterMembers(type) {
  currentFilter = type;
  const newUrl = `members.html?filter=${type}`;
  window.history.replaceState({}, document.title, newUrl);
  renderTable();
}

function clearFilter() {
  currentFilter = "all";
  window.history.replaceState({}, document.title, "members.html");
  renderTable();
}

// ==========================================
// PHASE 4: FETCH PAYMENTS FOR SIDE PANEL
// ==========================================
async function loadMemberPayments(memberId, memberName) {
  const paymentTableBody = document.getElementById("paymentTableBody");
  const paymentHeader = document.getElementById("paymentPanelHeader");
  const paymentSub = document.getElementById("paymentPanelSub");

  if (!paymentTableBody) return;

  if (paymentHeader) paymentHeader.textContent = `Payments: ${memberName}`;
  if (paymentSub) paymentSub.textContent = "";
  paymentTableBody.innerHTML = "<tr><td colspan='3'>Loading...</td></tr>";

  const { data: payments, error } = await supabaseClient
    .from("payments")
    .select("*")
    .eq("member_id", memberId)
    .order("payment_date", { ascending: false });

  if (error || !payments || payments.length === 0) {
    paymentTableBody.innerHTML = "<tr><td colspan='3'>No payment history found.</td></tr>";
    return;
  }

  paymentTableBody.innerHTML = "";
  payments.forEach((p) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.payment_date || ""}</td>
      <td>${p.plan_details || ""} (${p.plan_duration || "1"}M)</td>
      <td>₹${p.amount}</td>
    `;
    paymentTableBody.appendChild(row);
  });
}



function renderTable() {
  const tableBody = document.getElementById("tableBody");
  const emptyMessage = document.getElementById("emptyMessage");
  const tablehead = document.getElementById("tablehead");

  if (!tableBody) return;
  tableBody.innerHTML = "";

  const membersList = window.members || [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let displayList = membersList;
  if (currentFilter === "expired") {
    displayList = membersList.filter((m) => {
      if (!m.doe) return false;
      const doe = parseLocalDate(m.doe);
      return doe && (doe - today) < 0;
    });
  } else if (currentFilter === "expiring") {
    displayList = membersList.filter((m) => {
      if (!m.doe) return false;
      const doe = parseLocalDate(m.doe);
      if (!doe) return false;
      const diffDays = Math.ceil((doe - today) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    });
  }

  if (displayList.length === 0) {
    if (tablehead) tablehead.hidden = true;
    if (emptyMessage) emptyMessage.textContent = "No members found for this view.";
    return;
  } else {
    if (tablehead) tablehead.hidden = false;
    if (emptyMessage) emptyMessage.textContent = "";
  }

  displayList.forEach((member) => {
    const row = document.createElement("tr");

    if (member.status === "Inactive") {
      row.classList.add("inactive-row");
    }

    // Single click loads payment history into side panel
    row.onclick = (e) => {
      if (e.target.tagName !== "BUTTON") {
        loadMemberPayments(member.id, member.name);
      }
    };

    // Double-click toggles status
      // Double-click toggles status
    row.ondblclick = async () => {
      const current = member.status || "Active";
      const target = current === "Active" ? "Inactive" : "Active";

      const confirmed = await window.confirm(
        `Mark ${member.name} as ${target}?`
      );

      if (!confirmed) {
        return;
      }

      await toggleStatus(member.id, current);
    };

    let daysLeft = "";
    let dateStatus = "";
    let diffDays = null; // 1. Calculated diffDays initialized here

    if (member.doe) {
      const doe = parseLocalDate(member.doe);
      if (doe) {
        diffDays = Math.ceil((doe - today) / (1000 * 60 * 60 * 24));
        daysLeft = diffDays;

        if (diffDays < 0) {
          dateStatus = "🔴 Expired";
        } else if (diffDays <= 7) {
          dateStatus = "🟡 Expiring Soon";
        } else {
          dateStatus = "🟢 Active";
        }
      }
    }

    const ribbonStatus = member.status || "Active";
    const ribbonClass = ribbonStatus === "Inactive" ? "inactive" : "active";

    row.innerHTML = `
      <td class="name-cell-relative">
        <div class="status-ribbon ${ribbonClass}">${ribbonStatus}</div>
        ${escapeHTML(member.name)}
      </td>
      <td>${escapeHTML(member.phone)}</td>
      <td>${escapeHTML(member.doj)}</td>
      <td>${escapeHTML(member.doe)}</td>
      <td>${daysLeft}</td>
      <td>${dateStatus}</td>
      <td class="action-cells"></td>
    `;

    // 2. Query actionTd AFTER innerHTML is populated
    const actionTd = row.querySelector(".action-cells");

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.type = "button";
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      editMember(member.id);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.type = "button";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteMember(member.id);
    });

    const callBtn = document.createElement("button");
    callBtn.textContent = "📞 Call";
    callBtn.type = "button";
    callBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      callMember(member.phone);
    });

    // actionTd.appendChild(editBtn);
    // actionTd.appendChild(deleteBtn);
    // actionTd.appendChild(callBtn);
    // NEW CODE: Vertical Dropdown Action Menu
// Render Green Vertical Dots & Clean White Popup Menu (with Pay & Payment History)
actionTd.innerHTML = `
  <div class="action-dropdown">
    <button class="btn-dots" type="button">⋮</button>
    <div class="action-menu">
      <button class="menu-item pay-opt" type="button">
        <span class="icon">💳</span> <span class="label-pay">Pay</span>
      </button>
      <button class="menu-item history-opt" type="button">
        <span class="icon">📜</span> <span class="label-history">Payment History</span>
      </button>
      <button class="menu-item edit-opt" type="button">
        <span class="icon">✏️</span> <span class="label-edit">Edit</span>
      </button>
      <button class="menu-item delete-opt" type="button">
        <span class="icon">🗑️</span> <span class="label-delete">Delete</span>
      </button>
      <button class="menu-item call-opt" type="button">
        <span class="icon">📞</span> <span class="label-call">Call</span>
      </button>
    </div>
  </div>
`;

const dotsBtn = actionTd.querySelector(".btn-dots");
const menuDropdown = actionTd.querySelector(".action-menu");

// Toggle dropdown visibility
dotsBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  document.querySelectorAll(".action-menu").forEach((m) => {
    if (m !== menuDropdown) m.style.display = "none";
  });
  menuDropdown.style.display = menuDropdown.style.display === "flex" ? "none" : "flex";
});

// 1. Pay Option (Loads side history panel AND opens Add Payment modal)
actionTd.querySelector(".pay-opt").addEventListener("click", (e) => {
  e.stopPropagation();
  menuDropdown.style.display = "none";

  if (typeof loadMemberPayments === "function") {
    loadMemberPayments(member.id, member.name);
  }

  if (typeof openAddPaymentModal === "function") {
    openAddPaymentModal(member);
  }
});

// 2. Payment History Option (Loads side panel & smoothly scrolls to it WITHOUT opening Add Payment modal)
actionTd.querySelector(".history-opt").addEventListener("click", (e) => {
  e.stopPropagation();
  menuDropdown.style.display = "none";

  if (typeof loadMemberPayments === "function") {
    loadMemberPayments(member.id, member.name);
  }

  // Smooth scroll to side panel on mobile/small screens
  const paymentTableBody = document.getElementById("paymentTableBody");
  if (paymentTableBody) {
    paymentTableBody.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});

// 3. Edit Option
actionTd.querySelector(".edit-opt").addEventListener("click", (e) => {
  e.stopPropagation();
  menuDropdown.style.display = "none";
  editMember(member.id);
});

// 4. Delete Option
actionTd.querySelector(".delete-opt").addEventListener("click", (e) => {
  e.stopPropagation();
  menuDropdown.style.display = "none";
  deleteMember(member.id);
});

// 5. Call Option
actionTd.querySelector(".call-opt").addEventListener("click", (e) => {
  e.stopPropagation();
  menuDropdown.style.display = "none";
  callMember(member.phone);
});
    // 3. NOW call renderWhatsAppButton after actionTd & diffDays exist!
    if (typeof renderWhatsAppButton === "function") {
      renderWhatsAppButton(member, actionTd, diffDays);
    }

    tableBody.appendChild(row);
  });
}

function callMember(phone) {
  if (phone) {
    window.location.href = `tel:${phone}`;
  }
}

function editMember(id) {
  window.location.replace(`addform.html?id=${id}`);
}

async function toggleStatus(id, currentStatus) {
  const newStatus = currentStatus === "Inactive" ? "Active" : "Inactive";
  
  const { error } = await supabaseClient
    .from("members")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) {
    console.error("Status update error:", error);
    alert("Failed to update status!");
    return;
  }

  if (typeof loadMembers === "function") {
    await loadMembers();
  }
  refreshUI();
}

async function deleteMember(id) {
  const confirmed = await window.confirm(
    "Are you sure you want to delete this member?"
  );

  if (!confirmed) {
    return;
  }

  const { error } = await supabaseClient
    .from("members")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete error:", error);
    await window.alert("Failed to delete member!");
    return;
  }

  await window.alert("Member deleted successfully!");

  if (typeof loadMembers === "function") {
    await loadMembers();
  }

  refreshUI();
}

document.addEventListener("DOMContentLoaded", async () => {
  if (typeof loadMembers === "function") {
    await loadMembers();
  }

  const urlParams = new URLSearchParams(window.location.search);
  const filterParam = urlParams.get("filter");
  currentFilter = filterParam ? filterParam : "all";

  refreshUI();
  
  if (typeof setupRealtimeListener === "function") {
    setupRealtimeListener(refreshUI);
  }
});

// Example function when updating member expiry date
async function renewMember(memberId, newExpiryDate) {
  const { data, error } = await supabase
    .from("members")
    .update({
      doe: newExpiryDate,
      reminder_sent: false // Resets the flag so future reminders work
    })
    .eq("id", memberId);

  if (error) {
    console.error("Error renewing member:", error);
  } else {
    alert("Membership renewed successfully!");
    location.reload();
  }
}
// Close action menus when clicking outside
document.addEventListener("click", () => {
  document.querySelectorAll(".action-menu").forEach((menu) => {
    menu.style.display = "none";
  });
});

