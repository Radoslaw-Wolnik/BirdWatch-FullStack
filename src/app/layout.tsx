import React from 'react';
import Header from './Header';
import Footer from './Footer';
import ErrorBoundary from './ErrorBoundary';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <ErrorBoundary>
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
      </ErrorBoundary>
      <Footer />
    </div>
  );
};

export default Layout;