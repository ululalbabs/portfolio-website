document.addEventListener("DOMContentLoaded", () => {
  const lightbox = document.getElementById("lightbox");
  const content = document.getElementById("lightbox-content");
  const closeBtn = document.getElementById("closeBtn");

  // klik item galeri
  document.querySelectorAll(".gallery-item img").forEach(el => {
    el.addEventListener("click", () => openLightbox(el));
  });

  // tombol close
  closeBtn.addEventListener("click", closeLightbox);

  // klik background untuk tutup
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
});

// === fungsi buka lightbox ===
function openLightbox(el) {
  const lightbox = document.getElementById("lightbox");
  const content = document.getElementById("lightbox-content");

  // reset isi
  content.innerHTML = "";

  // cek apakah ada video
  const videoSrc = el.getAttribute("data-video");
  if (videoSrc) {
    const video = document.createElement("video");
    video.src = videoSrc;
    video.controls = true;
    video.autoplay = true;
    content.appendChild(video);
  } else {
    const img = document.createElement("img");
    img.src = el.src;
    content.appendChild(img);
  }

  lightbox.style.display = "flex";
}

// === fungsi tutup lightbox ===
function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  const content = document.getElementById("lightbox-content");

  // stop video & reset isi
  content.innerHTML = "";
  lightbox.style.display = "none";
}

function goBack() {
  window.history.back();
}