"use strict";

const API_BASES = [
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1",
  "https://latest.currency-api.pages.dev/v1",
];
const form = document.querySelector("form");
const amount = document.querySelector("#amount");
const fromCurr = document.querySelector("#from");
const toCurr = document.querySelector("#to");
const btn = document.querySelector(".convert");
const swap = document.querySelector(".swap");
const msg = document.querySelector(".msg");
const detail = document.querySelector(".rate-detail");
const result = document.querySelector(".result");
const cache = new Map();
let requestId = 0;
const format = (value) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(value);

async function fetchRates(base) {
  const cached = cache.get(base);
  if (cached && Date.now() - cached.savedAt < 5 * 60 * 1000) return cached.data;
  for (const endpoint of API_BASES) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(`${endpoint}/currencies/${base}.json`, { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!data[base] || !data.date || !Number.isFinite(data[base].usd) || data[base].usd <= 0) throw new Error("Invalid rates");
      cache.set(base, { data, savedAt: Date.now() });
      return data;
    } catch (error) {
      // Try the independent mirror if the primary provider is unavailable.
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error("Exchange rates are unavailable. Check your connection and try again.");
}

function updateFlag(select) {
  const img = select.parentElement.querySelector("img");
  img.hidden = false;
  img.onerror = () => { img.hidden = true; };
  img.src = `https://flagcdn.com/w80/${countryList[select.value].toLowerCase()}.png`;
}

for (const select of [fromCurr, toCurr]) {
  for (const code of Object.keys(countryList).sort()) {
    select.add(new Option(code, code, false, code === (select === fromCurr ? "USD" : "PKR")));
  }
  updateFlag(select);
  select.addEventListener("change", () => { updateFlag(select); updateExchangeRate(); });
}

async function updateExchangeRate() {
  const id = ++requestId;
  result.classList.remove("error");
  detail.textContent = "";
  if (!amount.checkValidity() || amount.value.trim() === "" || !Number.isFinite(amount.valueAsNumber)) {
    msg.textContent = "Enter a valid amount of zero or more.";
    result.classList.add("error");
    btn.disabled = false;
    return;
  }
  const value = amount.valueAsNumber;
  const from = fromCurr.value;
  const to = toCurr.value;
  btn.disabled = true;
  msg.textContent = "Getting exchange rate...";
  try {
    const data = from === to ? null : await fetchRates(from.toLowerCase());
    if (id !== requestId) return;
    const rate = data ? data[from.toLowerCase()][to.toLowerCase()] : 1;
    if (!Number.isFinite(rate) || rate <= 0) throw new Error("This currency pair is unavailable. Please select another currency.");
    const converted = value * rate;
    if (!Number.isFinite(converted)) throw new Error("Amount is too large. Please enter a smaller amount.");
    msg.textContent = `${format(converted)} ${to}`;
    detail.textContent = `${format(value)} ${from} = ${format(converted)} ${to}\n1 ${from} = ${format(rate)} ${to}${data ? ` | Rate date: ${data.date}` : ""}`;
  } catch (error) {
    if (id !== requestId) return;
    result.classList.add("error");
    msg.textContent = error.message;
  } finally {
    if (id === requestId) btn.disabled = false;
  }
}

form.addEventListener("submit", (event) => { event.preventDefault(); updateExchangeRate(); });
amount.addEventListener("input", () => { ++requestId; btn.disabled = false; msg.textContent = "Ready to convert"; detail.textContent = ""; result.classList.remove("error"); });
swap.addEventListener("click", () => {
  [fromCurr.value, toCurr.value] = [toCurr.value, fromCurr.value];
  updateFlag(fromCurr);
  updateFlag(toCurr);
  updateExchangeRate();
});
updateExchangeRate();
