import React, { useState } from 'react';
import Joyride from 'react-joyride';

const OnboardingTour = () => {
  const [run, setRun] = useState(true);
  const steps = [
    {
      target: '.header', // Ensure your header has className="header"
      content: 'Welcome to EA Builder! Use the navigation above to access different sections of the platform.',
    },
    {
      target: '.sidebar', // Ensure your Sidebar component renders an element with className="sidebar"
      content: 'This is your toolbox with available indicators. Drag and drop them onto the canvas.',
    },
    {
      target: '.drop-area', // Ensure your DropArea component has className="drop-area"
      content: 'Drop your indicators here to start building your EA.',
    },
    {
      target: '.risk-management', // Ensure your RiskManagementSettings container has className="risk-management"
      content: 'Configure risk management settings such as stop loss and trailing stop here.',
    },
    {
      target: '.code-editor', // Ensure your CodeEditor container has className="code-editor"
      content: 'The generated EA code will be displayed here. You can edit it directly if needed.',
    },
    {
      target: '.properties-panel', // Ensure your PropertiesPanel component has className="properties-panel"
      content: 'Adjust indicator parameters and other settings in this panel.',
    },
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showSkipButton={true}
      showProgress={true}
    />
  );
};

export default OnboardingTour;
