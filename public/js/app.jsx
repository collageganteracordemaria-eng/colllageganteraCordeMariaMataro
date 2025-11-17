import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group"; // Importamos para animaciones
import { ClipLoader } from "react-spinners"; // Importamos el spinner

// Definir los componentes para cada ruta con lazy loading
const Inicio = lazy(() => import('./Inicio'));
const Cercaviles = lazy(() => import('./Cercaviles'));
const FestaTardor = lazy(() => import('./FestaTardor'));
const Carnaval = lazy(() => import('./Carnaval'));
const Equip = lazy(() => import('./Equip'));
const Anuncis = lazy(() => import('./Anuncis'));
const Productes = lazy(() => import('./Productes'));
const Uneixte = lazy(() => import('./Uneixte'));
const Chat = lazy(() => import('./Chat'));
const Contacte = lazy(() => import('./Contacte'));

const App = () => {
  return (
    <BrowserRouter>
      <nav className="navbar navbar-expand-lg navbar-light fixed-top">
        <div className="container">
          <a className="navbar-brand" href="https://www.cordemariamataro.cat/">
            <img src="images/logo_corazon_de_maria.png" alt="Logo Cor de Maria" style={{ height: "60px" }} />
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><Link className="nav-link text-danger" to="/">Inici</Link></li>
              <li className="nav-item"><Link className="nav-link text-danger" to="/cercaviles">Cercaviles</Link></li>
              <li className="nav-item"><Link className="nav-link text-danger" to="/festatar">Festa de Tardor</Link></li>
              <li className="nav-item"><Link className="nav-link text-danger" to="/carnaval">Rua Carnaval</Link></li>
              <li className="nav-item dropdown">
                <Link className="nav-link dropdown-toggle text-danger" to="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">Colla</Link>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item text-danger" to="/equip">Músics i portadors</Link></li>
                  <li><Link className="dropdown-item text-danger" to="/anuncis">Anuncis</Link></li>
                  <li><Link className="dropdown-item text-danger" to="/productes">Productes</Link></li>
                  <li><Link className="dropdown-item text-danger" to="/uneixte">T'hi vols unir?</Link></li>
                  <li><Link className="dropdown-item text-danger" to="/chat">Chat i comentaris</Link></li>
                </ul>
              </li>
              <li className="nav-item"><Link className="nav-link text-danger" to="/contacte">Contacte</Link></li>
            </ul>
          </div>
        </div>
      </nav>

      <Suspense
        fallback={
          <div className="loader-container">
            <ClipLoader size={50} color={"#FF5733"} />
          </div>
        }
      >
        <TransitionGroup>
          <CSSTransition timeout={300} classNames="fade" unmountOnExit>
            <Routes>
              <Route path="/" element={<Inicio />} />
              <Route path="/cercaviles" element={<Cercaviles />} />
              <Route path="/festatar" element={<FestaTardor />} />
              <Route path="/carnaval" element={<Carnaval />} />
              <Route path="/equip" element={<Equip />} />
              <Route path="/anuncis" element={<Anuncis />} />
              <Route path="/productes" element={<Productes />} />
              <Route path="/uneixte" element={<Uneixte />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/contacte" element={<Contacte />} />
            </Routes>
          </CSSTransition>
        </TransitionGroup>
      </Suspense>
    </BrowserRouter>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
