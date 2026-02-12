"use client"; // This tells Next.js this part runs in the browser

import { useState } from "react";
import { Upload, Copy, Check } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [listing, setListing] = useState("");
  const [copied, setCopied] = useState(false);

  // Handle Image Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  // Handle the "Generate" Button Click
  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    setListing("");

    const formData = new FormData();
    formData.append("image", file);
    formData.append(
      "prompt",
      `You are an expert Nigerian seller.
       Identify this item.
       Write a viral sales listing for Instagram/WhatsApp.
       Include:
       - 🧢 Catchy Title
       - 💰 Estimated Price Range (in Naira)
       - ✨ Key Features (bullet points)
       - 📞 Call to Action (DM for price/pickup)
       Tone: Urgent but friendly.`
    );

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.error) throw new Error(data.error);
      setListing(data.result);

    } catch (err) {
      alert("Omo, network issues. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Copy to Clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(listing);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden mt-10">

        {/* Header */}
        <div className="bg-blue-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">🛍️ Lazy Lister</h1>
          <p className="text-blue-100 text-sm">Snap it. List it. Sell it.</p>
        </div>

        <div className="p-6 space-y-6">

          {/* Upload Box */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Preview" className="h-40 mx-auto object-contain rounded-lg" />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <Upload size={40} className="mb-2" />
                <p className="text-sm">Tap to upload photo</p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !file}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex justify-center items-center"
          >
            {loading ? (
              <span className="animate-pulse">Thinking... 🤔</span>
            ) : (
              "Generate Listing 🚀"
            )}
          </button>

          {/* Results Area */}
          {listing && (
            <div className="bg-gray-100 rounded-xl p-4 border border-gray-200 animate-fade-in">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-gray-500 uppercase">Your Caption</h3>
                <button
                  onClick={copyToClipboard}
                  className="text-blue-600 hover:bg-blue-100 p-1 rounded"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
                {listing}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
