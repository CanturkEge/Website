const cursorGlow = document.querySelector(".cursor-glow");

document.addEventListener("mousemove", (event) => {
  if (!cursorGlow) return;

  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});

const words = [
  "electronics.",
  "software.",
  "game systems.",
  "practical tools.",
  "cool ideas"
];

const typingText = document.getElementById("typing-text");

let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
  if (!typingText) return;

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

typeEffect();

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

const copyEmailButton = document.getElementById("copy-email-btn");
const copyMessage = document.getElementById("copy-message");

if (copyEmailButton && copyMessage) {
  copyEmailButton.addEventListener("click", () => {
    navigator.clipboard.writeText("canturkege74@gmail.com");

    copyMessage.classList.add("show");

    setTimeout(() => {
      copyMessage.classList.remove("show");
    }, 1800);
  });
}