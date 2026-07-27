/**
 * Alex Morgan - Portfolio Website JS
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
        isDark = theme === 'dark';
        particleColor = isDark ? 'rgba(129, 140, 248, 0.4)' : 'rgba(79, 70, 229, 0.2)';
        lineColor = isDark ? 'rgba(192, 132, 252, 0.08)' : 'rgba(147, 51, 234, 0.05)';
        particles.forEach(p => p.updateColor(particleColor));
    };

    // Handle Resize
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    }
    
    window.addEventListener('resize', resizeCanvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Mouse events
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle Object
    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.baseRadius = Math.random() * 2 + 1.5;
            this.radius = this.baseRadius;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.color = particleColor;
        }

        updateColor(color) {
            this.color = color;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            // Collision with boundaries
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

            this.x += this.vx;
            this.y += this.vy;

            // Mouse interaction
            if (mouse.x != null && mouse.y != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < mouse.radius) {
                    let force = (mouse.radius - dist) / mouse.radius;
                    let angle = Math.atan2(dy, dx);
                    
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
        "Java Full Stack Apps", 
        "Spring Boot REST APIs", 
        "React User Interfaces", 
        "Scalable Database Systems"
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
            typingSpeed = 50; // Deletes faster
        } else {
            textElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 120; // Natural typing pace
        }

        // Handle states
        if (!isDeleting && charIndex === currentWord.length) {
            typingSpeed = 2000; // Pause at end of word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typingSpeed = 500; // Pause before typing new word
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
                const category = card.getAttribute('data-category');
                
                // Add scale out transition
                card.style.transform = 'scale(0.85)';
                card.style.opacity = '0';
                
                setTimeout(() => {
                    if (filterValue === 'all' || category === filterValue) {
                        card.classList.remove('hide');
                        setTimeout(() => {
                            card.style.transform = 'scale(1)';
                            card.style.opacity = '1';
                        }, 50);
                    } else {
                        card.classList.add('hide');
                    }
                }, 300); // Matches transitions
            });
        });
    });
}

/* ==========================================
   6. INTERSECTION OBSERVER FOR SCROLL FADES
   ========================================== */
function initScrollAnimations() {
    // Add fade-in classes to elements dynamically for clean setup
    const sections = document.querySelectorAll('section');
    const headers = document.querySelectorAll('.section-title');
    const cards = document.querySelectorAll('.project-card, .timeline-content, .contact-card, .contact-form-box');

    // Setup helper classes
    headers.forEach(h => h.classList.add('fade-in-up'));
    cards.forEach(c => c.classList.add('fade-in-up'));

    const options = {
        threshold: 0.12,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target); // Trigger only once
            }
        });
    }, options);

    // Observe animatable elements
    const elementsToAnimate = document.querySelectorAll('.fade-in-up');
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });

    // Handle Nav link highlighting on scroll
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
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
        e.preventDefault(); // Prevent default page refresh

        // Loading state
        const originalBtnHTML = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span>Sending...</span>
            <svg class="btn-icon spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite">
                <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
            </svg>
        `;

        // Simulate network call
        setTimeout(() => {
            // Revert state
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;

            // Reset form fields
            form.reset();

            // Display custom success toast
            showToast("Your message was sent successfully!");
        }, 1500);
    });

    function showToast(message) {
        toastText.textContent = message;
        toast.classList.add('show');

        // Dismiss Toast after 4 seconds
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
