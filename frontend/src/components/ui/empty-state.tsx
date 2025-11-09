type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white px-8 py-12 text-center">
    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    {description ? <p className="max-w-md text-sm text-slate-500">{description}</p> : null}
    {action}
  </div>
);

