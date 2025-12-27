// Blog JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Category filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const blogCards = document.querySelectorAll('.blog-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter articles
            const category = this.getAttribute('data-category');
            
            blogCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.classList.remove('hidden');
                    // Add fade-in animation
                    card.style.animation = 'fadeIn 0.5s ease';
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
    
    // Load more functionality
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            // Simulate loading more articles
            this.textContent = 'Loading...';
            
            setTimeout(() => {
                // In a real application, this would load more articles from the server
                this.textContent = 'No More Articles';
                this.disabled = true;
                this.style.opacity = '0.5';
            }, 1000);
        });
    }
    
    // Newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            const button = this.querySelector('button');
            const originalText = button.textContent;
            
            // Show loading state
            button.textContent = 'Subscribing...';
            button.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                button.textContent = 'Subscribed!';
                button.style.background = '#4CAF50';
                
                // Reset form
                setTimeout(() => {
                    this.reset();
                    button.textContent = originalText;
                    button.disabled = false;
                    button.style.background = '';
                }, 2000);
            }, 1500);
        });
    }
    
    // Smooth scroll for internal links
    const articleLinks = document.querySelectorAll('a[href^="#"]');
    articleLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const headerOffset = 100;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add reading time estimation
    const articles = document.querySelectorAll('.blog-card');
    articles.forEach(article => {
        const content = article.querySelector('p');
        if (content) {
            // This is a simple estimation - in reality, would calculate based on full article content
            const words = content.textContent.split(' ').length;
            const readingTime = Math.ceil(words / 200); // Assuming 200 words per minute
            
            // Update reading time if it exists
            const timeElement = article.querySelector('.fa-clock');
            if (timeElement && timeElement.parentElement) {
                // Reading time is already set in HTML, but this shows how it could be calculated dynamically
            }
        }
    });
    
    // Add animation to articles on scroll
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
    
    // Observe all blog cards
    blogCards.forEach(card => {
        observer.observe(card);
    });
    
    // Add hover effect to topic tags
    const topicTags = document.querySelectorAll('.topic-tag');
    topicTags.forEach(tag => {
        tag.addEventListener('click', function(e) {
            e.preventDefault();
            
            // In a real application, this would filter articles by topic
            const topic = this.textContent;
            
            // Show all articles for now
            filterButtons.forEach(btn => {
                if (btn.getAttribute('data-category') === 'all') {
                    btn.click();
                }
            });
            
            // Scroll to articles section
            const articlesSection = document.querySelector('.articles-section');
            if (articlesSection) {
                articlesSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    
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