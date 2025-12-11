import React from 'react';

interface LayoutSubjectLeftIconProps {
  className?: string;
}

export const LayoutSubjectLeftIcon: React.FC<LayoutSubjectLeftIconProps> = ({ className = 'w-5 h-5' }) => {
  return (
    <svg className={className} viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.25 7.625H18.75V9.125H5.25V7.625ZM8.25 18.875H18.75V20.375H8.25V18.875ZM5.25 15.125H18.75V16.625H5.25V15.125ZM8.25 11.375H18.75V12.875H8.25V11.375Z" fill="currentColor"/>
    </svg>
  );
};

