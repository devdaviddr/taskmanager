import type { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  background?: string;
}

export default function PageLayout({ children, background }: PageLayoutProps) {
  return (
    <div className={`w-full h-full p-0 m-0 overflow-y-auto ${background || ''}`}>
      {children}
    </div>
  );
}