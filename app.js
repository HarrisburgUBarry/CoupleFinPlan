// Budget Planner Application
class BudgetPlanner {
    constructor() {
        this.data = {
            partner1Income: 0,
            partner2Income: 0,
            budgetingMethod: '50-30-20',
            splittingMethod: 'equal',
            expenses: {
                needs: {},
                wants: {},
                savings: {}
            },
            goals: []
        };
        
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderExpenseCategories();
        this.renderTips();
        this.updateAllCalculations();
        this.initializeCharts();
    }

    setupEventListeners() {
        // Income inputs
        document.getElementById('partner1-income').addEventListener('input', (e) => {
            this.data.partner1Income = parseFloat(e.target.value) || 0;
            this.updateAllCalculations();
        });

        document.getElementById('partner2-income').addEventListener('input', (e) => {
            this.data.partner2Income = parseFloat(e.target.value) || 0;
            this.updateAllCalculations();
        });

        // Budgeting method selection
        document.querySelectorAll('input[name="budgeting-method"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.data.budgetingMethod = e.target.value;
                this.updateBudgetAllocation();
                this.updateAllCalculations();
            });
        });

        // Splitting method selection
        document.querySelectorAll('input[name="splitting-method"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.data.splittingMethod = e.target.value;
                this.updateAllCalculations();
            });
        });

        // Expense tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchExpenseTab(e.target.dataset.category);
            });
        });

        // Goal form
        document.getElementById('add-goal-btn').addEventListener('click', () => {
            this.addGoal();
        });
    }

    updateAllCalculations() {
        this.updateIncomeDisplay();
        this.updateBudgetAllocation();
        this.updateExpenseSummary();
        this.updateCharts();
        this.updateBudgetHealth();
        this.updateGoalsProgress();
    }

    updateIncomeDisplay() {
        const totalIncome = this.data.partner1Income + this.data.partner2Income;
        const partner1Percentage = totalIncome > 0 ? (this.data.partner1Income / totalIncome * 100).toFixed(1) : 0;
        const partner2Percentage = totalIncome > 0 ? (this.data.partner2Income / totalIncome * 100).toFixed(1) : 0;

        document.getElementById('total-income').textContent = `$${totalIncome.toFixed(2)}`;
        document.getElementById('partner1-percentage').textContent = `${partner1Percentage}%`;
        document.getElementById('partner2-percentage').textContent = `${partner2Percentage}%`;
    }

    updateBudgetAllocation() {
        const totalIncome = this.data.partner1Income + this.data.partner2Income;
        const allocationDiv = document.getElementById('budget-allocation');
        
        if (totalIncome > 0 && this.data.budgetingMethod === '50-30-20') {
            allocationDiv.style.display = 'block';
            
            const needsAmount = totalIncome * 0.5;
            const wantsAmount = totalIncome * 0.3;
            const savingsAmount = totalIncome * 0.2;
            
            document.getElementById('needs-amount').textContent = `$${needsAmount.toFixed(2)}`;
            document.getElementById('wants-amount').textContent = `$${wantsAmount.toFixed(2)}`;
            document.getElementById('savings-amount').textContent = `$${savingsAmount.toFixed(2)}`;
            
            document.getElementById('needs-percentage').textContent = '(50%)';
            document.getElementById('wants-percentage').textContent = '(30%)';
            document.getElementById('savings-percentage').textContent = '(20%)';
        } else {
            allocationDiv.style.display = 'none';
        }
    }

    renderExpenseCategories() {
        const expenseCategories = {
            needs: [
                {name: "Housing", description: "Rent/mortgage, property taxes, HOA fees"},
                {name: "Utilities", description: "Electricity, gas, water, internet, phone"},
                {name: "Food - Groceries", description: "Essential food and household items"},
                {name: "Transportation", description: "Car payments, gas, insurance, public transit"},
                {name: "Healthcare", description: "Insurance premiums, medications, medical bills"},
                {name: "Insurance", description: "Life, disability, renters/homeowners insurance"},
                {name: "Minimum Debt Payments", description: "Required minimum payments on all debts"}
            ],
            wants: [
                {name: "Dining Out", description: "Restaurants, takeout, coffee shops"},
                {name: "Entertainment", description: "Movies, concerts, streaming services"},
                {name: "Shopping", description: "Clothing, electronics, non-essential items"},
                {name: "Hobbies", description: "Sports, crafts, recreational activities"},
                {name: "Personal Care", description: "Haircuts, spa, cosmetics"},
                {name: "Travel", description: "Vacations, weekend trips"},
                {name: "Gifts", description: "Birthday, holiday, special occasion gifts"}
            ],
            savings: [
                {name: "Emergency Fund", description: "3-6 months of living expenses"},
                {name: "Retirement", description: "401k, IRA, pension contributions"},
                {name: "Extra Debt Payments", description: "Additional payments beyond minimums"},
                {name: "Short-term Savings", description: "Vacation, car, home down payment"},
                {name: "Long-term Investments", description: "Stocks, bonds, mutual funds"}
            ]
        };

        Object.keys(expenseCategories).forEach(category => {
            const container = document.querySelector(`#${category}-expenses .expense-items`);
            container.innerHTML = '';
            
            expenseCategories[category].forEach(item => {
                const expenseItem = this.createExpenseItem(item, category);
                container.appendChild(expenseItem);
            });
        });
    }

    createExpenseItem(item, category) {
        const div = document.createElement('div');
        div.className = 'expense-item';
        
        const expenseKey = `${category}-${item.name.replace(/\s+/g, '-').toLowerCase()}`;
        
        div.innerHTML = `
            <div class="expense-info">
                <div class="expense-name">${item.name}</div>
                <p class="expense-description">${item.description}</p>
            </div>
            <input type="number" class="form-control expense-input" placeholder="$0" min="0" step="0.01" data-expense="${expenseKey}">
            <div class="expense-toggle">
                <span>Shared</span>
                <div class="toggle-switch" data-expense="${expenseKey}"></div>
            </div>
            <span class="expense-split" data-expense="${expenseKey}">50/50</span>
        `;

        // Add event listeners
        const input = div.querySelector('.expense-input');
        const toggle = div.querySelector('.toggle-switch');
        
        input.addEventListener('input', (e) => {
            const amount = parseFloat(e.target.value) || 0;
            if (!this.data.expenses[category]) this.data.expenses[category] = {};
            this.data.expenses[category][expenseKey] = {
                amount: amount,
                shared: this.data.expenses[category][expenseKey]?.shared ?? true
            };
            this.updateAllCalculations();
        });

        toggle.addEventListener('click', () => {
            if (!this.data.expenses[category]) this.data.expenses[category] = {};
            if (!this.data.expenses[category][expenseKey]) {
                this.data.expenses[category][expenseKey] = { amount: 0, shared: true };
            }
            
            this.data.expenses[category][expenseKey].shared = !this.data.expenses[category][expenseKey].shared;
            toggle.classList.toggle('active');
            this.updateExpenseSplit(expenseKey);
            this.updateAllCalculations();
        });

        return div;
    }

    updateExpenseSplit(expenseKey) {
        const splitSpan = document.querySelector(`[data-expense="${expenseKey}"].expense-split`);
        const category = expenseKey.split('-')[0];
        const expenseData = this.data.expenses[category]?.[expenseKey];
        
        if (!expenseData || !expenseData.shared) {
            splitSpan.textContent = 'Personal';
            return;
        }

        const totalIncome = this.data.partner1Income + this.data.partner2Income;
        if (this.data.splittingMethod === 'proportional' && totalIncome > 0) {
            const partner1Percent = (this.data.partner1Income / totalIncome * 100).toFixed(0);
            const partner2Percent = (this.data.partner2Income / totalIncome * 100).toFixed(0);
            splitSpan.textContent = `${partner1Percent}/${partner2Percent}`;
        } else {
            splitSpan.textContent = '50/50';
        }
    }

    switchExpenseTab(category) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        // Update expense categories
        document.querySelectorAll('.expense-category').forEach(cat => cat.classList.remove('active'));
        document.getElementById(`${category}-expenses`).classList.add('active');
    }

    updateExpenseSummary() {
        let totalExpenses = 0;
        
        Object.keys(this.data.expenses).forEach(category => {
            Object.values(this.data.expenses[category] || {}).forEach(expense => {
                totalExpenses += expense.amount || 0;
            });
        });

        const totalIncome = this.data.partner1Income + this.data.partner2Income;
        const remainingBudget = totalIncome - totalExpenses;

        document.getElementById('total-expenses').textContent = `$${totalExpenses.toFixed(2)}`;
        
        const remainingElement = document.getElementById('remaining-budget');
        remainingElement.textContent = `$${remainingBudget.toFixed(2)}`;
        remainingElement.className = `budget-status ${remainingBudget >= 0 ? 'positive' : 'negative'}`;
    }

    addGoal() {
        const goalType = document.getElementById('goal-type').value;
        const goalAmount = parseFloat(document.getElementById('goal-amount').value) || 0;
        const monthlyContribution = parseFloat(document.getElementById('monthly-contribution').value) || 0;

        if (!goalType || goalAmount <= 0) {
            alert('Please fill in all goal fields');
            return;
        }

        const goal = {
            id: Date.now(),
            type: goalType,
            targetAmount: goalAmount,
            monthlyContribution: monthlyContribution,
            currentAmount: 0,
            createdDate: new Date()
        };

        this.data.goals.push(goal);
        this.renderGoals();
        this.updateAllCalculations();

        // Clear form
        document.getElementById('goal-type').value = '';
        document.getElementById('goal-amount').value = '';
        document.getElementById('monthly-contribution').value = '';
    }

    renderGoals() {
        const container = document.getElementById('goals-container');
        container.innerHTML = '';

        if (this.data.goals.length === 0) {
            container.innerHTML = '<p class="text-secondary">No goals set yet. Add your first goal above!</p>';
            return;
        }

        this.data.goals.forEach(goal => {
            const goalElement = this.createGoalElement(goal);
            container.appendChild(goalElement);
        });
    }

    createGoalElement(goal) {
        const div = document.createElement('div');
        div.className = 'goal-item';

        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        const monthsToComplete = goal.monthlyContribution > 0 ? 
            Math.ceil((goal.targetAmount - goal.currentAmount) / goal.monthlyContribution) : 0;

        div.innerHTML = `
            <div class="goal-header">
                <span class="goal-type">${goal.type}</span>
                <span class="goal-amount">$${goal.targetAmount.toLocaleString()}</span>
                <button class="delete-goal" data-goal-id="${goal.id}">✕</button>
            </div>
            <div class="goal-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                </div>
                <div class="progress-text">
                    <span>$${goal.currentAmount.toLocaleString()} saved</span>
                    <span>${progress.toFixed(1)}%</span>
                </div>
            </div>
            <div class="goal-timeline">
                Monthly contribution: $${goal.monthlyContribution.toLocaleString()} • 
                ${monthsToComplete > 0 ? `${monthsToComplete} months to complete` : 'No timeline set'}
            </div>
        `;

        // Add delete functionality
        div.querySelector('.delete-goal').addEventListener('click', (e) => {
            this.deleteGoal(parseInt(e.target.dataset.goalId));
        });

        return div;
    }

    deleteGoal(goalId) {
        this.data.goals = this.data.goals.filter(goal => goal.id !== goalId);
        this.renderGoals();
        this.updateAllCalculations();
    }

    updateGoalsProgress() {
        const container = document.getElementById('goals-progress');
        container.innerHTML = '';

        if (this.data.goals.length === 0) {
            container.innerHTML = '<p class="text-secondary">No goals to track</p>';
            return;
        }

        this.data.goals.forEach(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            
            const goalDiv = document.createElement('div');
            goalDiv.className = 'goal-progress-item';
            goalDiv.innerHTML = `
                <div class="goal-progress-header">
                    <span>${goal.type}</span>
                    <span>${progress.toFixed(1)}%</span>
                </div>
                <div class="mini-progress-bar">
                    <div class="mini-progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                </div>
            `;
            
            container.appendChild(goalDiv);
        });
    }

    updateBudgetHealth() {
        const totalIncome = this.data.partner1Income + this.data.partner2Income;
        
        // Calculate savings rate
        let totalSavings = 0;
        Object.values(this.data.expenses.savings || {}).forEach(expense => {
            totalSavings += expense.amount || 0;
        });
        const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome * 100).toFixed(1) : 0;

        // Calculate debt-to-income ratio
        let totalDebt = 0;
        Object.values(this.data.expenses.needs || {}).forEach(expense => {
            if (expense.amount && expense.amount > 0) {
                totalDebt += expense.amount;
            }
        });
        const debtRatio = totalIncome > 0 ? (totalDebt / totalIncome * 100).toFixed(1) : 0;

        // Calculate emergency fund months
        let totalNeeds = 0;
        Object.values(this.data.expenses.needs || {}).forEach(expense => {
            totalNeeds += expense.amount || 0;
        });
        
        const emergencyFund = this.data.expenses.savings?.['savings-emergency-fund']?.amount || 0;
        const emergencyMonths = totalNeeds > 0 ? (emergencyFund / totalNeeds).toFixed(1) : 0;

        document.getElementById('savings-rate').textContent = `${savingsRate}%`;
        document.getElementById('debt-ratio').textContent = `${debtRatio}%`;
        document.getElementById('emergency-months').textContent = `${emergencyMonths} months`;
    }

    initializeCharts() {
        // Expense breakdown pie chart
        const expenseCtx = document.getElementById('expense-chart').getContext('2d');
        this.charts.expense = new Chart(expenseCtx, {
            type: 'doughnut',
            data: {
                labels: ['Needs', 'Wants', 'Savings'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // Budget vs spending bar chart
        const budgetCtx = document.getElementById('budget-chart').getContext('2d');
        this.charts.budget = new Chart(budgetCtx, {
            type: 'bar',
            data: {
                labels: ['Needs', 'Wants', 'Savings'],
                datasets: [
                    {
                        label: 'Budgeted',
                        data: [0, 0, 0],
                        backgroundColor: '#ECEBD5'
                    },
                    {
                        label: 'Actual',
                        data: [0, 0, 0],
                        backgroundColor: '#1FB8CD'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateCharts() {
        const totalIncome = this.data.partner1Income + this.data.partner2Income;
        
        // Calculate actual spending by category
        let needsSpending = 0, wantsSpending = 0, savingsSpending = 0;
        
        Object.values(this.data.expenses.needs || {}).forEach(expense => {
            needsSpending += expense.amount || 0;
        });
        Object.values(this.data.expenses.wants || {}).forEach(expense => {
            wantsSpending += expense.amount || 0;
        });
        Object.values(this.data.expenses.savings || {}).forEach(expense => {
            savingsSpending += expense.amount || 0;
        });

        // Update expense chart
        this.charts.expense.data.datasets[0].data = [needsSpending, wantsSpending, savingsSpending];
        this.charts.expense.update();

        // Update budget vs spending chart
        if (this.data.budgetingMethod === '50-30-20' && totalIncome > 0) {
            this.charts.budget.data.datasets[0].data = [
                totalIncome * 0.5,
                totalIncome * 0.3,
                totalIncome * 0.2
            ];
        } else {
            this.charts.budget.data.datasets[0].data = [0, 0, 0];
        }
        
        this.charts.budget.data.datasets[1].data = [needsSpending, wantsSpending, savingsSpending];
        this.charts.budget.update();
    }

    renderTips() {
        const tips = [
            "The 50/30/20 rule is a great starting point, but adjust percentages based on your specific situation",
            "Build your emergency fund before focusing on other savings goals",
            "Pay off high-interest debt before investing in lower-return savings",
            "Automate savings and bill payments to stay consistent",
            "Review and adjust your budget monthly",
            "Communicate openly about money to avoid conflicts",
            "Consider using separate accounts for individual spending money",
            "Track expenses for 2-3 months before setting a realistic budget"
        ];

        const container = document.getElementById('tips-container');
        container.innerHTML = '';

        tips.forEach(tip => {
            const tipDiv = document.createElement('div');
            tipDiv.className = 'tip-item';
            tipDiv.innerHTML = `<p>${tip}</p>`;
            container.appendChild(tipDiv);
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.budgetPlanner = new BudgetPlanner();
});