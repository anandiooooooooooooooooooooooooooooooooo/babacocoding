let incomeData = JSON.parse(localStorage.getItem('incomeData')) || [];
let expenseData = JSON.parse(localStorage.getItem('expenseData')) || [];

let incomeChart;
let expenseChart;
let balanceChart;

document.addEventListener('DOMContentLoaded', function () {
    updateCharts();
    updateTotals();
});

function addIncome() {
    const source = document.getElementById('incomeSource').value;
    const amount = parseFloat(document.getElementById('incomeAmount').value);

    if (source && !isNaN(amount) && amount > 0) {
        incomeData.push({ source, amount });
        localStorage.setItem('incomeData', JSON.stringify(incomeData));
        updateCharts();
        updateTotals();
        document.getElementById('incomeSource').value = '';
        document.getElementById('incomeAmount').value = '';
    }
}

function addExpenseField() {
    const expenseContainer = document.getElementById('expense-container');
    const newExpenseField = document.createElement('div');
    newExpenseField.className = 'form-group';
    newExpenseField.innerHTML = `
        <label for="expenseCategory">Category:</label>
        <input type="text" class="expense-category" placeholder="E.g., Rent, Groceries" required>
        <label for="expenseAmount">Amount:</label>
        <input type="number" class="expense-amount" placeholder="E.g., 1500" required>
    `;
    expenseContainer.appendChild(newExpenseField);
}

function addExpenses() {
    const expenseCategories = document.querySelectorAll('.expense-category');
    const expenseAmounts = document.querySelectorAll('.expense-amount');

    expenseCategories.forEach((categoryInput, index) => {
        const category = categoryInput.value;
        const amount = parseFloat(expenseAmounts[index].value);

        if (category && !isNaN(amount) && amount > 0) {
            expenseData.push({ category, amount });
        }
    });

    localStorage.setItem('expenseData', JSON.stringify(expenseData));
    updateCharts();
    updateTotals();

    const expenseContainer = document.getElementById('expense-container');
    expenseContainer.innerHTML = `
        <div class="form-group">
            <label for="expenseCategory">Category:</label>
            <input type="text" class="expense-category" name="expenseCategory" placeholder="E.g., Rent, Groceries" required>
        </div>
        <div class="form-group">
            <label for="expenseAmount">Amount:</label>
            <input type="number" class="expense-amount" name="expenseAmount" placeholder="E.g., 1500" required>
        </div>
    `;
}

function updateTotals() {
    const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenseData.reduce((sum, item) => sum + item.amount, 0);
    const totalBalance = totalIncome - totalExpenses;

    document.getElementById('total-income').innerText = totalIncome.toFixed(2);
    document.getElementById('total-expenses').innerText = totalExpenses.toFixed(2);
    document.getElementById('total-balance').innerText = totalBalance.toFixed(2);

    updateBalanceChart(totalIncome, totalExpenses, totalBalance);
}

function clearData() {
    if (confirm("Are you sure you want to clear all data?")) {
        incomeData = [];
        expenseData = [];
        localStorage.removeItem('incomeData');
        localStorage.removeItem('expenseData');
        updateCharts();
        updateTotals();
    }
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function calculateTrendline(data) {
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    data.forEach((point, index) => {
        sumX += index;
        sumY += point;
        sumXY += index * point;
        sumXX += index * index;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return data.map((_, index) => slope * index + intercept);
}

function updateCharts() {
    const incomeChartCtx = document.getElementById('incomeChart').getContext('2d');
    const expenseChartCtx = document.getElementById('expenseChart').getContext('2d');

    const incomeLabels = incomeData.map(data => data.source);
    const incomeAmounts = incomeData.map(data => data.amount);
    const incomeColors = incomeData.map(() => getRandomColor());
    const incomeTrendline = calculateTrendline(incomeAmounts);

    const expenseLabels = expenseData.map(data => data.category);
    const expenseAmounts = expenseData.map(data => data.amount);
    const expenseColors = expenseData.map(() => getRandomColor());

    if (incomeChart) {
        incomeChart.destroy();
    }

    incomeChart = new Chart(incomeChartCtx, {
        type: 'bar',
        data: {
            labels: incomeLabels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeAmounts,
                    backgroundColor: incomeColors,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Trendline',
                    data: incomeTrendline,
                    type: 'line',
                    fill: false,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: true,
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: $${context.raw.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(expenseChartCtx, {
        type: 'pie',
        data: {
            labels: expenseLabels,
            datasets: [{
                label: 'Expenses',
                data: expenseAmounts,
                backgroundColor: expenseColors,
                borderColor: expenseColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.label}: $${context.raw.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

function updateBalanceChart(totalIncome, totalExpenses, totalBalance) {
    const balanceChartCtx = document.getElementById('balanceChart').getContext('2d');

    if (balanceChart) {
        balanceChart.destroy();
    }

    const balanceData = {
        labels: ['Income', 'Expenses', 'Balance'],
        datasets: [{
            data: [totalIncome, totalExpenses, totalBalance],
            backgroundColor: ['#4caf50', '#f44336', '#2196f3'],
            borderColor: ['#4caf50', '#f44336', '#2196f3'],
            borderWidth: 1
        }]
    };

    balanceChart = new Chart(balanceChartCtx, {
        type: 'doughnut',
        data: balanceData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw;
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(2);
                            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}


try {
    updateCharts();
    updateTotals();
} catch (error) {
    console.error("Error updating charts or totals:", error);
}
