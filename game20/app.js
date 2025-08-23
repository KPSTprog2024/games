// DOM Elements
const itemNameInput = document.getElementById('itemName');
const purchasePriceInput = document.getElementById('purchasePrice');
const calculationMethodRadios = document.querySelectorAll('input[name="calculationMethod"]');
const frequencyInputs = document.getElementById('frequency-inputs');
const frequencyTypeSelect = document.getElementById('frequencyType');
const frequencyCountInput = document.getElementById('frequencyCount');
const startDateInput = document.getElementById('startDate');
const stillInUseCheckbox = document.getElementById('stillInUse');
const endDateGroup = document.getElementById('end-date-group');
const endDateInput = document.getElementById('endDate');
const resetBtn = document.getElementById('resetBtn');

// Result Elements
const costPerUseElement = document.getElementById('costPerUse');
const costPerDayElement = document.getElementById('costPerDay');
const evaluationBadge = document.getElementById('evaluationBadge');
const usagePeriodElement = document.getElementById('usagePeriod');
const totalUsageElement = document.getElementById('totalUsage');

// Constants
const STORAGE_KEY = 'costCalculatorData';
const EVALUATION_CRITERIA = [
    {min: 0, max: 100, level: '優秀', class: 'excellent'},
    {min: 100, max: 500, level: '良好', class: 'good'},
    {min: 500, max: 999999, level: '要検討', class: 'consider'}
];

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY',
        minimumFractionDigits: 0
    }).format(amount);
}

function daysBetween(start, end) {
    const oneDay = 1000 * 60 * 60 * 24;
    const diffTime = Math.abs(end - start);
    return Math.max(1, Math.ceil(diffTime / oneDay));
}

function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

function getOneMonthAgo() {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
}

// Storage Functions
function saveToStorage() {
    const data = {
        itemName: itemNameInput.value,
        purchasePrice: purchasePriceInput.value,
        calculationMethod: document.querySelector('input[name="calculationMethod"]:checked')?.value || 'frequency',
        frequencyType: frequencyTypeSelect.value,
        frequencyCount: frequencyCountInput.value,
        startDate: startDateInput.value,
        stillInUse: stillInUseCheckbox.checked,
        endDate: endDateInput.value
    };
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.warn('Failed to save to localStorage:', error);
    }
}

function loadFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            
            itemNameInput.value = data.itemName || '';
            purchasePriceInput.value = data.purchasePrice || '';
            
            // Set calculation method
            const methodRadio = document.querySelector(`input[name="calculationMethod"][value="${data.calculationMethod}"]`);
            if (methodRadio) {
                methodRadio.checked = true;
            }
            
            frequencyTypeSelect.value = data.frequencyType || 'daily';
            frequencyCountInput.value = data.frequencyCount || '1';
            startDateInput.value = data.startDate || getOneMonthAgo();
            stillInUseCheckbox.checked = data.stillInUse || false;
            endDateInput.value = data.endDate || '';
            
            updateMethodUI();
            toggleEndDateVisibility();
        }
    } catch (error) {
        console.warn('Failed to load from localStorage:', error);
    }
}

function clearStorage() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.warn('Failed to clear localStorage:', error);
    }
}

// UI Update Functions
function updateMethodUI() {
    const selectedMethod = document.querySelector('input[name="calculationMethod"]:checked')?.value;
    
    if (selectedMethod === 'frequency') {
        frequencyInputs.classList.remove('hidden');
    } else {
        frequencyInputs.classList.add('hidden');
    }
}

function toggleEndDateVisibility() {
    if (stillInUseCheckbox.checked) {
        endDateGroup.classList.add('hidden');
    } else {
        endDateGroup.classList.remove('hidden');
    }
}

// Calculation Functions
function calculateTotalUsage(days, frequencyType, frequencyCount) {
    let totalUsage = 0;
    
    switch (frequencyType) {
        case 'daily':
            totalUsage = frequencyCount * days;
            break;
        case 'weekly':
            totalUsage = frequencyCount * (days / 7);
            break;
        case 'monthly':
            totalUsage = frequencyCount * (days / 30.44); // Average month length
            break;
        case 'yearly':
            totalUsage = frequencyCount * (days / 365.25); // Account for leap years
            break;
    }
    
    return Math.max(1, Math.round(totalUsage));
}

