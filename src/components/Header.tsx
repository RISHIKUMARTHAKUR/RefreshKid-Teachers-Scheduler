"use client";

import Image from 'next/image';

const Header = () => {
  return (
    <header className="bg-background shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <Image 
            src="https://raw.githubusercontent.com/RISHIKUMARTHAKUR/RefreshKid-Teachers-Scheduler/refs/heads/main/Screenshot%202025-06-21%20013254.png" 
            alt="RefreshKid Logo" 
            width={600} 
            height={40} 
            priority
            className="rounded-md"
            data-ai-hint="logo" 
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
