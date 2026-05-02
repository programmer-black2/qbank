export default function Button({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      className={`bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition ${className}`}
    >
      {children}
    </button>
  );
}