"use client";

import { useEffect, useState } from "react";
import { urlService } from "../../lib/api";
import Link from "next/link";

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

    return (
        <main className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">URL Dashboard</h1>
                    <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                        Create New URL
                    </Link>
                </div>

                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-600">Original URL</th>
                                    <th className="p-4 font-semibold text-gray-600">Short Code</th>
                                    <th className="p-4 font-semibold text-gray-600">Short URL</th>
                                    <th className="p-4 font-semibold text-gray-600">Created At</th>
                                    <th className="p-4 font-semibold text-gray-600">Expires At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : urls.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">
                                            No URLs found.
                                        </td>
                                    </tr>
                                ) : (
                                    urls.map((url) => (
                                        <tr key={url.id} className="border-b hover:bg-gray-50 transition">
                                            <td className="p-4 max-w-xs truncate" title={url.url}>
                                                <a href={url.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    {url.url}
                                                </a>
                                            </td>
                                            <td className="p-4 font-mono text-sm text-gray-800">{url.code}</td>
                                            <td className="p-4">
                                                <a
                                                    href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000'}/${url.code}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-green-600 hover:underline font-medium"
                                                >
                                                    /{url.code}
                                                </a>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">
                                                {new Date(url.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">
                                                {url.expires_at ? new Date(url.expires_at).toLocaleDateString() : "Never"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {!loading && pagination && (
                        <div className="flex justify-between items-center p-4 border-t bg-gray-50">
                            <span className="text-sm text-gray-600">
                                Page {pagination.page} of {pagination.totalPages} (Total: {pagination.total})
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrev}
                                    disabled={page === 1}
                                    className="px-4 py-2 bg-white border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={page >= pagination.totalPages}
                                    className="px-4 py-2 bg-white border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
