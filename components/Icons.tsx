
import React from 'react';

export const WaterDropIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s9.75 11.086 9.75 11.086S21.75 17.385 21.75 12 17.385 2.25 12 2.25Zm-2.625 7.5a.75.75 0 0 0-1.5 0v.193a2.25 2.25 0 0 0-.53 1.562c0 .697.283 1.328.738 1.771a3.748 3.748 0 0 1 1.294 2.703.75.75 0 0 0 1.5 0 2.25 2.25 0 0 0-1.5-2.122V9.75Z" clipRule="evenodd" />
  </svg>
);

export const BombIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M11.25 2.25c4.524 0 8.337 3.235 9.422 7.534.113.434.422.784.81.983.388.198.834.223 1.226.068a.75.75 0 0 1 .632 1.332.833.833 0 0 1-.264.133c-4.633 2.14-7.505 6.64-7.505 11.699a.75.75 0 0 1-1.5 0c0-4.062-2.119-7.666-5.323-9.923a.75.75 0 0 1-.505-1.005A9.704 9.704 0 0 1 2.25 12C2.25 6.615 6.365 2.25 11.25 2.25Z" clipRule="evenodd" />
  </svg>
);

export const ShieldIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm.53 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v5.69l-1.72-1.72a.75.75 0 0 0-1.06 1.06l3 3a.75.75 0 0 0 1.06 0l3-3a.75.75 0 1 0-1.06-1.06l-1.72 1.72V8.94l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z" clipRule="evenodd" />
  </svg>
);

export const WindIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 12h17.25" />
    </svg>
);