function evaluateCost(costPerDay) {
    for (const criteria of EVALUATION_CRITERIA) {
        if (costPerDay >= criteria.min && costPerDay < criteria.max) {
            return criteria;
        }
    }
    return EVALUATION_CRITERIA[EVALUATION_CRITERIA.length - 1];
}

function performCalculation() {
    // Get input values
    const purchasePrice = parseFloat(purchasePriceInput.value) || 0;
    const startDate = new Date(startDateInput.value || getOneMonthAgo());
    const endDate = stillInUseCheckbox.checked ? new Date() : new Date(endDateInput.value || getCurrentDate());
    const frequencyCount = parseFloat(frequencyCountInput.value) || 1;
    const frequencyType = frequencyTypeSelect.value;
    
    // Validate inputs
    if (purchasePrice <= 0) {
        resetResults();
        return;
    }
    
    if (!startDateInput.value) {
        resetResults();
        return;
    }
    
    if (!stillInUseCheckbox.checked && !endDateInput.value) {
        resetResults();
        return;
    }
    
    // Calculate usage period
    const usageDays = daysBetween(startDate, endDate);
    
    // Calculate total usage
    const totalUsage = calculateTotalUsage(usageDays, frequencyType, frequencyCount);
    
    // Calculate costs
    const costPerUse = purchasePrice / totalUsage;
    const costPerDay = purchasePrice / usageDays;
    
    // Update results
    updateResults(costPerUse, costPerDay, usageDays, totalUsage);
}

function updateResults(costPerUse, costPerDay, usageDays, totalUsage) {
    // Update cost displays
    costPerUseElement.textContent = formatCurrency(costPerUse);
    costPerDayElement.textContent = formatCurrency(costPerDay);
    
    // Update evaluation
    const evaluation = evaluateCost(costPerDay);
    evaluationBadge.textContent = evaluation.level;
    evaluationBadge.className = `evaluation-badge ${evaluation.class}`;
    
    // Update detail info
    usagePeriodElement.textContent = `${usageDays}日`;
    totalUsageElement.textContent = `${totalUsage.toLocaleString()}回`;
}

function resetResults() {
    costPerUseElement.textContent = '¥0';
    costPerDayElement.textContent = '¥0';
    evaluationBadge.textContent = 'データを入力してください';
    evaluationBadge.className = 'evaluation-badge';
    usagePeriodElement.textContent = '0日';
    totalUsageElement.textContent = '0回';
}

// Event Handlers
function handleInputChange() {
    saveToStorage();
    performCalculation();
}

function handleMethodChange() {
    updateMethodUI();
    handleInputChange();
}

function handleStillInUseChange() {
    toggleEndDateVisibility();
    handleInputChange();
}

function handleReset() {
    // Reset form
    itemNameInput.value = '';
    purchasePriceInput.value = '';
    document.querySelector('input[name="calculationMethod"][value="frequency"]').checked = true;
    frequencyTypeSelect.value = 'daily';
    frequencyCountInput.value = '1';
    startDateInput.value = getOneMonthAgo();
    stillInUseCheckbox.checked = false;
    endDateInput.value = '';
    
    // Update UI
    updateMethodUI();
    toggleEndDateVisibility();
    
    // Clear storage
    clearStorage();
    
    // Reset results
    resetResults();
}

// Event Listeners
function addEventListeners() {
    // Input change events
    itemNameInput.addEventListener('input', handleInputChange);
    purchasePriceInput.addEventListener('input', handleInputChange);
    frequencyTypeSelect.addEventListener('change', handleInputChange);
    frequencyCountInput.addEventListener('input', handleInputChange);
    startDateInput.addEventListener('change', handleInputChange);
    endDateInput.addEventListener('change', handleInputChange);
    
    // Radio button changes
    calculationMethodRadios.forEach(radio => {
        radio.addEventListener('change', handleMethodChange);
    });
    
    // Checkbox change
    stillInUseCheckbox.addEventListener('change', handleStillInUseChange);
    
    // Reset button
    resetBtn.addEventListener('click', handleReset);
}

// Initialize Application
function initializeApp() {
    // Set default dates if not loaded from storage
    if (!startDateInput.value) {
        startDateInput.value = getOneMonthAgo();
    }
    
    // Load saved data
    loadFromStorage();
    
    // Update UI
    updateMethodUI();
    toggleEndDateVisibility();
    
    // Add event listeners
    addEventListeners();
    
    // Initial calculation
    performCalculation();
}

// Start the application
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}