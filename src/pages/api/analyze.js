export const config = {
  runtime: "nodejs20.x",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing image" });
    }

    const HF_TOKEN = "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";
    const MODEL_ID = "rievil/crackenpy";

    // Send request to HuggingFace model
    const hfResp = await fetch(
      `https://router.huggingface.co/hf-inference/v1/models/${MODEL_ID}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: imageBase64 })
      }
    );

    const hfJson = await hfResp.json();
    console.log("HF RAW OUTPUT:", JSON.stringify(hfJson, null, 2));

    // Same logic you had in server.js, simplified:
    const normalizeResult = (hfJson) => {
      let result = {
        severity: "Moderate",
        crackType: "Structural Crack (Shear)",
        confidence: 0.5,
        description: "No description available",
        dimensions: { length: "45cm", width: "2-3mm", depth: "5-8mm" },
        recommendedActions: {
          shortTerm: [
            "Mark and monitor crack length and width weekly",
            "Limit use of affected area until inspected"
          ],
          longTerm: [
            "Seal the crack with appropriate epoxy filler",
            "Engage a structural engineer for on-site assessment",
            "Check for water infiltration behind the crack"
          ]
        },
        urgency: { level: "Moderate", timeline: "1-2 weeks" }
      };

      if (Array.isArray(hfJson) && hfJson[0]?.label) {
        const top = hfJson[0];
        result.crackType = top.label;
        result.confidence = top.score ?? result.confidence;
        result.description = `Predicted: ${top.label} (score ${Math.round((top.score ?? 0) * 100)}%)`;
      }

      return result;
    };

    const finalResult = normalizeResult(hfJson);
    return res.status(200).json(finalResult);

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
}
