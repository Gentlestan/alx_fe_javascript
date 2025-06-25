// === Initial quotes from localStorage or default ===
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The important thing is not to stop questioning.", category: "Science" },
  { text: "First, solve the problem. Then, write the code.", category: "Programming" },
  { text: "Education is the most powerful weapon you can use to change the world.", category: "Inspiration" },
  { text: "An investment in knowledge pays the best interest.", category: "Wisdom" }
];

// === Show random quote ===
function showRandomQuote() {
  if (quotes.length === 0) return;
  const index = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[index];
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `<p>"${randomQuote.text}" — <em>${randomQuote.category}</em></p>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
}

// === Create Add Quote form ===
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.style.margin = "20px 0";

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";
  quoteInput.style.marginRight = "10px";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.style.marginRight = "10px";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";

  addButton.addEventListener("click", () => {
    const newText = quoteInput.value.trim();
    const newCategory = categoryInput.value.trim();

    if (newText && newCategory) {
      quotes.push({ text: newText, category: newCategory });
      localStorage.setItem("quotes", JSON.stringify(quotes));
      populateCategories();
      filterQuotes();
      alert("Quote added!");
      quoteInput.value = "";
      categoryInput.value = "";
    } else {
      alert("Please fill in both fields.");
    }
  });

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  document.body.appendChild(formContainer);
}

// === Export Quotes as JSON file ===
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.href = url;
  downloadAnchor.download = "quotes.json";
  downloadAnchor.click();
  URL.revokeObjectURL(url);
}

// === Import Quotes from JSON file ===
function importQuotes(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        localStorage.setItem("quotes", JSON.stringify(quotes));
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch {
      alert("Error parsing JSON file.");
    }
  };
  reader.readAsText(file);
}

// === Populate category filter dropdown ===
function populateCategories() {
  const filter = document.getElementById('categoryFilter');
  const categories = Array.from(new Set(quotes.map(q => q.category))).sort();
  filter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    filter.appendChild(opt);
  });
}

// === Filter quotes by category ===
function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  localStorage.setItem('lastFilter', selectedCategory);

  const filtered = selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  const display = document.getElementById('quoteDisplay');
  display.innerHTML = filtered.map(q => `<p>"${q.text}" — <em>${q.category}</em></p>`).join('');
}

// === Show notification for sync or errors ===
function showNotification(message) {
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.style.position = 'fixed';
    notification.style.bottom = '10px';
    notification.style.right = '10px';
    notification.style.backgroundColor = '#444';
    notification.style.color = '#fff';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
    notification.style.transition = 'opacity 0.5s ease';
    document.body.appendChild(notification);
  }
  notification.textContent = message;
  notification.style.opacity = '1';
  setTimeout(() => {
    notification.style.opacity = '0';
  }, 4000);
}

// === Simulated server fetch (mock API) ===
async function fetchQuotesFromServer() {
  await new Promise(res => setTimeout(res, 500)); // simulate network delay
  return [
    { text: "The important thing is not to stop questioning.", category: "Science" },
    { text: "First, solve the problem. Then, write the code.", category: "Programming" },
    { text: "Education is the most powerful weapon you can use to change the world.", category: "Inspiration" },
    { text: "An investment in knowledge pays the best interest.", category: "Wisdom" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" } // new quote from server
  ];
}

// === Merge local and server quotes, server takes precedence ===
function mergeQuotes(localQuotes, serverQuotes) {
  const merged = [...serverQuotes];
  localQuotes.forEach(localQ => {
    if (!serverQuotes.some(serverQ => serverQ.text === localQ.text && serverQ.category === localQ.category)) {
      merged.push(localQ);
    }
  });
  return merged;
}

// === Sync quotes periodically and update UI ===
async function syncQuotesWithServer() {
  try {
    const serverQuotes = await fetchServerQuotes();
    const mergedQuotes = mergeQuotes(quotes, serverQuotes);

    if (JSON.stringify(mergedQuotes) !== JSON.stringify(quotes)) {
      quotes = mergedQuotes;
      localStorage.setItem('quotes', JSON.stringify(quotes));
      populateCategories();
      filterQuotes();
      showNotification("Quotes have been synced with the server.");
    }
  } catch (error) {
    console.error("Error syncing with server:", error);
    showNotification("Error syncing with the server.");
  }
}

// === Set up event listeners after DOM loaded ===
window.addEventListener('DOMContentLoaded', () => {
  createAddQuoteForm();

  populateCategories();
  const savedFilter = localStorage.getItem('lastFilter') || 'all';
  document.getElementById('categoryFilter').value = savedFilter;
  filterQuotes();

  // Button event listener for new random quote
  document.getElementById('newQuote').addEventListener('click', showRandomQuote);

  // Periodic sync every 30 seconds
  setInterval(syncQuotesWithServer, 30000);

  // Initial sync
  syncQuotesWithServer();
});
