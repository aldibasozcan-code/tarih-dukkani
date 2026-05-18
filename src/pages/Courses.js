// ═════════════════════════════════════════════════
// COURSES PAGE ADAPTER - Rendering React into Vanilla JS
// ═════════════════════════════════════════════════
import React from 'react';
import { createRoot } from 'react-dom/client';
import CoursesComponent from './Courses.jsx';

let root = null;

export function renderCourses(navigate) {
  return {
    html: '<div id="react-courses-root"></div>',
    init: (el, nav) => {
      const container = document.getElementById('react-courses-root');
      if (container) {
        if (root) {
          root.unmount();
        }
        root = createRoot(container);
        root.render(React.createElement(CoursesComponent, { navigate: nav }));
      }
    }
  };
}
