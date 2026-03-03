import React, { useState } from 'react';
import { ChevronRight, ArrowRight } from 'lucide-react';

export default function HeroSlider() {
    return (
        <section className="relative w-full h-[500px] bg-gray-900 overflow-hidden group">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 transform hover:scale-105"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2669&auto=format&fit=crop')" }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-900/40 to-transparent"></div>
            </div>

            {/* Content Content */}
            <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl text-white space-y-6 animate-fade-in-up">
                        <div className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider mb-2">
                            Destaque
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold leading-tight shadow-sm">
                            Pavimentação nos Bairros
                        </h2>
                        <p className="text-lg md:text-xl text-gray-200 leading-relaxed drop-shadow-md">
                            Mais segurança e qualidade de vida para os moradores. Novas frentes de obras estão transformando a infraestrutura da nossa cidade.
                        </p>
                        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:translate-x-1 shadow-lg hover:shadow-blue-500/50">
                            <span>Saiba Mais</span>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Slider Indicators */}
            <div className="absolute bottom-6 left-0 w-full flex justify-center space-x-2 z-10">
                <button className="w-3 h-3 rounded-full bg-white transition-all scale-110"></button>
                <button className="w-3 h-3 rounded-full bg-white/50 hover:bg-white transition-all"></button>
                <button className="w-3 h-3 rounded-full bg-white/50 hover:bg-white transition-all"></button>
            </div>
        </section>
    );
}
