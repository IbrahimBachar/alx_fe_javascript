// Array of quote objects
let quotes = [];

// Function to load quotes from local storage
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
  populateCategories();
  restoreLastFilter();
}

// Function to save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to display a random quote
function showRandomQuote() {
  const quoteDisplay = document.getElementById('quoteDisplay');
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available. Add a new quote!";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  quoteDisplay.innerHTML = `<strong>${randomQuote.text}</strong> <em>(${randomQuote.category})</em>`;
}

// Function to dynamically create the "Add Quote" form
function createAddQuoteForm() {
  const formContainer = document.getElementById('addQuoteFormContainer');

  // Create the form element
  const form = document.createElement('form');
  form.id = 'addQuoteForm';

  // Create the quote text input
  const quoteTextInput = document.createElement('input');
  quoteTextInput.type = 'text';
  quoteTextInput.id = 'newQuoteText';
  quoteTextInput.placeholder = 'Enter a new quote';
  quoteTextInput.required = true;

  // Create the quote category input
  const quoteCategoryInput = document.createElement('input');
  quoteCategoryInput.type = 'text';
  quoteCategoryInput.id = 'newQuoteCategory';
  quoteCategoryInput.placeholder = 'Enter quote category';
  quoteCategoryInput.required = true;

  // Create the submit button
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Add Quote';

  // Append inputs and button to the form
  form.appendChild(quoteTextInput);
  form.appendChild(quoteCategoryInput);
  form.appendChild(submitButton);

  // Append the form to the container
  formContainer.appendChild(form);

  // Add an event listener to handle form submission
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    addQuote();
  });
}

// Function to add a new quote
function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value.trim();
  const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();

  if (newQuoteText && newQuoteCategory) {
    quotes.push({ text: newQuoteText, category: newQuoteCategory });
    saveQuotes();
    document.getElementById('addQuoteForm').reset();
    populateCategories();
    filterQuotes();
  } else {
    alert("Please fill in both the quote and category fields.");
  }
}

// Function to populate the categories dropdown
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  const categories = [...new Set(quotes.map(quote => quote.category))];

  // Clear existing options (except the first "All Categories" option)
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  // Add new category options
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

// Function to filter quotes based on the selected category
function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  const filteredQuotes = selectedCategory === 'all'
    ? quotes
    : quotes.filter(quote => quote.category === selectedCategory);

  // Display the filtered quotes
  const quoteDisplay = document.getElementById('quoteDisplay');
  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
  } else {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    quoteDisplay.innerHTML = `<strong>${randomQuote.text}</strong> <em>(${randomQuote.category})</em>`;
  }

  // Save the selected filter to local storage
  localStorage.setItem('lastSelectedFilter', selectedCategory);
}

// Function to restore the last selected filter
function restoreLastFilter() {
  const lastSelectedFilter = localStorage.getItem('lastSelectedFilter');
  if (lastSelectedFilter) {
    document.getElementById('categoryFilter').value = lastSelectedFilter;
    filterQuotes();
  }
}

// Function to export quotes as a JSON file
function exportQuotes() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Function to import quotes from a JSON file
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert('Quotes imported successfully!');
    filterQuotes();
  };
  fileReader.readAsText(file);
}

// Function to simulate fetching quotes from the server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const serverQuotes = await response.json();

    // Transform server data into our quote format
    const transformedQuotes = serverQuotes.map(post => ({
      text: post.title,
      category: 'Server'
    }));

    // Merge server quotes with local quotes
    const mergedQuotes = [...quotes, ...transformedQuotes];
    const uniqueQuotes = Array.from(new Set(mergedQuotes.map(quote => quote.text)))
      .map(text => mergedQuotes.find(quote => quote.text === text));

    // Update local quotes and save to storage
    quotes = uniqueQuotes;
    saveQuotes();
    populateCategories();
    filterQuotes();

    // Notify the user
    showNotification('Quotes updated from the server.');
  } catch (error) {
    console.error('Failed to fetch quotes from the server:', error);
    showNotification('Failed to fetch quotes from the server.', true);
  }
}

// Function to show notifications
function showNotification(message, isError = false) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.style.backgroundColor = isError ? '#ffebee' : '#e0f7fa';
  notification.style.borderColor = isError ? '#ff1744' : '#00bcd4';
  notification.style.display = 'block';

  // Hide the notification after 5 seconds
  setTimeout(() => {
    notification.style.display = 'none';
  }, 5000);
}

// Function to sync quotes between local storage and the server
async function syncQuotes() {
  await fetchQuotesFromServer();
  saveQuotes();
}

// Event listeners
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('exportQuotes').addEventListener('click', exportQuotes);
document.getElementById('importFile').addEventListener('change', importFromJsonFile);

// Initialize the application
loadQuotes();
createAddQuoteForm();
showRandomQuote();

// Periodically sync quotes with the server (every 30 seconds)
setInterval(syncQuotes, 30000);
