import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from flask import Flask, request, jsonify, render_template
import tensorflow as tf
import numpy as np
from PIL import Image
import json
import os

app = Flask(__name__)
model = tf.keras.models.load_model("D:/skin-cancer-detection-website/models/sc_7.keras")

CLASS_NAMES= [
    "actinic keratosis",             # akiec
    "basal cell carcinoma",          # bcc
    "pigmented benign keratosis",    # bkl
    "dermatofibroma",                # df
    "melanoma",                      # mel
    "nevus",                         # nv
    "vascular lesion"                # vasc
]



UPLOAD_FOLDER = "D:/skin-cancer-detection-website/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    avg_rating = 0.0
    try:
        if os.path.exists("ratings.json"):
            with open("ratings.json", "r", encoding="utf-8") as f:
                ratings = json.load(f)
                if ratings:
                    avg_rating = round(sum(ratings) / len(ratings), 2)
    except Exception as e:
        print("Error loading ratings:", e)

    return render_template('index.html', avg_rating=avg_rating)

@app.route('/predict', methods=['GET'])
def predict_page():
    return render_template('predict.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        file = request.files['image']
        img = Image.open(file.stream).convert("RGB")
        img = img.resize((72, 72))
        img_array = np.expand_dims(np.array(img) / 255.0, axis=0)

        prediction = model.predict(img_array)
        predicted_class_idx = np.argmax(prediction[0])
        predicted_class = CLASS_NAMES[predicted_class_idx]

        # Load disease info
        with open("disease_info.json", "r", encoding="utf-8") as f:
            disease_data = json.load(f)

        info = disease_data.get(predicted_class.lower(), {
            "causes": ["Information not available."],
            "precautions": ["Information not available."],
            "nextSteps": ["Consult a dermatologist."]
        })

        # Save uploaded image
        save_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(save_path)

        # Save prediction to history
        if not os.path.exists("history.json"):
            with open("history.json", "w", encoding="utf-8") as f:
                json.dump([], f)

        with open("history.json", "r+", encoding="utf-8") as f:
            history = json.load(f)
            f.seek(0)
            new_entry = {
                "prediction": predicted_class,
                "image": file.filename
            }
            history = [new_entry] + history[:9]  # Only last 10
            json.dump(history, f)
            f.truncate()

        return jsonify({
            "prediction": predicted_class,
            "causes": info["causes"],
            "precautions": info["precautions"],
            "nextSteps": info["nextSteps"]
        })

    except Exception as e:
        import traceback
        print("Prediction error:", e)
        traceback.print_exc()
        return jsonify({"error": "An error occurred during prediction."}), 500

@app.route('/get-history')
def get_history():
    try:
        if os.path.exists("history.json"):
            with open("history.json", "r", encoding="utf-8") as f:
                return jsonify(json.load(f))
        return jsonify([])
    except Exception as e:
        print("History load error:", e)
        return jsonify([])

@app.route('/clear-history', methods=['POST'])
def clear_history():
    with open("history.json", "w", encoding="utf-8") as f:
        json.dump([], f)
    return jsonify({"success": True})

@app.route('/rate', methods=['POST'])
def rate():
    try:
        rating = int(request.json.get("rating", 0))
        if not (1 <= rating <= 5):
            return jsonify({"error": "Invalid rating"}), 400

        if not os.path.exists("ratings.json"):
            with open("ratings.json", "w", encoding="utf-8") as f:
                json.dump([], f)

        with open("ratings.json", "r+", encoding="utf-8") as f:
            data = json.load(f)
            data.append(rating)
            f.seek(0)
            json.dump(data, f)
            f.truncate()

        return jsonify({"message": "Rating saved"}), 200
    except Exception as e:
        print("Rating error:", e)
        return jsonify({"error": "Failed to save rating"}), 500

if __name__ == '__main__':
    app.run(debug=True)
