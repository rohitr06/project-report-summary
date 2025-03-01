from flask import Flask, request, jsonify
import cv2
import numpy as np 
import os

app = Flask(__name__)

def detect_graph(image_path):
    img = cv2.imread(image_path, cv2.IMREAD_COLOR)
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    graph_detected = False
    graph_info = ""

    for contour in contours:
        approx = cv2.approxPolyDP(contour, 0.02 * cv2.arcLength(contour, True), True)
        if len(approx) > 5:  # Identifies a circular or irregular shape
            graph_detected = True
            graph_info = "Graph detected. It seems to be a line/bar/pie chart."

    return graph_detected, graph_info

@app.route("/process-graph", methods=["POST"])
def process_graph():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    image_path = "temp_image.png"
    file.save(image_path)

    graph_detected, graph_info = detect_graph(image_path)
    os.remove(image_path)

    if graph_detected:
        return jsonify({"graph_detected": True, "graph_info": graph_info})
    else:
        return jsonify({"graph_detected": False, "graph_info": "No graph detected."})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
