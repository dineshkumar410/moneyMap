// If DOMContentLoaded is not used edit and delete options are not working as thier HTMl is defined here.
document.addEventListener("DOMContentLoaded", () => {
  const transactionForm = document.getElementById("transaction-form");
  const transactionList = document.getElementById("transaction-list");
  const totalIncomeEl = document.getElementById("total-income");
  const totalExpensesEl = document.getElementById("total-expenses");
  const netBalanceEl = document.getElementById("net-balance");
  const filterOptions = document.getElementsByName("filter");

  // LocalStorage is used to display entries made in other sessions. If empty initializing with empty array.
  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  // This method is used to display total expense, income and net balance
  function updateSummary() {
    // Using type in transaction object to diffrentiate and reduce array method to perform summation
    const income = transactions
      .filter((item) => item.type === "income")
      .reduce((acc, item) => acc + parseFloat(item.amount), 0);
    const expense = transactions
      .filter((item) => item.type === "expense")
      .reduce((acc, item) => acc + parseFloat(item.amount), 0);
    const balance = income - expense;

    totalIncomeEl.textContent = `₹${income.toFixed(2)}`;
    totalExpensesEl.textContent = `₹${expense.toFixed(2)}`;
    netBalanceEl.textContent = `₹${balance.toFixed(2)}`;
  }

  // Transactions stored in local storage in string format which is converted to JSON format above.
  function saveToLocalStorage() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }

  // Rendering transactions with default filter 'ALL'
  function renderTransactions(filter = "all") {
    transactionList.innerHTML = "";
    // Filtering from transactions according to user preferences
    const filteredTransactions = transactions.filter((transaction) => {
      return filter === "all" || transaction.type === filter;
    });
    // From filtered transactions rendering all entries
    filteredTransactions.forEach((transaction, index) => {
      const li = document.createElement("li");
      li.classList.add(transaction.type);
      li.innerHTML = `
          <span>${transaction.description} - ₹${transaction.amount}</span>
          <div class="transaction-actions">
            <button class="edit-btn" data-index="${index}">Edit</button>
            <button class="delete-btn" data-index="${index}">Delete</button>
          </div>
        `;
      transactionList.appendChild(li);
    });

    const editButtons = document.querySelectorAll(".edit-btn");
    const deleteButtons = document.querySelectorAll(".delete-btn");

    // When edit button pressed that entry is passed using dataset feature
    editButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        editTransaction(e.target.dataset.index);
      });
    });

    // When delete button pressed that entry is passed using dataset feature
    deleteButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        deleteTransaction(e.target.dataset.index);
      });
    });
  }

  function editTransaction(index) {
    const transaction = transactions[index];
    document.getElementById("description").value = transaction.description;
    document.getElementById("amount").value = transaction.amount;
    document.getElementById(transaction.type).checked = true;
    deleteTransaction(index);
  }

  function deleteTransaction(index) {
    transactions.splice(index, 1);
    saveToLocalStorage();
    updateSummary();
    renderTransactions(getSelectedFilter());
  }

  // Using name attribute in radio input we can get value of that option
  function getSelectedFilter() {
    return Array.from(filterOptions).find((option) => option.checked).value;
  }

  // When different options are selected respective entries will be rendered
  filterOptions.forEach((option) => {
    option.addEventListener("change", () =>
      renderTransactions(getSelectedFilter())
    );
  });

  // New entry is created
  transactionForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const description = document.getElementById("description").value;
    const amount = document.getElementById("amount").value;
    const type = document.querySelector('input[name="type"]:checked').value;

    transactions.push({ description, amount, type });
    saveToLocalStorage();
    updateSummary();
    renderTransactions(getSelectedFilter());

    transactionForm.reset();
  });

  updateSummary();
  renderTransactions();
});
