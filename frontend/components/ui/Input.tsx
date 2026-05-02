type Props = {
  label: string;
  placeholder?: string;
  type?: string;
};

export default function Input({ label, placeholder, type = "text" }: Props) {
  return (
    <div>
      <label className="block text-sm mb-1 text-gray-600">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}