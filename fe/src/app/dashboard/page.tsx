"use client";

import { useEffect, useState } from "react";
import { urlService } from "../../lib/api";
import Link from "next/link";
import { Card } from "../components/Card";
import { Button } from "../components/Button";

interface UrlData {
    id: string;
    url: string;
    code: string;
    created_at: string;
    expires_at: string | null;
}

interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function DashboardPage() {
    const [urls, setUrls] = useState<UrlData[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const fetchUrls = async (pageNum: number) => {
        setLoading(true);
        try {
            const result = await urlService.getAllUrls(pageNum);
            setUrls(result.data);
            setPagination(result.pagination);
        } catch (error) {
            console.error("Failed to fetch URLs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUrls(page);
    }, [page]);

    const handleNext = () => {
        if (pagination && page < pagination.totalPages) {
            setPage(page + 1);
        }
    };

    const handlePrev = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    return (
        <main className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-x-hidden">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 animate-fade-in py-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">
                            Recent Links
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Manage your history
                        </p>
                    </div>
                    <Link href="/">
                        <Button className="mt-4 md:mt-0 shadow-lg shadow-indigo-500/20">
                            + Create New URL
                        </Button>
                    </Link>
                </div>

                <div className="animate-fade-in animate-delay-100">
                    <Card className="!p-0 overflow-hidden border-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="p-5 font-semibold text-slate-600 dark:text-slate-300 text-sm uppercase tracking-wider">Original URL</th>
                                        <th className="p-5 font-semibold text-slate-600 dark:text-slate-300 text-sm uppercase tracking-wider">Short Code</th>
                                        <th className="p-5 font-semibold text-slate-600 dark:text-slate-300 text-sm uppercase tracking-wider">Short URL</th>
                                        <th className="p-5 font-semibold text-slate-600 dark:text-slate-300 text-sm uppercase tracking-wider">Created</th>
                                        <th className="p-5 font-semibold text-slate-600 dark:text-slate-300 text-sm uppercase tracking-wider">Expires</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {loading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={5} className="p-5">
                                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : urls.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center text-slate-500 dark:text-slate-400">
                                                <div className="flex flex-col items-center gap-3">
                                                    <span className="text-4xl">📭</span>
                                                    <p>No URLs found yet.</p>
                                                    <Link href="/">
                                                        <Button variant="ghost" size="sm" className="mt-2">Create your first one</Button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        urls.map((url) => (
                                            <tr key={url.id} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors duration-150 group">
                                                <td className="p-5 max-w-xs truncate text-slate-700 dark:text-slate-300">
                                                    <a href={url.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors" title={url.url}>
                                                        {url.url}
                                                    </a>
                                                </td>
                                                <td className="p-5 font-mono text-sm text-slate-500 dark:text-slate-400">
                                                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                        {url.code}
                                                    </span>
                                                </td>
                                                <td className="p-5">
                                                    <a
                                                        href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000'}/${url.code}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
                                                    >
                                                        /{url.code}
                                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">↗</span>
                                                    </a>
                                                </td>
                                                <td className="p-5 text-sm text-slate-500 dark:text-slate-400">
                                                    {formatDate(url.created_at)}
                                                </td>
                                                <td className="p-5 text-sm">
                                                    {url.expires_at ? (
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${new Date(url.expires_at) < new Date() ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-green-100 text-green-600 dark:bg-green-900/30'}`}>
                                                            {formatDate(url.expires_at)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 italic">Never</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {!loading && pagination && (
                            <div className="flex justify-between items-center p-4 border-t border-gray-100 dark:border-gray-700/50 bg-slate-50/50 dark:bg-white/5">
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    Page <span className="font-medium text-slate-900 dark:text-white">{pagination.page}</span> of {pagination.totalPages}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={handlePrev}
                                        disabled={page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={handleNext}
                                        disabled={page >= pagination.totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </main>
    );
}
