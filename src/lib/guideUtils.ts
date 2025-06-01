import type { GrowingGuide, Condition, CustomizationRule, GrowingStage } from './produceData'; // Assuming types are exported
import type { PlannerData } from '@/types/planner';

// This function can be shared if produceData.ts can import from here,
// or duplicated if circular dependencies are an issue.
// For now, duplicating the core logic for client-side use.
export function matchesClientCondition(condition: Condition, plannerData: PlannerData): boolean {
    if (!plannerData) return false;

    if (condition.space && plannerData.space !== condition.space) return false;
    if (condition.experience && plannerData.experience !== condition.experience) return false;

    if (condition.location_climate) {
        const climateZone = plannerData.location?.climateZone?.toLowerCase() || "";
        // Check simplifiedClimate first if it exists on plannerData
        if (plannerData.location?.simplifiedClimate && typeof plannerData.location.simplifiedClimate === 'string') {
            if(plannerData.location.simplifiedClimate.toLowerCase() !== condition.location_climate.toLowerCase()) return false;
        } else if (!climateZone.includes(condition.location_climate.toLowerCase())) {
            // Fallback to checking climateZone if simplifiedClimate is not available or doesn't match
            return false;
        }
    }
    return true;
}

export function customizeGuideForClient(baseGuide: GrowingGuide, plannerData: PlannerData | null): GrowingGuide {
  if (!plannerData) {
    // If no planner data, or if the base guide itself is null/undefined, return it as is.
    return baseGuide || null;
  }

  // Deep copy to avoid modifying the original object from props
  const customizedGuide: GrowingGuide = JSON.parse(JSON.stringify(baseGuide));

  customizedGuide.growing_guide.forEach((stage: GrowingStage) => { // Ensure type for stage
    if (stage.customizations && stage.customizations.length > 0) {
      // Ensure arrays are new instances for modification
      const originalInstructions = [...stage.instructions];
      let currentInstructions = [...stage.instructions];
      let currentTips = stage.tips ? [...stage.tips] : [];
      let currentWarnings = stage.warnings ? [...stage.warnings] : [];

      stage.customizations.forEach((rule: CustomizationRule) => { // Ensure type for rule
        if (matchesClientCondition(rule.condition, plannerData)) {
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
      stage.tips = currentTips.length > 0 ? currentTips : undefined; // Assign undefined if empty, matching original structure
      stage.warnings = currentWarnings.length > 0 ? currentWarnings : undefined; // Assign undefined if empty

      // It's generally good practice to remove the customization rules from the final object
      // if they are not intended to be used by the rendering component directly,
      // to keep the data clean and reduce payload if serialized.
      // However, if GrowingGuideDisplay might want to show *why* something was customized, keep them.
      // For now, let's keep them for potential debugging or advanced UI.
      // delete stage.customizations;
    }
  });

  return customizedGuide;
}
