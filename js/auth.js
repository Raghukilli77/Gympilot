// Inside js/auth.js
const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();
    const submitBtn = signupForm.querySelector("button");

    submitBtn.disabled = true;
    submitBtn.textContent = "Creating Account...";

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: "https://raghukilli77.github.io/GymPilot/login.html"
        }
      });

      if (error) {
        alert("Registration failed: " + error.message);
        console.error("SignUp Error:", error);
      } else {
        signupForm.reset();
        
        // Clear, explicit instructions for the user
        alert(
          "📩 VERIFICATION EMAIL SENT!\n\n" +
          "We sent a confirmation link to: " + email + "\n\n" +
          "1. Open your Gmail inbox.\n" +
          "2. Click the verification link to activate your GymPilot account.\n" +
          "3. Return here to log in!"
        );
        
        // Open Gmail in a new tab for quick access
        window.open("https://mail.google.com", "_blank");
        
        // Redirect current tab to login page
        window.location.href = "login.html";
      }
    } catch (err) {
      console.error("Unexpected Error:", err);
      alert("An unexpected error occurred. Check browser console.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign Up";
    }
  });
}

// // Inside js/auth.js
// const signupForm = document.getElementById("signupForm");

// if (signupForm) {
//   signupForm.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     const email = document.getElementById("signupEmail").value.trim();
//     const password = document.getElementById("signupPassword").value.trim();
//     const submitBtn = signupForm.querySelector("button");

//     // Show loading state so user knows it's working
//     submitBtn.disabled = true;
//     submitBtn.textContent = "Creating Account...";

//     try {
//       const { data, error } = await supabaseClient.auth.signUp({
//         email: email,
//         password: password,
//       });

//       if (error) {
//         alert("Registration failed: " + error.message);
//         console.error("SignUp Error:", error);
//       } else {
//         alert("Account created successfully! Please log in.");
//         window.location.href = "dashboard.html";
//       }
//     } catch (err) {
//       console.error("Unexpected Error:", err);
//       alert("An unexpected error occurred. Check browser console.");
//     } finally {
//       submitBtn.disabled = false;
//       submitBtn.textContent = "Sign Up";
//     }
//   });
// }
// Handle Owner Login


const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Matched with HTML IDs "email" and "password"
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      alert("Login failed: " + error.message);
    } else {
      // Successfully logged in -> redirect to main dashboard
      window.location.replace("dashboard.html");
    }
  });
}
// In auth.js during logout
async function handleLogout() {
  if (window.realtimeChannel) {
    await supabase.removeChannel(window.realtimeChannel);
    window.realtimeChannel = null;
  }
  await supabase.auth.signOut();
  window.location.href = "login.html";
}