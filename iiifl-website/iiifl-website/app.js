// year
const y = document.getElementById("year");
if (y) y.innerText = new Date().getFullYear();

// mobile menu
const hamburger = document.getElementById("hamburger");
const menu = document.getElementById("menu");
hamburger?.addEventListener("click", () => {
  menu.classList.toggle("open");
});
document.querySelectorAll(".navlink").forEach(link => {
  link.addEventListener("click", function (e) {

    const href = this.getAttribute("href");

    // Allow normal external links
    if (!href || href.startsWith("#")) return;

    e.preventDefault();

    // Force full page reload every time
    window.location.href = href + "?v=" + new Date().getTime();
  });
});



// forms
["leadForm","kycForm","contactForm","loginForm","partnerForm"].forEach((id)=>{
  const f = document.getElementById(id);
  f?.addEventListener("submit",(e)=>{
    e.preventDefault();
    alert("✅ Submitted successfully. Our iiifl team will contact you.");
    f.reset();
  });
});

// scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add("show");
      observer.unobserve(entry.target);
    }
  });
},{threshold:0.12});
document.querySelectorAll(".reveal").forEach(el => {
  observer.observe(el);
});


// FAQ accordion
document.querySelectorAll(".faq-q").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const item = btn.closest(".faq-item");
    item.classList.toggle("open");
  });
});
window.addEventListener("beforeunload", () => {
  observer.disconnect();
});