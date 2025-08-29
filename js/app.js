/**
 * Portfolio Interactions - Enhanced
 * Features:
 * - Smooth animations with requestAnimationFrame
 * - Better performance with IntersectionObserver
 * - Enhanced parallax effects
 * - Improved tilt animations with configurable settings
 * - Gallery filtering with smooth transitions
 * - Lightbox functionality
 * - Mobile navigation improvements
 * - Scroll animations
 */

document.addEventListener('DOMContentLoaded', () => {
  // Set current year in footer
  document.getElementById('year').textContent = new Date().getFullYear();

  // Mobile navigation toggle
  const navToggle = document.querySelector('.nav__toggle');
  const navLinks = document.querySelector('.nav__links');
  const nav = document.querySelector('.nav');
  
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navLinks.style.display = isExpanded ? 'none' : 'flex';
      nav.classList.toggle('active', !isExpanded);
      
      // Toggle body scroll when menu is open
      document.body.style.overflow = isExpanded ? '' : 'hidden';
    });
    
    // Close menu when clicking on a link
    document.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navLinks.style.display = 'none';
        nav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // Parallax effect for hero layers
  const setupParallax = () => {
    const depthContainer = document.querySelector('[data-depth-container]');
    if (!depthContainer) return;

    const layers = [...depthContainer.querySelectorAll('[data-depth]')];
    let rafId = null;
    let scrollProgress = 0;

    const update = (xPerc, yPerc) => {
      layers.forEach(layer => {
        const depth = parseFloat(layer.getAttribute('data-depth'));
        const intensity = 30; // Base intensity
        const x = (xPerc - 0.5) * depth * intensity;
        const y = (yPerc - 0.5) * depth * intensity;
        const scrollY = window.scrollY;
        const scrollEffect = Math.min(1, Math.max(0, 1 - scrollY / (window.innerHeight * 0.8)));
        
        layer.style.transform = `translate3d(${x}px, ${y + scrollY * 0.2}px, 0)`;
        layer.style.opacity = scrollEffect;
      });
    };

    const onMove = (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      
      const rect = depthContainer.getBoundingClientRect();
      const xPerc = (e.clientX - rect.left) / rect.width;
      const yPerc = (e.clientY - rect.top) / rect.height;
      
      rafId = requestAnimationFrame(() => update(xPerc, yPerc));
    };

    const onScroll = () => {
      scrollProgress = window.scrollY / (window.innerHeight * 0.8);
      depthContainer.style.opacity = Math.max(0, 1 - scrollProgress).toString();
    };

    // Initialize with center position
    update(0.5, 0.5);
    
    depthContainer.addEventListener('mousemove', onMove);
    depthContainer.addEventListener('mouseleave', () => update(0.5, 0.5));
    window.addEventListener('scroll', onScroll);

    // Cleanup
    return () => {
      depthContainer.removeEventListener('mousemove', onMove);
      depthContainer.removeEventListener('mouseleave', () => update(0.5, 0.5));
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  };

  // Enhanced tilt effect with configurable settings
  const setupTilt = () => {
    const tiltElements = document.querySelectorAll('[data-tilt]');
    if (!tiltElements.length) return;

    tiltElements.forEach(el => {
      const settings = {
        max: el.dataset.tiltMax || 10,
        scale: el.dataset.tiltScale || 1.05,
        perspective: el.dataset.tiltPerspective || 1000,
        speed: el.dataset.tiltSpeed || 400,
        glare: el.hasAttribute('data-tilt-glare'),
        'glare-pr': el.dataset.tiltGlarePr || '0.5',
      };

      let rafId = null;
      let glareElement = null;

      if (settings.glare) {
        glareElement = document.createElement('div');
        glareElement.className = 'tilt-glare';
        glareElement.style.position = 'absolute';
        glareElement.style.top = '0';
        glareElement.style.left = '0';
        glareElement.style.width = '100%';
        glareElement.style.height = '100%';
        glareElement.style.pointerEvents = 'none';
        glareElement.style.borderRadius = 'inherit';
        glareElement.style.overflow = 'hidden';
        glareElement.style.opacity = '0';
        glareElement.style.transition = `opacity ${settings.speed}ms ease-out`;
        
        const glareInner = document.createElement('div');
        glareInner.className = 'tilt-glare-inner';
        glareInner.style.position = 'absolute';
        glareInner.style.top = '0';
        glareInner.style.left = '0';
        glareInner.style.width = '200%';
        glareInner.style.height = '200%';
        glareInner.style.background = 'linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)';
        
        glareElement.appendChild(glareInner);
        el.appendChild(glareElement);
        el.style.position = 'relative';
        el.style.transformStyle = 'preserve-3d';
      }

      const handleMouseMove = (e) => {
        if (rafId) cancelAnimationFrame(rafId);
        
        const rect = el.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const centerX = rect.left + width / 2;
        const centerY = rect.top + height / 2;
        const posX = e.clientX - centerX;
        const posY = e.clientY - centerY;
        const x = posX / width;
        const y = posY / height;
        
        const rotateX = (settings.max / 2 - y * settings.max).toFixed(2);
        const rotateY = (x * settings.max).toFixed(2);
        
        rafId = requestAnimationFrame(() => {
          el.style.transform = `
            perspective(${settings.perspective}px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            scale3d(${settings.scale}, ${settings.scale}, ${settings.scale})
          `;
          
          if (glareElement) {
            const glareX = (x * 100).toFixed(2);
            const glareY = (y * 100).toFixed(2);
            glareElement.style.opacity = settings['glare-pr'];
            glareElement.firstChild.style.transform = `
              translate(${glareX}%, ${glareY}%)
              rotate(180deg)
            `;
          }
        });
      };

      const handleMouseLeave = () => {
        if (rafId) cancelAnimationFrame(rafId);
        
        rafId = requestAnimationFrame(() => {
          el.style.transform = `
            perspective(${settings.perspective}px)
            rotateX(0deg)
            rotateY(0deg)
            scale3d(1, 1, 1)
          `;
          
          if (glareElement) {
            glareElement.style.opacity = '0';
          }
        });
      };

      el.addEventListener('mousemove', handleMouseMove);
      el.addEventListener('mouseleave', handleMouseLeave);
    });
  };

  // Gallery filtering with smooth transitions
  const setupGalleryFilter = () => {
    const filters = document.querySelectorAll('.filter');
    const tiles = document.querySelectorAll('.tile');
    if (!filters.length || !tiles.length) return;

    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active state
        filters.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        
        // Get filter value
        const filterValue = btn.dataset.filter;
        
        // Filter tiles
        tiles.forEach(tile => {
          const shouldShow = filterValue === 'all' || tile.dataset.category === filterValue;
          
          if (shouldShow) {
            tile.style.display = 'block';
            setTimeout(() => {
              tile.style.opacity = '1';
              tile.style.transform = 'translateY(0)';
            }, 50);
          } else {
            tile.style.opacity = '0';
            tile.style.transform = 'translateY(20px)';
            setTimeout(() => {
              tile.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  };

  // Lightbox functionality for gallery images
  const setupLightbox = () => {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.querySelector('.lightbox__close');
    const tiles = document.querySelectorAll('.tile');
    
    if (!lightbox || !tiles.length) return;

    const openLightbox = (imgSrc, caption) => {
      lightboxImg.src = imgSrc;
      lightboxCaption.textContent = caption;
      lightbox.setAttribute('aria-hidden', 'false');
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      lightbox.setAttribute('aria-hidden', 'true');
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    };

    // Add click events to all tiles
    tiles.forEach(tile => {
      const img = tile.querySelector('img');
      const caption = tile.querySelector('figcaption')?.textContent || '';
      
      tile.addEventListener('click', (e) => {
        if (!e.target.closest('.tile__expand') && img) {
          openLightbox(img.src, caption);
        }
      });
      
      // Add click event to expand button if it exists
      const expandBtn = tile.querySelector('.tile__expand');
      if (expandBtn) {
        expandBtn.addEventListener('click', () => {
          openLightbox(img.src, caption);
        });
      }
    });

    // Close lightbox events
    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // Close with ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });
  };

  // Scroll animations with IntersectionObserver
  const setupScrollAnimations = () => {
    const animateElements = document.querySelectorAll('.fade-in');
    if (!animateElements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    });

    animateElements.forEach(el => {
      observer.observe(el);
    });
  };

  // Sticky navigation on scroll
  const setupStickyNav = () => {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        nav.classList.toggle('scrolled', !entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    const hero = document.getElementById('hero');
    if (hero) observer.observe(hero);
  };

  // Initialize all features
  setupParallax();
  setupTilt();
  setupGalleryFilter();
  setupLightbox();
  setupScrollAnimations();
  setupStickyNav();

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const nav = document.querySelector('.floating-nav');
  const toggle = document.querySelector('.floating-nav__toggle');
  const links = document.querySelector('.floating-nav__links');
  
  // Mobile menu toggle
  if (toggle && links) {
    toggle.addEventListener('click', function() {
      links.classList.toggle('active');
      toggle.classList.toggle('active');
      document.body.style.overflow = links.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close menu when clicking on links
    document.querySelectorAll('.floating-nav__link').forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('active');
        toggle.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
  
  // Scroll behavior
  window.addEventListener('scroll', function() {
    if (window.scrollY > 100) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });
});