// src/components/Messages.jsx
import React, { useState, useRef } from "react";
import { Send, Search, Plus, X, ChevronDown, Check, CornerDownLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Listbox } from "@headlessui/react";

// Data dummy messages awal (status: sent, delivered, received)
const initialMessagesData = [
  {
    id: 1,
    applicantName: "Ahmad Rizki Pratama",
    applicantEmail: "ahmad.rizki@email.com",
    subject: "Konfirmasi Interview HC",
    message:
      "Selamat! Anda telah lolos ke tahap Interview HC. Silakan konfirmasi kehadiran Anda.",
    status: "sent",
    isIncoming: false, // Pesan keluar
    sentAt: "2024-01-15T10:30:00",
    avatar: "https://i.pravatar.cc/100?img=1",
  },
  {
    id: 2,
    applicantName: "Sari Indah Permata",
    applicantEmail: "sari.indah@email.com",
    subject: "Jadwal Psikotes",
    message: "Anda dijadwalkan untuk mengikuti psikotes pada tanggal 20 Januari 2024.",
    status: "delivered",
    isIncoming: false, // Pesan keluar
    sentAt: "2024-01-14T14:15:00",
    avatar: "https://i.pravatar.cc/100?img=2",
  },
];

// Data dummy pelamar untuk simulasi pencarian
const applicantsData = [
  {
    name: "Ahmad Rizki Pratama",
    email: "ahmad.rizki@email.com",
    avatar: "https://i.pravatar.cc/100?img=1",
  },
  {
    name: "Sari Indah Permata",
    email: "sari.indah@email.com",
    avatar: "https://i.pravatar.cc/100?img=2",
  },
  {
    name: "Budi Santoso",
    email: "budi.santoso@email.com",
    avatar: "https://i.pravatar.cc/100?img=3",
  },
];

