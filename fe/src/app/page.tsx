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
import Link from "next/link";
import { Button } from "./components/Button";
import { Input } from "./components/Input";
import { Card } from "./components/Card";
import { useAuth } from "@/context/AuthContext";

type FormData = z.infer<typeof formSchema>;

export default function HomePage() {
  const [shortUrl, setShortUrl] = useState("");
  const [longUrl, setLongUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();

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

        const timeDiff = expiryDate.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

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
    <main className="min-h-screen relative overflow-x-hidden bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <ToastContainer position="top-right" theme="colored" />

      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-400/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen filter opacity-70 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-purple-400/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen filter opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 flex flex-col justify-center min-h-screen">

        {/* Main Content Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20 animate-fade-in">

          {/* Left Column: Marketing Text */}
          <div className="text-left space-y-6">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">
              URL Shortener, <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">
                Branded Short Links
              </span> & Analytics
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed">
              Welcome to the original link shortener — simplifying the Internet through the power of the URL.
            </p>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-lg">
              Track link analytics, and enjoy other powerful features.
            </p>
          </div>

          {/* Right Column: Shorten Form */}
          <div className="w-full max-w-lg mx-auto lg:ml-auto animate-fade-in animate-delay-100">
            <Card className="shadow-2xl shadow-indigo-500/10 !p-6 md:!p-8 bg-white/80 dark:bg-black/40">
              <div className="mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-4">
                <span className="text-indigo-600 font-bold text-lg">🔗 Shorten a Link</span>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                {!submitted ? (
                  <>
                    <Input
                      label="Long URL *"
                      placeholder="Paste your long link here..."
                      {...register("originalUrl")}
                      error={errors.originalUrl?.message}
                      className="placeholder:text-gray-400"
                    />

                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-[var(--foreground)] opacity-80">
                        Expiry Date (Optional)
                      </label>
                      <Controller
                        name="expire_at"
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            selected={field.value}
                            onChange={(date) => field.onChange(date)}
                            minDate={new Date()}
                            maxDate={new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000)}
                            placeholderText="Select expiry date"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-base"
                            wrapperClassName="w-full"
                            isClearable
                            dateFormat="MMM d, yyyy"
                          />
                        )}
                      />
                      {errors.expire_at && (
                        <p className="mt-1 text-sm text-red-500">{errors.expire_at.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      isLoading={isSubmitting}
                      size="lg"
                      className="w-full mt-2 font-bold text-lg shadow-indigo-500/30"
                    >
                      Shorten Link
                    </Button>
                    <p className="text-xs text-slate-400 mt-2 text-center">
                      By clicking Shorten Link, you agree to our Terms of Service.
                    </p>
                  </>
                ) : (
                  <div className="animate-fade-in">
                    <div className="mb-4">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Long URL</label>
                      <p className="text-sm text-slate-700 dark:text-slate-300 truncate font-mono bg-slate-100 dark:bg-white/5 p-2 rounded">
                        {longUrl}
                      </p>
                    </div>

                    <div className="mb-6">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">Your Short Link</label>
                      <div className="flex items-center gap-2">
                        <Input
                          readOnly
                          value={shortUrl}
                          className="text-indigo-600 font-bold !bg-indigo-50 dark:!bg-indigo-900/20 !border-indigo-200 !text-lg"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          onClick={() => window.open(shortUrl, "_blank")}
                          className="flex-1"
                        >
                          Visit URL
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleCopy}
                          className="flex-1"
                        >
                          Copy
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleReset}
                        className="w-full text-sm"
                      >
                        Shorten Another Link
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </Card>
          </div>
        </div>

        {/* Recent Links Call to Action */}
        {user && (
          <section className="w-full max-w-lg mx-auto text-center animate-fade-in animate-delay-200">
            <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">
              Review Your History
            </h2>
            <Link href="/dashboard">
              <Button variant="secondary" size="lg" className="shadow-lg shadow-gray-200/50 dark:shadow-none w-full sm:w-auto">
                View Your Recent Links &rarr;
              </Button>
            </Link>
          </section>
        )}

      </div>
    </main>
  );
}