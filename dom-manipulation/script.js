let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  {
    text: "The important thing is not to stop questioning.",
    category: "Science"
  },
  {
    text: "First, solve the problem. Then, write the code.",
    category: "Programming"
  },
  {
    text: "Education is the most powerful weapon you can use to change the world.",
    category: "Inspiration"
  },
  {
    text: "An investment in knowledge pays the best interest.",
    category: "Wisdom"
  }
];

const newQuote = document.getElementById("newQuote");

function showRandomQuote() {
  if (quotes.length === 0) return;
  const index = Math.floor(Math.random() * quotes.length);
  const randomQuotes = quotes[index];
  const quoteDisplay = document.getElementById("quoteDisplay");

  quoteDisplay.innerHTML = `<p>"${randomQuotes.text}" — <em>${randomQuotes.category}</em></p>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(randomQuotes));
}

function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";

  addButton.addEventListener("click", function () {
    const newText = quoteInput.value.trim();
    const newCategory = categoryInput.value.trim();

    if (newText && newCategory) {
      quotes.push({ text: newText, category: newCategory });
      populateCategories();
      filterQuotes();
      localStorage.setItem("quotes", JSON.stringify(quotes));
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
createAddQuoteForm();

function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.href = url;
  downloadAnchor.download = "quotes.json";
  downloadAnchor.click();
  URL.revokeObjectURL(url);
}

function importQuotes(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        populateCategories();
        filterQuotes();
        localStorage.setItem("quotes", JSON.stringify(quotes));
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch (err) {
      alert("Error parsing JSON file.");
    }
  };
  reader.readAsText(file);
}

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

function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  localStorage.setItem('lastFilter', selectedCategory);

  const filtered = selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  const display = document.getElementById('quoteDisplay');
  display.innerHTML = filtered.map(q => `<p>"${q.text}" — <em>${q.category}</em></p>`).join('');
}

// Fetch quotes from mock server API
async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    if (!response.ok) throw new Error('Network response was not ok');

    const posts = await response.json();

    // Map server posts to quotes format
    // Use first 10 posts for demo, assign category "Server"
    const serverQuotes = posts.slice(0, 10).map(post => ({
      text: post.title,
      category: "Server"
    }));

    return serverQuotes;
  } catch (error) {
    console.error("Fetching from server failed:", error);
    return [];
  }
}

// Merge local and server quotes, server takes precedence on conflicts
function mergeQuotes(localQuotes, serverQuotes) {
  const merged = [...serverQuotes];

  localQuotes.forEach(localQ => {
    const exists = serverQuotes.some(serverQ =>
      serverQ.text === localQ.text && serverQ.category === localQ.category
    );
    if (!exists) {
      merged.push(localQ);
    }
  });

  return merged;
}

// Show notification for sync events
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

// Sync local quotes with server every 30 seconds
async function syncQuotesWithServer() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    const mergedQuotes = mergeQuotes(quotes, serverQuotes);

    const hasUpdates = JSON.stringify(mergedQuotes) !== JSON.stringify(quotes);

    if (hasUpdates) {
      quotes = mergedQuotes;
      localStorage.setItem('quotes', JSON.stringify(quotes));
      populateCategories();

      // Keep last filter and update filtered display
      const savedFilter = localStorage.getItem('lastFilter') || 'all';
      document.getElementById('categoryFilter').value = savedFilter;
      filterQuotes();

      showNotification("Quotes have been synced with the server and updated.");
    }
  } catch (error) {
    console.error("Error syncing with server:", error);
    showNotification("Error syncing with the server.");
  }
}

// Initial setup on DOM load
window.addEventListener('DOMContentLoaded', () => {
  populateCategories();

  const savedFilter = localStorage.getItem('lastFilter') || 'all';
  document.getElementById('categoryFilter').value = savedFilter;

  filterQuotes();

  syncQuotesWithServer();
  setInterval(syncQuotesWithServer, 30000);
});
