interface PageHeaderProps {
  title: string;
}

export default function PageHeader({ title }: PageHeaderProps) {
  return (
    <div className="mb-4 bg-black/50 backdrop-blur-sm p-4">
      <h1 className="text-lg font-bold text-white">{title}</h1>
    </div>
  );
}