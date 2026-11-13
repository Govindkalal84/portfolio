/**
 * Govind Sadhanande - Portfolio Website JS
 * Interactive functionalities including Canvas background, Theme Manager,
 * typing effects, project filter tabs, scroll animation, and contact form.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize core components
    initTheme();
    initMobileMenu();
    initCanvasBackground();
    initTypingEffect();
    initProjectFilter();
    initScrollAnimations();
    initContactForm();
});

/* ==========================================
   1. THEME MANAGER
   ========================================== */
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
    } else {
        htmlElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }

    // Toggle theme handler
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Trigger particle theme update if canvas is running
        if (window.updateParticleTheme) {
            window.updateParticleTheme(newTheme);
        }
    });
}

/* ==========================================
   2. MOBILE NAV MENU
   ========================================== */
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.getElementById('navbar');

    // Toggle mobile menu active state
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Change navbar padding on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

/* ==========================================
   3. CANVAS PARTICLE BACKGROUND
   ========================================== */
function initCanvasBackground() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, radius: 120 };

    // Track theme colors
    let isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    let particleColor = isDark ? 'rgba(129, 140, 248, 0.4)' : 'rgba(79, 70, 229, 0.2)';
    let lineColor = isDark ? 'rgba(192, 132, 252, 0.08)' : 'rgba(147, 51, 234, 0.05)';

    // Expose theme updater globally
    window.updateParticleTheme = function(theme) {
        const dark = theme === 'dark';
        particleColor = dark ? 'rgba(129, 140, 248, 0.4)' : 'rgba(79, 70, 229, 0.2)';
        lineColor = dark ? 'rgba(192, 132, 252, 0.08)' : 'rgba(147, 51, 234, 0.05)';
    };

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });

    // Track mouse interaction
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle Class
    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.baseRadius = Math.random() * 2 + 1;
            this.radius = this.baseRadius;
            this.speedX = (Math.random() - 0.5) * 0.8;
            this.speedY = (Math.random() - 0.5) * 0.8;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = particleColor;
            ctx.fill();
        }

        update() {
            // Standard drift
            this.x += this.speedX;
            this.y += this.speedY;

            // Bounce off boundaries
            if (this.x < 0 || this.x > canvas.width) this.speedX = -this.speedX;
            if (this.y < 0 || this.y > canvas.height) this.speedY = -this.speedY;

            // Mouse proximity repulsion/attraction
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    // Pull particles closer to mouse gently
                    this.x += Math.cos(angle) * force * 1.5;
                    this.y += Math.sin(angle) * force * 1.5;
                    this.radius = this.baseRadius + force * 1.5;
                } else {
                    if (this.radius > this.baseRadius) {
                        this.radius -= 0.1;
                    }
                }
            }
        }
    }

    function initParticles() {
        particles = [];
        // Scale number of particles by screen area
        const numberOfParticles = Math.floor((canvas.width * canvas.height) / 11000);
        const cappedParticles = Math.min(numberOfParticles, 120); // Cap for performance
        
        for (let i = 0; i < cappedParticles; i++) {
            let x = Math.random() * canvas.width;
            let y = Math.random() * canvas.height;
            particles.push(new Particle(x, y));
        }
    }

    function drawLines() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                let dx = particles[i].x - particles[j].x;
                let dy = particles[i].y - particles[j].y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = lineColor;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        drawLines();
        requestAnimationFrame(animate);
    }

    initParticles();
    animate();
}

/* ==========================================
   4. TYPING EFFECT (HERO)
   ========================================== */
function initTypingEffect() {
    const textElement = document.getElementById('typing-text');
    if (!textElement) return;

    const words = [
        "Distributed Microservices", 
        "Spring Boot Backends", 
        "Low-Latency gRPC & Kafka Pipelines", 
        "Concurrency-Safe APIs",
        "Responsive React Interfaces"
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            textElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 40; // Deletes faster
        } else {
            textElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 110; // Natural typing pace
        }

        // Handle states
        if (!isDeleting && charIndex === currentWord.length) {
            typingSpeed = 2200; // Pause at end of word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typingSpeed = 450; // Pause before typing new word
        }

        setTimeout(type, typingSpeed);
    }

    type();
}

/* ==========================================
   5. PROJECT FILTER TAB SYSTEM
   ========================================== */
function initProjectFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active state from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active to current
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category') || '';
                
                // Add scale out transition
                card.style.transform = 'scale(0.85)';
                card.style.opacity = '0';
                
                setTimeout(() => {
                    if (filterValue === 'all' || category.includes(filterValue)) {
                        card.classList.remove('hide');
                        setTimeout(() => {
                            card.style.transform = 'scale(1)';
                            card.style.opacity = '1';
                        }, 50);
                    } else {
                        card.classList.add('hide');
                    }
                }, 250);
            });
        });
    });
}

/* ==========================================
   6. INTERSECTION OBSERVER FOR SCROLL FADES
   ========================================== */
function initScrollAnimations() {
    const sections = document.querySelectorAll('section');
    const headers = document.querySelectorAll('.section-title');
    const cards = document.querySelectorAll('.project-card, .timeline-content, .contact-card, .contact-form-box, .metric-card, .skills-card');

    // Setup helper classes
    headers.forEach(h => h.classList.add('fade-in-up'));
    cards.forEach(c => c.classList.add('fade-in-up'));

    const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target);
            }
        });
    }, options);

    const elementsToAnimate = document.querySelectorAll('.fade-in-up');
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });

    // Handle Nav link highlighting on scroll
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 180;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });
}

/* ==========================================
   7. CONTACT FORM SUBMISSION HANDLER & TOAST
   ========================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');
    const submitBtn = document.getElementById('form-submit-btn');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('form-name');
        const emailInput = document.getElementById('form-email');
        const subjectInput = document.getElementById('form-subject');
        const messageInput = document.getElementById('form-message');

        const originalBtnHTML = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span>Preparing Message...</span>
            <svg class="btn-icon spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite">
                <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
            </svg>
        `;

        setTimeout(() => {
            // Open user's mail client directly as guaranteed fallback
            const recipient = "ntg043172@gmail.com";
            const subject = encodeURIComponent(`[Portfolio Inquiry] ${subjectInput.value}`);
            const body = encodeURIComponent(`Hi Govind,\n\nName: ${nameInput.value}\nEmail: ${emailInput.value}\n\nMessage:\n${messageInput.value}`);
            
            window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;

            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
            form.reset();
            showToast("Opening mail client to send your message!");
        }, 1000);
    });

    function showToast(message) {
        toastText.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }
}

// Inline CSS for loader spin animation dynamically
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;
document.head.appendChild(styleSheet);
