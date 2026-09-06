import React from 'react';
import './default.css';

/**
 * The quiet ground every route without its own scenery gets: planner, tools,
 * account pages, auth, legal. Two slow-breathing brand glows in opposite
 * corners and one faint wireframe globe low on the right — enough that the
 * page never reads as a blank grey sheet, never enough to compete with a form.
 *
 * The globe is drawn in ink, not teal, because it sits on the light ground
 * rather than on a navy band like RouteGlobe does; the same motif at the same
 * alpha would vanish here.
 */
export default function DefaultBackdrop() {
  return (
    <div className="bd-default">
      <div className="bd-default-glow bd-default-glow--teal" />
      <div className="bd-default-glow bd-default-glow--blue" />
      <svg className="bd-default-globe" viewBox="0 0 640 640" fill="none"
        stroke="#252a31" strokeWidth="1">
        <circle cx="320" cy="320" r="300" strokeOpacity="0.10" />
        <ellipse cx="320" cy="320" rx="300" ry="108" strokeOpacity="0.07" />
        <ellipse cx="320" cy="320" rx="300" ry="108" strokeOpacity="0.07" transform="rotate(60 320 320)" />
        <ellipse cx="320" cy="320" rx="300" ry="108" strokeOpacity="0.07" transform="rotate(-60 320 320)" />
        <ellipse cx="320" cy="320" rx="108" ry="300" strokeOpacity="0.07" />
        <path d="M60 470 C 200 330 420 300 600 150" stroke="#0172cb" strokeOpacity="0.30"
          strokeWidth="1.5" strokeDasharray="5 9" strokeLinecap="round" />
        <circle cx="216" cy="372" r="4" stroke="#0172cb" strokeOpacity="0.35" />
        <circle cx="216" cy="372" r="1.5" fill="#0172cb" fillOpacity="0.5" stroke="none" />
        <circle cx="452" cy="266" r="4" stroke="#00a58e" strokeOpacity="0.35" />
        <circle cx="452" cy="266" r="1.5" fill="#00a58e" fillOpacity="0.5" stroke="none" />
      </svg>
    </div>
  );
}
