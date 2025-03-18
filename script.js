document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signup-form"); 
    const loginForm = document.getElementById("login-form");
    const expenseForm = document.getElementById("expense-form");
    const expenseList = document.getElementById("expense-list");
    const totalAmount = document.getElementById("total-amount");
    const filterCategory = document.getElementById("filter-category");
    const authForms = document.getElementById("auth-forms");
    const expenseSection = document.getElementById("expense-section");
    const ctx = document.getElementById('expense-chart').getContext('2d');

    let expenses = [];
    let currentUser = null; // keep track of the logged-in users 
    let chart = null;

    signupForm.addEventListener("submit", (e) => {
        e.preventDefault(); // prevent default behaviours of the submit button which is reloading the whole page 

        const username = document.getElementById("username").value; // value property: get the user's input data 
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // Store user data in Local Storage so that it persists even when the page is refreshed 
        const user = { username, password, expenses: [] }; // object to store username, password and an empty array to store expenses
        localStorage.setItem(username, JSON.stringify(user)); // save the user data in the browser with the username key, stringtify user object bc Local Storage can store strings

        alert("User registered successfully!");
    });

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const loginUsername = document.getElementById("login-username").value;
        const loginPassword = document.getElementById("login-password").value;

        const storedUser = JSON.parse(localStorage.getItem(loginUsername));

        if (!storedUser || storedUser.password !== loginPassword) {
            alert("Invalid username or password");
        } else {
            currentUser = storedUser;
            expenses = storedUser.expenses;

            alert("Login successful!");

            authForms.style.display = "none";
            expenseSection.style.display = "block";

            displayExpenses(expenses);
            updateTotalAmount();
            updateChart(expenses);
        }
    });

    expenseForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("expense-name").value;
        const amount = parseFloat(document.getElementById("expense-amount").value);
        const category = document.getElementById("expense-category").value;
        const date = document.getElementById("expense-date").value;

        const expense = {
            id: Date.now(),
            name,
            amount,
            category,
            date
        };

        expenses.push(expense);
        currentUser.expenses = expenses;
        localStorage.setItem(currentUser.username, JSON.stringify(currentUser));

        displayExpenses(expenses);
        updateTotalAmount();
        updateChart(expenses);

        expenseForm.reset();
    });

    expenseList.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-btn")) {
            const id = parseInt(e.target.dataset.id);
            expenses = expenses.filter(expense => expense.id !== id);
            currentUser.expenses = expenses;
            localStorage.setItem(currentUser.username, JSON.stringify(currentUser));

            displayExpenses(expenses);
            updateTotalAmount();
            updateChart(expenses);
        }

        if (e.target.classList.contains("edit-btn")) {
            const id = parseInt(e.target.dataset.id);
            const expense = expenses.find(expense => expense.id === id);

            document.getElementById("expense-name").value = expense.name;
            document.getElementById("expense-amount").value = expense.amount;
            document.getElementById("expense-category").value = expense.category;
            document.getElementById("expense-date").value = expense.date;

            expenses = expenses.filter(expense => expense.id !== id);
            currentUser.expenses = expenses;
            localStorage.setItem(currentUser.username, JSON.stringify(currentUser));

            displayExpenses(expenses);
            updateTotalAmount();
            updateChart(expenses);
        }
    });

    filterCategory.addEventListener("change", (e) => {
        const category = e.target.value;
        let filteredExpenses = expenses;

        if (category !== "All") {
            filteredExpenses = expenses.filter(expense => expense.category === category);
        }

        displayExpenses(filteredExpenses);
        updateTotalAmount();
        updateChart(filteredExpenses);
    });

    function displayExpenses(expenses) {
        expenseList.innerHTML = "";
        expenses.forEach(expense => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${expense.name}</td>
                <td>$${expense.amount.toFixed(2)}</td>
                <td>${expense.category}</td>
                <td>${expense.date}</td>
                <td>
                    <button class="edit-btn" data-id="${expense.id}">Edit</button>
                    <button class="delete-btn" data-id="${expense.id}">Delete</button>
                </td>
            `;

            expenseList.appendChild(row);
        });
    }

    function updateTotalAmount() {
        const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        totalAmount.textContent = total.toFixed(2);
    }

    function updateChart(expenses) {
        const categoryTotals = expenses.reduce((totals, expense) => {
            totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
            return totals;
        }, {});

        const categories = Object.keys(categoryTotals);
        const amounts = categories.map(category => categoryTotals[category]);

        if (chart) {
            chart.destroy();
        }

        chart = new Chart(ctx, {
            type: 'pie', // change this to 'bar' for a bar chart
            data: {
                labels: categories,
                datasets: [{
                    data: amounts,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                    hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const category = context.label;
                                const amount = context.raw;
                                return `${category}: $${amount.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }
});