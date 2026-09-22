// js/storage.js

window.members = [];
let membersChannel = null;

// 1. Fetch members for the current logged-in owner
async function loadMembers() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return;

  const { data, error } = await supabaseClient
    .from("members")
    .select("*")
    .eq("owner_id", session.user.id)
    .order("id", { ascending: false });

  if (error) {
    console.error("Error loading members:", error);
    return;
  }

  // Update global members variable
  window.members = data || [];
}

// 2. Realtime listener that re-fetches and updates the screen
async function setupRealtimeListener(onUpdateCallback) {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return;

  if (membersChannel) {
    supabaseClient.removeChannel(membersChannel);
  }

  membersChannel = supabaseClient
    .channel("realtime-members-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "members",
        filter: `owner_id=eq.${session.user.id}` // Filter events to only this owner
      },
      async (payload) => {
        console.log("Realtime change detected for current owner:", payload);
        await loadMembers();
        if (typeof onUpdateCallback === "function") {
          onUpdateCallback();
        }
      }
    )
    .subscribe();
}

// Cleanup on leave
window.addEventListener("beforeunload", () => {
  if (membersChannel) {
    supabaseClient.removeChannel(membersChannel);
  }
});




