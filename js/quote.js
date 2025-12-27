// Quote Form JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('quoteForm');
    const insuranceType = document.getElementById('insuranceType');
    const propertySection = document.getElementById('propertySection');
    const vehicleSection = document.getElementById('vehicleSection');
    const successMessage = document.getElementById('successMessage');
    
    // Insurance types that require property details
    const propertyInsurance = ['homeowners', 'condo', 'renters', 'commercial-property'];
    
    // Insurance types that require vehicle details  
    const vehicleInsurance = ['auto', 'motorcycle', 'boat', 'rv', 'commercial-auto'];
    
    // Show/hide relevant sections based on insurance type
    insuranceType.addEventListener('change', function() {
        const selectedType = this.value;
        
        // Show/hide property section
        if (propertyInsurance.includes(selectedType)) {
            propertySection.style.display = 'block';
            vehicleSection.style.display = 'none';
        } 
        // Show/hide vehicle section
        else if (vehicleInsurance.includes(selectedType)) {
            vehicleSection.style.display = 'block';
            propertySection.style.display = 'none';
        } 
        // Hide both for other types
        else {
            propertySection.style.display = 'none';
            vehicleSection.style.display = 'none';
        }
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Show loading state
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span> Submitting...';
        submitBtn.disabled = true;
        
        // Simulate form submission (in production, this would send to a server)
        setTimeout(() => {
            // Hide form and show success message
            form.style.display = 'none';
            successMessage.style.display = 'block';
            
            // Scroll to top of success message
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Store submission data (in production, this would be sent to a server)
            console.log('Quote Request Submitted:', data);
            
            // Optional: Send email notification
            // This would typically be handled server-side
        }, 1500);
    });
    
    // Form validation
    function validateForm() {
        let isValid = true;
        
        // Get all required fields
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            const formGroup = field.closest('.form-group');
            
            // Remove previous error states
            formGroup.classList.remove('error', 'success');
            const errorMsg = formGroup.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.remove();
            }
            
            // Check if field is empty
            if (!field.value.trim()) {
                formGroup.classList.add('error');
                const error = document.createElement('span');
                error.className = 'error-message';
                error.textContent = 'This field is required';
                formGroup.appendChild(error);
                isValid = false;
            } else {
                formGroup.classList.add('success');
            }
        });
        
        // Validate email format
        const emailField = document.getElementById('email');
        if (emailField.value && !isValidEmail(emailField.value)) {
            const formGroup = emailField.closest('.form-group');
            formGroup.classList.remove('success');
            formGroup.classList.add('error');
            
            // Remove any existing error message
            const existingError = formGroup.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            
            const error = document.createElement('span');
            error.className = 'error-message';
            error.textContent = 'Please enter a valid email address';
            formGroup.appendChild(error);
            isValid = false;
        }
        
        // Validate phone format
        const phoneField = document.getElementById('phone');
        if (phoneField.value && !isValidPhone(phoneField.value)) {
            const formGroup = phoneField.closest('.form-group');
            formGroup.classList.remove('success');
            formGroup.classList.add('error');
            
            // Remove any existing error message
            const existingError = formGroup.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            
            const error = document.createElement('span');
            error.className = 'error-message';
            error.textContent = 'Please enter a valid phone number';
            formGroup.appendChild(error);
            isValid = false;
        }
        
        return isValid;
    }
    
    // Email validation
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Phone validation
    function isValidPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length >= 10;
    }
    
    // Format phone number as user types
    const phoneField = document.getElementById('phone');
    phoneField.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value.length <= 3) {
                value = value;
            } else if (value.length <= 6) {
                value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
            } else {
                value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
            }
        }
        e.target.value = value;
    });
    
    // Set minimum date for start date field (today)
    const startDateField = document.getElementById('startDate');
    if (startDateField) {
        const today = new Date().toISOString().split('T')[0];
        startDateField.setAttribute('min', today);
    }
    
    // Add character counter for comments field
    const commentsField = document.getElementById('comments');
    if (commentsField) {
        const maxLength = 500;
        commentsField.setAttribute('maxlength', maxLength);
        
        // Create character counter element
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.style.textAlign = 'right';
        counter.style.fontSize = '0.85rem';
        counter.style.color = '#999';
        counter.style.marginTop = '5px';
        counter.textContent = `0 / ${maxLength} characters`;
        
        commentsField.parentElement.appendChild(counter);
        
        // Update counter on input
        commentsField.addEventListener('input', function() {
            const remaining = maxLength - this.value.length;
            counter.textContent = `${this.value.length} / ${maxLength} characters`;
            
            if (remaining < 50) {
                counter.style.color = '#ff9800';
            } else {
                counter.style.color = '#999';
            }
        });
    }
    
    // Add animation to form sections
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all form sections
    const formSections = document.querySelectorAll('.form-section, .benefit-card');
    formSections.forEach(section => {
        observer.observe(section);
    });
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);