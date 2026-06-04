const cursorGlow = document.querySelector(".cursor-glow");

document.addEventListener("mousemove", (event) => {
  if (!cursorGlow) return;

  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});

const words = [
  "software.",
  "electronics.",
  "security labs.",
  "game systems.",
  "weird ideas."
];

const typingText = document.getElementById("typing-text");

let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
  const currentWord = words[wordIndex];

  if (isDeleting) {
    typingText.textContent = currentWord.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typingText.textContent = currentWord.substring(0, charIndex + 1);
    charIndex++;
  }

  let speed = isDeleting ? 55 : 90;

  if (!isDeleting && charIndex === currentWord.length) {
    speed = 1300;
    isDeleting = true;
  }

  if (isDeleting && charIndex === 0) {
    isDeleting = false;
    wordIndex = (wordIndex + 1) % words.length;
    speed = 350;
  }

  setTimeout(typeEffect, speed);
}

if (typingText) {
  typeEffect();
}

const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    const filterValue = button.getAttribute("data-filter");

    projectCards.forEach((card) => {
      const category = card.getAttribute("data-category");

      if (filterValue === "all" || filterValue === category) {
        card.classList.remove("hidden-card");
      } else {
        card.classList.add("hidden-card");
      }
    });
  });
});

const revealElements = document.querySelectorAll(".reveal");

function revealOnScroll() {
  revealElements.forEach((element) => {
    const elementTop = element.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (elementTop < windowHeight - 100) {
      element.classList.add("visible");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

const projectDetails = {
  "Mini Interpreter": {
    description:
      "A Python-based toy programming language created to understand how interpreters work. It includes custom syntax, variables, conditions, loops, simple math operations and experimental commands."
  },
  "Event Scheduler": {
    description:
      "A JavaScript console application for managing events. It supports adding, listing, updating, removing, sorting and validating scheduled events."
  },
  "Bench Power Supply": {
    description:
      "A custom electronics project focused on building a practical 12V bench power supply using a buck converter, fuse protection, cooling system and 3D printed enclosure."
  },
  "Cybersecurity Lab": {
    description:
      "A local virtual lab environment using Kali Linux and Metasploitable2 to practice scanning, enumeration and vulnerability analysis in a safe environment."
  },
  "Drone Concept Design": {
    description:
      "A fixed-wing UAV concept design project focused on structure, airflow, control surfaces, endurance and experimental aircraft design ideas."
  },
  "Game Prototypes": {
    description:
      "Small game development experiments focused on mechanics, Unity systems, C# scripting, pixel art concepts and gameplay logic."
  }
};

const detailButtons = document.querySelectorAll(".project-detail-btn");
const modal = document.getElementById("project-modal");
const modalClose = document.getElementById("modal-close");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");

detailButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();

    const card = button.closest(".project-card");
    const title = card.querySelector("h3").innerText;

    modalTitle.innerText = title;
    modalDescription.innerText =
      projectDetails[title]?.description || "More details will be added soon.";

    modal.classList.add("active");
  });
});

if (modalClose) {
  modalClose.addEventListener("click", () => {
    modal.classList.remove("active");
  });
}

if (modal) {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.classList.remove("active");
    }
  });
}

const copyEmailButton = document.getElementById("copy-email-btn");
const copyMessage = document.getElementById("copy-message");

if (copyEmailButton) {
  copyEmailButton.addEventListener("click", () => {
    navigator.clipboard.writeText("canturkege74@gmail.com");

    copyMessage.classList.add("show");

    setTimeout(() => {
      copyMessage.classList.remove("show");
    }, 1800);
  });
}