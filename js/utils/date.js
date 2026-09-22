

/**
 * Parses a YYYY-MM-DD string into a local Date object without timezone offset shift.
 * Cleanly handles full ISO strings (e.g. YYYY-MM-DDTHH:mm:ssZ).
 */
function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  
  // Extract YYYY-MM-DD portion if string contains time components
  const cleanStr = String(dateStr).split("T")[0];
  const parts = cleanStr.split("-").map(Number);

  if (parts.length !== 3) return null;

  const [year, month, day] = parts;
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  return new Date(year, month - 1, day);
}

/**
 * Formats a Date object into a YYYY-MM-DD string using local time.
 */
function formatDateToISO(dateObj) {
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return "";
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates Date of Expiry (DOE) based on Date of Joining (DOJ) and duration in months.
 * Clamps to the last day of the month if month overflow occurs (e.g., Jan 31 + 1 month -> Feb 28/29).
 */
function togetdoe(doj, planDuration) {
  if (!doj || !planDuration) return "";
  
  const startDate = parseLocalDate(doj);
  if (!startDate) return "";

  const monthsToAdd = parseInt(planDuration, 10);
  if (isNaN(monthsToAdd) || monthsToAdd <= 0) return "";

  const originalDay = startDate.getDate();
  
  // Advance the month
  startDate.setMonth(startDate.getMonth() + monthsToAdd);

  // If day rolled over (e.g., Jan 31 + 1 month became March 3), reset to last day of target month
  if (startDate.getDate() !== originalDay) {
    startDate.setDate(0); // Sets date to last day of previous month
  }

  return formatDateToISO(startDate);
}