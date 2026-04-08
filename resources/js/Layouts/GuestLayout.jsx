import React from 'react';
import { Building2 } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function Guest({ children }) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-slate-50">
            <div>
                <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight text-slate-800">
                    <Building2 className="h-8 w-8 text-blue-600" />
                    <span>Prefeituras</span>
                </Link>
            </div>

            <div className="w-full sm:max-w-md mt-6 px-6 py-8 bg-white shadow-lg shadow-slate-200/50 overflow-hidden sm:rounded-xl border border-slate-100">
                {children}
            </div>
        </div>
    );
}
