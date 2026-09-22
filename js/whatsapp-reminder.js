/**
 * GymPilot WhatsApp Reminder Module
 */

// Helper to open native WhatsApp Web/App pre-filled with reminder text
function sendWhatsAppDirect(phone, name, doe) {
  if (!phone) {
    alert("Phone number not available!");
    return;
  }

  // Format phone number with country code (+91 for India)
  let cleanPhone = phone.trim().replace("+", "").replace(/\s+/g, "");
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }

  const message = encodeURIComponent(
    `Arre ${name}! GymPilot ends ${doe}. Your biceps said they aren't done growing yet! 🦾 Renew now bro!`
  );

  // Opens WhatsApp link directly in a new tab
  window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
}

// Function to attach the WhatsApp button to a member row if expiring in 0-3 days
function renderWhatsAppButton(member, actionTd, diffDays) {
  if (diffDays >= 0 && diffDays <= 3) {
    const whatsappBtn = document.createElement("button");
    whatsappBtn.textContent = "📲 Remind";
    whatsappBtn.type = "button";
    
    // Emerald / WhatsApp Green styling matching Hydra theme
    whatsappBtn.style.backgroundColor = "#25D366";
    whatsappBtn.style.color = "#ffffff";
    whatsappBtn.style.border = "none";
    whatsappBtn.style.borderRadius = "6px";
    whatsappBtn.style.padding = "0.35rem 0.75rem";
    whatsappBtn.style.cursor = "pointer";
    whatsappBtn.style.fontWeight = "600";
    whatsappBtn.style.marginLeft = "0.5rem";

    whatsappBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      sendWhatsAppDirect(member.phone, member.name, member.doe);
    });

    actionTd.appendChild(whatsappBtn);
  }
}