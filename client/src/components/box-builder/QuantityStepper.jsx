export default function QuantityStepper({ value, onChange, min = 0, max = Infinity, step = 1, className = '' }) {
  return (
    <div className={`inline-flex items-center border border-brown-200 rounded-sm ${className}`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={value <= min}
        className="w-9 h-9 flex items-center justify-center text-brown-600 hover:bg-brown-50 disabled:opacity-30 disabled:hover:bg-transparent"
      >
        −
      </button>
      <span className="w-10 text-center font-semibold text-brown-800">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + step))}
        disabled={value >= max}
        className="w-9 h-9 flex items-center justify-center text-brown-600 hover:bg-brown-50 disabled:opacity-30 disabled:hover:bg-transparent"
      >
        +
      </button>
    </div>
  );
}
