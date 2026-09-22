// let selectedMemberForPay = null;

// Open payment modal and pre-fill details
function openAddPaymentModal(member) {
  selectedMemberForPay = member;

  const memberIdInput = document.getElementById("payModalMemberId");
  const memberNameElem = document.getElementById("payModalMemberName");
  const currentExpiryElem = document.getElementById("payModalCurrentExpiry");
  const amountInput = document.getElementById("payModalAmount");
  const durationInput = document.getElementById("payModalDuration");
  const extendCheckbox = document.getElementById("payModalExtendCheckbox");
  const extensionContainer = document.getElementById("extensionFieldsContainer");

  if (memberIdInput) memberIdInput.value = member.id;
  if (memberNameElem) memberNameElem.textContent = member.name;
  if (currentExpiryElem) currentExpiryElem.textContent = member.doe || "N/A";
  if (amountInput) amountInput.value = "";
  if (durationInput) durationInput.value = member.planduration || 1;
  if (extendCheckbox) extendCheckbox.checked = true;
  if (extensionContainer) extensionContainer.style.display = "block";

  recalculateNewExpiry();
  resetModalPosition();

  const modal = document.getElementById("addPaymentModal");
  if (modal) modal.style.display = "flex";
}

// Close payment modal
function closeAddPaymentModal() {
  const modal = document.getElementById("addPaymentModal");
  if (modal) modal.style.display = "none";
  selectedMemberForPay = null;
}

// Toggle duration inputs visibility
function toggleExtensionFields(isChecked) {
  const container = document.getElementById("extensionFieldsContainer");
  if (container) container.style.display = isChecked ? "block" : "none";
}

// Calculates expiry date
function recalculateNewExpiry() {
  if (!selectedMemberForPay || !selectedMemberForPay.doe) return;

  const durationInput = document.getElementById("payModalDuration");
  const monthsToAdd = parseInt(durationInput ? durationInput.value : 1, 10) || 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentDoe = typeof parseLocalDate === "function" 
    ? parseLocalDate(selectedMemberForPay.doe) 
    : new Date(selectedMemberForPay.doe);

  let baseDate = (currentDoe && currentDoe < today) ? new Date(today) : new Date(currentDoe);
  baseDate.setMonth(baseDate.getMonth() + monthsToAdd);

  const newDoeStr = baseDate.toISOString().split("T")[0];
  const previewElem = document.getElementById("payModalNewExpiry");
  if (previewElem) previewElem.textContent = newDoeStr;

  return newDoeStr;
}

// Robust, Screen-Bounded Draggable Handler
function makeModalDraggable() {
  const modalCard = document.querySelector(".payment-modal-card");
  const dragHandle = document.querySelector(".drag-handle");

  if (!modalCard || !dragHandle) return;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;

  dragHandle.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("close-btn")) return;

    isDragging = true;
    dragHandle.style.cursor = "grabbing";

    const rect = modalCard.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    initialLeft = rect.left;
    initialTop = rect.top;

    modalCard.style.position = "fixed";
    modalCard.style.margin = "0";
    modalCard.style.left = `${initialLeft}px`;
    modalCard.style.top = `${initialTop}px`;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let newX = initialLeft + dx;
    let newY = initialTop + dy;

    // Viewport Boundary Constraints (Prevents sliding out of screen)
    const maxWidth = window.innerWidth - modalCard.offsetWidth;
    const maxHeight = window.innerHeight - modalCard.offsetHeight;

    newX = Math.max(10, Math.min(newX, maxWidth - 10));
    newY = Math.max(10, Math.min(newY, maxHeight - 10));

    modalCard.style.left = `${newX}px`;
    modalCard.style.top = `${newY}px`;
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      dragHandle.style.cursor = "grab";
    }
  });
}

// Reset position to default center-right when opening modal
function resetModalPosition() {
  const modalCard = document.querySelector(".payment-modal-card");
  if (modalCard) {
    modalCard.style.position = "fixed";
    modalCard.style.top = "100px";
    modalCard.style.right = "40px";
    modalCard.style.left = "auto";
    modalCard.style.margin = "0";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  makeModalDraggable();

  const paymentForm = document.getElementById("addPaymentForm");
  if (!paymentForm) return;

  paymentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const memberId = document.getElementById("payModalMemberId")?.value;
    const amount = parseFloat(document.getElementById("payModalAmount")?.value);
    const payMethod = document.querySelector('input[name="payMethod"]:checked')?.value || "Cash";
    const shouldExtend = document.getElementById("payModalExtendCheckbox")?.checked;
    const durationMonths = document.getElementById("payModalDuration")?.value;

    if (!amount || amount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    const saveBtn = document.getElementById("savePayBtn");
    if (saveBtn) saveBtn.disabled = true;

    try {
      const todayStr = new Date().toISOString().split("T")[0];

      const { error: payError } = await supabaseClient
        .from("payments")
        .insert([
          {
            member_id: memberId,
            amount: amount,
            payment_date: todayStr,
            plan_details: `${selectedMemberForPay?.plandetails || "Standard"} (${payMethod})`,
            plan_duration: shouldExtend ? `${durationMonths} Month(s)` : "Partial"
          }
        ]);

      if (payError) {
        alert("Error saving payment: " + payError.message);
        if (saveBtn) saveBtn.disabled = false;
        return;
      }

      if (shouldExtend) {
        const newDoe = recalculateNewExpiry();
        const { error: memberError } = await supabaseClient
          .from("members")
          .update({
            doe: newDoe,
            status: "Active",
            reminder_sent: false
          })
          .eq("id", memberId);

        if (memberError) {
          alert("Payment logged, but failed to extend expiry date: " + memberError.message);
        }
      }

      alert("Payment recorded successfully!");
      closeAddPaymentModal();

      if (typeof loadMembers === "function") await loadMembers();
      if (typeof refreshUI === "function") refreshUI();
      if (typeof loadMemberPayments === "function") {
        loadMemberPayments(memberId, selectedMemberForPay.name);
      }

    } catch (err) {
      console.error("Payment submission error:", err);
    } finally {
      if (saveBtn) saveBtn.disabled = false;
    }
  });
});