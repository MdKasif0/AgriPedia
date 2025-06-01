import fs from 'fs';
import path from 'path';
import type { PlannerData } from '@/types/planner';
import type { GrowingGuide, Condition, GrowingStage, CustomizationRule } from './produceData'; // Import types from the main produceData

// Helper function for getProduceGuide (copied from produceData.ts)
// This can stay here or be in a shared utils if produceData.ts also needs it without fs context
function matchesCondition(condition: Condition, plannerData: PlannerData): boolean {
  if (!plannerData) return false;

  if (condition.space && plannerData.space !== condition.space) return false;
  if (condition.experience && plannerData.experience !== condition.experience) return false;

  if (condition.location_climate) {
    const climateZone = plannerData.location?.climateZone?.toLowerCase() || "";
    if (plannerData.location?.simplifiedClimate && typeof plannerData.location.simplifiedClimate === 'string') {
        if(plannerData.location.simplifiedClimate.toLowerCase() !== condition.location_climate.toLowerCase()) return false;
    } else if (!climateZone.includes(condition.location_climate.toLowerCase())) {
        return false;
    }
  }
  return true;
}

export function getProduceGuide(plant_id: string, plannerData?: PlannerData | null): GrowingGuide | null {
  const guideFileName = `${plant_id}.json`;
  // Assuming this runs from the project root, adjust path if context changes
  const filePath = path.join(process.cwd(), 'src', 'lib', 'data', 'guides', guideFileName);

  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`Growing guide for plant_id '${plant_id}' not found at ${filePath}`);
      return null;
    }
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const baseGuide: GrowingGuide = JSON.parse(fileContent);

    if (!plannerData) {
      return baseGuide;
    }

    const customizedGuide: GrowingGuide = JSON.parse(JSON.stringify(baseGuide));

    customizedGuide.growing_guide.forEach((stage: GrowingStage) => {
      if (stage.customizations && stage.customizations.length > 0) {
        const originalInstructions = [...stage.instructions];
        let currentInstructions = [...stage.instructions];
        let currentTips = stage.tips ? [...stage.tips] : [];
        let currentWarnings = stage.warnings ? [...stage.warnings] : [];

        stage.customizations.forEach((rule: CustomizationRule) => {
          if (matchesCondition(rule.condition, plannerData)) {
            if (rule.instructions_add) {
              currentInstructions.push(...rule.instructions_add);
            }
            if (rule.tips_add) {
              currentTips.push(...rule.tips_add);
            }
            if (rule.warnings_add) {
              currentWarnings.push(...rule.warnings_add);
            }
            if (rule.instructions_modify) {
              rule.instructions_modify.forEach(mod => {
                if (mod.index !== undefined && mod.index < currentInstructions.length) {
                  currentInstructions[mod.index] = mod.new_text;
                } else if (mod.match_text) {
                  const idxToModify = currentInstructions.findIndex(instr => instr.includes(mod.match_text!));
                  if (idxToModify > -1) {
                    currentInstructions[idxToModify] = mod.new_text;
                  }
                }
              });
            }
          }
        });
        stage.instructions = currentInstructions;
        stage.tips = currentTips.length > 0 ? currentTips : undefined;
        stage.warnings = currentWarnings.length > 0 ? currentWarnings : undefined;
      }
      // delete stage.customizations; // Decide if client needs this
    });

    return customizedGuide;

  } catch (error) {
    console.error(`Error reading or parsing/customizing guide for '${plant_id}':`, error);
    return null;
  }
}
