let currentPrediction = null;
let currentImage = null;

// Preview the uploaded image
function handleUpload(input) {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      currentImage = file;
      document.getElementById('preview').src = e.target.result;
      document.getElementById('previewContainer').classList.remove('hidden');
      document.getElementById('predictButton').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }
}

// Trigger the prediction
function predict() {
  if (!currentImage) return alert('Please upload an image.');

  const formData = new FormData();
  formData.append('image', currentImage);

  document.getElementById('loadingIndicator').classList.remove('hidden');
  document.getElementById('predictButton').classList.add('hidden');

  fetch('/predict', {
    method: 'POST',
    body: formData,
  })
    .then(async (res) => {
      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      console.log("Prediction response:", data);

      if (!data || !data.prediction) throw new Error("Invalid prediction data");

      currentPrediction = data.prediction;

      document.getElementById('loadingIndicator').classList.add('hidden');
      document.getElementById('resultSection').classList.remove('hidden');
      document.getElementById('uploadAnother').classList.remove('hidden');
      document.getElementById('viewHistoryButton').classList.remove('hidden');
      document.getElementById('downloadResult').classList.remove('hidden');
      document.getElementById('ratingSection').classList.remove('hidden');

      document.getElementById('prediction').textContent = currentPrediction;

      updateList('causes', data.causes);
      updateList('precautions', data.precautions);
      updateList('nextSteps', data.nextSteps);

      saveToHistory(currentImage, currentPrediction);

      const uploadBtn = document.getElementById('uploadImageButton');
      if (uploadBtn) uploadBtn.classList.add('hidden');
    })
    .catch(err => {
      console.error("Prediction error:", err);
      alert('Error during prediction. Please try again.');
      document.getElementById('loadingIndicator').classList.add('hidden');
      document.getElementById('predictButton').classList.remove('hidden');
    });
}

function updateList(id, items) {
  const container = document.getElementById(id);
  container.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    container.appendChild(li);
  });
}

function saveToHistory(imageFile, prediction) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const newEntry = {
      image: e.target.result,
      prediction: prediction,
      time: formatDate(new Date())
    };

    let history = JSON.parse(localStorage.getItem('predictionHistory')) || [];
    history.unshift(newEntry);
    if (history.length > 10) history = history.slice(0, 10);
    localStorage.setItem('predictionHistory', JSON.stringify(history));
  };
  reader.readAsDataURL(imageFile);
}

function formatDate(date) {
  return `${String(date.getDate()).padStart(2, '0')}/${
    String(date.getMonth() + 1).padStart(2, '0')}/${
    date.getFullYear()}, ${date.toLocaleTimeString()}`;
}

function toggleHistory() {
  const section = document.getElementById('historySection');
  section.classList.toggle('hidden');

  if (!section.classList.contains('hidden')) {
    const history = JSON.parse(localStorage.getItem('predictionHistory')) || [];
    const container = document.getElementById('historyList');
    container.innerHTML = '';

    if (history.length === 0) {
      container.innerHTML = '<p class="text-gray-500">No history available.</p>';
      return;
    }

    history.forEach(entry => {
      const div = document.createElement('div');
      div.className = 'bg-gray-100 p-4 rounded shadow';
      div.innerHTML = `
        <p class="font-semibold text-blue-700">Prediction: ${entry.prediction}</p>
        <p class="text-sm text-gray-500">Time: ${entry.time}</p>
        <img src="${entry.image}" alt="History Image" class="mt-2 h-32 rounded shadow border" />
      `;
      container.appendChild(div);
    });
  }
}

function clearHistory() {
  localStorage.removeItem('predictionHistory');
  document.getElementById('historyList').innerHTML = '<p class="text-gray-500">History cleared.</p>';
}

function resetUpload() {
  // Redirect to the /predict page
  window.location.href = "/predict";
}



async function downloadResult() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');

  const patientName = prompt("Enter the patient's name:");
  if (!patientName) return;

  try {
    const logoUrl = '/static/logo.png';
    const logoData = await fetch(logoUrl).then(res => res.blob());
    const reader = new FileReader();

    reader.onload = function (e) {
      const logoBase64 = e.target.result;

      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 210, 297, 'F');

      doc.addImage(logoBase64, 'PNG', 75, 10, 60, 30);
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 120);
      doc.text('SkinAI - Skin Cancer Prediction Report', 20, 50);

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const now = new Date();
      doc.text(`Patient Name: ${patientName}`, 20, 60);
      doc.text(`Date: ${formatDate(now)}`, 20, 68);

      let y = 80;
      const history = JSON.parse(localStorage.getItem('predictionHistory')) || [];

      if (history.length === 0) {
        doc.text('No previous prediction history found.', 20, y);
      } else {
        doc.setFontSize(14);
        doc.setTextColor(0, 102, 102);
        doc.text('Recent Prediction History:', 20, y);
        y += 10;

        history.slice(0, 10).forEach((entry, index) => {
          if (y > 260) {
            doc.addPage();
            y = 20;
          }

          const imgWidth = 30;
          const imgHeight = 30;

          doc.setDrawColor(0);
          doc.setFillColor(240, 248, 255);
          doc.rect(20, y, 170, 35, 'FD');

          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.text(`Prediction: ${entry.prediction}`, 60, y + 10);
          doc.text(`Time: ${entry.time}`, 60, y + 20);
          doc.addImage(entry.image, 'JPEG', 25, y + 5, imgWidth, imgHeight);

          y += 40;
        });
      }

      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('Generated by SkinAI', 20, 290);

      doc.save(`SkinAI_Report_${patientName.replace(/\s+/g, '_')}.pdf`);
    };

    reader.readAsDataURL(logoData);
  } catch (err) {
    console.error('Error generating PDF:', err);
    alert('Failed to generate PDF.');
  }
}

function rate(value) {
  fetch('/rate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating: value })
  })
    .then(res => res.json())
    .then(data => {
      const alertDiv = document.createElement('div');
      alertDiv.textContent = 'Thanks for your rating!';
      alertDiv.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg transition';
      document.body.appendChild(alertDiv);

      setTimeout(() => {
        alertDiv.remove();
      }, 3000);
    })
    .catch(err => {
      console.error(err);
      alert('Error submitting rating.');
    });
}
