const adviceList = [
  "🌞 Always wear sunscreen, even on cloudy days.",
  "👒 Use hats and clothing to cover exposed skin.",
  "🧴 Reapply sunscreen every 2 hours when outdoors.",
  "🔬 Schedule regular skin checkups with a dermatologist.",
  "🚫 Avoid tanning beds – they increase cancer risk.",
  "🌇 Stay out of the sun between 10am–4pm.",
  "🕶️ Wear sunglasses to protect sensitive eye skin.",
  "👀 Check your skin monthly for new or changing moles.",
  "🍎 Eat antioxidant-rich foods for healthier skin.",
  "💧 Keep your skin hydrated with moisturizers."
];

let lastAdviceIndex = -1;

function getRandomIndex() {
  let index;
  do {
    index = Math.floor(Math.random() * adviceList.length);
  } while (index === lastAdviceIndex);
  lastAdviceIndex = index;
  return index;
}

function rotateAdvice() {
  const box = document.getElementById("adviceBox");
  const index = getRandomIndex();
  box.style.opacity = 0;
  setTimeout(() => {
    box.innerText = adviceList[index];
    box.style.opacity = 1;
  }, 200);
}

setInterval(rotateAdvice, 15000);
window.onload = rotateAdvice;

function goToPrediction() {
  // Updated to use Flask route (assuming correct backend route setup)
  window.location.href = "/predict-page";
}
