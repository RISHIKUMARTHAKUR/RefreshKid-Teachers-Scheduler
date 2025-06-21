"use client";

import Image from 'next/image';

const Header = () => {
  return (
    <header className="bg-background shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <Image 
            src="https://placehold.co/512x59.png" 
            alt="Refresh Kid: Add Teacher Availability" 
            width={512} 
            height={59} 
            priority
            data-ai-hint="logo refresh kid" 
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
