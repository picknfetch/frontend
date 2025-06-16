// PicknFetch - Selective ZIP File Downloader (Frontend)
// Tech Stack: React (frontend), Flask (backend), Vercel + Render.com (for free hosting)

import React, { useState } from "react";
import axios from "axios";

function App() {
  const [url, setUrl] = useState("");
  const [cookies, setCookies] = useState("");
  const [impersonate, setImpersonate] = useState(false);
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState([]);
  const [status, setStatus] = useState("");
  const [downloading, setDownloading] = useState(false);

  const loadContents = async () => {
    setStatus("Loading ZIP contents...");
    try {
      const res = await axios.post("https://website-brzq.onrender.com/api/inspect", {
        url,
        cookies,
        userAgent: impersonate
          ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91 Safari/537.36"
          : ""
      });
      setFiles(res.data.files);
      setStatus("ZIP contents loaded.");
    } catch (err) {
      setStatus("Error: " + (err.response?.data?.error || err.message));
    }
  };

  const downloadFiles = async () => {
    if (selected.length === 0) return alert("Please select files to download.");
    setStatus("Preparing download...");
    setDownloading(true);

    try {
      for (const i of selected) {
        const file = files[i];
        const response = await axios.post(
          "https://website-brzq.onrender.com/api/download",
          {
            url,
            filename: file.filename,
            offset: file.local_header_offset,
            comp_size: file.compressed_size,
            compression: file.compression,
            cookies,
            userAgent: impersonate
              ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91 Safari/537.36"
              : ""
          },
          { responseType: "blob" }
        );

        const blob = new Blob([response.data]);
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = file.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setStatus("Download complete.");
    } catch (err) {
      setStatus("Download failed: " + (err.response?.data?.error || err.message));
    }

    setDownloading(false);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">PicknFetch</h1>

      <input
        type="text"
        className="border w-full p-2 mb-2"
        placeholder="ZIP file URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <input
        type="text"
        className="border w-full p-2 mb-2"
        placeholder="Cookies (optional)"
        value={cookies}
        onChange={(e) => setCookies(e.target.value)}
      />
      <label className="mb-2 block">
        <input
          type="checkbox"
          checked={impersonate}
          onChange={(e) => setImpersonate(e.target.checked)}
        /> Impersonate Browser (User-Agent)
      </label>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        onClick={loadContents}
      >
        Load ZIP Contents
      </button>

      {files.length > 0 && (
        <>
          <div className="mt-4">
            <h2 className="text-lg font-semibold">Files</h2>
            <ul className="border p-2 max-h-64 overflow-y-auto">
              {files.map((f, i) => (
                <li key={i}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selected.includes(i)}
                      onChange={(e) => {
                        setSelected((prev) =>
                          e.target.checked ? [...prev, i] : prev.filter((x) => x !== i)
                        );
                      }}
                    /> {f.filename} ({f.size || f.compressed_size})
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <button
            className="bg-green-600 text-white px-4 py-2 mt-2 rounded"
            disabled={downloading}
            onClick={downloadFiles}
          >
            {downloading ? "Downloading..." : "Download Selected"}
          </button>
        </>
      )}

      <p className="mt-4 text-sm text-gray-700">{status}</p>
    </div>
  );
}

export default App;
