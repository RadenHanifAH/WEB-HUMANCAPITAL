import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

function Alert({ message, type = "success", onClose }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);

    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 300); // tunggu animasi keluar
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-50 w-[340px]
        transform transition-all duration-300 ease-in-out
        ${show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
        bg-white/70 backdrop-blur-lg rounded-xl p-6
        shadow-xl hover:shadow-2xl border-l-4
        ${type === "success" ? "border-green-500" : "border-red-500"}
      `}
    >
      <div className="flex items-center gap-4">
        {type === "success" ? (
          <CheckCircle className="w-6 h-6 text-green-600" />
        ) : (
          <XCircle className="w-6 h-6 text-red-600" />
        )}

        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">{message}</p>
        </div>

        <button onClick={onClose}>
          <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
        </button>
      </div>
    </div>
  );
}

export default Alert;
