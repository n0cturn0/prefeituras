import React from 'react';
import Header from '../../Components/Site/Header';
import HeroSlider from '../../Components/Site/HeroSlider';
import NewsSection from '../../Components/Site/NewsSection';
import ServicesBar from '../../Components/Site/ServicesBar';
import MultimediaSection from '../../Components/Site/MultimediaSection';
import InfoSection from '../../Components/Site/InfoSection';
import Footer from '../../Components/Site/Footer';
import { Head } from '@inertiajs/react';

export default function Home({ departmentsMenu, publicacoesMenu, municipioMenu, informativosMenu, transparenciaMenu, contatosMenu }) {
    return (
        <div className="min-h-screen font-sans text-gray-900 bg-white">
            <Head title="Prefeitura Municipal - Início" />

            <Header
                departmentsMenu={departmentsMenu}
                publicacoesMenu={publicacoesMenu}
                municipioMenu={municipioMenu}
                informativosMenu={informativosMenu}
                transparenciaMenu={transparenciaMenu}
                contatosMenu={contatosMenu}
            />

            <main>
                <HeroSlider />
                <NewsSection />
                <ServicesBar />
                <MultimediaSection />
                <InfoSection />
            </main>

            <Footer />
        </div>
    );
}
