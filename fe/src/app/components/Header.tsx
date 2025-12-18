"use client";

import Link from "next/link";
import { Button } from "./Button";

import { useAuth } from "@/context/AuthContext";

export function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">
                            TinyURL
                        </span>
                    </Link>

                    {/* Navigation / Auth */}
                    <nav className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    Hi, {user.name || user.email.split('@')[0]}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => logout()}
                                >
                                    Sign Out
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                                        Log in
                                    </Button>
                                </Link>
                                <Link href="/signup">
                                    <Button variant="primary" size="sm">
                                        Sign up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
