import React from 'react';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ 
    children, 
    departmentsMenu, 
    publicacoesMenu, 
    municipioMenu, 
    informativosMenu, 
    transparenciaMenu, 
    contatosMenu,
    mainClassName = "",
    containerClassName = "bg-white"
}) {
    return (
        <div className={`min-h-screen font-sans text-gray-900 flex flex-col ${containerClassName}`}>
            <Header
                departmentsMenu={departmentsMenu}
                publicacoesMenu={publicacoesMenu}
                municipioMenu={municipioMenu}
                informativosMenu={informativosMenu}
                transparenciaMenu={transparenciaMenu}
                contatosMenu={contatosMenu}
            />

            <main className={`flex-grow ${mainClassName}`}>
                {children}
            </main>

            <Footer />
        </div>
    );
}
