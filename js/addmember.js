const addBtn = document.getElementById("addBtn");
const updateBtn = document.getElementById("updateBtn");
const resetBtn = document.getElementById("resetBtn");

const memberName = document.getElementById("memberName");
const phoneNumber = document.getElementById("Phonenumber");
const dojField = document.getElementById("doj");

const paymentModal = document.getElementById("paymentModal");
const paymentAmountInput = document.getElementById("paymentAmount");
const confirmPaymentBtn = document.getElementById("confirmPaymentBtn");
const cancelPaymentBtn = document.getElementById("cancelPaymentBtn");

let pendingMemberData = null;
let isEditMode = false;
let currentEditId = null;

function clearForm() {
  memberName.value = "";
  phoneNumber.value = "";
  dojField.value = "";
  document.querySelectorAll('input[name="planDetails"]').forEach((r) => (r.checked = false));
  document.querySelectorAll('input[name="planDuration"]').forEach((r) => (r.checked = false));
}

function togetdoe(doj, planDuration) {
  if (!doj || !planDuration) return "";
  const startDate = new Date(doj);
  if (isNaN(startDate.getTime())) {
    console.error("Invalid start date provided:", doj);
    return "";
  }
  const monthsToAdd = parseInt(planDuration, 10) || 1;
  startDate.setMonth(startDate.getMonth() + monthsToAdd);
  return startDate.toISOString().split("T")[0];
}

function resetModalButtons() {
  confirmPaymentBtn.disabled = false;
  confirmPaymentBtn.style.opacity = "1";
  cancelPaymentBtn.disabled = false;
  const msg = document.getElementById("modalLoadingMsg");
  if (msg) msg.style.display = "none";
}

// ==========================================
// FORM INITIALIZATION (EDIT MODE PRE-FILL)
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get("id");

  if (editId) {
    isEditMode = true;
    currentEditId = editId;

    const { data: member, error } = await supabaseClient
      .from("members")
      .select("*")
      .eq("id", editId)
      .single();

    if (error || !member) {
      console.error("Error loading member details:", error);
      alert("Could not load member details!");
      window.location.href = "members.html";
      return;
    }

    // Pre-fill form fields
    memberName.value = member.name || "";
    phoneNumber.value = member.phone || "";
    dojField.value = member.doj || "";

    document.querySelectorAll('input[name="planDetails"]').forEach((r) => {
      if (r.value === member.plandetails) r.checked = true;
    });

    document.querySelectorAll('input[name="planDuration"]').forEach((r) => {
      if (r.value === member.planduration) r.checked = true;
    });

    // Toggle button views
    addBtn.hidden = true;
    updateBtn.hidden = false;
  }
});

// ==========================================
// PHASE 2: ADD MEMBER ACTION
// ==========================================

addBtn.addEventListener("click", (event) => {
  event.preventDefault();

  const name = memberName.value.trim();
  const phone = phoneNumber.value.trim();
  const planDetails = document.querySelector('input[name="planDetails"]:checked');
  const planDuration = document.querySelector('input[name="planDuration"]:checked');
  const doj = dojField.value.trim();

  if (!name || !phone || !planDetails || !planDuration || !doj) {
    alert("Please fill in all member fields!");
    return;
  }
  if (!/^[0-9]{10}$/.test(phone)) {
    alert("Please enter a valid 10-digit phone number!");
    phoneNumber.focus();
    return;
  }

  const doe = togetdoe(doj, planDuration.value);

  pendingMemberData = {
    name: name,
    phone: phone,
    plandetails: planDetails.value,
    planduration: planDuration.value,
    doj: doj,
    doe: doe,
    status: "Active"
  };

  document.getElementById("modalTitle").textContent = "Collect Payment";
  document.getElementById("modalSubtitle").textContent = "Enter initial payment details for this member.";

  paymentAmountInput.value = "";
  paymentModal.style.display = "flex";
  paymentAmountInput.focus();
});

