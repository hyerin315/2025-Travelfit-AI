import React from 'react';

interface LayoutBottomSpaceIconProps {
  className?: string;
}

export const LayoutBottomSpaceIcon: React.FC<LayoutBottomSpaceIconProps> = ({ className = 'w-5 h-5' }) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.25 17.25H18.75V18.75H5.25V17.25Z" fill="currentColor"/>
      <path d="M12.75 7.75L15 7.75L15 15.25L16.5 15.25L16.5 7.75L18.75 7.75L15.75 4.75L12.75 7.75Z" fill="currentColor"/>
      <path d="M5.25 7.75L7.5 7.75L7.5 15.25L9 15.25L9 7.75L11.25 7.75L8.25 4.75L5.25 7.75Z" fill="currentColor"/>
    </svg>
  );
};

