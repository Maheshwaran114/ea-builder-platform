import React from 'react';
import Joyride from 'react-joyride';

function OnboardingTour() {
  const steps = [
    {
      target: '.header',
      content: 'This is the header where you navigate through the application.',
    },
    {
      target: '.sidebar',
      content: 'This is the toolbox. Drag and drop blocks to build your EA.',
    },
    {
      target: '.main-canvas',
      content: 'This area is your EA builder canvas. Drop blocks here.',
    },
    {
      target: '.code-preview',
      content: 'Here is the live code preview that updates as you build your EA.',
    },
  ];

  return <Joyride steps={steps} continuous showSkipButton />;
}

export default OnboardingTour;
