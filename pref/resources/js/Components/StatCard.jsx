import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({ title, value, difference, trend = 'neutral', icon: Icon }) {
    const trendColor = {
        up: 'text-emerald-500',
        down: 'text-red-500',
        neutral: 'text-slate-500',
    }[trend];

    return (
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-100 p-6 flex items-start justify-between transition-all hover:shadow-md">
            <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900">{value}</span>
                </div>
                {difference && (
                    <div className={`mt-2 flex items-center text-sm ${trendColor}`}>
                        {trend === 'up' && <ArrowUpRight className="mr-1 h-4 w-4" />}
                        {trend === 'down' && <ArrowDownRight className="mr-1 h-4 w-4" />}
                        <span className="font-medium">{difference}</span>
                        <span className="ml-1 text-slate-400">vs mês anterior</span>
                    </div>
                )}
            </div>
            {Icon && (
                <div className="p-3 bg-blue-50 rounded-lg">
                    <Icon className="h-6 w-6 text-blue-600" />
                </div>
            )}
        </div>
    );
}
