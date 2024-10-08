// File: src/components/Footer.tsx

import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-primary-800 text-white py-4">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} BirdWatch. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;