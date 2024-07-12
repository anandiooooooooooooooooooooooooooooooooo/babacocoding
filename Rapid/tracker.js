let incomeData = JSON.parse(localStorage.getItem('incomeData')) || [];
let expenseData = JSON.parse(localStorage.getItem('expenseData')) || [];
let incomeChart, expenseChart;

document.addEventListener('DOMContentLoaded', function() {
    updateCharts();
    updateTotals();
});

function addData() {
    const incomeSource = document.getElementById('income-source').value.trim();
    const incomeAmount = parseFloat(document.getElementById('income-amount').value);
    const expenseCategory = document.getElementById('expense-category').value.trim();
    const expenseAmount = parseFloat(document.getElementById('expense-amount').value);

    if (validateInputs(incomeSource, incomeAmount, expenseCategory, expenseAmount)) {
        if (incomeSource && !isNaN(incomeAmount) && incomeAmount > 0) {
            incomeData.push({ source: incomeSource, amount: incomeAmount });
        }

        if (expenseCategory && !isNaN(expenseAmount) && expenseAmount > 0) {
            expenseData.push({ category: expenseCategory, amount: expenseAmount });
        }

        document.getElementById('data-form').reset();
        localStorage.setItem('incomeData', JSON.stringify(incomeData));
        localStorage.setItem('expenseData', JSON.stringify(expenseData));
        updateCharts();
        updateTotals();
    }
}

function validateInputs(incomeSource, incomeAmount, expenseCategory, expenseAmount) {
    if (!incomeSource && !expenseCategory) {
        alert("Please enter a source/category.");
        return false;
    }
    if ((incomeSource && (isNaN(incomeAmount) || incomeAmount <= 0)) ||
        (expenseCategory && (isNaN(expenseAmount) || expenseAmount <= 0))) {
        alert("Please enter valid amounts.");
        return false;
    }
    return true;
}

function updateCharts() {
    const incomeChartCtx = document.getElementById('incomeChart').getContext('2d');
    const expenseChartCtx = document.getElementById('expenseChart').getContext('2d');

    const incomeLabels = incomeData.map(data => data.source);
    const incomeAmounts = incomeData.map(data => data.amount);
    const incomeColors = incomeData.map(() => getRandomColor());

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
            datasets: [{
                label: 'Income',
                data: incomeAmounts,
                backgroundColor: incomeColors,
                borderColor: incomeColors,
                borderWidth: 1
            }]
        },
        options: {
            animation: {
                duration: 1000,
                easing: 'easeInOutBounce'
            },
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
                        label: function(context) {
                            return $;"{context.label}: $${context.raw}";
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
            animation: {
                duration: 1000,
                easing: 'easeInOutBounce'
            },
            plugins: {
                legend: {
                    display: true,
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return $;"{context.label}: $${context.raw}";
                        }
                    }
                }
            }
        }
    });
}

function updateTotals() {
  const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenseData.reduce((sum, item) => sum + item.amount, 0);

  document.getElementById('total-income').innerText = totalIncome.toFixed(2);
  document.getElementById('total-expenses').innerText = totalExpenses.toFixed(2);
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

// Error handling for chart.js
try {
  updateCharts();
  updateTotals();
} catch (error) {
  console.error("Error updating charts or totals:", error);
}