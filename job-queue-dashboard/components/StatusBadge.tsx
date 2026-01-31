type Props = {
  status: string;
};

const STATUS_STYLES: Record<string, string> = {
  QUEUED:
    "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
  PROCESSING:
    "bg-amber-100 text-amber-700 ring-1 ring-amber-200 animate-pulse",
  COMPLETED:
    "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  FAILED:
    "bg-red-100 text-red-700 ring-1 ring-red-200",
  DEAD_LETTER:
    "bg-purple-100 text-purple-700 ring-1 ring-purple-200",
};

export default function StatusBadge({ status }: Props) {
  return (
    <span
      className={`
        inline-flex items-center
        px-3 py-1
        rounded-full
        text-xs font-semibold
        shadow-sm
        transition
        ${STATUS_STYLES[status] || "bg-gray-100 text-gray-700 ring-1 ring-gray-200"}
      `}
    >
      {status}
    </span>
  );
}
