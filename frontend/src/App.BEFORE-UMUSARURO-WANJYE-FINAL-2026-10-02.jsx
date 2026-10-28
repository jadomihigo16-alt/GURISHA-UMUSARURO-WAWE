import { useState } from "react";
import "./index.css";

function App() {
  const [page, setPage] = useState("home");

  const [showProductForm, setShowProductForm] = useState(false);
  const [showMyProducts, setShowMyProducts] = useState(false);

  const [myProducts, setMyProducts] = useState([]);

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

  const [livestockProduct, setLivestockProduct] = useState({
    name: "",
    type: "",
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

    setFarmerProduct((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleLivestockProductChange = (e) => {
    const { name, value } = e.target;

    setLivestockProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFarmerProductSubmit = (e) => {
    e.preventDefault();

    const newProduct = {
      ...farmerProduct,
      id: Date.now(),
      status: "TEGEREJE KWEMEZWA",
      createdAt: new Date().toLocaleDateString("rw-RW"),
    };

    setMyProducts((prev) => [newProduct, ...prev]);

    alert(
      "Umusaruro washyizwe ku isoko neza.\n\nStatus: TEGEREJE KWEMEZWA"
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

    setShowProductForm(false);
  };

  const handleLivestockProductSubmit = (e) => {
    e.preventDefault();

    alert(
      "Umusaruro w'ubworozi washyizwe ku isoko neza.\n\nStatus: TEGEREJE KWEMEZWA"
    );

    setLivestockProduct({
      name: "",
      type: "",
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
  };

  // ============================================================
  // HOME
  // ============================================================

  if (page === "home") {
    return (
      <div className="dashboard">
        <h1>GURISHA UMUSARURO WAWE</h1>

        <h2>UBUHINZI N'UBWOROZI</h2>

        <p>
          Shyira umusaruro wawe ku isoko, ubone abaguzi kandi
          ukurikire commande yawe.
        </p>

        <div className="cards">
          <div className="card">
            <h2>🌾 UMUHINZI</h2>
            <p>Shyira umusaruro w'ubuhinzi ku isoko.</p>

            <button onClick={() => setPage("farmer")}>
              KOMEZA
            </button>
          </div>

          <div className="card">
            <h2>🐄 UMWOROZI</h2>
            <p>Shyira amatungo n'ibikomoka ku bworozi ku isoko.</p>

            <button onClick={() => setPage("livestock")}>
              KOMEZA
            </button>
          </div>

          <div className="card">
            <h2>🤝 UMUHUZA</h2>
            <p>Genenzura kandi wemeze umusaruro.</p>

            <button onClick={() => setPage("agent")}>
              KOMEZA
            </button>
          </div>

          <div className="card">
            <h2>🛒 UMUGUZI</h2>
            <p>Shakisha umusaruro kandi utange KOMANDE.</p>

            <button onClick={() => setPage("buyer")}>
              KOMEZA
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // FARMER
  // ============================================================

  if (page === "farmer") {
    return (
      <div className="dashboard">
        {!showProductForm && !showMyProducts && (
          <>
            <h1>🌾 UMUHINZI</h1>

            <p>
              Murakaza neza. Hano ushobora gushyira umusaruro
              ku isoko no gukurikirana ibyo washyizemo.
            </p>

            <div className="cards">
              <div className="card">
                <h2>➕ SHYIRA KU ISOKO</h2>
                <p>
                  Andika amakuru y'umusaruro ushaka kugurisha.
                </p>

                <button
                  onClick={() => {
                    setShowProductForm(true);
                    setShowMyProducts(false);
                  }}
                >
                  SHYIRA KU ISOKO
                </button>
              </div>

              <div className="card">
                <h2>📦 UMUSARURO WANJYE</h2>
                <p>
                  Reba imisaruro washyize ku isoko.
                </p>

                <button
                  onClick={() => {
                    setShowMyProducts(true);
                    setShowProductForm(false);
                  }}
                >
                  REBA UMUSARURO
                </button>
              </div>

              <div className="card">
                <h2>🛒 KOMANDE</h2>
                <p>
                  Reba kandi ukurikirane KOMANDE zawe.
                </p>

                <button>
                  REBA KOMANDE
                </button>
              </div>

              <div className="card">
                <h2>🚚 DELIVERY</h2>
                <p>
                  Kurikirana uko umusaruro wawe ugezwaho.
                </p>

                <button>
                  REBA DELIVERY
                </button>
              </div>
            </div>
          </>
        )}

        {/* ======================================================
            UMUSARURO WANJYE
        ====================================================== */}

        {showMyProducts && (
          <div className="product-form-card">
            <button
              type="button"
              onClick={() => setShowMyProducts(false)}
              style={{
                width: "auto",
                padding: "10px 18px",
                marginBottom: "20px",
              }}
            >
              ← SUBIRA
            </button>

            <h2>📦 UMUSARURO WANJYE</h2>

            <p>
              Hano ni ho ubona imisaruro washyize ku isoko.
            </p>

            {myProducts.length === 0 ? (
              <div
                style={{
                  padding: "35px 20px",
                  textAlign: "center",
                  background: "#f5f8f6",
                  borderRadius: "16px",
                  marginTop: "20px",
                }}
              >
                <h3>Nta musaruro urashyirwa ku isoko</h3>

                <p>
                  Umusaruro washyize ku isoko uzagaragara hano.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setShowMyProducts(false);
                    setShowProductForm(true);
                  }}
                >
                  ➕ SHYIRA KU ISOKO
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "18px",
                  marginTop: "25px",
                }}
              >
                {myProducts.map((product) => (
                  <div
                    key={product.id}
                    style={{
                      padding: "22px",
                      borderRadius: "18px",
                      background: "#ffffff",
                      boxShadow:
                        "0 8px 24px rgba(0,0,0,0.08)",
                      textAlign: "left",
                    }}
                  >
                    <h3>{product.name}</h3>

                    <p>
                      <strong>Ubwoko:</strong>{" "}
                      {product.type}
                    </p>

                    <p>
                      <strong>Ingano:</strong>{" "}
                      {product.quantity} {product.unit}
                    </p>

                    <p>
                      <strong>Igiciro:</strong>{" "}
                      {product.price} RWF
                    </p>

                    <p>
                      <strong>Aho biherereye:</strong>{" "}
                      {product.province},{" "}
                      {product.district},{" "}
                      {product.sector},{" "}
                      {product.cell},{" "}
                      {product.village}
                    </p>

                    <p>
                      <strong>Telefoni:</strong>{" "}
                      {product.phone}
                    </p>

                    <p>
                      <strong>Itariki:</strong>{" "}
                      {product.createdAt}
                    </p>

                    <div
                      style={{
                        display: "inline-block",
                        marginTop: "10px",
                        padding: "9px 15px",
                        borderRadius: "10px",
                        background: "#fff3cd",
                        color: "#856404",
                        fontWeight: "800",
                      }}
                    >
                      🟡 TEGEREJE KWEMEZWA
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================
            SHYIRA KU ISOKO
        ====================================================== */}

        {showProductForm && (
          <div className="product-form-card">
            <button
              type="button"
              onClick={() => setShowProductForm(false)}
              style={{
                width: "auto",
                padding: "10px 18px",
                marginBottom: "20px",
              }}
            >
              ← SUBIRA
            </button>

            <h2>➕ SHYIRA KU ISOKO</h2>

            <form onSubmit={handleFarmerProductSubmit}>
              <div>
                <label>Ubwoko bw'umusaruro</label>

                <select
                  name="type"
                  value={farmerProduct.type}
                  onChange={handleFarmerProductChange}
                  required
                >
                  <option value="">
                    Hitamo ubwoko
                  </option>

                  <optgroup label="🌽 IBINYAMPEKE">
                    <option>Ibigori</option>
                    <option>Umuceri</option>
                    <option>Amasaka</option>
                    <option>Uburo</option>
                    <option>Ingano</option>
                    <option>Sayiri</option>
                  </optgroup>

                  <optgroup label="🫘 IBINYAMISOGWE">
                    <option>Ibishyimbo</option>
                    <option>Soya</option>
                    <option>Amashaza</option>
                    <option>Ubunyobwa</option>
                    <option>Lentilles</option>
                    <option>Ibihwagari</option>
                  </optgroup>

                  <optgroup label="🥔 IMIZI N'IBIJUMBA">
                    <option>Ibirayi</option>
                    <option>Imyumbati</option>
                    <option>Ibijumba</option>
                    <option>Taro</option>
                    <option>Karoti</option>
                    <option>Betterave</option>
                  </optgroup>

                  <optgroup label="🍌 IMBUTO">
                    <option>Imineke</option>
                    <option>Avoka</option>
                    <option>Imyembe</option>
                    <option>Amacunga</option>
                    <option>Indimu</option>
                    <option>Ipapayi</option>
                    <option>Inanasi</option>
                    <option>Maracuja</option>
                    <option>Watermelon</option>
                    <option>Guava</option>
                    <option>Pome</option>
                  </optgroup>

                  <optgroup label="🥬 IMBOGA">
                    <option>Inyanya</option>
                    <option>Igitunguru</option>
                    <option>Tungurusumu</option>
                    <option>Amashu</option>
                    <option>Karoti</option>
                    <option>Poivron</option>
                    <option>Aubergine</option>
                    <option>Dodo</option>
                    <option>Isombe</option>
                    <option>Epinari</option>
                    <option>Broccoli</option>
                    <option>Courgette</option>
                    <option>Concombre</option>
                    <option>Poireau</option>
                    <option>Chou-fleur</option>
                  </optgroup>

                  <optgroup label="🌱 IBINDI BIHINWA">
                    <option>Ikawa</option>
                    <option>Icyayi</option>
                    <option>Urusenda</option>
                    <option>Vanille</option>
                    <option>Sesame</option>
                    <option>Coton</option>
                    <option>Itabi</option>
                  </optgroup>

                  <option value="IBINDI">
                    ➕ IBINDI
                  </option>
                </select>
              </div>

              {farmerProduct.type === "IBINDI" && (
                <div style={{ marginTop: "18px" }}>
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

              <div>
                <label>Photo / Video</label>

                <input
                  type="file"
                  name="media"
                  accept="image/*,video/*"
                  onChange={handleFarmerProductChange}
                />
              </div>

              <div>
                <label>Ingano</label>

                <input
                  type="number"
                  name="quantity"
                  value={farmerProduct.quantity}
                  onChange={handleFarmerProductChange}
                  placeholder="Urugero: 100"
                  required
                />
              </div>

              <div>
                <label>Unit</label>

                <select
                  name="unit"
                  value={farmerProduct.unit}
                  onChange={handleFarmerProductChange}
                  required
                >
                  <option value="">
                    Hitamo unit
                  </option>
                  <option value="KG">KG</option>
                  <option value="TON">TON</option>
                  <option value="LITER">LITER</option>
                  <option value="IBIBANDO">IBIBANDO</option>
                  <option value="IBISANDUKU">IBISANDUKU</option>
                  <option value="IBINDI">IBINDI</option>
                </select>
              </div>

              <div>
                <label>Igiciro</label>

                <input
                  type="number"
                  name="price"
                  value={farmerProduct.price}
                  onChange={handleFarmerProductChange}
                  placeholder="Urugero: 500"
                  required
                />
              </div>

              <div>
                <label>Province</label>

                <input
                  type="text"
                  name="province"
                  value={farmerProduct.province}
                  onChange={handleFarmerProductChange}
                  placeholder="Urugero: Western"
                  required
                />
              </div>

              <div>
                <label>District</label>

                <input
                  type="text"
                  name="district"
                  value={farmerProduct.district}
                  onChange={handleFarmerProductChange}
                  placeholder="Urugero: Ngororero"
                  required
                />
              </div>

              <div>
                <label>Sector</label>

                <input
                  type="text"
                  name="sector"
                  value={farmerProduct.sector}
                  onChange={handleFarmerProductChange}
                  placeholder="Urugero: Gatumba"
                  required
                />
              </div>

              <div>
                <label>Cell</label>

                <input
                  type="text"
                  name="cell"
                  value={farmerProduct.cell}
                  onChange={handleFarmerProductChange}
                  placeholder="Urugero: Ruhanga"
                  required
                />
              </div>

              <div>
                <label>Village</label>

                <input
                  type="text"
                  name="village"
                  value={farmerProduct.village}
                  onChange={handleFarmerProductChange}
                  placeholder="Urugero: Kamina"
                  required
                />
              </div>

              <div>
                <label>Telefoni</label>

                <input
                  type="tel"
                  name="phone"
                  value={farmerProduct.phone}
                  onChange={handleFarmerProductChange}
                  placeholder="Urugero: 078..."
                  required
                />
              </div>

              <div
                style={{
                  padding: "15px",
                  marginTop: "15px",
                  marginBottom: "15px",
                  borderRadius: "12px",
                  background: "#fff3cd",
                  color: "#856404",
                  fontWeight: "800",
                  textAlign: "center",
                }}
              >
                🟡 TEGEREJE KWEMEZWA
              </div>

              <button type="submit">
                SHYIRA KU ISOKO
              </button>
            </form>
          </div>
        )}

        <button
          type="button"
          onClick={() => setPage("home")}
          style={{
            marginTop: "25px",
            width: "auto",
            padding: "12px 25px",
          }}
        >
          🏠 AHABANZA
        </button>
      </div>
    );
  }

  // ============================================================
  // LIVESTOCK
  // ============================================================

  if (page === "livestock") {
    return (
      <div className="dashboard">
        <h1>🐄 UMWOROZI</h1>

        <p>
          Shyira amatungo cyangwa ibikomoka ku bworozi ku isoko.
        </p>

        <div className="cards">
          <div className="card">
            <h2>➕ SHYIRA KU ISOKO</h2>

            <p>
              Shyira amatungo cyangwa ibikomoka ku bworozi ku isoko.
            </p>

            <button
              onClick={() =>
                document
                  .getElementById("livestock-form")
                  ?.scrollIntoView()
              }
            >
              SHYIRA KU ISOKO
            </button>
          </div>

          <div className="card">
            <h2>📦 UMUSARURO WANJYE</h2>
            <p>Reba ibyo washyize ku isoko.</p>
            <button>REBA UMUSARURO</button>
          </div>

          <div className="card">
            <h2>🛒 KOMANDE</h2>
            <p>Reba KOMANDE.</p>
            <button>REBA KOMANDE</button>
          </div>

          <div className="card">
            <h2>🚚 DELIVERY</h2>
            <p>Kurikirana delivery.</p>
            <button>REBA DELIVERY</button>
          </div>
        </div>

        <div
          id="livestock-form"
          className="product-form-card"
        >
          <h2>➕ SHYIRA KU ISOKO</h2>

          <form onSubmit={handleLivestockProductSubmit}>
            <div>
              <label>Ubwoko bw'amatungo</label>

              <select
                name="type"
                value={livestockProduct.type}
                onChange={handleLivestockProductChange}
                required
              >
                <option value="">
                  Hitamo ubwoko
                </option>
                <option>Inka</option>
                <option>Inyama z'inka</option>
                <option>Amata</option>
                <option>Imbuto z'inka</option>
                <option>Amihene</option>
                <option>Intama</option>
                <option>Ingurube</option>
                <option>Inkoko</option>
                <option>Amagi</option>
                <option>Ubuki</option>
                <option>IBINDI</option>
              </select>
            </div>

            <div>
              <label>Izina / Ibisobanuro</label>

              <input
                type="text"
                name="name"
                value={livestockProduct.name}
                onChange={handleLivestockProductChange}
                placeholder="Urugero: Inka y'umweru"
                required
              />
            </div>

            <div>
              <label>Ingano</label>

              <input
                type="number"
                name="quantity"
                value={livestockProduct.quantity}
                onChange={handleLivestockProductChange}
                required
              />
            </div>

            <div>
              <label>Unit</label>

              <select
                name="unit"
                value={livestockProduct.unit}
                onChange={handleLivestockProductChange}
                required
              >
                <option value="">
                  Hitamo unit
                </option>
                <option>KG</option>
                <option>TON</option>
                <option>LITER</option>
                <option>AMATUNGO</option>
                <option>IBINDI</option>
              </select>
            </div>

            <div>
              <label>Igiciro</label>

              <input
                type="number"
                name="price"
                value={livestockProduct.price}
                onChange={handleLivestockProductChange}
                required
              />
            </div>

            <div>
              <label>Province</label>

              <input
                type="text"
                name="province"
                value={livestockProduct.province}
                onChange={handleLivestockProductChange}
                required
              />
            </div>

            <div>
              <label>District</label>

              <input
                type="text"
                name="district"
                value={livestockProduct.district}
                onChange={handleLivestockProductChange}
                required
              />
            </div>

            <div>
              <label>Sector</label>

              <input
                type="text"
                name="sector"
                value={livestockProduct.sector}
                onChange={handleLivestockProductChange}
                required
              />
            </div>

            <div>
              <label>Cell</label>

              <input
                type="text"
                name="cell"
                value={livestockProduct.cell}
                onChange={handleLivestockProductChange}
                required
              />
            </div>

            <div>
              <label>Village</label>

              <input
                type="text"
                name="village"
                value={livestockProduct.village}
                onChange={handleLivestockProductChange}
                required
              />
            </div>

            <div>
              <label>Telefoni</label>

              <input
                type="tel"
                name="phone"
                value={livestockProduct.phone}
                onChange={handleLivestockProductChange}
                required
              />
            </div>

            <div
              style={{
                padding: "15px",
                marginTop: "15px",
                marginBottom: "15px",
                borderRadius: "12px",
                background: "#fff3cd",
                color: "#856404",
                fontWeight: "800",
                textAlign: "center",
              }}
            >
              🟡 TEGEREJE KWEMEZWA
            </div>

            <button type="submit">
              SHYIRA KU ISOKO
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={() => setPage("home")}
          style={{
            marginTop: "25px",
            width: "auto",
            padding: "12px 25px",
          }}
        >
          🏠 AHABANZA
        </button>
      </div>
    );
  }

  // ============================================================
  // UMUHUZA
  // ============================================================

  if (page === "agent") {
    return (
      <div className="dashboard">
        <h1>🤝 UMUHUZA</h1>

        <p>
          Hano hazajya hagaragara imisaruro itegereje kugenzurwa.
        </p>

        <div className="cards">
          <div className="card">
            <h2>🟡 TEGEREJE KWEMEZWA</h2>

            <p>
              Imisaruro itaragenzurwa.
            </p>

            <button>
              REBA IMISARURO
            </button>
          </div>

          <div className="card">
            <h2>🟢 WEMEJWE</h2>

            <p>
              Imisaruro yamaze kugenzurwa no kwemezwa.
            </p>

            <button>
              REBA YEMEJWE
            </button>
          </div>
        </div>

        <button
          onClick={() => setPage("home")}
          style={{
            width: "auto",
            padding: "12px 25px",
          }}
        >
          🏠 AHABANZA
        </button>
      </div>
    );
  }

  // ============================================================
  // BUYER
  // ============================================================

  if (page === "buyer") {
    return (
      <div className="dashboard">
        <h1>🛒 UMUGUZI</h1>

        <p>
          Shakisha umusaruro wemejwe kandi utange KOMANDE.
        </p>

        <div className="cards">
          <div className="card">
            <h2>🔎 SHAKISHA UMUSARURO</h2>
            <p>
              Shakisha imisaruro yemejwe.
            </p>

            <button>
              SHAKISHA
            </button>
          </div>

          <div className="card">
            <h2>🛒 KOMANDE</h2>
            <p>
              Reba KOMANDE watanze.
            </p>

            <button>
              REBA KOMANDE
            </button>
          </div>

          <div className="card">
            <h2>🚚 DELIVERY</h2>
            <p>
              Kurikirana delivery ya KOMANDE.
            </p>

            <button>
              REBA DELIVERY
            </button>
          </div>
        </div>

        <button
          onClick={() => setPage("home")}
          style={{
            width: "auto",
            padding: "12px 25px",
          }}
        >
          🏠 AHABANZA
        </button>
      </div>
    );
  }

  return null;
}

export default App;