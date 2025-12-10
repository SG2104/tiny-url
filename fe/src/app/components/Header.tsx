"use client";

import Link from "next/link";
import { Button } from "./Button";

export function Header() {
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
                    </nav>
                </div>
            </div>
        </header>
    );
}
