const nav = document.querySelector(".site-nav");
const menuToggle = document.querySelector(".menu-toggle");
const progress = document.querySelector(".progress");
const filterButtons = document.querySelectorAll(".filter-button");
const menuCards = document.querySelectorAll(".menu-card");
const reveals = document.querySelectorAll(".reveal");
const stampButton = document.querySelector(".stamp-button");
const stamps = document.querySelectorAll(".stamps span");
const stampCount = document.querySelector("#stampCount");
const stampMessage = document.querySelector("#stampMessage");

menuToggle?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".site-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

window.addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const value = max > 0 ? (window.scrollY / max) * 100 : 0;
  progress.style.width = value + "%";
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    menuCards.forEach((card) => {
      const visible = card.dataset.menu === filter;
      card.hidden = !visible;
    });
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

reveals.forEach((item) => observer.observe(item));

let count = 0;
const messages = [
  "1杯目のコーヒーから始まります。",
  "朝の一杯、記録しました。",
  "次はトーストも一緒にどうぞ。",
  "常連さんの気配がしてきました。",
  "あと少しで小さなごほうび。",
  "次回は焼き菓子が付きます。",
  "満杯です。今日はよく休めました。"
];

stampButton?.addEventListener("click", () => {
  count = Math.min(count + 1, stamps.length);
  stamps.forEach((stamp, index) => {
    stamp.classList.toggle("is-stamped", index < count);
  });
  stampCount.textContent = String(count);
  stampMessage.textContent = messages[count] ?? messages[messages.length - 1];
});
