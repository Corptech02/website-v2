// Coverage Calculator JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    const tabs = document.querySelectorAll('.calc-tab');
    const calculators = document.querySelectorAll('.calculator-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const calcType = this.getAttribute('data-calc');
            
            // Remove active class from all tabs and calculators
            tabs.forEach(t => t.classList.remove('active'));
            calculators.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding calculator
            this.classList.add('active');
            document.getElementById(`${calcType}-calc`).classList.add('active');
        });
    });
    
    // Homeowners Insurance Calculator
    const homeForm = document.getElementById('homeCalculator');
    if (homeForm) {
        homeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateHomeInsurance();
        });
    }
    
    // Auto Insurance Calculator
    const autoForm = document.getElementById('autoCalculator');
    if (autoForm) {
        autoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateAutoInsurance();
        });
    }
    
    // Life Insurance Calculator
    const lifeForm = document.getElementById('lifeCalculator');
    if (lifeForm) {
        lifeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateLifeInsurance();
        });
    }
    
    // Business Insurance Calculator
    const businessForm = document.getElementById('businessCalculator');
    if (businessForm) {
        businessForm.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateBusinessInsurance();
        });
    }
});

// Homeowners Insurance Calculation
function calculateHomeInsurance() {
    const homeValue = parseFloat(document.getElementById('homeValue').value) || 0;
    const homeSize = parseFloat(document.getElementById('homeSize').value) || 0;
    const buildYear = parseInt(document.getElementById('buildYear').value) || 2000;
    const personalProperty = parseFloat(document.getElementById('personalProperty').value) || 0;
    const location = document.getElementById('location').value;
    
    // Calculate dwelling coverage (rebuild cost)
    const costPerSqFt = location === 'high' ? 200 : location === 'medium' ? 150 : 120;
    const dwellingCoverage = Math.max(homeValue * 1.25, homeSize * costPerSqFt);
    
    // Other structures (10% of dwelling)
    const otherStructures = dwellingCoverage * 0.10;
    
    // Personal property (50-70% of dwelling or actual value)
    const personalPropertyCoverage = Math.max(personalProperty, dwellingCoverage * 0.60);
    
    // Loss of use (20% of dwelling)
    const lossOfUse = dwellingCoverage * 0.20;
    
    // Personal liability (standard $300,000 - $500,000)
    const personalLiability = homeValue > 500000 ? 500000 : 300000;
    
    // Calculate annual premium based on various factors
    let basePremium = dwellingCoverage * 0.0035; // 0.35% of dwelling coverage
    
    // Age factor
    const age = new Date().getFullYear() - buildYear;
    if (age > 30) basePremium *= 1.25;
    else if (age > 20) basePremium *= 1.15;
    else if (age < 10) basePremium *= 0.95;
    
    // Location factor
    if (location === 'high') basePremium *= 1.50;
    else if (location === 'medium') basePremium *= 1.15;
    
    // Display results
    document.getElementById('dwellingCoverage').textContent = formatCurrency(dwellingCoverage);
    document.getElementById('otherStructures').textContent = formatCurrency(otherStructures);
    document.getElementById('personalPropertyCoverage').textContent = formatCurrency(personalPropertyCoverage);
    document.getElementById('lossOfUse').textContent = formatCurrency(lossOfUse);
    document.getElementById('personalLiability').textContent = formatCurrency(personalLiability);
    document.getElementById('annualPremium').textContent = formatCurrency(basePremium) + '/year';
    
    // Show results
    document.getElementById('homeResults').style.display = 'block';
    document.getElementById('homeResults').scrollIntoView({ behavior: 'smooth' });
}

