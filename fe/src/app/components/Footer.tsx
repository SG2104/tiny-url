export function Footer() {
    return (
        <footer className="bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-gray-800 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    &copy; {new Date().getFullYear()} TinyURL. All rights reserved.
                </p>
                <div className="flex gap-6">
                    <a href="#" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                        Terms
                    </a>
                    <a href="#" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                        Privacy
                    </a>
                    <a href="#" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                        Contact
                    </a>
                </div>
            </div>
        </footer>
    );
}
