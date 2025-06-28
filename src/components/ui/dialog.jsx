import React, { useState } from 'react';

export function Dialog({ children }) {
  return <>{children}</>;
}

export function DialogTrigger({ children, asChild = false }) {
  return children;
}

export function DialogContent({ children }) {
  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white p-6 shadow-lg rounded-lg z-50 w-full max-w-md">
      {children}
    </div>
  );
}
