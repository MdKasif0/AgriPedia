export interface GrowingStage {
  stage: string;
  duration_days: number;
  instructions: string[];
  media?: {
    images?: string[];
    video?: string;
  };
  tools_needed?: string[];
  tips?: string[];
  warnings?: string[];
  reminders?: string[];
}

export interface PlantGrowingGuide {
  plant_id: string;
  common_name: string;
  scientific_name: string;
  growing_guide: GrowingStage[];
}

export const growingGuides: Record<string, PlantGrowingGuide> = {
  basil: {
    plant_id: "basil_001",
    common_name: "Basil",
    scientific_name: "Ocimum basilicum",
    growing_guide: [
      {
        stage: "Planting",
        duration_days: 7,
        instructions: [
          "Choose a pot with drainage holes.",
          "Use nutrient-rich soil (pH 6–7.5).",
          "Sow seeds 0.5 cm deep and water lightly.",
          "Place in a warm, sunny location (6–8 hrs light)."
        ],
        media: {
          images: [
            "/images/guides/basil/planting1.jpg",
            "/images/guides/basil/planting2.jpg"
          ],
          video: "/videos/guides/basil/how-to-plant-basil.mp4"
        },
        tools_needed: ["Pot", "Soil", "Spray bottle", "Basil seeds"],
        tips: ["Cover with a plastic wrap to retain moisture."],
        warnings: ["Don't use cold water—shocks roots."],
        reminders: ["Check soil moisture daily."]
      },
      {
        stage: "Germination",
        duration_days: 7,
        instructions: [
          "Keep soil moist but not wet.",
          "Maintain 21–26°C.",
          "Wait for sprouting."
        ],
        tips: ["Cover with a plastic wrap to retain moisture."],
        warnings: ["Avoid direct sunlight during germination."],
        reminders: ["Check for mold growth."]
      },
      {
        stage: "Growing",
        duration_days: 30,
        instructions: [
          "Thin to strongest seedlings.",
          "Water every 2–3 days.",
          "Provide full sunlight."
        ],
        tips: ["Pinch off flower buds to encourage leaf growth."],
        warnings: ["Watch for yellowing leaves—sign of overwatering."],
        reminders: ["Fertilize weekly with organic feed."]
      },
      {
        stage: "Harvesting",
        duration_days: 5,
        instructions: [
          "Start harvesting leaves when 6–8 inches tall.",
          "Pick leaves from the top."
        ],
        tips: ["Harvest often to encourage growth."],
        warnings: ["Don't remove more than 1/3 of the plant at once."],
        reminders: ["Harvest in the morning for best flavor."]
      }
    ]
  },
  tomato: {
    plant_id: "tomato_001",
    common_name: "Tomato",
    scientific_name: "Solanum lycopersicum",
    growing_guide: [
      {
        stage: "Planting",
        duration_days: 10,
        instructions: [
          "Start seeds indoors 6-8 weeks before last frost.",
          "Use seed starting mix.",
          "Plant seeds 1/4 inch deep.",
          "Keep soil temperature at 21-27°C."
        ],
        media: {
          images: [
            "/images/guides/tomato/planting1.jpg",
            "/images/guides/tomato/planting2.jpg"
          ],
          video: "/videos/guides/tomato/how-to-plant-tomato.mp4"
        },
        tools_needed: ["Seed trays", "Seed starting mix", "Heat mat", "Tomato seeds"],
        tips: ["Use a heat mat for better germination."],
        warnings: ["Don't overwater seedlings."],
        reminders: ["Check soil temperature daily."]
      },
      {
        stage: "Transplanting",
        duration_days: 14,
        instructions: [
          "Harden off seedlings for 7-10 days.",
          "Prepare garden bed with compost.",
          "Plant seedlings 2-3 feet apart.",
          "Water thoroughly after planting."
        ],
        tips: ["Plant deep—bury 2/3 of the stem."],
        warnings: ["Avoid transplanting in hot sun."],
        reminders: ["Water daily for first week."]
      },
      {
        stage: "Growing",
        duration_days: 60,
        instructions: [
          "Stake or cage plants early.",
          "Water deeply 2-3 times per week.",
          "Fertilize every 2 weeks.",
          "Prune suckers regularly."
        ],
        tips: ["Mulch to retain moisture."],
        warnings: ["Watch for blossom end rot."],
        reminders: ["Check for pests daily."]
      },
      {
        stage: "Harvesting",
        duration_days: 30,
        instructions: [
          "Harvest when fruits are fully colored.",
          "Pick regularly to encourage production.",
          "Store at room temperature."
        ],
        tips: ["Harvest in the morning for best flavor."],
        warnings: ["Don't refrigerate tomatoes."],
        reminders: ["Check plants daily for ripe fruits."]
      }
    ]
  }
}; 