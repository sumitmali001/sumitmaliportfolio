document.addEventListener('DOMContentLoaded', () => {
    // --- State and Cache ---
    const state = {
        theme: localStorage.getItem('theme') || 'dark',
        currentSection: 'home'
    };

    const elements = {
        body: document.body,
        themeBtn: document.getElementById('theme-toggle'),
        mobileBtn: document.getElementById('mobile-menu-btn'),
        mobileMenu: document.getElementById('mobile-menu'),
        main: document.getElementById('main-container'),
        navLinks: document.querySelectorAll('.nav-link'),
        modal: document.getElementById('modal'),
        closeModal: document.getElementById('close-modal'),
        modalBody: document.getElementById('modal-body')
    };

    // --- Initialization ---
    initTheme();
    loadSection(state.currentSection);
    bindEvents();

    // --- Core Functions ---

    function initTheme() {
        if (state.theme === 'light') {
            elements.body.classList.replace('dark-theme', 'light-theme');
            elements.body.classList.remove('dark-theme');
            elements.body.classList.add('light-theme');
            elements.themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            elements.body.classList.replace('light-theme', 'dark-theme');
            elements.body.classList.remove('light-theme');
            elements.body.classList.add('dark-theme');
            elements.themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    function toggleTheme() {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', state.theme);

        // Add a subtle rotation animation
        elements.themeBtn.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            initTheme();
            elements.themeBtn.style.transform = 'rotate(0deg)';
        }, 300);
    }

    function toggleMobileMenu() {
        elements.mobileMenu.classList.toggle('active');
        const icon = elements.mobileMenu.classList.contains('active') ? 'fa-times' : 'fa-bars';
        elements.mobileBtn.innerHTML = `<i class="fas ${icon}"></i>`;
    }

    async function loadSection(sectionId) {
        // Find template
        const template = document.getElementById(`tpl-${sectionId}`);
        if (!template) return;

        // Perform fade out transition
        if (elements.main.innerHTML !== '') {
            elements.main.style.opacity = '0';
            elements.main.style.transform = 'scale(0.98)';
            await new Promise(res => setTimeout(res, 300));
        }

        // Clone and inject content
        const content = template.innerHTML;
        elements.main.innerHTML = content;

        // Update active nav links
        elements.navLinks.forEach(link => {
            if (link.dataset.target === sectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Close mobile menu if open
        if (elements.mobileMenu.classList.contains('active')) {
            toggleMobileMenu();
        }

        // Perform fade in transition
        requestAnimationFrame(() => {
            elements.main.style.opacity = '1';
            elements.main.style.transform = 'scale(1)';
            initDynamicElements();
        });

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        state.currentSection = sectionId;
    }

    // --- Dynamic Elements Initialization ---

    function initDynamicElements() {
        // Re-bind internal navigation links inside the new content
        const internalNavs = elements.main.querySelectorAll('.nav-trigger');
        internalNavs.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget.dataset.target;
                loadSection(target);
            });
        });

        // Initialize 3D Tilt Effect
        initTiltEffect();

        // Initialize Modals for Projects
        const viewBtns = elements.main.querySelectorAll('.view-details');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                openModal(id);
            });
        });

        // Initialize Form handler if contact section
        const form = document.getElementById('contact-form');
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }

        // Initialize Intersection Observer for scroll animations (if main container scrolls)
        initObserver();
    }

    // --- Interactive Micro-Interactions ---

    function initTiltEffect() {
        const tiltElements = elements.main.querySelectorAll('.tilt-element, .project-card, .cert-card');

        tiltElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg
                const rotateY = ((x - centerX) / centerX) * 10;

                el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                el.style.transition = 'none';
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                el.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            });
        });
    }

    // --- Modals ---

    function openModal(id) {
        // Dummy data based on ID
        const projectData = {
            p1: { title: 'Resume Fit', desc: 'ResumeFit optimizes resumes using real-time AI analysis. Developed as an AI Lab project showcasing AI integration, web programming, and interactive user interfaces.', stack: ['HTML', 'CSS', 'JS', 'Python'] },
            p2: { title: 'CPU Scheduler Solver', desc: 'A Python-based graphical simulator collaboratively developed under an Operating Systems course. It visually simulates FCFS, SJF, SRTF, Priority, and Round Robin scheduling, generating real-time Gantt charts and computing metrics like Completion, Turnaround, and Waiting Times. Co-authored by Sumit Mali & Chirag Maloo.', stack: ['Python 3', 'QtPy', 'Matplotlib'] },
            p3: { title: '1612x Microprocessor', desc: 'A custom-built 16-bit CPU designed and meticulously implemented using Logisim for a Computer Organization and Architecture (COA) laboratory project. This project extensively demonstrates the internal working of a basic processor, including instruction fetch, decode, execute cycles, ALU operations, register management, and memory interfacing.', stack: ['Logisim', 'Digital Logic'] }
        };

        const data = projectData[id];

        if (data) {
            elements.modalBody.innerHTML = `
                <div class="animate-scale">
                    <h2 class="gradient-text" style="font-size: 2rem; margin-bottom: 15px;">${data.title}</h2>
                    <p style="margin-bottom: 20px; line-height: 1.6;">${data.desc}</p>
                    <div class="tech-stack" style="margin-bottom: 20px;">
                        ${data.stack.map(tech => `<span class="badge glassmorphism" style="color:var(--text-color); border-color:var(--primary-color)">${tech}</span>`).join('')}
                    </div>
                    <button class="btn btn-primary" onclick="document.getElementById('close-modal').click()">Close Details</button>
                </div>
            `;
            elements.modal.classList.add('active');
            elements.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        elements.modal.classList.remove('active');
        elements.body.style.overflow = '';
        setTimeout(() => {
            elements.modalBody.innerHTML = '';
        }, 400);
    }

    // --- Form Handling ---

    function handleFormSubmit(e) {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;

        // Loading state
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Sending...';
        btn.style.opacity = '0.8';
        btn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-check"></i> Sent Successfully!';
            btn.classList.remove('btn-primary');
            btn.style.background = '#10b981'; // Success color
            btn.style.color = '#fff';

            e.target.reset();

            // Reset button after 3s
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.classList.add('btn-primary');
                btn.style.opacity = '1';
                btn.disabled = false;
            }, 3000);
        }, 1500);
    }

    // --- Scroll Animations (Intersection Observer) ---

    function initObserver() {
        const animatedElements = elements.main.querySelectorAll('.animate-fade, .animate-slide-up, .animate-slide-left, .animate-scale');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Elements already have animation classes applied, 
                    // but we ensure they run when in view by resetting animation state
                    entry.target.style.animationPlayState = 'running';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(el => {
            el.style.animationPlayState = 'paused';
            observer.observe(el);
        });
    }

    // --- Event Listeners Binding ---

    function bindEvents() {
        elements.themeBtn.addEventListener('click', toggleTheme);
        elements.mobileBtn.addEventListener('click', toggleMobileMenu);

        elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.currentTarget.dataset.target;
                if (target !== state.currentSection) {
                    loadSection(target);
                }
            });
        });

        elements.closeModal.addEventListener('click', closeModal);
        elements.modal.addEventListener('click', (e) => {
            if (e.target === elements.modal) {
                closeModal();
            }
        });

        // Escape key for modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && elements.modal.classList.contains('active')) {
                closeModal();
            }
        });

        // Add base transition properties for main container
        elements.main.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    }

    // Background parallax effect
    document.addEventListener('mousemove', (e) => {
        const moveX = (e.clientX - window.innerWidth / 2) * 0.05;
        const moveY = (e.clientY - window.innerHeight / 2) * 0.05;

        const bgWrapper = document.querySelector('.bg-wrapper');
        if (bgWrapper) {
            bgWrapper.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
    });

});