// Auto Insurance Calculation
function calculateAutoInsurance() {
    const vehicleValue = parseFloat(document.getElementById('vehicleValue').value) || 0;
    const vehicleYear = parseInt(document.getElementById('vehicleYear').value) || 2020;
    const annualMiles = parseFloat(document.getElementById('annualMiles').value) || 12000;
    const driverAge = parseInt(document.getElementById('driverAge').value) || 30;
    const drivingRecord = document.getElementById('drivingRecord').value;
    const coverageLevel = document.getElementById('coverageLevel').value;
    
    // Coverage amounts based on level
    let bodilyInjury, propertyDamage, collision, comprehensive, uninsured;
    
    if (coverageLevel === 'minimum') {
        bodilyInjury = 25000; // per person / 50000 per accident
        propertyDamage = 25000;
        collision = 0;
        comprehensive = 0;
        uninsured = 25000;
    } else if (coverageLevel === 'standard') {
        bodilyInjury = 100000; // per person / 300000 per accident
        propertyDamage = 100000;
        collision = vehicleValue > 5000 ? vehicleValue : 0;
        comprehensive = vehicleValue > 5000 ? vehicleValue : 0;
        uninsured = 100000;
    } else { // full
        bodilyInjury = 250000; // per person / 500000 per accident
        propertyDamage = 250000;
        collision = vehicleValue;
        comprehensive = vehicleValue;
        uninsured = 250000;
    }
    
    // Calculate monthly premium
    let monthlyPremium = 50; // Base premium
    
    // Vehicle value factor
    monthlyPremium += (vehicleValue * 0.002);
    
    // Age of vehicle factor
    const vehicleAge = new Date().getFullYear() - vehicleYear;
    if (vehicleAge < 3) monthlyPremium *= 1.3;
    else if (vehicleAge > 10) monthlyPremium *= 0.8;
    
    // Driver age factor
    if (driverAge < 25) monthlyPremium *= 2.0;
    else if (driverAge < 30) monthlyPremium *= 1.5;
    else if (driverAge > 65) monthlyPremium *= 1.2;
    
    // Driving record factor
    switch(drivingRecord) {
        case 'excellent': monthlyPremium *= 0.85; break;
        case 'good': monthlyPremium *= 1.0; break;
        case 'fair': monthlyPremium *= 1.35; break;
        case 'poor': monthlyPremium *= 2.0; break;
    }
    
    // Mileage factor
    if (annualMiles > 15000) monthlyPremium *= 1.15;
    else if (annualMiles < 7500) monthlyPremium *= 0.90;
    
    // Coverage level factor
    if (coverageLevel === 'full') monthlyPremium *= 1.5;
    else if (coverageLevel === 'minimum') monthlyPremium *= 0.6;
    
    // Display results
    document.getElementById('bodilyInjury').textContent = formatCoverage(bodilyInjury);
    document.getElementById('propertyDamage').textContent = formatCoverage(propertyDamage);
    document.getElementById('collision').textContent = collision > 0 ? formatCurrency(collision) : 'Not Included';
    document.getElementById('comprehensive').textContent = comprehensive > 0 ? formatCurrency(comprehensive) : 'Not Included';
    document.getElementById('uninsured').textContent = formatCoverage(uninsured);
    document.getElementById('autoMonthlyPremium').textContent = formatCurrency(monthlyPremium) + '/month';
    
    // Show results
    document.getElementById('autoResults').style.display = 'block';
    document.getElementById('autoResults').scrollIntoView({ behavior: 'smooth' });
}

// Life Insurance Calculation
function calculateLifeInsurance() {
    const annualIncome = parseFloat(document.getElementById('annualIncome').value) || 0;
    const currentAge = parseInt(document.getElementById('currentAge').value) || 30;
    const dependents = parseInt(document.getElementById('dependents').value) || 0;
    const mortgage = parseFloat(document.getElementById('mortgage').value) || 0;
    const otherDebts = parseFloat(document.getElementById('otherDebts').value) || 0;
    const collegeFund = parseFloat(document.getElementById('collegeFund').value) || 0;
    const finalExpenses = parseFloat(document.getElementById('finalExpenses').value) || 15000;
    
    // Calculate coverage needs
    const incomeReplacement = annualIncome * 10; // 10 years of income
    const mortgagePayoff = mortgage;
    const debtPayoff = otherDebts;
    const educationFund = collegeFund;
    const finalExpensesAmount = finalExpenses;
    
    const totalCoverage = incomeReplacement + mortgagePayoff + debtPayoff + educationFund + finalExpensesAmount;
    
    // Calculate monthly premium for term life insurance
    let monthlyPremium = (totalCoverage / 1000) * 0.5; // Base rate per $1000 of coverage
    
    // Age factor
    if (currentAge < 30) monthlyPremium *= 0.8;
    else if (currentAge < 40) monthlyPremium *= 1.0;
    else if (currentAge < 50) monthlyPremium *= 1.5;
    else if (currentAge < 60) monthlyPremium *= 2.5;
    else monthlyPremium *= 4.0;
    
    // Display results
    document.getElementById('incomeReplacement').textContent = formatCurrency(incomeReplacement);
    document.getElementById('mortgagePayoff').textContent = formatCurrency(mortgagePayoff);
    document.getElementById('debtPayoff').textContent = formatCurrency(debtPayoff);
    document.getElementById('educationFund').textContent = formatCurrency(educationFund);
    document.getElementById('finalExpensesResult').textContent = formatCurrency(finalExpensesAmount);
    document.getElementById('totalLifeCoverage').textContent = formatCurrency(totalCoverage);
    document.getElementById('lifeMonthlyPremium').textContent = formatCurrency(monthlyPremium) + '/month';
    
    // Show results
    document.getElementById('lifeResults').style.display = 'block';
    document.getElementById('lifeResults').scrollIntoView({ behavior: 'smooth' });
}

