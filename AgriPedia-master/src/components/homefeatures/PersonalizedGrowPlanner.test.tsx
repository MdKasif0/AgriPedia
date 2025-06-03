import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PersonalizedGrowPlanner from './PersonalizedGrowPlanner';

// Mock step components to simplify testing the planner's logic
// We'll assert they are rendered and props are passed, but not their internal behavior here.
const mockLocationStep = jest.fn();
const mockGrowingSpaceStep = jest.fn();
const mockSunlightExposureStep = jest.fn();
const mockPurposeStep = jest.fn();
const mockTimeCommitmentStep = jest.fn();
const mockExperienceLevelStep = jest.fn();

jest.mock('../planner/LocationStep', () => (props) => {
  mockLocationStep(props);
  return (
    <div>
      <h2>Location Step Content</h2>
      <button onClick={() => props.onNext({ location: { address: 'Test Location' } })}>Next Location</button>
      {/* No Back button for the first step in the mock */}
    </div>
  );
});
jest.mock('../planner/GrowingSpaceStep', () => (props) => {
  mockGrowingSpaceStep(props);
  return (
    <div>
      <h2>Growing Space Step Content</h2>
      <button onClick={props.onBack}>Back GrowingSpace</button>
      <button onClick={() => props.onNext({ growingSpace: 'balcony' })}>Next GrowingSpace</button>
    </div>
  );
});
jest.mock('../planner/SunlightExposureStep', () => (props) => {
  mockSunlightExposureStep(props);
  return <div><h2>Sunlight Exposure Step Content</h2><button onClick={props.onBack}>Back Sunlight</button><button onClick={() => props.onNext({ sunlightExposure: 'full' })}>Next Sunlight</button></div>;
});
jest.mock('../planner/PurposeStep', () => (props) => {
  mockPurposeStep(props);
  return <div><h2>Purpose Step Content</h2><button onClick={props.onBack}>Back Purpose</button><button onClick={() => props.onNext({ purposes: ['vegetables'] })}>Next Purpose</button></div>;
});
jest.mock('../planner/TimeCommitmentStep', () => (props) => {
  mockTimeCommitmentStep(props);
  return <div><h2>Time Commitment Step Content</h2><button onClick={props.onBack}>Back Time</button><button onClick={() => props.onNext({ timeCommitment: 3 })}>Next Time</button></div>;
});
jest.mock('../planner/ExperienceLevelStep', () => (props) => {
  mockExperienceLevelStep(props);
  return <div><h2>Experience Level Step Content</h2><button onClick={props.onBack}>Back Experience</button><button onClick={() => props.onNext({ experienceLevel: 'intermediate' })}>Finish</button></div>;
});

// Mock ProgressBar
jest.mock('../planner/ProgressBar', () => ({ currentStep, totalSteps }) => (
  <div data-testid="progress-bar">
    Progress: {currentStep + 1} / {totalSteps}
  </div>
));