// ==========================================
// PHASE 3: EDIT / RENEW MEMBER ACTION
// ==========================================

  updateBtn.addEventListener("click", async (event) => {
    event.preventDefault();

    const name = memberName.value.trim();
    const phone = phoneNumber.value.trim();
    const planDetails = document.querySelector('input[name="planDetails"]:checked');
    const planDuration = document.querySelector('input[name="planDuration"]:checked');
    const doj = dojField.value.trim();

    // 1. Validate required fields
    if (!name || !phone || !planDetails || !planDuration || !doj) {
      alert("Please fill in all fields!");
      return;
    }

    // 2. Validate phone number format
    if (!/^[0-9]{10}$/.test(phone)) {
      alert("Please enter a valid 10-digit phone number!");
      phoneNumber.focus();
      return;
    }

    // 3. Calculate Date of Expiry (DOE)
    const doe = togetdoe(doj, planDuration.value);

    // 4. Construct updated member payload
    const updatedMemberData = {
      name: name,
      phone: phone,
      plandetails: planDetails.value,
      planduration: planDuration.value,
      doj: doj,
      doe: doe,
      status: "Active"
    };

    try {
      // 5. Direct update to Supabase without opening any payment modal
      const { error } = await supabaseClient
        .from("members")
        .update(updatedMemberData)
        .eq("id", currentEditId);

      if (error) {
        alert("Failed to update member: " + error.message);
        return;
      }

      alert("Member details updated successfully!");

      // 6. Reset UI buttons and redirect
      clearForm();
      if (addBtn) addBtn.hidden = false;
      if (updateBtn) updateBtn.hidden = true;
      currentEditId = null;

      window.location.replace("members.html");
    } catch (err) {
      console.error("Error updating member:", err);
      alert("An unexpected error occurred while updating the member.");
    }
  });


// ==========================================
// UNIFIED MODAL PAYMENT CONFIRMATION
// ==========================================

confirmPaymentBtn.addEventListener("click", async () => {

    let amount = paymentAmountInput.value.trim();

    // Empty amount = no payment
    if (amount === "") {
        amount = "0";
    }

    if (isNaN(amount) || Number(amount) < 0) {
        alert("Please enter a valid amount!");
        return;
    }

    const loadingMsg = document.getElementById("modalLoadingMsg");

    confirmPaymentBtn.disabled = true;
    cancelPaymentBtn.disabled = true;

    if (loadingMsg) {
        loadingMsg.style.display = "block";
        loadingMsg.textContent = "⏳ Saving member...";
    }

    try {

        // ==========================================
        // 1. GET LOGGED-IN USER
        // ==========================================

        const { data: userData, error: userError } =
            await supabaseClient.auth.getUser();

        if (userError || !userData.user) {
            alert("Please log in first!");
            window.location.replace("login.html");
            return;
        }


        // ==========================================
        // 2. INSERT MEMBER
        // ==========================================

        const { data: insertedMember, error: memberError } =
            await supabaseClient
                .from("members")
                .insert([
                    {
                        owner_id: userData.user.id,
                        ...pendingMemberData
                    }
                ])
                .select()
                .single();

        if (memberError) {
            console.error("Member insert error:", memberError);

            alert(
                "Failed to add member: " +
                memberError.message
            );

            resetModalButtons();
            return;
        }


        // ==========================================
        // 3. OPTIONAL INITIAL PAYMENT
        // ==========================================

        if (Number(amount) > 0) {

            const { error: paymentError } =
                await supabaseClient
                    .from("payments")
                    .insert([
                        {
                            member_id: insertedMember.id,
                            amount: Number(amount),
                            payment_date: pendingMemberData.doj,
                            plan_details: pendingMemberData.plandetails,
                            plan_duration: pendingMemberData.planduration
                        }
                    ]);

            if (paymentError) {

                console.error(
                    "Payment insert error:",
                    paymentError
                );

                alert(
                    "Member added successfully, but initial payment could not be recorded."
                );
            }
        }


        // ==========================================
        // 4. FINISH
        // ==========================================

        if (loadingMsg) {
            loadingMsg.textContent =
                "✅ Member saved successfully!";
        }

        setTimeout(() => {

            paymentModal.style.display = "none";

            pendingMemberData = null;

            clearForm();

            window.location.replace("members.html");

        }, 800);

    } catch (err) {

        console.error("Unexpected error:", err);

        alert("An error occurred while saving the member.");

        resetModalButtons();
    }
});

// Cancel Modal Handler
cancelPaymentBtn.addEventListener("click", () => {
  paymentModal.style.display = "none";
  pendingMemberData = null;
  resetModalButtons();
});

// Reset Button Handler
resetBtn.addEventListener("click", () => {
  clearForm();
});