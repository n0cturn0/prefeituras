<?php


namespace App\Http\Controllers;


use Inertia\Inertia;

class TransparenciaController extends Controller
{
    public function index()
    {
        return Inertia::render('Site/Transparencia/Index');
    }

    public function laiSolicitacao()
    {
        return Inertia::render('Site/Transparencia/LaiSolicitacao');
    }

    public function ouvidoria()
    {
        return Inertia::render('Site/Transparencia/Ouvidoria');
    }

    public function ouvidoriaRelatorios()
    {
        return Inertia::render('Site/Transparencia/OuvidoriaRelatorios');
    }

    public function radar()
    {
        return Inertia::render('Site/Transparencia/Radar');
    }

    public function contasPublicas()
    {
        return Inertia::render('Site/Transparencia/ContasPublicas');
    }

    public function receitas()
    {
        return Inertia::render('Site/Transparencia/Receitas');
    }

    public function rreo()
    {
        return Inertia::render('Site/Transparencia/RREO');
    }

    public function rgf()
    {
        return Inertia::render('Site/Transparencia/RGF');
    }

    public function pac()
    {
        return Inertia::render('Site/Transparencia/PAC');
    }

    public function folhaPagamento()
    {
        return Inertia::render('Site/Transparencia/FolhaPagamento');
    }

    public function servicos()
    {
        return Inertia::render('Site/Transparencia/Servicos');
    }

    public function cartaServicos()
    {
        return Inertia::render('Site/Transparencia/CartaServicos');
    }

    public function projetosProgramas()
    {
        return Inertia::render('Site/Transparencia/ProjetosProgramas');
    }

    public function contratos()
    {
        return Inertia::render('Site/Transparencia/Contratos');
    }

    public function parcerias()
    {
        return Inertia::render('Site/Transparencia/Parcerias');
    }

    public function convenios()
    {
        return Inertia::render('Site/Transparencia/Convenios');
    }

    public function diarioOficial()
    {
        return Inertia::render('Site/Transparencia/DiarioOficial');
    }

    public function leis()
    {
        return Inertia::render('Site/Transparencia/Leis');
    }

    public function lai()
    {
        return Inertia::render('Site/Transparencia/LAI');
    }
}
