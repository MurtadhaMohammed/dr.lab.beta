// helper/printCount.js
const user = JSON.parse(localStorage.getItem("lab-user") || "{}");
const printLimit = user?.Plan?.printLimit ?? 20;
const planType = user?.Plan?.type ?? "FREE";

const DAILY_LIMIT = planType === "FREE" ? printLimit : 200;

export function getPrintUsage() {
  const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
  const stored = JSON.parse(localStorage.getItem("printData") || "{}");

  if (stored.printDate !== today) {
    // Reset usage for new day
    const newData = { printDate: today, printUsed: 0, printLimit: DAILY_LIMIT };
    localStorage.setItem("printData", JSON.stringify(newData));
    return newData;
  }

  return stored;
}

export function canPrint() {
  const { printUsed } = getPrintUsage();
  return printUsed < DAILY_LIMIT;
}

export function recordPrint() {
  const today = new Date().toISOString().split("T")[0];
  const { printUsed } = getPrintUsage();
  const updated = {
    printDate: today,
    printUsed: printUsed + 1,
    printLimit: DAILY_LIMIT,
  };
  localStorage.setItem("printData", JSON.stringify(updated));
}
