import React from 'react';

interface ExperienceLevelStepProps {
  onNext: (data: any) => void;
  onBack: () => void;
  data: any;
}

const ExperienceLevelStep: React.FC<ExperienceLevelStepProps> = ({ onNext, onBack, data }) => {
  // TODO: Implement experience level selection
  return (
    <div>
      <h2>Experience Level</h2>
      {/* Add form elements for experience level input */}
      <button onClick={onBack}>Back</button>
      <button onClick={() => onNext({})}>Next</button>
    </div>
  );
};

export default ExperienceLevelStep;
