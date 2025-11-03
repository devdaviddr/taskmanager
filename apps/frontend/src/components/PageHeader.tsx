interface PageHeaderProps {
  title: string;
  description: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-4">
      <h1 className="text-lg font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
}