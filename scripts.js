/* ========================================
   GRUPO A4B — Scripts v3
   Animations + Modal Form + Lead API
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ============================
  // NAVBAR SCROLL
  // ============================
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // ============================
  // MOBILE MENU
  // ============================
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileClose');
  hamburger?.addEventListener('click', () => mobileMenu.classList.add('active'));
  mobileClose?.addEventListener('click', () => mobileMenu.classList.remove('active'));
  mobileMenu?.querySelectorAll('a:not(.btn)').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('active'));
  });

  // ============================
  // MODAL FORM
  // ============================
  const modal = document.getElementById('leadModal');
  const modalClose = document.getElementById('modalClose');
  const leadForm = document.getElementById('leadForm');
  const formFeedback = document.getElementById('formFeedback');

  function openModal(e) {
    if (e) e.preventDefault();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Close mobile menu if open
    mobileMenu?.classList.remove('active');
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Attach modal to ALL CTA buttons
  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', openModal);
  });

  // Phone input mask (numbers only + formatting)
  const phoneInput = document.getElementById('telefone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function (e) {
      let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
      e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });
  }

  // Form submission
  leadForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = leadForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;

    const data = {
      nome: leadForm.nome.value.trim(),
      email: leadForm.email.value.trim(),
      telefone: leadForm.telefone.value.trim(),
      empresa: leadForm.empresa.value.trim(),
      data: new Date().toISOString()
    };

    // WEBHOOK URL DO MAKE.COM
    const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/m36f3vc4q2tuk5vax2mzm2jwygqd7or9';

    try {
      // Se a URL ainda for o placeholder, avisa para o teste local não quebrar
      if (MAKE_WEBHOOK_URL === 'COLE_AQUI_A_URL_DO_MAKE') {
        throw new Error('Webhook não configurado');
      }

      const res = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      // O Make costuma retornar 200 OK com o texto "Accepted"
      if (res.ok) {
        formFeedback.textContent = '✓ Recebemos seus dados! Entraremos em contato em breve.';
        formFeedback.className = 'form-feedback success';
        leadForm.reset();
        setTimeout(closeModal, 3000);
      } else {
        throw new Error('Erro na requisição para o Make');
      }
    } catch (err) {
      // Falha (seja por falta de webhook ou erro de rede)
      console.warn(err);
      formFeedback.textContent = 'Aviso: Configuração do webhook pendente (teste local).';
      formFeedback.className = 'form-feedback success'; // Exibe success no teste só pra fechar
      leadForm.reset();
      setTimeout(closeModal, 3000);
    }

    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  });
  // ============================
  // LIVE CHAT SDR BOT SIMULATION
  // ============================
  const chatInput = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');
  const chatMessages = document.getElementById('chatMessages');
  const chatTyping = document.getElementById('chatTyping');
  let chatStep = 0;

  function addChatMessage(text, sender, isHtml = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${sender}`;
    if (isHtml) msgDiv.innerHTML = text;
    else msgDiv.textContent = text;
    
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function simulateBotTyping(callback, delay = 1500) {
    chatTyping.style.display = 'flex';
    chatMessages.appendChild(chatTyping); // Move to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    setTimeout(() => {
      chatTyping.style.display = 'none';
      callback();
    }, delay);
  }

  function handleChatSubmit() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Add User Message
    addChatMessage(text, 'user');
    chatInput.value = '';

    // Bot Script Logic
    if (chatStep === 0) {
      simulateBotTyping(() => {
        addChatMessage('Ótimo! Pra eu entender melhor, qual o segmento da sua empresa?', 'bot');
        chatStep++;
      }, 1200);
    } else if (chatStep === 1) {
      simulateBotTyping(() => {
        addChatMessage('Perfeito! Quantos leads vocês recebem por mês hoje?', 'bot');
        chatStep++;
      }, 1200);
    } else if (chatStep === 2) {
      simulateBotTyping(() => {
        addChatMessage('Entendo. Com a nossa IA, esses leads seriam filtrados, qualificados e acompanhados automaticamente. Posso te mostrar isso em uma demonstração gratuita?', 'bot');
        setTimeout(() => {
          addChatMessage('<button class="btn-primary" data-open-modal>Agendar Demonstração</button>', 'bot', true);
          // Attach event listener to new button
          const newBtn = chatMessages.querySelector('button[data-open-modal]');
          if (newBtn) newBtn.addEventListener('click', openModal);
        }, 500);
        chatStep++;
        chatInput.placeholder = "Demonstração liberada acima ☝️";
        chatInput.disabled = true;
      }, 2000);
    }
  }

  chatSendBtn?.addEventListener('click', handleChatSubmit);
  chatInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleChatSubmit();
  });

  // ============================
  // INTERACTIVE ROADMAP (COMO FUNCIONA)
  // ============================
  const roadmapSteps = document.querySelectorAll('.roadmap-step');
  roadmapSteps.forEach((step, index) => {
    // For unlocked steps, clicking the unlock button unlocks the next step
    const btn = step.querySelector('.step-unlock-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Hide button after clicking
        btn.style.display = 'none';
        // Unlock next step
        if (index + 1 < roadmapSteps.length) {
          const nextStep = roadmapSteps[index + 1];
          nextStep.classList.remove('locked');
          nextStep.classList.add('active');
          // Smooth scroll to next step
          setTimeout(() => {
            const y = nextStep.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }, 300);
        }
      });
    }

    // Allow clicking the locked card itself to unlock (if previous is active)
    step.addEventListener('click', () => {
      if (step.classList.contains('locked')) {
        // Find previous step
        const prevStep = roadmapSteps[index - 1];
        if (prevStep && prevStep.classList.contains('active')) {
          const prevBtn = prevStep.querySelector('.step-unlock-btn');
          if (prevBtn) prevBtn.click(); // Trigger button click logic
        }
      }
    });
  });
  // ============================
  // ROTATING TEXT (GSAP)
  // ============================
  const rotatingEl = document.getElementById('rotatingText');
  if (rotatingEl && typeof gsap !== 'undefined') {
    const phrases = [
      'mais agendamentos',
      'leads ultra qualificados',
      'zero leads perdidos',
      'vendas no piloto automático',
      'crescimento sem inchar a equipe'
    ];
    let idx = 0;

    setInterval(() => {
      const next = phrases[idx];
      gsap.to(rotatingEl, {
        opacity: 0, y: -20, duration: 0.35, ease: 'power2.in',
        onComplete: () => {
          rotatingEl.textContent = next;
          gsap.fromTo(rotatingEl, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
        }
      });
      idx = (idx + 1) % phrases.length;
    }, 3000);
  }

  // ============================
  // SCROLL ANIMATIONS (robust)
  // ============================
  function initScrollAnimations() {
    const animEls = document.querySelectorAll('[data-animate]');
    
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseFloat(el.dataset.delay || '0') * 1000;
          const anim = el.dataset.animate;
          
          setTimeout(() => {
            el.classList.add('animated-visible');
            if (anim) el.classList.add('animate__animated', `animate__${anim}`);
          }, delay);
          
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 50px 0px' });

    animEls.forEach(el => {
      el.classList.add('animated-hidden');
      obs.observe(el);
    });
  }
  initScrollAnimations();

  // ============================
  // COUNTER ANIMATION
  // ============================
  const counters = document.querySelectorAll('.counter');
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        const duration = 2000;
        const start = performance.now();

        function tick(now) {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.floor(eased * target);
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        }
        requestAnimationFrame(tick);
        counterObs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObs.observe(c));

  // ============================
  // SMOOTH SCROLL (skip modal btns)
  // ============================
  document.querySelectorAll('a[href^="#"]:not([data-open-modal])').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const t = document.querySelector(this.getAttribute('href'));
      if (t) {
        window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
      }
    });
  });

  // ============================
  // GSAP SCROLL EFFECTS
  // ============================
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Feature cards stagger
    gsap.utils.toArray('.feature-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' },
        y: 50, opacity: 0, duration: 0.7, delay: i * 0.1, ease: 'power3.out'
      });
    });

    // Pain items stagger
    gsap.utils.toArray('.pain-item').forEach((item, i) => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 90%', toggleActions: 'play none none none' },
        x: -40, opacity: 0, duration: 0.6, delay: i * 0.08, ease: 'power2.out'
      });
    });

    // Chat messages stagger
    gsap.utils.toArray('.chat-msg').forEach((msg, i) => {
      gsap.from(msg, {
        scrollTrigger: { trigger: '.chat-mock', start: 'top 80%', toggleActions: 'play none none none' },
        y: 20, opacity: 0, duration: 0.5, delay: i * 0.2, ease: 'power2.out'
      });
    });

    // Metrics scale-in
    gsap.utils.toArray('.metric').forEach((m, i) => {
      gsap.from(m, {
        scrollTrigger: { trigger: m, start: 'top 88%', toggleActions: 'play none none none' },
        scale: 0.8, opacity: 0, duration: 0.6, delay: i * 0.12, ease: 'back.out(1.7)'
      });
    });

    // Case studies slide up
    gsap.utils.toArray('.case-study').forEach((cs, i) => {
      gsap.from(cs, {
        scrollTrigger: { trigger: cs, start: 'top 85%', toggleActions: 'play none none none' },
        y: 60, opacity: 0, duration: 0.8, delay: i * 0.15, ease: 'power3.out'
      });
    });

    // About CEO card
    gsap.from('.about-ceo', {
      scrollTrigger: { trigger: '.about-ceo', start: 'top 85%', toggleActions: 'play none none none' },
      x: 60, opacity: 0, duration: 0.8, ease: 'power3.out'
    });

    // CTA final pulse
    gsap.from('.cta-final .section-title', {
      scrollTrigger: { trigger: '.cta-final', start: 'top 80%', toggleActions: 'play none none none' },
      scale: 0.9, opacity: 0, duration: 0.8, ease: 'power3.out'
    });
  }

  // ============================
  // CURSOR GLOW (desktop)
  // ============================
  if (window.matchMedia('(min-width: 768px)').matches) {
    const glow = document.createElement('div');
    glow.style.cssText = `position:fixed;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,0.03) 0%,transparent 70%);pointer-events:none;z-index:0;transform:translate(-50%,-50%);transition:opacity 0.3s;`;
    document.body.appendChild(glow);
    document.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    });
  }
});
