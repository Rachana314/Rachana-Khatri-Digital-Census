export default function Button({ children, variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-60";
  const styles =
    variant === "primary"
      ? "bg-black text-white hover:opacity-90"
      : "border bg-white hover:bg-gray-100";

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}