// Business Insurance Calculation
function calculateBusinessInsurance() {
    const businessType = document.getElementById('businessType').value;
    const annualRevenue = parseFloat(document.getElementById('annualRevenue').value) || 0;
    const employees = parseInt(document.getElementById('employees').value) || 0;
    const propertyValue = parseFloat(document.getElementById('propertyValue').value) || 0;
    const equipmentValue = parseFloat(document.getElementById('equipmentValue').value) || 0;
    const vehicleCount = parseInt(document.getElementById('vehicleCount').value) || 0;
    
    // General Liability (based on revenue and business type)
    let generalLiability = Math.max(1000000, annualRevenue * 0.1);
    if (generalLiability > 2000000) generalLiability = 2000000;
    
    // Property Insurance
    const businessProperty = propertyValue + equipmentValue;
    
    // Business Interruption (6-12 months of revenue)
    const businessInterruption = annualRevenue * 0.75;
    
    // Workers' Compensation (based on employees and business type)
    let workersCompPerEmployee = 500; // Base annual cost per employee
    switch(businessType) {
        case 'office': workersCompPerEmployee = 300; break;
        case 'retail': workersCompPerEmployee = 500; break;
        case 'restaurant': workersCompPerEmployee = 800; break;
        case 'contractor': workersCompPerEmployee = 2000; break;
        case 'manufacturing': workersCompPerEmployee = 1500; break;
        case 'healthcare': workersCompPerEmployee = 600; break;
        case 'tech': workersCompPerEmployee = 250; break;
    }
    const workersComp = employees * workersCompPerEmployee;
    
    // Commercial Auto
    const commercialAuto = vehicleCount * 50000; // $50k per vehicle coverage
    
    // Professional Liability (for applicable businesses)
    let professionalLiability = 0;
    if (['office', 'tech', 'healthcare'].includes(businessType)) {
        professionalLiability = Math.max(1000000, annualRevenue * 0.05);
    }
    
    // Calculate annual premium
    let annualPremium = 0;
    annualPremium += generalLiability * 0.002; // 0.2% of coverage
    annualPremium += businessProperty * 0.004; // 0.4% of property value
    annualPremium += businessInterruption * 0.001; // 0.1% of coverage
    annualPremium += workersComp;
    annualPremium += vehicleCount * 1200; // $1200 per vehicle per year
    annualPremium += professionalLiability * 0.003; // 0.3% of coverage
    
    // Business type factor
    switch(businessType) {
        case 'contractor': annualPremium *= 1.5; break;
        case 'restaurant': annualPremium *= 1.3; break;
        case 'manufacturing': annualPremium *= 1.4; break;
        case 'healthcare': annualPremium *= 1.2; break;
    }
    
    // Display results
    document.getElementById('generalLiability').textContent = formatCurrency(generalLiability);
    document.getElementById('businessProperty').textContent = formatCurrency(businessProperty);
    document.getElementById('businessInterruption').textContent = formatCurrency(businessInterruption);
    document.getElementById('workersComp').textContent = formatCurrency(workersComp) + '/year';
    document.getElementById('commercialAuto').textContent = vehicleCount > 0 ? formatCurrency(commercialAuto) : 'Not Needed';
    document.getElementById('professionalLiability').textContent = professionalLiability > 0 ? formatCurrency(professionalLiability) : 'Not Needed';
    document.getElementById('businessAnnualPremium').textContent = formatCurrency(annualPremium) + '/year';
    
    // Show results
    document.getElementById('businessResults').style.display = 'block';
    document.getElementById('businessResults').scrollIntoView({ behavior: 'smooth' });
}

// Helper Functions
function formatCurrency(amount) {
    return '$' + Math.round(amount).toLocaleString();
}

function formatCoverage(amount) {
    if (amount >= 1000000) {
        return '$' + (amount / 1000000).toFixed(1) + 'M';
    }
    return '$' + (amount / 1000).toFixed(0) + 'K';
}

// Reset Functions
function resetHomeCalc() {
    document.getElementById('homeCalculator').reset();
    document.getElementById('homeResults').style.display = 'none';
}

function resetAutoCalc() {
    document.getElementById('autoCalculator').reset();
    document.getElementById('autoResults').style.display = 'none';
}

function resetLifeCalc() {
    document.getElementById('lifeCalculator').reset();
    document.getElementById('lifeResults').style.display = 'none';
}

function resetBusinessCalc() {
    document.getElementById('businessCalculator').reset();
    document.getElementById('businessResults').style.display = 'none';
}