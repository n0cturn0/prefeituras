import React from 'react';
import Layout from '@/Components/Site/Layout';
import HeroSlider from '../../Components/Site/HeroSlider';
import NewsSection from '../../Components/Site/NewsSection';
import ServicesBar from '../../Components/Site/ServicesBar';
import MultimediaSection from '../../Components/Site/MultimediaSection';
import InfoSection from '../../Components/Site/InfoSection';
import { Head } from '@inertiajs/react';

export default function Home(props) {
    return (
        <Layout {...props}>
            <Head title="Prefeitura Municipal - Início" />

            <HeroSlider />
            <NewsSection />
            <ServicesBar />
            <MultimediaSection />
            <InfoSection />
        </Layout>
    );
}
