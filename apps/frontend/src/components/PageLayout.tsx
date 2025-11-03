import type { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  background?: string;
}

export default function PageLayout({ children, background }: PageLayoutProps) {
  return (
    <div className={`min-h-screen pt-0 pb-6 px-4 sm:px-0 ${background || ''}`}>
      {children}
    </div>
  );
}