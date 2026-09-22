document.addEventListener("DOMContentLoaded", async () => {
    // 1. Verify User Session
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !userData.user) {
        alert("Please log in first!");
        window.location.replace("login.html");
        return;
    }

    // 2. Fetch Payments for Monthly Revenue Line Chart
    const { data: payments, error: paymentError } = await supabaseClient
        .from("payments")
        .select("amount, payment_date")
        .order("payment_date", { ascending: true });

    if (!paymentError && payments) {
        renderRevenueChart(payments);
    }

    // 3. Fetch Members for Plan Distribution Doughnut Chart
    const { data: members, error: memberError } = await supabaseClient
        .from("members")
        .select("plandetails");

    if (!memberError && members) {
        renderPlanChart(members);
    }
});

// Render Revenue Bar/Line Chart
function renderRevenueChart(payments) {
    const monthlyData = {};

    payments.forEach((p) => {
        if (!p.payment_date) return;
        const month = p.payment_date.substring(0, 7); // Format: YYYY-MM
        monthlyData[month] = (monthlyData[month] || 0) + parseFloat(p.amount || 0);
    });

    const labels = Object.keys(monthlyData);
    const amounts = Object.values(monthlyData);

    const ctx = document.getElementById("revenueChart").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Revenue (₹)",
                data: amounts,
                backgroundColor: "rgba(34, 197, 94, 0.4)",
                borderColor: "#22c55e",
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: "#8fa896", font: { family: "Poppins" } } }
            },
            scales: {
                x: { ticks: { color: "#8fa896" }, grid: { color: "rgba(30, 58, 39, 0.5)" } },
                y: { ticks: { color: "#8fa896" }, grid: { color: "rgba(30, 58, 39, 0.5)" } }
            }
        }
    });
}

// Render Membership Plan Distribution Chart
function renderPlanChart(members) {
    const planCounts = {};

    members.forEach((m) => {
        const plan = m.plandetails || "Standard";
        planCounts[plan] = (planCounts[plan] || 0) + 1;
    });

    const labels = Object.keys(planCounts);
    const counts = Object.values(planCounts);

    const ctx = document.getElementById("planChart").getContext("2d");
    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: counts,
                backgroundColor: ["#22c55e", "#f59e0b", "#3b82f6", "#ef4444", "#a855f7"],
                borderColor: "#111f15",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: { color: "#8fa896", font: { family: "Poppins" } }
                }
            }
        }
    });
}