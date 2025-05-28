// src/AppRouter.tsx
import React from 'react';
// Import the core router and route components
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Import the component you want to render for a specific route
import AllocationAdvisor from './components/investment/AllocationAdvisor';

const AppRouter: React.FC = () => {
  return (
    // 1. Wrap your application in a router component
    // BrowserRouter uses the browser's History API
    <Router>
      {/* 2. Define a container for your routes */}
      <Routes>
        {/* 3. Define individual routes */}
        {/*
          - path: The URL path for this route. "/" is the root path.
          - element: The React component to render when the path matches.
        */}
        <Route path="/" element={<AllocationAdvisor />} />

        {/*
          Add more <Route> elements here if your Next.js app had other "pages"
          For example, if you had an "about" page at /about:
          <Route path="/about" element={<AboutPage />} />
        */}

        {/*
          You can also define a catch-all route for 404 pages (optional):
          <Route path="*" element={<NotFoundPage />} />
        */}
      </Routes>
    </Router>
  );
};

export default AppRouter;

