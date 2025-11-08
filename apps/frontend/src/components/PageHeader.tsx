interface PageHeaderProps {
  title: string;
  background?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, background, children }: PageHeaderProps) {
  const isDarkBackground = background && ['bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-red-600'].includes(background);
  const textColor = isDarkBackground ? 'text-white' : 'text-black';

  return (
    <div className="flex items-center justify-between">
      <h1 className={`text-lg font-bold ${textColor}`}>{title}</h1>
      {children}
    </div>
  );
}