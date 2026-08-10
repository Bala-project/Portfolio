
document.addEventListener('DOMContentLoaded', () => {
  // Initialize EmailJS with your Public Key
  // Get your key from: https://dashboard.emailjs.com/admin/account
  emailjs.init('6iak7Py1HCSI9aMGo'); // Replace with your actual public key

  initMobileNav();
  initScrollSpyAndTrace();
  initRevealAnimations();
  initBackToTop();
  initContactForm();
  initTypingEffect();
  initParticleBackground();
  initSmoothScroll();
  initResumeButtons();
  initLiveLinks();
  document.getElementById('year').textContent = new Date().getFullYear();
});

/* ---------- Mobile navigation ---------- */
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    toggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  });

  menu.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (menu.classList.contains('open') && !menu.contains(e.target) && !toggle.contains(e.target)) {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ---------- Active nav highlighting + signal trace progress ---------- */
function initScrollSpyAndTrace() {
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const traceFill = document.getElementById('traceFill');

  function updateOnScroll() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0;

    if (traceFill) {
      traceFill.setAttribute('y2', (progress * 100).toFixed(2));
    }

    let current = sections[0]?.id || 'home';
    const offset = 120;

    for (const section of sections) {
      const top = section.offsetTop - offset;
      const bottom = top + section.offsetHeight;
      if (scrollY >= top && scrollY < bottom) {
        current = section.id;
        break;
      }
    }

    navLinks.forEach((link) => {
      const isActive = link.dataset.section === current;
      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  window.addEventListener('scroll', updateOnScroll, { passive: true });
  window.addEventListener('resize', updateOnScroll, { passive: true });
  updateOnScroll();
}

/* ---------- Reveal-on-scroll animations ---------- */
function initRevealAnimations() {
  const revealEls = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay) || 0;
          setTimeout(() => {
            entry.target.classList.add('in-view');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach((el) => observer.observe(el));
}

/* ---------- Back to top button ---------- */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  let lastScrollY = 0;

  window.addEventListener(
    'scroll',
    () => {
      const currentScrollY = window.scrollY;
      const isVisible = currentScrollY > 500;
      
      btn.classList.toggle('visible', isVisible);
      
      if (currentScrollY > lastScrollY && currentScrollY > 500) {
        btn.classList.add('scrolling-down');
      } else {
        btn.classList.remove('scrolling-down');
      }
      
      lastScrollY = currentScrollY;
    },
    { passive: true }
  );

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

/* ---------- Contact form with EmailJS ---------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const fields = {
    name: { 
      el: document.getElementById('name'), 
      error: document.getElementById('nameError'),
      validate: (val) => val.trim().length >= 2 || 'Name must be at least 2 characters'
    },
    email: { 
      el: document.getElementById('email'), 
      error: document.getElementById('emailError'),
      validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Enter a valid email address'
    },
    subject: { 
      el: document.getElementById('subject'), 
      error: document.getElementById('subjectError'),
      validate: (val) => val.trim().length >= 3 || 'Subject must be at least 3 characters'
    },
    message: { 
      el: document.getElementById('message'), 
      error: document.getElementById('messageError'),
      validate: (val) => val.trim().length >= 10 || 'Message should be at least 10 characters'
    },
  };
  
  const status = document.getElementById('formStatus');
  const submitBtn = form.querySelector('.form-submit');
  let isSubmitting = false;

  function validateField(key) {
    const { el, error, validate } = fields[key];
    const value = el.value;
    const result = validate(value);
    const isValid = result === true;
    
    el.classList.toggle('invalid', !isValid);
    error.textContent = isValid ? '' : result;
    
    return isValid;
  }

  function validateAll() {
    return Object.keys(fields).every((key) => validateField(key));
  }

  Object.keys(fields).forEach((key) => {
    const { el } = fields[key];
    el.addEventListener('input', () => validateField(key));
    el.addEventListener('blur', () => validateField(key));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    status.textContent = '';
    status.style.color = '';
    
    const allValid = validateAll();
    
    if (!allValid) {
      status.style.color = '#ff6b6b';
      status.textContent = 'Please fix the highlighted fields.';
      const firstInvalid = form.querySelector('.invalid');
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    status.style.color = 'var(--accent-teal)';
    status.textContent = 'Sending your message...';

    const formData = {
      name: fields.name.el.value.trim(),
      email: fields.email.el.value.trim(),
      subject: fields.subject.el.value.trim(),
      message: fields.message.el.value.trim(),
    };

    try {
      // Send email using EmailJS
      // Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with your actual IDs
      const response = await emailjs.send(
        'service_i107e08', // Replace with your EmailJS Service ID
        'template_p6jt73o', // Replace with your EmailJS Template ID
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
          to_email: 'a.balamurugan282006@gmail.com', // Your email
        }
      );

      if (response.status === 200) {
        status.style.color = '#2fd8c4';
        status.textContent = '✅ Message sent successfully! I\'ll get back to you soon.';
        form.reset();
        
        setTimeout(() => {
          status.textContent = '';
        }, 5000);
      } else {
        throw new Error('Failed to send message');
      }

    } catch (error) {
      status.style.color = '#ff6b6b';
      status.textContent = '❌ Failed to send message. Please try again or email me directly.';
      console.error('EmailJS error:', error);
    } finally {
      isSubmitting = false;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
}

/* ---------- Typing Effect for Hero Role ---------- */
function initTypingEffect() {
  const typingElement = document.querySelector('.role-typing');
  if (!typingElement) return;

  const roles = [
    'Java Developer',
    'Web Developer',
    'Problem Solver',
    'Software Engineer'
  ];
  
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let currentText = '';

  function typeEffect() {
    const fullText = roles[roleIndex];
    
    if (isDeleting) {
      currentText = fullText.substring(0, charIndex - 1);
      charIndex--;
    } else {
      currentText = fullText.substring(0, charIndex + 1);
      charIndex++;
    }

    typingElement.textContent = currentText;

    let speed = isDeleting ? 50 : 100;

    if (!isDeleting && charIndex === fullText.length) {
      speed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      speed = 500;
    }

    setTimeout(typeEffect, speed);
  }

  setTimeout(typeEffect, 1000);
}

/* ---------- Animated Particle Background ---------- */
function initParticleBackground() {
  if (window.innerWidth < 768) return;

  const hero = document.querySelector('.hero');
  if (!hero) return;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '0';
  
  hero.style.position = 'relative';
  hero.insertBefore(canvas, hero.firstChild);

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  function resize() {
    width = canvas.width = hero.offsetWidth;
    height = canvas.height = hero.offsetHeight;
  }
  resize();

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.5 + 0.1;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0 || this.x > width) this.speedX *= -1;
      if (this.y < 0 || this.y > height) this.speedY *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(76, 141, 255, ${this.opacity})`;
      ctx.fill();
    }
  }

  const particleCount = Math.min(50, Math.floor(width * height / 15000));
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });

    ctx.strokeStyle = 'rgba(76, 141, 255, 0.05)';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', () => {
    resize();
    particles = [];
    const newCount = Math.min(50, Math.floor(width * height / 15000));
    for (let i = 0; i < newCount; i++) {
      particles.push(new Particle());
    }
  });
}

/* ---------- Smooth Scroll for All Anchor Links ---------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerHeight = document.querySelector('.site-header').offsetHeight || 70;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* ---------- Resume Buttons ---------- */
function initResumeButtons() {
  const downloadBtn = document.getElementById('downloadResume');
  const viewBtn = document.getElementById('viewResume');

  if (downloadBtn) {
    downloadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const resumeUrl = 'Balamurugan A_resume.pdf';
      const link = document.createElement('a');
      link.href = resumeUrl;
      link.download = 'Balamurugan_A_Resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      downloadBtn.textContent = 'Downloading...';
      setTimeout(() => {
        downloadBtn.innerHTML = '<i class="fa-solid fa-download"></i> Download PDF';
      }, 2000);
    });
  }

  if (viewBtn) {
    viewBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const resumeUrl = 'Balamurugan A_resume.pdf';
      window.open(resumeUrl, '_blank');
    });
  }
}