describe('PersonalizedGrowPlanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the first step (LocationStep) by default', async () => {
    render(<PersonalizedGrowPlanner />);
    // Wait for any initial animations/state changes
    await waitFor(() => {
        expect(screen.getByText('Location Step Content')).toBeInTheDocument();
    });
    expect(mockLocationStep).toHaveBeenCalled();
    expect(screen.getByTestId('progress-bar')).toHaveTextContent('Progress: 1 / 6');
  });

  it('navigates to the next step when "Next" is clicked in a step', async () => {
    render(<PersonalizedGrowPlanner />);
    await waitFor(() => { // Wait for initial render of LocationStep
      expect(screen.getByText('Location Step Content')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Next Location' }));

    await waitFor(() => {
      expect(screen.getByText('Growing Space Step Content')).toBeInTheDocument();
    });
    expect(mockGrowingSpaceStep).toHaveBeenCalled();
    expect(screen.getByTestId('progress-bar')).toHaveTextContent('Progress: 2 / 6');
    // Check that formData was updated
    expect(mockGrowingSpaceStep).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ location: { address: 'Test Location' } })
    }));
  });

  it('navigates to the previous step when "Back" is clicked', async () => {
    render(<PersonalizedGrowPlanner />);
    // Go to LocationStep
    await waitFor(() => expect(screen.getByText('Location Step Content')).toBeInTheDocument());
    // Go to GrowingSpaceStep
    fireEvent.click(screen.getByRole('button', { name: 'Next Location' }));
    await waitFor(() => expect(screen.getByText('Growing Space Step Content')).toBeInTheDocument());

    // Go back to LocationStep
    fireEvent.click(screen.getByRole('button', { name: 'Back GrowingSpace' }));
    await waitFor(() => expect(screen.getByText('Location Step Content')).toBeInTheDocument());
    expect(mockLocationStep).toHaveBeenCalledTimes(2); // Called on initial and on back
    expect(screen.getByTestId('progress-bar')).toHaveTextContent('Progress: 1 / 6');
  });

  it('updates formData correctly across multiple steps', async () => {
    render(<PersonalizedGrowPlanner />);
    // Step 0 -> 1
    await waitFor(() => expect(screen.getByText('Location Step Content')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Next Location' }));
    // Step 1 -> 2
    await waitFor(() => expect(screen.getByText('Growing Space Step Content')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Next GrowingSpace' }));

    await waitFor(() => expect(screen.getByText('Sunlight Exposure Step Content')).toBeInTheDocument());
    expect(mockSunlightExposureStep).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        location: { address: 'Test Location' },
        growingSpace: 'balcony',
      },
    }));
  });

  it('shows the summary screen after the last step', async () => {
    render(<PersonalizedGrowPlanner />);
    // Navigate through all steps
    await waitFor(() => expect(screen.getByText('Location Step Content')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Next Location' }));
    await waitFor(() => expect(screen.getByText('Growing Space Step Content')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Next GrowingSpace' }));
    await waitFor(() => expect(screen.getByText('Sunlight Exposure Step Content')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Next Sunlight' }));
    await waitFor(() => expect(screen.getByText('Purpose Step Content')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Next Purpose' }));
    await waitFor(() => expect(screen.getByText('Time Commitment Step Content')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Next Time' }));
    await waitFor(() => expect(screen.getByText('Experience Level Step Content')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));

    await waitFor(() => {
      expect(screen.getByText(/Planner Complete!/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/"location": {\s*"address": "Test Location"\s*}/)).toBeInTheDocument();
    expect(screen.getByText(/"growingSpace": "balcony"/)).toBeInTheDocument();
    expect(screen.getByText(/"sunlightExposure": "full"/)).toBeInTheDocument();
    expect(screen.getByText(/"purposes": \[\s*"vegetables"\s*\]/)).toBeInTheDocument();
    expect(screen.getByText(/"timeCommitment": 3/)).toBeInTheDocument();
    expect(screen.getByText(/"experienceLevel": "intermediate"/)).toBeInTheDocument();

    // Progress bar should not be visible on summary screen
    expect(screen.queryByTestId('progress-bar')).not.toBeInTheDocument();
  });

  it('resets the planner when "Start Over" is clicked on the summary screen', async () => {
    render(<PersonalizedGrowPlanner />);
    // Complete all steps to reach summary
    await waitFor(() => expect(screen.getByText('Location Step Content')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Next Location' }));
    await waitFor(() => expect(screen.getByText('Growing Space Step Content')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Next GrowingSpace' }));
    await waitFor(() => expect(screen.getByText('Sunlight Exposure Step Content')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Next Sunlight' }));
    await waitFor(() => expect(screen.getByText('Purpose Step Content')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Next Purpose' }));
    await waitFor(() => expect(screen.getByText('Time Commitment Step Content')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Next Time' }));
    await waitFor(() => expect(screen.getByText('Experience Level Step Content')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));

    // On summary screen
    await waitFor(() => expect(screen.getByText(/Planner Complete!/i)).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Start Over/i }));

    // Should be back to LocationStep with empty data
    await waitFor(() => expect(screen.getByText('Location Step Content')).toBeInTheDocument());
    expect(mockLocationStep).toHaveBeenLastCalledWith(expect.objectContaining({
      data: {}, // Empty data
    }));
    expect(screen.getByTestId('progress-bar')).toHaveTextContent('Progress: 1 / 6');
  });
});
