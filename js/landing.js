/* ==========================================
   GYMPILOT - LANDING PAGE INTERACTION LOGIC
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
  initSmoothScroll();
});


/**
 * Handles smooth scrolling when clicking "Watch Demo 🎥"
 */
function initSmoothScroll() {
  const demoBtn = document.querySelector('a[href="#demo"]');
  const demoSection = document.getElementById("demo");

  if (demoBtn && demoSection) {
    demoBtn.addEventListener("click", (e) => {
      e.preventDefault();
      demoSection.scrollIntoView({ behavior: "smooth" });
      
      // Auto-play demo video when scrolled into view
      const demoVideo = document.getElementById("demoVideo");
      if (demoVideo) {
        demoVideo.play().catch(() => {
          // Autoplay policy fallback
          console.log("Autoplay prevented by browser.");
        });
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");

    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // FormData automatically includes the hidden access_key input from HTML
        const formData = new FormData(form);
        const originalText = submitBtn.textContent;

        submitBtn.textContent = "Sending...";
        submitBtn.disabled = true;

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                alert("Success! Your message has been sent to the developer.");
                form.reset();
            } else {
                alert("Error: " + (data.message || "Failed to send message."));
            }

        } catch (error) {
            alert("Something went wrong. Please check your internet connection.");
            console.error("Contact Form Error:", error);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
});