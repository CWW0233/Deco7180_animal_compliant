function showPage(pageId) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

// 模拟AI识别
document.getElementById("upload").addEventListener("change", function () {
  const result = document.getElementById("result");

  const animals = ["Kangaroo 🦘", "Snake 🐍", "Bird 🐦"];
  const random = animals[Math.floor(Math.random() * animals.length)];

  result.innerText = "Detected: " + random;
});

// 声音
let audio;

function playSound(type) {
  stopSound();

  if (type === "bird") {
    audio = new Audio("https://www.soundjay.com/nature/bird-chirp-1.mp3");
  } else {
    audio = new Audio("https://www.soundjay.com/animal/dog-bark-1.mp3");
  }

  audio.loop = true;
  audio.play();
}

function stopSound() {
  if (audio) {
    audio.pause();
  }
}

// 打开地图（模拟）
function openMap() {
  alert("Opening nearby hospitals...");
}