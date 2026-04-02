import Link from 'next/link';

interface TitleHeaderProps {
  title: string;
  description: string;
  button?: {
    buttonText: string;
    buttonHref: string;
  };
}

export default function TitleHeader({
  title,
  description,
  button,
}: TitleHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8 gap-2">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">{title}</h1>
        <p className="text-sm text-zinc-500 mt-2">{description}</p>
      </div>
      {button && (
        <Link
          href={button.buttonHref}
          className="px-5 py-2.5 rounded-xl bg-zinc-800 text-white text-sm font-semibold hover:bg-zinc-800 shrink-0"
        >
          {button.buttonText}
        </Link>
      )}
    </div>
  );
}
