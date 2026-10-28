import { useState } from "react";

function App() {
  const [page, setPage] = useState("home");

  /* =========================
     UMUHINZI DASHBOARD
  ========================= */

  if (page === "farmer") {
    return (
      <div className="dashboard">

        <div className="role-header">
          <div className="big-role-icon">🌾</div>

          <h1>UMUHINZI</h1>

          <h2>UBUHINZI</h2>

          <p>Dashboard y'umuhinzi</p>
        </div>

        <div className="cards">

          <div className="card">
            <h2>➕ SHYIRAHO UMUSARURO</h2>
            <p>
              Shyiraho umusaruro ufite kugira ngo
              abaguzi bawubone.
            </p>
            <button>SHYIRAHO UMUSARURO</button>
          </div>

          <div className="card">
            <h2>📦 UMUSARURO WANJYE</h2>
            <p>
              Reba umusaruro washyize kuri system
              n'uko uhagaze.
            </p>
            <button>REBA UMUSARURO</button>
          </div>

          <div className="card">
            <h2>🛒 COMMANDE</h2>
            <p>
              Reba commande zatanzwe ku musaruro wawe.
            </p>
            <button>REBA COMMANDE</button>
          </div>

          <div className="card">
            <h2>🚚 DELIVERY</h2>
            <p>
              Kurikirana uko umusaruro ugezwaho umuguzi.
            </p>
            <button>KURIKIRANA DELIVERY</button>
          </div>

        </div>

        <button
          className="back"
          onClick={() => setPage("home")}
        >
          ← SUBIRA AHABANZA
        </button>

      </div>
    );
  }

  /* =========================
     UMWOROZI DASHBOARD
  ========================= */

  if (page === "livestock") {
    return (
      <div className="dashboard">

        <div className="role-header">
          <div className="big-role-icon">🐄</div>

          <h1>UMWOROZI</h1>

          <h2>UBWOROZI</h2>

          <p>Dashboard y'umworozi</p>
        </div>

        <div className="cards">

          <div className="card">
            <h2>➕ SHYIRAHO UMUSARURO</h2>
            <p>
              Shyiraho amatungo cyangwa umusaruro
              w'ubworozi ufite.
            </p>
            <button>SHYIRAHO UMUSARURO</button>
          </div>

          <div className="card">
            <h2>📦 UMUSARURO WANJYE</h2>
            <p>
              Reba amatungo n'umusaruro w'ubworozi
              washyize kuri system.
            </p>
            <button>REBA UMUSARURO</button>
          </div>

          <div className="card">
            <h2>🛒 COMMANDE</h2>
            <p>
              Reba commande zatanzwe ku musaruro wawe.
            </p>
            <button>REBA COMMANDE</button>
          </div>

          <div className="card">
            <h2>🚚 DELIVERY</h2>
            <p>
              Kurikirana itangwa ry'umusaruro.
            </p>
            <button>KURIKIRANA DELIVERY</button>
          </div>

        </div>

        <button
          className="back"
          onClick={() => setPage("home")}
        >
          ← SUBIRA AHABANZA
        </button>

      </div>
    );
  }

  /* =========================
     UMUHUZA DASHBOARD
  ========================= */

  if (page === "agent") {
    return (
      <div className="dashboard">

        <div className="role-header">
          <div className="big-role-icon">🤝</div>

          <h1>UMUHUZA</h1>

          <h2>UMUHUZA</h2>

          <p>Dashboard y'umuhuza</p>
        </div>

        <div className="cards">

          <div className="card">
            <h2>🔎 UMUSARURO UTARAGENZURWA</h2>
            <p>
              Reba umusaruro utegereje kugenzurwa
              no kwemezwa.
            </p>
            <button>AGENZURE</button>
          </div>

          <div className="card">
            <h2>✅ UMUSARURO WEMEJWE</h2>
            <p>
              Reba umusaruro wemejwe ushobora
              kubonwa n'abaguzi.
            </p>
            <button>REBA WEMEJWE</button>
          </div>

          <div className="card">
            <h2>🛒 COMMANDE</h2>
            <p>
              Reba kandi wemeze commande z'abaguzi.
            </p>
            <button>REBA COMMANDE</button>
          </div>

          <div className="card">
            <h2>🚚 DELIVERY</h2>
            <p>
              Kurikirana itangwa ry'umusaruro ku muguzi.
            </p>
            <button>REBA DELIVERY</button>
          </div>

        </div>

        <button
          className="back"
          onClick={() => setPage("home")}
        >
          ← SUBIRA AHABANZA
        </button>

      </div>
    );
  }

  /* =========================
     UMUGUZI DASHBOARD
  ========================= */

  if (page === "buyer") {
    return (
      <div className="dashboard">

        <div className="role-header">
          <div className="big-role-icon">🛒</div>

          <h1>UMUGUZI</h1>

          <h2>ABAGUZI</h2>

          <p>Dashboard y'umuguzi</p>
        </div>

        <div className="cards">

          <div className="card">
            <h2>🔎 SHAKISHA UMUSARURO</h2>
            <p>
              Shakisha umusaruro wemejwe n'umuhuza.
            </p>
            <button>SHAKISHA</button>
          </div>

          <div className="card">
            <h2>🛒 TANGA COMMANDE</h2>
            <p>
              Hitamo umusaruro ushaka utange commande.
            </p>
            <button>TANGA COMMANDE</button>
          </div>

          <div className="card">
            <h2>📋 COMMANDE ZANJYE</h2>
            <p>
              Reba commande watanze n'uko zihagaze.
            </p>
            <button>REBA COMMANDE</button>
          </div>

          <div className="card">
            <h2>🚚 DELIVERY</h2>
            <p>
              Kurikirana uko umusaruro uri kugera aho wifuza.
            </p>
            <button>KURIKIRANA</button>
          </div>

        </div>

        <button
          className="back"
          onClick={() => setPage("home")}
        >
          ← SUBIRA AHABANZA
        </button>

      </div>
    );
  }

  /* =========================
     HOME PAGE
  ========================= */

  return (
    <div className="home">

      <div className="brand">
        <h1>GURISHA UMUSARURO WAWE</h1>
        <p>UBUHINZI N'UBWOROZI</p>
      </div>

      <div className="hero">

        <h2>Menya umusaruro uhari</h2>

        <p className="description">
          Huza umuhinzi cyangwa umworozi n'umuguzi,
          umuhuza agenzure umusaruro mbere ya commande.
        </p>

      </div>

      <div className="roles">

        <button
          className="farmer"
          onClick={() => setPage("farmer")}
        >
          <span className="role-icon">🌾</span>
          <span>UMUHINZI</span>
        </button>

        <button
          className="livestock"
          onClick={() => setPage("livestock")}
        >
          <span className="role-icon">🐄</span>
          <span>UMWOROZI</span>
        </button>

        <button
          className="agent"
          onClick={() => setPage("agent")}
        >
          <span className="role-icon">🤝</span>
          <span>UMUHUZA</span>
        </button>

        <button
          className="buyer"
          onClick={() => setPage("buyer")}
        >
          <span className="role-icon">🛒</span>
          <span>UMUGUZI</span>
        </button>

      </div>

    </div>
  );
}

export default App;