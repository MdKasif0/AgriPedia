import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Step1Location from './Step1Location';
import Step2GrowingSpace from './Step2GrowingSpace';
import Step3SunlightExposure from './Step3SunlightExposure';
import Step4Purpose from './Step4Purpose';
import Step5TimeCommitment from './Step5TimeCommitment';
import Step6ExperienceLevel from './Step6ExperienceLevel';
import StepSummary from './StepSummary'; // Import the Summary Step
// Import other steps here as they are created

const DATA_INPUT_MAX_STEPS = 6; // Last step for data input
const SUMMARY_STEP = DATA_INPUT_MAX_STEPS + 1;

const GrowPlanner: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);
  const startOver = () => {
    setCurrentStep(1);
    setFormData({});
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Location formData={formData} setFormData={setFormData} />;
      case 2:
        return <Step2GrowingSpace formData={formData} setFormData={setFormData} />;
      case 3:
        return <Step3SunlightExposure formData={formData} setFormData={setFormData} />;
      case 4:
        return <Step4Purpose formData={formData} setFormData={setFormData} />;
      case 5:
        return <Step5TimeCommitment formData={formData} setFormData={setFormData} />;
      case 6:
        return <Step6ExperienceLevel formData={formData} setFormData={setFormData} />;
      case SUMMARY_STEP: // Render Summary Step
        return <StepSummary formData={formData} />;
      // Add other cases here
      default:
        return <div>Unknown Step</div>;
    }
  };

  // Animation variants for framer-motion
  const stepVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[300px] w-full">
      <div className="w-full max-w-lg p-6 bg-white border border-gray-200 rounded-xl shadow-xl">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Grow Planner</h1>

        <motion.div
          key={currentStep} // Important for triggering animation on step change
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg shadow hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          {currentStep < SUMMARY_STEP && (
            <button
              onClick={nextStep}
              disabled={currentStep > DATA_INPUT_MAX_STEPS}
              className="px-6 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {currentStep === DATA_INPUT_MAX_STEPS ? 'See Summary' : 'Next'}
            </button>
          )}
          {currentStep === SUMMARY_STEP && (
             <button
              onClick={startOver}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors"
            >
              Start Over
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrowPlanner;
