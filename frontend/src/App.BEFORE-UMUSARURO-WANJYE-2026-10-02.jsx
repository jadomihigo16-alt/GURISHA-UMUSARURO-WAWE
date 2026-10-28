import { useState } from "react";

function App() {
  const [page, setPage] = useState("home");

  // =========================
  // FARMER PRODUCT FORM
  // =========================

  const [showFarmerProductForm, setShowFarmerProductForm] = useState(false);

  const [farmerProduct, setFarmerProduct] = useState({
    name: "",
    type: "",
    media: null,
    quantity: "",
    unit: "",
    price: "",
    province: "",
    district: "",
    sector: "",
    cell: "",
    village: "",
    phone: "",
  });

  const handleFarmerProductChange = (e) => {
    const { name, value, files } = e.target;

    setFarmerProduct({
      ...farmerProduct,
      [name]: files ? files[0] : value,
    });
  };

  const handleFarmerProductSubmit = (e) => {
    e.preventDefault();

    alert(
      "Umusaruro wanditswe neza.\n\nStatus: TEGEREJE KWEMEZWA"
    );

    setFarmerProduct({
      name: "",
      type: "",
      media: null,
      quantity: "",
      unit: "",
      price: "",
      province: "",
      district: "",
      sector: "",
      cell: "",
      village: "",
      phone: "",
    });

    setShowFarmerProductForm(false);
  };

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

        {showFarmerProductForm ? (

          <div className="card product-form-card">

            <h2>➕ SHYIRAHO UMUSARURO</h2>

            <p>
              Andika amakuru y'umusaruro ufite.
            </p>

            <form onSubmit={handleFarmerProductSubmit}>

              {/* UBWOKO BW'UMUSARURO */}

              <div>
                <label>Ubwoko bw'umusaruro</label>

                <select
                  name="type"
                  value={farmerProduct.type}
                  onChange={handleFarmerProductChange}
                  required
                >

                  <option value="">
                    Hitamo ubwoko bw'umusaruro
                  </option>

                  <optgroup label="🌽 IBINYAMPEKE">

                    <option value="Ibigori">
                      Ibigori
                    </option>

                    <option value="Umuceri">
                      Umuceri
                    </option>

                    <option value="Amasaka">
                      Amasaka
                    </option>

                    <option value="Uburo">
                      Uburo
                    </option>

                    <option value="Ingano">
                      Ingano
                    </option>

                    <option value="Sayiri">
                      Sayiri
                    </option>

                  </optgroup>

                  <optgroup label="🫘 IBINYAMISOGWE">

                    <option value="Ibishyimbo">
                      Ibishyimbo
                    </option>

                    <option value="Soya">
                      Soya
                    </option>

                    <option value="Amashaza">
                      Amashaza
                    </option>

                    <option value="Ubunyobwa">
                      Ubunyobwa
                    </option>

                    <option value="Lentilles">
                      Lentilles
                    </option>

                    <option value="Ibihwagari">
                      Ibihwagari
                    </option>

                  </optgroup>

                  <optgroup label="🥔 IMIZI N'IBIJUMBA">

                    <option value="Ibirayi">
                      Ibirayi
                    </option>

                    <option value="Imyumbati">
                      Imyumbati
                    </option>

                    <option value="Ibijumba">
                      Ibijumba
                    </option>

                    <option value="Taro">
                      Taro
                    </option>

                    <option value="Karoti">
                      Karoti
                    </option>

                    <option value="Betterave">
                      Betterave
                    </option>

                  </optgroup>

                  <optgroup label="🍌 IMBUTO">

                    <option value="Imineke">
                      Imineke
                    </option>

                    <option value="Avoka">
                      Avoka
                    </option>

                    <option value="Imyembe">
                      Imyembe
                    </option>

                    <option value="Amacunga">
                      Amacunga
                    </option>

                    <option value="Indimu">
                      Indimu
                    </option>

                    <option value="Ipapayi">
                      Ipapayi
                    </option>

                    <option value="Inanasi">
                      Inanasi
                    </option>

                    <option value="Maracuja">
                      Maracuja
                    </option>

                    <option value="Watermelon">
                      Watermelon
                    </option>

                    <option value="Guava">
                      Guava
                    </option>

                    <option value="Pome">
                      Pome
                    </option>

                  </optgroup>

                  <optgroup label="🥬 IMBOGA">

                    <option value="Inyanya">
                      Inyanya
                    </option>

                    <option value="Igitunguru">
                      Igitunguru
                    </option>

                    <option value="Tungurusumu">
                      Tungurusumu
                    </option>

                    <option value="Amashu">
                      Amashu
                    </option>

                    <option value="Karoti">
                      Karoti
                    </option>

                    <option value="Poivron">
                      Poivron
                    </option>

                    <option value="Aubergine">
                      Aubergine
                    </option>

                    <option value="Dodo">
                      Dodo
                    </option>

                    <option value="Isombe">
                      Isombe
                    </option>

                    <option value="Epinari">
                      Epinari
                    </option>

                    <option value="Broccoli">
                      Broccoli
                    </option>

                    <option value="Courgette">
                      Courgette
                    </option>

                    <option value="Concombre">
                      Concombre
                    </option>

                    <option value="Poireau">
                      Poireau
                    </option>

                    <option value="Chou-fleur">
                      Chou-fleur
                    </option>

                  </optgroup>

                  <optgroup label="🌱 IBINDI BIHINWA">

                    <option value="Ikawa">
                      Ikawa
                    </option>

                    <option value="Icyayi">
                      Icyayi
                    </option>

                    <option value="Urusenda">
                      Urusenda
                    </option>

                    <option value="Vanille">
                      Vanille
                    </option>

                    <option value="Sesame">
                      Sesame
                    </option>

                    <option value="Coton">
                      Coton
                    </option>

                    <option value="Itabi">
                      Itabi
                    </option>

                  </optgroup>

                  <option value="IBINDI">
                    ➕ IBINDI
                  </option>

                </select>

                {/* IBINDI */}

                {farmerProduct.type === "IBINDI" && (
                  <div
                    style={{
                      marginTop: "18px",
                    }}
                  >

                    <label>
                      Andika izina ry'umusaruro
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={farmerProduct.name}
                      onChange={handleFarmerProductChange}
                      placeholder="Urugero: Ibihumyo"
                      required
                      autoFocus
                    />

                  </div>
                )}

              </div>

              {/* IZINA RY'UMUSARURO */}

              {farmerProduct.type !== "IBINDI" && (
                <div>

                  <label>
                    Izina ry'umusaruro
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={farmerProduct.name}
                    onChange={handleFarmerProductChange}
                    placeholder="Urugero: Ibishyimbo"
                    required
                  />

                </div>
              )}

              {/* IFOTO / VIDEO */}

              <div>

                <label>
                  📷🎥 Ifoto / Video y'umusaruro
                </label>

                <input
                  type="file"
                  name="media"
                  accept="image/*,video/*"
                  onChange={handleFarmerProductChange}
                />

                <small
                  style={{
                    display: "block",
                    marginTop: "8px",
                    textAlign: "left",
                    fontSize: "15px",
                    fontWeight: "600",
                  }}
                >
                  Ongeraho ifoto cyangwa video y'umusaruro.
                </small>

              </div>

              {/* INGANO */}

              <div>

                <label>
                  Ingano ufite
                </label>

                <input
                  type="number"
                  name="quantity"
                  value={farmerProduct.quantity}
                  onChange={handleFarmerProductChange}
                  placeholder="Urugero: 500"
                  min="1"
                  required
                />

              </div>

              {/* IGIPIMO */}

              <div>

                <label>
                  Igipimo
                </label>

                <select
                  name="unit"
                  value={farmerProduct.unit}
                  onChange={handleFarmerProductChange}
                  required
                >

                  <option value="">
                    Hitamo igipimo
                  </option>

                  <option value="KG">
                    KG
                  </option>

                  <option value="TONI">
                    TONI
                  </option>

                  <option value="LITERS">
                    LITERS
                  </option>

                  <option value="AMASANDUKU">
                    AMASANDUKU
                  </option>

                  <option value="IBINDI">
                    IBINDI
                  </option>

                </select>

              </div>

              {/* IGICIRO */}

              <div>

                <label>
                  Igiciro
                </label>

                <input
                  type="number"
                  name="price"
                  value={farmerProduct.price}
                  onChange={handleFarmerProductChange}
                  placeholder="Urugero: 500 RWF / KG"
                  min="0"
                  required
                />

              </div>

              {/* INTARA */}

              <div>

                <label>
                  Intara
                </label>

                <select
                  name="province"
                  value={farmerProduct.province}
                  onChange={handleFarmerProductChange}
                  required
                >

                  <option value="">
                    Hitamo Intara
                  </option>

                  <option value="KIGALI">
                    Umujyi wa Kigali
                  </option>

                  <option value="AMAJYARUGURU">
                    Amajyaruguru
                  </option>

                  <option value="AMAJYEPFO">
                    Amajyepfo
                  </option>

                  <option value="IBURENGERAZUBA">
                    Iburengerazuba
                  </option>

                  <option value="IBURASIRAZUBA">
                    Iburasirazuba
                  </option>

                </select>

              </div>

              {/* AKARERE */}

              <div>

                <label>
                  Akarere
                </label>

                <input
                  type="text"
                  name="district"
                  value={farmerProduct.district}
                  onChange={handleFarmerProductChange}
                  placeholder="Urugero: Ngororero"
                  required
                />

              </div>

              {/* UMURENGE */}

              <div>

                <label>
                  Umurenge
                </label>

                <input
                  type="text"
                  name="sector"
                  value={farmerProduct.sector}
                  onChange={handleFarmerProductChange}
                  placeholder="Urugero: Gatumba"
                  required
                />

              </div>

              {/* AKAGARI */}

              <div>

                <label>
                  Akagari
                </label>

                <input
                  type="text"
                  name="cell"
                  value={farmerProduct.cell}
                  onChange={handleFarmerProductChange}
                  placeholder="Urugero: Ruhanga"
                  required
                />

              </div>

              {/* UMUDUGUDU */}

              <div>

                <label>
                  Umudugudu
                </label>

                <input
                  type="text"
                  name="village"
                  value={farmerProduct.village}
                  onChange={handleFarmerProductChange}
                  placeholder="Urugero: Kamina"
                  required
                />

              </div>

              {/* TELEFONI */}

              <div>

                <label>
                  Telefoni
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={farmerProduct.phone}
                  onChange={handleFarmerProductChange}
                  placeholder="Urugero: 078..."
                  required
                />

              </div>

              {/* STATUS */}

              <div
                style={{
                  marginTop: "20px",
                  padding: "18px",
                  borderRadius: "10px",
                  background: "#fff3cd",
                  color: "#856404",
                  fontWeight: "800",
                  fontSize: "19px",
                }}
              >
                STATUS: TEGEREJE KWEMEZWA
              </div>

              {/* SUBMIT */}

              <button type="submit">
                KANDIKA UMUSARURO
              </button>

              {/* BACK */}

              <button
                type="button"
                onClick={() =>
                  setShowFarmerProductForm(false)
                }
              >
                ← SUBIRA KURI DASHBOARD
              </button>

            </form>

          </div>

        ) : (

          <div className="cards">

            <div className="card">

              <h2>
                ➕ SHYIRAHO UMUSARURO
              </h2>

              <p>
                Shyiraho umusaruro ufite kugira ngo
                abaguzi bawubone.
              </p>

              <button
                onClick={() =>
                  setShowFarmerProductForm(true)
                }
              >
                SHYIRAHO UMUSARURO
              </button>

            </div>

            <div className="card">

              <h2>
                📦 UMUSARURO WANJYE
              </h2>

              <p>
                Reba umusaruro washyize kuri system
                n'uko uhagaze.
              </p>

              <button>
                REBA UMUSARURO
              </button>

            </div>

            <div className="card">

              <h2>
                🛒 COMMANDE
              </h2>

              <p>
                Reba commande zatanzwe ku musaruro wawe.
              </p>

              <button>
                REBA COMMANDE
              </button>

            </div>

            <div className="card">

              <h2>
                🚚 DELIVERY
              </h2>

              <p>
                Kurikirana uko umusaruro ugezwaho umuguzi.
              </p>

              <button>
                KURIKIRANA DELIVERY
              </button>

            </div>

          </div>

        )}

        <button
          className="back"
          onClick={() => {
            setShowFarmerProductForm(false);
            setPage("home");
          }}
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

          <div className="big-role-icon">
            🐄
          </div>

          <h1>UMWOROZI</h1>

          <h2>UBWOROZI</h2>

          <p>
            Dashboard y'umworozi
          </p>

        </div>

        <div className="cards">

          <div className="card">

            <h2>
              ➕ SHYIRAHO UMUSARURO
            </h2>

            <p>
              Shyiraho amatungo cyangwa umusaruro
              w'ubworozi ufite.
            </p>

            <button>
              SHYIRAHO UMUSARURO
            </button>

          </div>

          <div className="card">

            <h2>
              📦 UMUSARURO WANJYE
            </h2>

            <p>
              Reba amatungo n'umusaruro w'ubworozi
              washyize kuri system.
            </p>

            <button>
              REBA UMUSARURO
            </button>

          </div>

          <div className="card">

            <h2>
              🛒 COMMANDE
            </h2>

            <p>
              Reba commande zatanzwe ku musaruro wawe.
            </p>

            <button>
              REBA COMMANDE
            </button>

          </div>

          <div className="card">

            <h2>
              🚚 DELIVERY
            </h2>

            <p>
              Kurikirana itangwa ry'umusaruro.
            </p>

            <button>
              KURIKIRANA DELIVERY
            </button>

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

          <div className="big-role-icon">
            🤝
          </div>

          <h1>UMUHUZA</h1>

          <h2>UMUHUZA</h2>

          <p>
            Dashboard y'umuhuza
          </p>

        </div>

        <div className="cards">

          <div className="card">

            <h2>
              🔎 UMUSARURO UTARAGENZURWA
            </h2>

            <p>
              Reba umusaruro utegereje kugenzurwa
              no kwemezwa.
            </p>

            <button>
              AGENZURE
            </button>

          </div>

          <div className="card">

            <h2>
              ✅ UMUSARURO WEMEJWE
            </h2>

            <p>
              Reba umusaruro wemejwe ushobora
              kubonwa n'abaguzi.
            </p>

            <button>
              REBA WEMEJWE
            </button>

          </div>

          <div className="card">

            <h2>
              🛒 COMMANDE
            </h2>

            <p>
              Reba kandi wemeze commande z'abaguzi.
            </p>

            <button>
              REBA COMMANDE
            </button>

          </div>

          <div className="card">

            <h2>
              🚚 DELIVERY
            </h2>

            <p>
              Kurikirana itangwa ry'umusaruro ku muguzi.
            </p>

            <button>
              REBA DELIVERY
            </button>

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

          <div className="big-role-icon">
            🛒
          </div>

          <h1>UMUGUZI</h1>

          <h2>ABAGUZI</h2>

          <p>
            Dashboard y'umuguzi
          </p>

        </div>

        <div className="cards">

          <div className="card">

            <h2>
              🔎 SHAKISHA UMUSARURO
            </h2>

            <p>
              Shakisha umusaruro wemejwe n'umuhuza.
            </p>

            <button>
              SHAKISHA
            </button>

          </div>

          <div className="card">

            <h2>
              🛒 TANGA COMMANDE
            </h2>

            <p>
              Hitamo umusaruro ushaka utange commande.
            </p>

            <button>
              TANGA COMMANDE
            </button>

          </div>

          <div className="card">

            <h2>
              📋 COMMANDE ZANJYE
            </h2>

            <p>
              Reba commande watanze n'uko zihagaze.
            </p>

            <button>
              REBA COMMANDE
            </button>

          </div>

          <div className="card">

            <h2>
              🚚 DELIVERY
            </h2>

            <p>
              Kurikirana uko umusaruro uri kugera aho wifuza.
            </p>

            <button>
              KURIKIRANA
            </button>

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

        <h1>
          GURISHA UMUSARURO WAWE
        </h1>

        <p>
          UBUHINZI N'UBWOROZI
        </p>

      </div>

      <div className="hero">

        <h2>
          Menya umusaruro uhari
        </h2>

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

          <span className="role-icon">
            🌾
          </span>

          <span>
            UMUHINZI
          </span>

        </button>

        <button
          className="livestock"
          onClick={() => setPage("livestock")}
        >

          <span className="role-icon">
            🐄
          </span>

          <span>
            UMWOROZI
          </span>

        </button>

        <button
          className="agent"
          onClick={() => setPage("agent")}
        >

          <span className="role-icon">
            🤝
          </span>

          <span>
            UMUHUZA
          </span>

        </button>

        <button
          className="buyer"
          onClick={() => setPage("buyer")}
        >

          <span className="role-icon">
            🛒
          </span>

          <span>
            UMUGUZI
          </span>

        </button>

      </div>

    </div>
  );
}

export default App;