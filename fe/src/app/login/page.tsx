"use client";

import { useForm } from "react-hook-form";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Card } from "../components/Card";
import Link from "next/link";
import { toast } from "react-toastify";

export default function LoginPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    const onSubmit = async (data: any) => {
        // Placeholder for actual login logic
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Login data:", data);
        toast.success("Logged in successfully! (Demo)");
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-pink-50 dark:from-slate-900 dark:to-slate-800">
            <div className="w-full max-w-md animate-fade-in">
                <Card className="shadow-xl">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">
                            Welcome Back
                        </h1>
                        <p className="text-slate-500 mt-2">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="you@example.com"
                            {...register("email", { required: "Email is required" })}
                            error={errors.email?.message as string}
                        />

                        <div className="space-y-1">
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                {...register("password", { required: "Password is required" })}
                                error={errors.password?.message as string}
                            />
                            <div className="flex justify-end">
                                <a href="#" className="text-xs text-indigo-600 hover:underline">Forgot password?</a>
                            </div>
                        </div>

                        <Button type="submit" isLoading={isSubmitting} className="w-full shadow-indigo-500/20" size="lg">
                            Sign In
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-indigo-600 font-semibold hover:underline">
                            Sign up
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}
