type Props = {
  status: string;
};

const STATUS_STYLES: Record<string, string> = {
  QUEUED: "bg-blue-600 text-white",
  PROCESSING: "bg-yellow-500 text-black",
  COMPLETED: "bg-green-600 text-white",
  FAILED: "bg-red-600 text-white",
  DEAD_LETTER: "bg-purple-600 text-white",
};

export default function StatusBadge({ status }: Props) {
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-semibold ${
        STATUS_STYLES[status] || "bg-gray-500 text-white"
      }`}
    >
      {status}
    </span>
  );
}
