interface Props {
  onOpen: () => void;
}

export default function EmptyState({
  onOpen,
}: Props) {
  return (
    <div className="text-center py-20">
      <svg
        className="w-20 h-20 mx-auto text-gray-300 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01"
        />
      </svg>

      <p className="text-gray-500 text-lg">
        هنوز سوالی ثبت نشده است
      </p>

      <button
        onClick={onOpen}
        className="mt-4 text-blue-600 font-bold"
      >
        اولین سوال را ثبت کنید
      </button>
    </div>
  );
}