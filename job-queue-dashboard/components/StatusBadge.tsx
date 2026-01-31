type Props = {
  status: string;
};

const STATUS_STYLES: Record<string, string> = {
  QUEUED:
    "bg-blue-50 text-blue-700 ring-blue-200",
  PROCESSING:
    "bg-amber-50 text-amber-700 ring-amber-200 animate-pulse",
  COMPLETED:
    "bg-emerald-50 text-emerald-700 ring-emerald-200",
  FAILED:
    "bg-red-50 text-red-700 ring-red-200",
  DEAD_LETTER:
    "bg-purple-50 text-purple-700 ring-purple-200",
};

export default function StatusBadge({ status }: Props) {
  return (
    <span
      className={`
        inline-flex items-center
        px-3 py-1.5
        rounded-full
        text-xs font-semibold
        ring-1
        shadow-sm
        transition-all
        hover:scale-105
        ${STATUS_STYLES[status] || "bg-gray-50 text-gray-700 ring-gray-200"}
      `}
    >
      {status}
    </span>
  );
}
