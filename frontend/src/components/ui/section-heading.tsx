type SectionHeadingProps = {
  title: string;
  description?: string;
};

export const SectionHeading = ({ title, description }: SectionHeadingProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">{title}</h2>
      {description ? <p className="text-xs sm:text-sm text-slate-500">{description}</p> : null}
    </div>
  );
};

