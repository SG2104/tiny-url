"use client";

import { useForm } from "react-hook-form";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Card } from "../components/Card";
import Link from "next/link";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    const onSubmit = async (data: any) => {
        try {
            const res = await fetch("http://localhost:8000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // IMPORTANT: so cookie is stored
                body: JSON.stringify(data),
            });

            // Try to parse JSON, but don't crash if empty
            let json: any = null;
            try {
                json = await res.json();
            } catch {
                json = null;
            }

            // Helpful for debugging
            console.log("Signup response:", res.status, json);

            if (res.status === 409) {
                toast.error("Email already in use. Try logging in instead.");
                return;
            }

            if (!res.ok) {
                toast.error(json?.message || "Signup failed");
                return;
            }

            toast.success("Account created successfully!");

            // 🔁 Redirect after success (choose what you want)
            // Option A: Go to login page
            router.push("/login");

            // Option B (later): Go to homepage or dashboard
            // router.push("/");
        } catch (err) {
            console.error("Signup error:", err);
            toast.error("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-pink-50 dark:from-slate-900 dark:to-slate-800">
            <div className="w-full max-w-md animate-fade-in">
                <Card className="shadow-xl">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">
                            Create Account
                        </h1>
                        <p className="text-slate-500 mt-2">Start shortening links today</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            {...register("name", { required: "Name is required" })}
                            error={errors.name?.message as string}
                        />

                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="you@example.com"
                            {...register("email", { required: "Email is required" })}
                            error={errors.email?.message as string}
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="Create a password"
                            {...register("password", {
                                required: "Password is required",
                                minLength: { value: 6, message: "Min 6 chars" },
                            })}
                            error={errors.password?.message as string}
                        />

                        <Button type="submit" isLoading={isSubmitting} className="w-full shadow-indigo-500/20" size="lg">
                            Sign Up Free
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        Already have an account?{" "}
                        <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
                            Log in
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}