function Messages() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipientEmail: "",
    recipientName: "",
    subject: "",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState(initialMessagesData);

  // REF untuk textarea agar bisa diukur tingginya (Auto-resize)
  const textareaRef = useRef(null);

  // Efek untuk auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      // Reset tinggi ke auto agar scrollHeight dihitung dengan benar
      textareaRef.current.style.height = 'auto'; 
      // Set tinggi baru berdasarkan scrollHeight
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; 
    }
  }, [newMessage.message, showComposeDialog]);


  const handleRecipientChange = (e) => {
    const email = e.target.value;
    const foundApplicant = applicantsData.find((app) => app.email === email);

    setNewMessage({
      ...newMessage,
      recipientEmail: email,
      recipientName: foundApplicant ? foundApplicant.name : "",
    });
  };

  const sendMessage = () => {
    if (isSending) return;
    setIsSending(true);

    if (!newMessage.recipientEmail || !newMessage.subject || !newMessage.message) {
      toast.error("Pesan gagal dikirim. Pastikan semua kolom terisi!");
      setIsSending(false);
      return;
    }

    const recipient = applicantsData.find(
      (app) => app.email === newMessage.recipientEmail
    );
    if (!recipient) {
      toast.error("Pesan gagal dikirim. Email penerima tidak ditemukan.");
      setIsSending(false);
      return;
    }

    setTimeout(() => {
      const newId =
        messages.length > 0 ? Math.max(...messages.map((m) => m.id)) + 1 : 1;

      // 1. Tambahkan pesan yang baru dikirim (SENT)
      const sentMessage = {
        id: newId,
        applicantName: recipient.name,
        applicantEmail: recipient.email,
        subject: newMessage.subject,
        message: newMessage.message,
        status: "sent",
        isIncoming: false, // Ditandai sebagai pesan keluar
        sentAt: new Date().toISOString(),
        avatar: recipient.avatar,
      };

      setMessages((prevMessages) => [sentMessage, ...prevMessages]);
      toast.success("Pesan berhasil dikirim!");
      
      // 2. SIMULASI PESAN BALASAN (INCOMING/RECEIVED)
      setTimeout(() => {
        const replyId = newId + 1;
        const replySubject = `RE: ${newMessage.subject}`;
        const replyMessage = `Terima kasih atas informasinya. Saya telah menerima pesan Anda mengenai ${newMessage.subject.toLowerCase()}.`;

        const receivedMessage = {
          id: replyId,
          applicantName: recipient.name,
          applicantEmail: recipient.email,
          subject: replySubject,
          message: replyMessage,
          status: "received",
          isIncoming: true, // Ditandai sebagai pesan masuk
          sentAt: new Date().toISOString(),
          avatar: recipient.avatar,
        };

        setMessages((prevMessages) => [receivedMessage, ...prevMessages]);
        toast.custom((t) => (
          <div className="bg-green-600 text-white p-3 rounded-lg shadow-xl flex items-center gap-3">
            <CornerDownLeft className="h-5 w-5" />
            Pesan Baru Masuk dari {recipient.name}!
            <button onClick={() => toast.dismiss(t.id)} className="ml-2">
                <X className="h-4 w-4" />
            </button>
          </div>
        ));
      }, 2000); // Pesan balasan datang 2 detik setelah pesan dikirim

      // Reset Form
      setShowComposeDialog(false);
      setNewMessage({
        recipientEmail: "",
        recipientName: "",
        subject: "",
        message: "",
      });
      setIsSending(false);
    }, 1000);
  };

  const filteredMessages = messages.filter((msg) => {
    const matchSearch =
      msg.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      statusFilter === "all" ? true : msg.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  };

  // Helper untuk menentukan warna status tag
  const getStatusClasses = (status) => {
    switch (status) {
      case 'sent':
        return 'bg-gray-200 text-gray-700';
      case 'delivered':
        return 'bg-blue-200 text-blue-700';
      case 'read':
        return 'bg-green-200 text-green-700';
      case 'received':
        return 'bg-purple-200 text-purple-700 font-bold'; // Warna baru untuk pesan masuk
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  // Helper untuk menampilkan teks status
  const getStatusText = (status) => {
    switch (status) {
      case 'sent': return 'Terkirim';
      case 'delivered': return 'Tersampaikan';
      case 'read': return 'Dibaca';
      case 'received': return 'Masuk';
      default: return 'Status';
    }
  };

  return (
    <div className="flex flex-col h-full p-6 bg-gray-50">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-sky-900 mb-3">
         Manajemen Pesan
        </h1>
        <button
          onClick={() => setShowComposeDialog(true)}
          // Tombol header diperbesar
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold transition shadow-lg shadow-gray-400/50 transform bg-gradient-to-tr from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600"
        >
          <Plus className="h-5 w-5" />
          Tulis Pesan Baru
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Cari pesan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            // Search Input: menggunakan border-gray-300 dan py-2
            className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* === Listbox Dropdown Status === */}
        <Listbox value={statusFilter} onChange={setStatusFilter}>
          {({ open }) => (
            <div className="relative w-44">
              <Listbox.Button 
                // Listbox Button: diselaraskan dengan input Search (border-gray-300 dan py-2)
                className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm text-left text-sm focus:outline-none focus:ring-1 focus:ring-sky-500">
                <span>
                  {statusFilter === "all"
                    ? "Status"
                    : statusFilter === "sent"
                    ? "Terkirim"
                    : "Pesan Masuk"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 ml-1 transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </Listbox.Button>

              <Listbox.Options className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-sm">
                {[
                  { value: "all", label: "Status" },
                  { value: "sent", label: "Terkirim" },
                  { value: "received", label: "Pesan Masuk" }, // Opsi filter "Masuk"
                ].map((option) => (
                  <Listbox.Option key={option.value} value={option.value}>
                    {({ active, selected }) => (
                      <div
                        className={`flex justify-between items-center px-3 py-2 cursor-pointer rounded-md ${
                          active ? "bg-sky-100 text-sky-700" : "text-gray-700"
                        }`}
                      >
                        <span>{option.label}</span>
                        {selected && <Check className="w-4 h-4 text-sky-600" />}
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          )}
        </Listbox>
      </div>

      {/* Messages List */}
      <div className="space-y-4 overflow-y-auto flex-1 pb-4">
        {filteredMessages.length > 0 ? (
          filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`border rounded-lg p-4 shadow-sm transition-all duration-300 
                ${msg.isIncoming ? 'border-purple-400 bg-purple-50' : 'border-gray-300 bg-white'}`}
            >
              <div className="flex items-start gap-4">
                <img
                  src={msg.avatar}
                  alt={msg.applicantName}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-lg">
                        {msg.applicantName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {msg.applicantEmail}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusClasses(msg.status)}`}
                      >
                        {getStatusText(msg.status)}
                      </span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatDateTime(msg.sentAt)}
                      </span>
                    </div>
                  </div>
                  <h5 className="font-semibold mb-1">{msg.subject}</h5>
                  <p className="text-sm text-gray-600">{msg.message}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <Send className="h-10 w-10 mb-2 text-gray-400" />
            <p>Tidak ada pesan yang ditemukan.</p>
          </div>
        )}
      </div>

      {/* Compose Dialog */}
      {showComposeDialog && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold">Tulis Pesan Baru</h2>
              <button onClick={() => setShowComposeDialog(false)}>
                <X className="h-5 w-5 text-gray-500 hover:text-gray-800" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Kirim pesan ke pelamar</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Email Penerima <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newMessage.recipientEmail}
                  onChange={handleRecipientChange}
                  placeholder="email@example.com"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                {newMessage.recipientName && (
                  <p className="text-sm text-gray-500 mt-1">{`Kepada: ${newMessage.recipientName}`}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">
                  Subjek <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newMessage.subject}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, subject: e.target.value })
                  }
                  placeholder="Subjek pesan"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Pesan <span className="text-red-500">*</span>
                </label>
                <textarea
                  // Pasang REF ke textarea
                  ref={textareaRef}
                  value={newMessage.message}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, message: e.target.value })
                  }
                  placeholder="Tulis pesan..."
                  // Kelas untuk Auto-Resize: resize-none dan overflow-hidden (untuk menghilangkan scroll)
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none overflow-hidden min-h-20"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowComposeDialog(false);
                    setIsSending(false);
                    setNewMessage({
                      recipientEmail: "",
                      recipientName: "",
                      subject: "",
                      message: "",
                    });
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 bg-white shadow-sm hover:bg-gray-100 transition focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                  disabled={isSending}
                >
                  Batal
                </button>
                <button
                  onClick={sendMessage}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-md transition shadow-lg shadow-gray-400/50 transform bg-gradient-to-tr from-sky-700 to-sky-600 hover:from-sky-800 hover:to-sky-600"
                  disabled={isSending}
                >
                  {isSending ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Mengirim...
                    </span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Kirim
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Messages;