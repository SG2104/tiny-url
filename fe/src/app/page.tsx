"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast, { Toaster } from "react-hot-toast";
import { useState } from "react";

const formSchema = z.object({
  originalUrl: z.string().min(1, "URL is required").url("Must be a valid URL"),
  expire_at: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function HomePage() {
  const [shortUrl, setShortUrl] = useState("");
  const [longUrl, setLongUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const expire_at = data.expire_at
      ? new Date(data.expire_at).toISOString()
      : undefined;

      const response = await fetch("http://localhost:8000/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl: data.originalUrl,
          expire_at,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setShortUrl(result.url);
        setLongUrl(data.originalUrl);
        setSubmitted(true);
        toast.success("Short URL created!");
      } else {
        toast.error(result.error || "Failed to shorten URL");
      }
    } catch (error) {
      toast.error("Network error");
      console.error(error);
    }
  };

  const handleReset = () => {
    reset();
    setShortUrl("");
    setLongUrl("");
    setSubmitted(false);
  };

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(shortUrl);
      toast.success("Copied to clipboard!");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold mb-6">URL Shortener</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 w-full max-w-md"
      >
        {!submitted ? (
          <>
            <label className="text-md">Original URL</label>
            <input
              type="text"
              placeholder="Enter original URL"
              {...register("originalUrl")}
              className="border px-4 py-2 rounded"
            />
            {errors.originalUrl && (
              <p className="text-red-500 text-sm">
                {errors.originalUrl.message}
              </p>
            )}

            <label className="text-md">Expiry Date (Optional)</label>
            <input
              type="datetime-local"
              {...register("expire_at")}
              className="border px-4 py-2 rounded"
            />
            {errors.expire_at && (
              <p className="text-red-500 text-sm">{errors.expire_at.message}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Shorten URL"}
            </button>
          </>
        ) : (
          <>
            <label className="text-md">Original URL</label>
            <input
              type="text"
              value={longUrl}
              readOnly
              className="border px-4 py-2 rounded"
            />

            <label className="text-md">Shortened URL</label>
            <input
              type="text"
              value={shortUrl}
              readOnly
              className="border px-4 py-2 rounded"
            />
            <div className="flex justify-center">
              <button
              className="bg-gray-600 text-white py-2 px-4 mr-10 rounded hover:bg-gray-700"
              onClick={() => window.open(shortUrl, "_blank")}
            >
              Click to Visit
            </button>
              <button
              type="button"
              onClick={handleCopy}
              className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
            >
              Copy Short URL
            </button>
            </div>
            
            <button
              type="button"
              onClick={handleReset}
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Shorten Another
            </button>
          
          </>

        )}
      </form>
    </main>
  );
}