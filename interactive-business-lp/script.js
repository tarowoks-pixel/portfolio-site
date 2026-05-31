const body = document.body;
const menuButton = document.querySelector(".menu-button");
const siteNav = document.querySelector(".site-nav");
const progressBar = document.querySelector(".scroll-progress");
const modalTriggers = document.querySelectorAll("[data-open-modal]");
const modalCloseButtons = document.querySelectorAll("[data-close-modal]");
const modal = document.querySelector(".modal");
let lastFocusedElement = null;

const setMenuOpen = (isOpen) => {
  menuButton?.setAttribute("aria-expanded", String(isOpen));
  siteNav?.classList.toggle("is-open", isOpen);
  body.classList.toggle("menu-open", isOpen);
};

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  setMenuOpen(!isOpen);
});

siteNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});

const updateScrollProgress = () => {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  progressBar.style.transform = `scaleX(${Math.min(progress, 1)})`;
};

window.addEventListener("scroll", updateScrollProgress, { passive: true });
updateScrollProgress();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const target = entry.target;
      const goal = Number(target.dataset.count);
      const duration = 900;
      const startTime = performance.now();

      const tick = (currentTime) => {
        const elapsed = currentTime - startTime;
        const rate = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - rate, 3);
        target.textContent = String(Math.round(goal * eased));

        if (rate < 1) {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
      countObserver.unobserve(target);
    });
  },
  { threshold: 0.6 }
);

document.querySelectorAll("[data-count]").forEach((element) => countObserver.observe(element));

document.querySelectorAll("[data-tabs]").forEach((tabs) => {
  const tabButtons = tabs.querySelectorAll('[role="tab"]');
  const tabPanels = tabs.querySelectorAll('[role="tabpanel"]');

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((tab) => tab.setAttribute("aria-selected", "false"));
      tabPanels.forEach((panel) => {
        panel.hidden = true;
        panel.classList.remove("active");
      });

      const panel = document.getElementById(button.getAttribute("aria-controls"));
      button.setAttribute("aria-selected", "true");
      panel.hidden = false;
      panel.classList.add("active");
    });
  });
});

document.querySelectorAll("[data-slider]").forEach((slider) => {
  const slides = Array.from(slider.querySelectorAll(".case-card"));
  const prevButton = slider.querySelector("[data-slider-prev]");
  const nextButton = slider.querySelector("[data-slider-next]");
  const dotsContainer = slider.querySelector(".slider-dots");
  let currentIndex = 0;

  slides.forEach((_, index) => {
    const dot = document.createElement("span");
    if (index === 0) dot.classList.add("active");
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.children);
  const showSlide = (nextIndex) => {
    currentIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, index) => slide.classList.toggle("active", index === currentIndex));
    dots.forEach((dot, index) => dot.classList.toggle("active", index === currentIndex));
  };

  prevButton.addEventListener("click", () => showSlide(currentIndex - 1));
  nextButton.addEventListener("click", () => showSlide(currentIndex + 1));
});

const priceToggle = document.querySelector("[data-price-toggle]");
priceToggle?.addEventListener("click", () => {
  const isYearly = priceToggle.getAttribute("aria-pressed") === "true";
  priceToggle.setAttribute("aria-pressed", String(!isYearly));

  document.querySelectorAll("[data-monthly][data-yearly]").forEach((price) => {
    price.textContent = !isYearly ? price.dataset.yearly : price.dataset.monthly;
  });
});

const openModal = (targetModal) => {
  if (!targetModal) return;
  lastFocusedElement = document.activeElement;
  targetModal.hidden = false;
  body.classList.add("modal-open");
  targetModal.querySelector(".modal-close")?.focus();
};

const closeModal = () => {
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  body.classList.remove("modal-open");
  lastFocusedElement?.focus();
};

modalTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => openModal(document.getElementById(trigger.dataset.openModal)));
});

modalCloseButtons.forEach((button) => button.addEventListener("click", closeModal));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuOpen(false);
    closeModal();
  }
});

const contactForm = document.querySelector(".contact-form");
const textarea = contactForm?.querySelector("textarea");
const charCount = contactForm?.querySelector(".char-count");
const demoTitle = document.getElementById("demo-title");
const demoList = document.querySelector(".modal-panel ul");
const defaultModalTitle = demoTitle?.textContent;
const defaultModalList = demoList?.innerHTML;

textarea?.addEventListener("input", () => {
  charCount.textContent = `${textarea.value.length} / ${textarea.maxLength}`;
});

const setError = (field, message) => {
  const error = field.parentElement.querySelector(".error-message");
  field.classList.toggle("invalid", Boolean(message));
  error.textContent = message;
};

const validateField = (field) => {
  const value = field.value.trim();

  if (field.hasAttribute("data-required") && !value) {
    setError(field, "入力してください。");
    return false;
  }

  if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    setError(field, "メールアドレスの形式で入力してください。");
    return false;
  }

  if (field.tagName === "TEXTAREA" && value.length < 10) {
    setError(field, "10文字以上で入力してください。");
    return false;
  }

  setError(field, "");
  return true;
};

contactForm?.querySelectorAll("input, textarea").forEach((field) => {
  field.addEventListener("blur", () => validateField(field));
});

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const fields = Array.from(contactForm.querySelectorAll("input, textarea"));
  const isValid = fields.every(validateField);

  if (!isValid) return;

  demoTitle.textContent = "入力チェックが完了しました";
  demoList.innerHTML =
    "<li>入力必須チェック</li><li>メール形式チェック</li><li>文字数チェック</li><li>完了モーダル表示</li>";
  openModal(document.getElementById("demo-modal"));
  contactForm.reset();
  charCount.textContent = "0 / 300";
});

modalTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    demoTitle.textContent = defaultModalTitle;
    demoList.innerHTML = defaultModalList;
  });
});
