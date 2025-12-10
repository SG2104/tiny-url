"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast, ToastContainer } from "react-toastify";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formSchema } from "./lib/formSchema";
import { z } from "zod";
import { urlService } from "../lib/api";

type FormData = z.infer<typeof formSchema>;

export default function HomePage() {
  const [shortUrl, setShortUrl] = useState("");
  const [longUrl, setLongUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      originalUrl: "",
      expire_at: null,
    },
  });


  const onSubmit = async (data: FormData) => {
    try {
      let expire_at = undefined;

      if (data.expire_at) {
        const expiryDate = new Date(data.expire_at);
        const now = new Date();

        // Calculate the difference in days
        const timeDiff = expiryDate.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        // Set expiry to exactly that many hours from now
        const hoursFromNow = daysDiff * 24;
        const utcDate = new Date(now.getTime() + (hoursFromNow * 60 * 60 * 1000));
        expire_at = utcDate.toISOString();
      }

      const result = await urlService.createUrl({
        originalUrl: data.originalUrl,
        expire_at,
      });

      setShortUrl(result.url);
      setLongUrl(data.originalUrl);
      setSubmitted(true);
      toast.success("Short URL created!");
    } catch (error: any) {
      console.error("Error creating short URL:", error);
      toast.error(error.message || "Something went wrong");
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
    <main className="min-h-screen p-4 relative">
      <ToastContainer position="top-right" />

      <nav className="absolute top-6 right-6">
        <a href="/dashboard" className="text-blue-600 hover:underline font-medium text-lg">
          View Dashboard &rarr;
        </a>
      </nav>

      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-6">URL Shortener</h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 w-full max-w-md"
        >
          {!submitted ? (
            <>
              <div>
                <label className="text-md block mb-2">Original URL</label>
                <input
                  type="text"
                  placeholder="Enter original URL"
                  defaultValue=""
                  {...register("originalUrl")}
                  className="border px-4 py-2 rounded w-full"
                />
                {errors.originalUrl && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.originalUrl.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-md block mb-2">Expiry Date (Optional)</label>
                <Controller
                  name="expire_at"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value}
                      onChange={(date) => field.onChange(date)}
                      minDate={new Date()}
                      maxDate={new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000)}
                      placeholderText="Select expiry date (MM/DD/YYYY)"
                      className="border px-4 py-2 rounded w-full"
                      dateFormat="MM/dd/yyyy"
                      isClearable
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                      wrapperClassName="w-full"
                    />
                  )}
                />
                {errors.expire_at && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.expire_at.message}
                  </p>
                )}
              </div>

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
                defaultValue={longUrl}
                readOnly
                className="border px-4 py-2 rounded"
              />

              <label className="text-md">Shortened URL</label>
              <input
                type="text"
                defaultValue={shortUrl}
                readOnly
                className="border px-4 py-2 rounded"
              />
              <div className="flex justify-center">
                <button
                  type="button"
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
      </div>
    </main>
  );
}