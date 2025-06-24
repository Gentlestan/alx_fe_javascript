const quotes = [
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

const newQuote = document.getElementById("newQuote")

 function showRandomQuote(){
     const index = Math.floor(Math.random() * quotes.length)
     const randomQuotes = quotes[index]
     const quoteDisplay = document.getElementById("quoteDisplay")

     quoteDisplay.innerHTML = `<p>"${randomQuotes.text}": ${randomQuotes.category}</p>`
}

function createAddQuoteForm(){
    const formContainer = document.createElement("div")
    const quoteInput = document.createElement("input")
    quoteInput.id = "newQuoteText"
    quoteInput.placeholder = "Enter a new quote"

    const categoryInput = document.createElement("input")
    categoryInput.id = "newQuoteCategory" 
    categoryInput.placeholder = "Enter quote category"

    const addButton = document.createElement("button");
    addButton.textContent = "Add Quote";

     addButton.addEventListener("click", function () {
    const newText = quoteInput.value.trim();
    const newCategory = categoryInput.value.trim();

    if (newText && newCategory) {
      quotes.push({ text: newText, category: newCategory });
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