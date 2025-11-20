import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

const HF_TOKEN = "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";
const MODEL_ID = "rievil/crackenpy";

app.post("/analyze", async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing image" });
    }

    const hfResp = await fetch(
      `https://router.huggingface.co/hf-inference/v1/models/${MODEL_ID}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: imageBase64 }),
      }
    );

    const hfJson = await hfResp.json();

    const LABEL_INSIGHTS = [
      {
        keywords: ["hairline", "fine", "surface"],
        severity: "Low",
        dimensions: { length: "15-30cm", width: "<1mm", depth: "Surface level" },
        description: "Hairline surface crack detected — typically caused by shrinkage or superficial stress.",
        shortTerm: [
          "Monitor crack once per quarter",
          "Seal with acrylic caulk to prevent moisture entry"
        ],
        longTerm: [
          "Repaint affected area with flexible coating",
          "Inspect for repeated patterns during seasonal changes"
        ],
        urgency: { level: "Low", timeline: "Monitor within 3 months" }
      },
      {
        keywords: ["structural", "shear", "diagonal", "load"],
        severity: "High",
        dimensions: { length: "60-120cm", width: "3-6mm", depth: "Penetrating" },
        description: "Structural crack with diagonal shear characteristics — often tied to load redistribution or settlement.",
        shortTerm: [
          "Install temporary shoring if the crack crosses load paths",
          "Mark both ends and monitor daily for growth"
        ],
        longTerm: [
          "Schedule structural engineer inspection within one week",
          "Inject epoxy to restore shear capacity after evaluation"
        ],
        urgency: { level: "High", timeline: "Inspect within 7 days" }
      },
      {
        keywords: ["vertical", "settlement", "foundation", "column"],
        severity: "Moderate",
        dimensions: { length: "40-90cm", width: "2-4mm", depth: "Beyond plaster" },
        description: "Vertical settlement-type crack — can originate from foundation or differential movement.",
        shortTerm: [
          "Document width with gauge markers weekly",
          "Check adjacent openings (doors/windows) for misalignment"
        ],
        longTerm: [
          "Evaluate foundation drainage and backfill conditions",
          "Consider underpinning if movement persists"
        ],
        urgency: { level: "Moderate", timeline: "Assess within 2-3 weeks" }
      },
      {
        keywords: ["horizontal", "pressure", "expansion", "rebar"],
        severity: "High",
        dimensions: { length: "80-150cm", width: "4-8mm", depth: "Reinforcement exposed" },
        description: "Horizontal crack indicating lateral pressure or reinforcement corrosion.",
        shortTerm: [
          "Relieve external pressure if caused by soil/water",
          "Clean and protect any exposed reinforcement"
        ],
        longTerm: [
          "Engineer to design reinforcement upgrade",
          "Install drainage or relief joints to prevent recurrence"
        ],
        urgency: { level: "High", timeline: "Stabilize within 1 week" }
      },
      {
        keywords: ["spalling", "delamination", "cover", "corrosion"],
        severity: "High",
        dimensions: { length: "30-60cm", width: "Variable", depth: "Concrete cover loss" },
        description: "Concrete spalling observed — typically driven by reinforcement corrosion or impact.",
        shortTerm: [
          "Barricade loose material to prevent falling debris",
          "Remove delaminated cover carefully"
        ],
        longTerm: [
          "Treat and passivate corroded reinforcement",
          "Recast cover using low-permeability repair mortar"
        ],
        urgency: { level: "High", timeline: "Repair within 2 weeks" }
      }
    ];

    const pickInsights = (label) => {
      if (!label) return null;
      const lower = label.toLowerCase();
      for (const insight of LABEL_INSIGHTS) {
        if (insight.keywords.some((kw) => lower.includes(kw))) {
          return insight;
        }
      }
      return null;
    };

    // 🔥 Normalize AI response for ResultsScreen.tsx (VERY IMPORTANT)
    /*const result = {
      severity: hfJson.severity ?? "Moderate",
      crackType: hfJson.crackType ?? hfJson.label ?? "Structural Crack (Shear)",
      confidence: hfJson.confidence ?? 0.87,
      description: hfJson.description ?? "No description available",

      dimensions: {
        length: hfJson.dimensions?.length ?? "45cm",
        width: hfJson.dimensions?.width ?? "2-3mm",
        depth: hfJson.dimensions?.depth ?? "5-8mm",
      },

      recommendedActions: {
        shortTerm: hfJson.recommendedActions?.shortTerm ?? [
          "Mark and monitor crack length and width weekly",
          "Limit use of affected area until inspected",
        ],
        longTerm: hfJson.recommendedActions?.longTerm ?? [
          "Seal the crack with appropriate epoxy filler",
          "Engage a structural engineer for on-site assessment",
          "Check for water infiltration behind the crack",
        ],
      },

      urgency: {
        level: hfJson.urgency?.level ?? "Moderate",
        timeline: hfJson.urgency?.timeline ?? "1-2 weeks",
      },
    };*/


        // DEBUG: log raw HF output so we can see the real shape during development
    console.log("HF RAW OUTPUT:", JSON.stringify(hfJson, null, 2));

    // Normalize different HF output shapes into a single result shape
    // ResultsScreen expects: { severity, crackType, confidence, description, dimensions: {length,width,depth}, recommendedActions: {shortTerm,longTerm}, urgency: {level,timeline} }
    let normalized = {
      severity: null,
      crackType: null,
      confidence: null,
      description: null,
      dimensions: { length: null, width: null, depth: null },
      recommendedActions: { shortTerm: [], longTerm: [] },
      urgency: { level: null, timeline: null },
    };

    // Case 1: HF returns an array of classification outputs [{label, score}, ...]
    if (Array.isArray(hfJson) && hfJson.length > 0 && hfJson[0].label) {
      // Choose top prediction
      const top = hfJson[0];
      normalized.crackType = top.label || null;
      normalized.confidence = typeof top.score === "number" ? top.score : null;

      // Heuristics to decide severity from label text
      const labelLower = (top.label || "").toLowerCase();
      if (labelLower.includes("severe") || labelLower.includes("high")) normalized.severity = "High";
      else if (labelLower.includes("moderate")) normalized.severity = "Moderate";
      else if (labelLower.includes("low") || labelLower.includes("minor")) normalized.severity = "Low";
      else normalized.severity = "Moderate";

      normalized.description = `Predicted: ${top.label} (score ${Math.round((top.score || 0) * 100)}%)`;

      const insight = pickInsights(top.label);
      if (insight) {
        normalized.severity = insight.severity ?? normalized.severity;
        normalized.description = insight.description ?? normalized.description;
        normalized.dimensions = {
          length: insight.dimensions.length,
          width: insight.dimensions.width,
          depth: insight.dimensions.depth,
        };
        normalized.recommendedActions.shortTerm = insight.shortTerm;
        normalized.recommendedActions.longTerm = insight.longTerm;
        normalized.urgency = insight.urgency;
      }
    }
    // Case 2: HF returns a generation object { generated_text } or { text }
    else if (hfJson && typeof hfJson === "object" && (hfJson.generated_text || hfJson.text)) {
      const txt = hfJson.generated_text ?? hfJson.text;
      normalized.description = String(txt).slice(0, 2000); // avoid giant payloads

      // Attempt naïve parsing for known fields (best-effort)
      try {
        // look for key phrases like "severity:", "confidence:", "length", "width", "recommend"
        const low = txt.toLowerCase();
        const sevMatch = low.match(/severity[:\s]+([A-Za-z0-9]+)/);
        if (sevMatch) normalized.severity = sevMatch[1];

        const confMatch = low.match(/confidence[:\s]+([0-9]{1,3}%?|0?\.\d+)/);
        if (confMatch) {
          const c = confMatch[1].includes("%")
            ? parseFloat(confMatch[1]) / 100
            : parseFloat(confMatch[1]);
          if (!isNaN(c)) normalized.confidence = c;
        }

        const lengthMatch = low.match(/length[:\s]+([0-9]+(?:\.[0-9]+)?\s*(cm|mm|m)?)/);
        if (lengthMatch) normalized.dimensions.length = lengthMatch[1].trim();
        const widthMatch = low.match(/width[:\s]+([0-9]+(?:\.[0-9]+)?\s*(mm|cm)?)/);
        if (widthMatch) normalized.dimensions.width = widthMatch[1].trim();
        const depthMatch = low.match(/depth[:\s]+([0-9]+(?:\.[0-9]+)?\s*(mm|cm)?)/);
        if (depthMatch) normalized.dimensions.depth = depthMatch[1].trim();

        // recommended actions (simple sentence split)
        const recMatches = txt.split(/(?:recommend|action|suggest|short-term|long-term)/i).slice(1);
        if (recMatches.length > 0) {
          normalized.recommendedActions.shortTerm = recMatches.slice(0, 2).map(s => s.trim()).filter(Boolean);
        }
      } catch (err) {
        // parsing best-effort: ignore errors
      }
    }
    // Case 3: HF returns structured object with fields we expect
    else if (hfJson && typeof hfJson === "object") {
      normalized.severity = hfJson.severity ?? hfJson.severity_level ?? null;
      normalized.crackType = hfJson.crackType ?? hfJson.label ?? hfJson.prediction ?? null;
      normalized.confidence = hfJson.confidence ?? hfJson.score ?? null;
      normalized.description = hfJson.description ?? hfJson.notes ?? null;

      normalized.dimensions = {
        length: hfJson.dimensions?.length ?? hfJson.length ?? normalized.dimensions.length,
        width: hfJson.dimensions?.width ?? hfJson.width ?? normalized.dimensions.width,
        depth: hfJson.dimensions?.depth ?? hfJson.depth ?? normalized.dimensions.depth,
      };

      if (!normalized.recommendedActions.shortTerm.length) {
        normalized.recommendedActions.shortTerm = hfJson.recommendedActions?.shortTerm ?? hfJson.short_term_recommendations ?? [];
      }
      if (!normalized.recommendedActions.longTerm.length) {
        normalized.recommendedActions.longTerm = hfJson.recommendedActions?.longTerm ?? hfJson.long_term_recommendations ?? [];
      }

      if (!normalized.urgency.level && !normalized.urgency.timeline) {
        normalized.urgency = {
          level: hfJson.urgency?.level ?? hfJson.urgency_level ?? null,
          timeline: hfJson.urgency?.timeline ?? hfJson.urgency_timeline ?? null,
        };
      }
    }

    // Final result: apply safe default values only if fields are still missing
    const result = {
      severity: normalized.severity ?? "Moderate",
      crackType: normalized.crackType ?? "Structural Crack (Shear)",
      confidence: typeof normalized.confidence === "number" ? normalized.confidence : 0.50,
      description: normalized.description ?? "No description available",
      dimensions: {
        length: normalized.dimensions.length ?? "45cm",
        width: normalized.dimensions.width ?? "2-3mm",
        depth: normalized.dimensions.depth ?? "5-8mm",
      },
      recommendedActions: {
        shortTerm: (normalized.recommendedActions.shortTerm && normalized.recommendedActions.shortTerm.length > 0)
          ? normalized.recommendedActions.shortTerm
          : [
            "Mark and monitor crack length and width weekly",
            "Limit use of affected area until inspected",
          ],
        longTerm: (normalized.recommendedActions.longTerm && normalized.recommendedActions.longTerm.length > 0)
          ? normalized.recommendedActions.longTerm
          : [
            "Seal the crack with appropriate epoxy filler",
            "Engage a structural engineer for on-site assessment",
            "Check for water infiltration behind the crack",
          ],
      },
      urgency: {
        level: normalized.urgency?.level ?? "Moderate",
        timeline: normalized.urgency?.timeline ?? "1-2 weeks",
      },
    };



    return res.json(result);

  } catch (err) {
    console.error("ERROR:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMessage || "Internal server error" });
  }
});

app.listen(5000, () => 
  console.log("✅ Backend running at http://localhost:5000")
);
