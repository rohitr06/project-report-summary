import axios from "axios";
import FormData from "form-data";
import fs from "fs";

export async function processGraph(imagePath: string) {
  try {
    const formData = new FormData();
    formData.append("image", fs.createReadStream(imagePath));

    const response = await axios.post("http://127.0.0.1:5000/process-graph", formData, {
      headers: { ...formData.getHeaders() },
    });

    return response.data;
  } catch (error) {
    console.error("❌ Error processing graph:", error);
    return { graph_detected: false, graph_info: "Error in graph detection." };
  }
}
