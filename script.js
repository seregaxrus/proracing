const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const toggle = document.querySelector("[data-menu-toggle]");
const serviceCards = document.querySelectorAll(".service-card");
const form = document.querySelector(".request-form");
const formNote = document.querySelector("[data-form-note]");

const updateHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

toggle?.addEventListener("click", () => {
  nav.classList.toggle("is-open");
});

nav?.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    nav.classList.remove("is-open");
  }
});

serviceCards.forEach((card) => {
  card.addEventListener("click", () => {
    serviceCards.forEach((item) => item.classList.remove("is-active"));
    card.classList.add("is-active");
  });
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  formNote.textContent = "Заявка собрана. В реальном проекте здесь подключим CRM или мессенджер.";
});
