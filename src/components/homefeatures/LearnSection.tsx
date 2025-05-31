import React from 'react';

// Placeholder icons (optional)
const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m0 0a8.485 8.485 0 0011.494 0M12 17.747a8.485 8.485 0 01-11.494 0M12 6.253L5.253 2M12 6.253L18.747 2" />
  </svg>
);

const QuestionMarkCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4s-1.79 4-4 4c-1.742 0-3.223-.835-3.772-2M9 12l-2-2m2 2l2-2m2 2l2 2M9 12l-2 2m2-2l2 2m-2-2v6m-2-2h4" />
  </svg>
);

const LightBulbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M21 12a9 9 0 11-18 0 9 9 0 0118 0zM12 6v3M12 15v3" />
  </svg>
);


const LearnSection: React.FC = () => {
  return (
    <div className="bg-card text-card-foreground shadow-lg rounded-2xl p-6">
      <h3 className="text-xl font-serif font-semibold mb-4 text-center text-primary">Learn & Grow</h3>

      <p className="text-muted-foreground mb-6 text-center px-4">
        Expand your gardening knowledge with our curated resources.
      </p>

      <div className="space-y-4">
        {/* Gardening Glossary */}
        <div className="p-4 bg-primary/10 dark:bg-primary/20 border border-primary/30 rounded-lg">
          <h4 className="font-serif font-semibold text-primary mb-1">Gardening Glossary</h4>
          <p className="text-sm text-card-foreground/90 mb-2">Confused by gardening terms? Our glossary has you covered.</p>
          <button
            // onClick={() => alert('Explore Glossary functionality to be implemented')}
            className="inline-flex items-center text-sm bg-primary text-primary-foreground py-1.5 px-3 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-opacity-50 transition-all duration-150 ease-in-out hover:scale-[1.03]"
          >
            <BookOpenIcon />
            Explore Glossary
          </button>
        </div>

        {/* FAQ */}
        <div className="p-4 bg-secondary/10 dark:bg-secondary/20 border border-secondary/30 rounded-lg">
          <h4 className="font-serif font-semibold text-secondary mb-1">Frequently Asked Questions</h4>
          <p className="text-sm text-card-foreground/90 mb-2">Find answers to common gardening questions.</p>
          <button
            // onClick={() => alert('Read FAQs functionality to be implemented')}
            className="inline-flex items-center text-sm bg-secondary text-secondary-foreground py-1.5 px-3 rounded-md hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-opacity-50 transition-all duration-150 ease-in-out hover:scale-[1.03]"
          >
            <QuestionMarkCircleIcon />
            Read FAQs
          </button>
        </div>

        {/* Tips for All */}
        <div className="p-4 bg-accent/10 dark:bg-accent/20 border border-accent/30 rounded-lg">
          <h4 className="font-serif font-semibold text-accent mb-1">Tips for Everyone</h4>
          <p className="text-sm text-card-foreground/90 mb-2">
            Discover gardening tips tailored for all ages and abilities, including fun projects for kids, accessible gardening for seniors, and low-maintenance techniques.
          </p>
          <button
            // onClick={() => alert('Get Tips functionality to be implemented')}
            className="inline-flex items-center text-sm bg-accent text-accent-foreground py-1.5 px-3 rounded-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-opacity-50 transition-all duration-150 ease-in-out hover:scale-[1.03]"
          >
            <LightBulbIcon />
            Get Tips
          </button>
        </div>
      </div>
       <p className="text-xs text-muted-foreground/80 mt-4 text-center">
        (Buttons are for UI demonstration)
      </p>
    </div>
  );
};

export default LearnSection;
