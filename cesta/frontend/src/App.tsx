import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ProductRegistration } from "./components/products/ProductRegistration";
import { ConsultaProdutosGov } from "./components/products/ConsultaProdutosGov";
import { ConsultaServicosGov } from "./components/products/ConsultaServicosGov";
import { PesquisaPrecosView } from "./components/prices/PesquisaPrecosView";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<Navigate to="/produtos" replace />} />
          <Route path="/produtos" element={<ProductRegistration />} />
          <Route path="/consulta-gov" element={<ConsultaProdutosGov />} />
          <Route path="/modulo-servico" element={<ConsultaServicosGov />} />
          <Route path="/pesquisa-precos" element={<PesquisaPrecosView />} />
          <Route path="/execucao/contratos" element={<Navigate to="/pesquisa-precos" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
