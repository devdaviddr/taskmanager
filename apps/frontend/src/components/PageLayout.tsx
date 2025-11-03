import type { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="pt-0 pb-6 px-4 sm:px-0">
      {children}
    </div>
  );
}