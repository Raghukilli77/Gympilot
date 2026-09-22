/* ==========================================
   GYMPILOT - ROUTE GUARD & AUTHENTICATION
   ========================================== */

async function initAuthGuard() {
  // Use supabaseClient consistently
  const { data: { session } } = await supabaseClient.auth.getSession();
  
  // Identify current filename
  let currentPage = window.location.pathname.split("/").pop();
  if (currentPage === "") currentPage = "index.html"; // Handle root domain path

  const protectedPages = ["dashboard.html", "addform.html", "members.html"];
  const publicPages = ["index.html", "login.html", "signup.html"];

  // 1. Unauthenticated users accessing protected pages -> Redirect to Login
  if (!session && protectedPages.includes(currentPage)) {
    window.location.replace("login.html");
    return;
  }

  // 2. Authenticated users visiting public pages (Landing/Login/Signup) -> Redirect to Dashboard
  if (session && publicPages.includes(currentPage)) {
    window.location.replace("dashboard.html");
    return;
  }

  // 3. Display User Email on protected pages if element exists
  if (session && session.user) {
    const emailSpan = document.getElementById("userEmailDisplay");
    if (emailSpan) {
      emailSpan.textContent = session.user.email;
    }
  }
}

// Global handleLogout function
async function handleLogout() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    alert("Error logging out: " + error.message);
  } else {
    // Redirect unauthenticated user back to Landing Page
    window.location.replace("index.html");
  }
}

// Run auth guard check immediately on load
initAuthGuard();