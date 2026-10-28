import { useState } from "react";

function App() {
  const [page, setPage] = useState("home");

  // ============================================================
  // FARMER
  // ============================================================

  const [showFarmerProductForm, setShowFarmerProductForm] =
    useState(false);

  const [showMyProducts, setShowMyProducts] =
    useState(false);

  const [myProducts, setMyProducts] = useState([]);

  // ============================================================
  // UMUHUZA
  // ============================================================

  const [showPendingProducts, setShowPendingProducts] =
    useState(false);

  const [showVerifiedProducts, setShowVerifiedProducts] =
    useState(false);

  const [showApprovedProducts, setShowApprovedProducts] =
    useState(false);

  const [showAgentOrders, setShowAgentOrders] =
    useState(false);

  // ============================================================
  // UMUGUZI
  // ============================================================

  const [showBuyerProducts, setShowBuyerProducts] =
    useState(false);

  const [selectedBuyerProduct, setSelectedBuyerProduct] =
    useState(null);

  const [showOrderForm, setShowOrderForm] =
    useState(false);

  // ============================================================
  // KOMANDE
  // ============================================================

  const [orders, setOrders] = useState([]);

  const [buyerOrder, setBuyerOrder] = useState({
    buyerName: "",
    quantity: "",
    deliveryLocation: "",
    buyerPhone: "",
  });

  // ============================================================
  // FARMER PRODUCT
  // ============================================================

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

  // ============================================================
  // FARMER PRODUCT CHANGE
  // ============================================================

  const handleFarmerProductChange = (e) => {
    const { name, value, files } = e.target;

    setFarmerProduct((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // ============================================================
  // FARMER PRODUCT SUBMIT
  // ============================================================

  const handleFarmerProductSubmit = (e) => {
    e.preventDefault();

    const newProduct = {
      ...farmerProduct,
      id: Date.now(),
      status: "NTABWO WAGENZUWE",
      createdAt: new Date().toLocaleDateString("rw-RW"),
    };

    setMyProducts((prev) => [
      newProduct,
      ...prev,
    ]);

    alert(
      "Umusaruro washyizwe ku isoko neza.\n\n" +
        "Status: NTABWO WAGENZUWE"
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

  // ============================================================
  // UMUHUZA - VERIFY
  // ============================================================

  const handleVerifyProduct = (productId) => {
    const reason = window.prompt(
      "ANDIKA IMPAMVU UMUSARURO UTAREMEJWE:"
    );

    if (reason === null) {
      return;
    }

    if (!reason.trim()) {
      alert("Ugomba kwandika IMPAMVU.");
      return;
    }

    setMyProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,
              status: "WAGENZUWE — NTABWO WEMEJWE",
              verificationReason: reason.trim(),
              verifiedAt:
                new Date().toLocaleDateString("rw-RW"),
            }
          : product
      )
    );

    alert(
      "Umusaruro wagenzuwe.\n\n" +
        "Status: WAGENZUWE — NTABWO WEMEJWE\n\n" +
        "IMPAMVU: " +
        reason.trim()
    );
  };

  // ============================================================
  // UMUHUZA - APPROVE PRODUCT
  // ============================================================

  const handleApproveProduct = (productId) => {
    setMyProducts((prev) =>
      prev.map((product) =>
        product.id === productId &&
        product.status ===
          "WAGENZUWE — NTABWO WEMEJWE"
          ? {
              ...product,
              status: "WEMEJWE",
              approvedAt:
                new Date().toLocaleDateString("rw-RW"),
            }
          : product
      )
    );

    alert(
      "Umusaruro wemejwe neza.\n\n" +
        "Status: WEMEJWE"
    );
  };

  // ============================================================
  // BUYER ORDER CHANGE
  // ============================================================

  const handleBuyerOrderChange = (e) => {
    const { name, value } = e.target;

    setBuyerOrder((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // BUYER ORDER SUBMIT
  // ============================================================

  const handleBuyerOrderSubmit = (e) => {
    e.preventDefault();

    if (!selectedBuyerProduct) {
      alert("Hitamo umusaruro ubanza.");
      return;
    }

    // ==========================================================
    // BUYER NAME REQUIRED
    // ==========================================================

    if (!buyerOrder.buyerName.trim()) {
      alert("Andika izina ry'umuguzi.");
      return;
    }

    const requestedQuantity =
      Number(buyerOrder.quantity);

    const availableQuantity =
      Number(selectedBuyerProduct.quantity);

    if (requestedQuantity <= 0) {
      alert("Andika ingano irenze 0.");
      return;
    }

    if (
      requestedQuantity >
      availableQuantity
    ) {
      alert(
        "Ingano wasabye irenze umusaruro uhari.\n\n" +
          "Ingano ihari: " +
          selectedBuyerProduct.quantity +
          " " +
          selectedBuyerProduct.unit
      );

      return;
    }

    if (
      !buyerOrder.deliveryLocation.trim()
    ) {
      alert(
        "Andika aho uzakiririra umusaruro."
      );

      return;
    }

    if (!buyerOrder.buyerPhone.trim()) {
      alert(
        "Andika telefoni y'umuguzi."
      );

      return;
    }

    // ========================================================
    // CREATE ORDER
    // ========================================================

    const newOrder = {
      id: Date.now(),

      // ======================================================
      // BUYER INFORMATION
      // ======================================================

      buyerName:
        buyerOrder.buyerName.trim(),

      buyerPhone:
        buyerOrder.buyerPhone.trim(),

      deliveryLocation:
        buyerOrder.deliveryLocation.trim(),

      // ======================================================
      // PRODUCT INFORMATION
      // ======================================================

      productId:
        selectedBuyerProduct.id,

      productName:
        selectedBuyerProduct.name,

      productType:
        selectedBuyerProduct.type,

      availableQuantity:
        selectedBuyerProduct.quantity,

      unit:
        selectedBuyerProduct.unit,

      price:
        selectedBuyerProduct.price,

      requestedQuantity:
        buyerOrder.quantity,

      // ======================================================
      // FARMER INFORMATION
      // ======================================================

      farmerPhone:
        selectedBuyerProduct.phone,

      province:
        selectedBuyerProduct.province,

      district:
        selectedBuyerProduct.district,

      sector:
        selectedBuyerProduct.sector,

      cell:
        selectedBuyerProduct.cell,

      village:
        selectedBuyerProduct.village,

      // ======================================================
      // ORDER
      // ======================================================

      orderDate:
        new Date().toLocaleDateString("rw-RW"),

      status:
        "TEGEREJE UMUHUZA",
    };

    setOrders((prev) => [
      newOrder,
      ...prev,
    ]);

    alert(
      "KOMANDE yatanzwe neza.\n\n" +
        "Izina ry'umuguzi: " +
        buyerOrder.buyerName +
        "\n" +
        "Umusaruro: " +
        selectedBuyerProduct.name +
        "\n" +
        "Ingano: " +
        buyerOrder.quantity +
        " " +
        selectedBuyerProduct.unit +
        "\n" +
        "Aho izakirirwa: " +
        buyerOrder.deliveryLocation +
        "\n" +
        "Telefoni: " +
        buyerOrder.buyerPhone +
        "\n\n" +
        "KOMANDE yoherejwe kuri UMUHUZA."
    );

    // ========================================================
    // RESET ORDER FORM
    // ========================================================

    setBuyerOrder({
      buyerName: "",
      quantity: "",
      deliveryLocation: "",
      buyerPhone: "",
    });

    setSelectedBuyerProduct(null);

    setShowOrderForm(false);
  };

  // ============================================================
  // PRODUCT LISTS
  // ============================================================

  const pendingProducts =
    myProducts.filter(
      (product) =>
        product.status ===
        "NTABWO WAGENZUWE"
    );

  const verifiedProducts =
    myProducts.filter(
      (product) =>
        product.status ===
        "WAGENZUWE — NTABWO WEMEJWE"
    );

  const approvedProducts =
    myProducts.filter(
      (product) =>
        product.status ===
        "WEMEJWE"
    );

  // ============================================================
  // ORDERS
  // ============================================================

  const pendingOrders =
    orders.filter(
      (order) =>
        order.status ===
        "TEGEREJE UMUHUZA"
    );

  // ============================================================
  // UMUHINZI
  // ============================================================

  if (page === "farmer") {
    return (
      <div className="dashboard">

        <div className="role-header">

          <div className="big-role-icon">
            🌾
          </div>

          <h1>UMUHINZI</h1>

          <h2>UBUHINZI</h2>

          <p>
            Dashboard y'umuhinzi
          </p>

        </div>

        {showMyProducts ? (

          <div className="card product-form-card">

            <button
              type="button"
              onClick={() =>
                setShowMyProducts(false)
              }
            >
              ← SUBIRA
            </button>

            <h2>
              📦 UMUSARURO WANJYE
            </h2>

            <p>
              Hano ni ho ubona imisaruro
              washyize ku isoko.
            </p>

            {myProducts.length === 0 ? (

              <div
                style={{
                  marginTop: "25px",
                  padding: "30px",
                  borderRadius: "15px",
                  background: "#f5f8f6",
                  textAlign: "center",
                }}
              >
                <h3>
                  Nta musaruro urashyirwa ku isoko
                </h3>

                <p>
                  Umusaruro washyize ku isoko
                  uzagaragara hano.
                </p>
              </div>

            ) : (

              <div
                style={{
                  display: "grid",
                  gap: "20px",
                  marginTop: "25px",
                }}
              >

                {myProducts.map(
                  (product) => (

                    <div
                      key={product.id}
                      className="card"
                      style={{
                        textAlign: "left",
                        padding: "25px",
                      }}
                    >

                      <h3>
                        {product.name}
                      </h3>

                      <p>
                        <strong>
                          Ubwoko:
                        </strong>{" "}
                        {product.type}
                      </p>

                      <p>
                        <strong>
                          Ingano:
                        </strong>{" "}
                        {product.quantity}{" "}
                        {product.unit}
                      </p>

                      <p>
                        <strong>
                          Igiciro:
                        </strong>{" "}
                        {product.price} RWF
                      </p>

                      <p>
                        <strong>
                          Intara:
                        </strong>{" "}
                        {product.province}
                      </p>

                      <p>
                        <strong>
                          Akarere:
                        </strong>{" "}
                        {product.district}
                      </p>

                      <p>
                        <strong>
                          Umurenge:
                        </strong>{" "}
                        {product.sector}
                      </p>

                      <p>
                        <strong>
                          Akagari:
                        </strong>{" "}
                        {product.cell}
                      </p>

                      <p>
                        <strong>
                          Umudugudu:
                        </strong>{" "}
                        {product.village}
                      </p>

                      <p>
                        <strong>
                          Telefoni:
                        </strong>{" "}
                        {product.phone}
                      </p>

                      <p>
                        <strong>
                          Itariki yashyiriweho:
                        </strong>{" "}
                        {product.createdAt}
                      </p>

                      {product.status ===
                      "NTABWO WAGENZUWE" ? (

                        <div
                          style={{
                            marginTop: "15px",
                            padding: "12px",
                            borderRadius: "10px",
                            background: "#fff3cd",
                            color: "#856404",
                            fontWeight: "800",
                            textAlign: "center",
                          }}
                        >
                          🟡 NTABWO WAGENZUWE
                        </div>

                      ) : product.status ===
                        "WAGENZUWE — NTABWO WEMEJWE"
                        ? (

                        <div
                          style={{
                            marginTop: "15px",
                            padding: "15px",
                            borderRadius: "10px",
                            background: "#ffe8cc",
                            color: "#9a4d00",
                            fontWeight: "800",
                          }}
                        >

                          <div
                            style={{
                              textAlign: "center",
                              marginBottom: "10px",
                            }}
                          >
                            🟠 WAGENZUWE —
                            NTABWO WEMEJWE
                          </div>

                          <div
                            style={{
                              background: "#fff",
                              padding: "12px",
                              borderRadius: "8px",
                            }}
                          >

                            <strong>
                              IMPAMVU:
                            </strong>

                            <p>
                              {
                                product.verificationReason
                              }
                            </p>

                            <p>
                              <strong>
                                Itariki wagenzuwe:
                              </strong>{" "}
                              {
                                product.verifiedAt
                              }
                            </p>

                          </div>

                        </div>

                      ) : (

                        <div
                          style={{
                            marginTop: "15px",
                            padding: "12px",
                            borderRadius: "10px",
                            background: "#d4edda",
                            color: "#155724",
                            fontWeight: "800",
                            textAlign: "center",
                          }}
                        >
                          🟢 WEMEJWE
                        </div>

                      )}

                      {product.approvedAt && (
                        <p>
                          <strong>
                            Itariki yemejwe:
                          </strong>{" "}
                          {product.approvedAt}
                        </p>
                      )}

                    </div>

                  )
                )}

              </div>
            )}

          </div>

        ) : showFarmerProductForm ? (

          <div className="card product-form-card">

            <h2>
              ➕ SHYIRA KU ISOKO
            </h2>

            <p>
              Andika amakuru y'umusaruro ufite.
            </p>

            <form
              onSubmit={
                handleFarmerProductSubmit
              }
            >

              <div>
                <label>
                  Ubwoko bw'umusaruro
                </label>

                <select
                  name="type"
                  value={
                    farmerProduct.type
                  }
                  onChange={
                    handleFarmerProductChange
                  }
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

                    <option value="Sesame">
                      Sesame
                    </option>

                    <option value="Coton">
                      Coton
                    </option>

                  </optgroup>

                  <option value="IBINDI">
                    ➕ IBINDI
                  </option>

                </select>
              </div>

              <div>
                <label>
                  Izina ry'umusaruro
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    farmerProduct.name
                  }
                  onChange={
                    handleFarmerProductChange
                  }
                  placeholder="Urugero: Amashaza"
                  required
                />
              </div>

              <div>
                <label>
                  📷🎥 Ifoto / Video y'umusaruro
                </label>

                <input
                  type="file"
                  name="media"
                  accept="image/*,video/*"
                  onChange={
                    handleFarmerProductChange
                  }
                />
              </div>

              <div>
                <label>
                  Ingano ufite
                </label>

                <input
                  type="number"
                  name="quantity"
                  value={
                    farmerProduct.quantity
                  }
                  onChange={
                    handleFarmerProductChange
                  }
                  placeholder="Urugero: 7900"
                  min="1"
                  required
                />
              </div>

              <div>
                <label>
                  Igipimo
                </label>

                <select
                  name="unit"
                  value={
                    farmerProduct.unit
                  }
                  onChange={
                    handleFarmerProductChange
                  }
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

              <div>
                <label>
                  Igiciro
                </label>

                <input
                  type="number"
                  name="price"
                  value={
                    farmerProduct.price
                  }
                  onChange={
                    handleFarmerProductChange
                  }
                  placeholder="Urugero: 400"
                  min="0"
                  required
                />
              </div>

              <div>
                <label>
                  Intara
                </label>

                <select
                  name="province"
                  value={
                    farmerProduct.province
                  }
                  onChange={
                    handleFarmerProductChange
                  }
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

              <div>
                <label>
                  Akarere
                </label>

                <input
                  type="text"
                  name="district"
                  value={
                    farmerProduct.district
                  }
                  onChange={
                    handleFarmerProductChange
                  }
                  placeholder="Urugero: Ngororero"
                  required
                />
              </div>

              <div>
                <label>
                  Umurenge
                </label>

                <input
                  type="text"
                  name="sector"
                  value={
                    farmerProduct.sector
                  }
                  onChange={
                    handleFarmerProductChange
                  }
                  placeholder="Urugero: Murunda"
                  required
                />
              </div>

              <div>
                <label>
                  Akagari
                </label>

                <input
                  type="text"
                  name="cell"
                  value={
                    farmerProduct.cell
                  }
                  onChange={
                    handleFarmerProductChange
                  }
                  placeholder="Urugero: Ruhanga"
                  required
                />
              </div>

              <div>
                <label>
                  Umudugudu
                </label>

                <input
                  type="text"
                  name="village"
                  value={
                    farmerProduct.village
                  }
                  onChange={
                    handleFarmerProductChange
                  }
                  placeholder="Urugero: Ruhanga"
                  required
                />
              </div>

              <div>
                <label>
                  Telefoni
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={
                    farmerProduct.phone
                  }
                  onChange={
                    handleFarmerProductChange
                  }
                  placeholder="Urugero: 0787254211"
                  required
                />
              </div>

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
                🟡 NTABWO WAGENZUWE
              </div>

              <button type="submit">
                SHYIRA KU ISOKO
              </button>

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
                ➕ SHYIRA KU ISOKO
              </h2>

              <p>
                Shyiraho umusaruro ufite
                kugira ngo abaguzi bawubone.
              </p>

              <button
                onClick={() => {
                  setShowFarmerProductForm(true);
                  setShowMyProducts(false);
                }}
              >
                SHYIRA KU ISOKO
              </button>

            </div>

            <div className="card">

              <h2>
                📦 UMUSARURO WANJYE
              </h2>

              <p>
                Reba umusaruro washyize
                kuri system n'uko uhagaze.
              </p>

              <button
                onClick={() => {
                  setShowMyProducts(true);
                  setShowFarmerProductForm(false);
                }}
              >
                REBA UMUSARURO
              </button>

            </div>

            <div className="card">

              <h2>
                🛒 KOMANDE
              </h2>

              <p>
                Reba KOMANDE zatanzwe
                ku musaruro wawe.
              </p>

              <button>
                REBA KOMANDE
              </button>

            </div>

            <div className="card">

              <h2>
                🚚 DELIVERY
              </h2>

              <p>
                Kurikirana uko umusaruro
                ugezwaho umuguzi.
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
            setShowMyProducts(false);
            setPage("home");
          }}
        >
          ← SUBIRA AHABANZA
        </button>

      </div>
    );
  }

  // ============================================================
  // UMWOROZI
  // ============================================================

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
              ➕ SHYIRA KU ISOKO
            </h2>

            <p>
              Shyira amatungo cyangwa
              umusaruro w'ubworozi ufite.
            </p>

            <button>
              SHYIRA KU ISOKO
            </button>
          </div>

          <div className="card">
            <h2>
              📦 UMUSARURO WANJYE
            </h2>

            <p>
              Reba amatungo n'umusaruro
              w'ubworozi.
            </p>

            <button>
              REBA UMUSARURO
            </button>
          </div>

          <div className="card">
            <h2>
              🛒 KOMANDE
            </h2>

            <p>
              Reba KOMANDE zatanzwe
              ku musaruro wawe.
            </p>

            <button>
              REBA KOMANDE
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
          onClick={() =>
            setPage("home")
          }
        >
          ← SUBIRA AHABANZA
        </button>

      </div>
    );
  }

  // ============================================================
  // UMUHUZA
  // ============================================================

  if (page === "agent") {

    // ==========================================================
    // KOMANDE Z'ABAGUZI
    // ==========================================================

    if (showAgentOrders) {
      return (
        <div className="dashboard">

          <div className="role-header">

            <div className="big-role-icon">
              🤝
            </div>

            <h1>UMUHUZA</h1>

            <h2>
              🛒 KOMANDE Z'ABAGUZI
            </h2>

            <p>
              Reba KOMANDE zitegereje
              kugenzurwa.
            </p>

          </div>

          <div className="cards">

            {pendingOrders.length === 0 ? (

              <div className="card">

                <h2>
                  📦 NTA KOMANDE
                </h2>

                <p>
                  Kugeza ubu nta KOMANDE
                  itegereje kugenzurwa.
                </p>

              </div>

            ) : (

              pendingOrders.map(
                (order) => (

                  <div
                    key={order.id}
                    className="card"
                    style={{
                      textAlign: "left",
                      padding: "25px",
                    }}
                  >

                    <h2>
                      🛒 {order.productName}
                    </h2>

                    {/* ==================================================
                        BUYER INFORMATION
                    ================================================== */}

                    <p>
                      <strong>
                        Izina ry'umuguzi:
                      </strong>{" "}
                      {order.buyerName}
                    </p>

                    <p>
                      <strong>
                        Telefoni y'umuguzi:
                      </strong>{" "}
                      {order.buyerPhone}
                    </p>

                    <p>
                      <strong>
                        Aho umuguzi azakiririra:
                      </strong>{" "}
                      {order.deliveryLocation}
                    </p>

                    {/* ==================================================
                        PRODUCT INFORMATION
                    ================================================== */}

                    <p>
                      <strong>
                        Ubwoko:
                      </strong>{" "}
                      {order.productType}
                    </p>

                    <p>
                      <strong>
                        Ingano yasabwe:
                      </strong>{" "}
                      {order.requestedQuantity}{" "}
                      {order.unit}
                    </p>

                    <p>
                      <strong>
                        Ingano ihari:
                      </strong>{" "}
                      {order.availableQuantity}{" "}
                      {order.unit}
                    </p>

                    <p>
                      <strong>
                        Igiciro:
                      </strong>{" "}
                      {order.price} RWF
                    </p>

                    {/* ==================================================
                        FARMER INFORMATION
                    ================================================== */}

                    <p>
                      <strong>
                        Telefoni y'umuhinzi:
                      </strong>{" "}
                      {order.farmerPhone}
                    </p>

                    <p>
                      <strong>
                        Intara:
                      </strong>{" "}
                      {order.province}
                    </p>

                    <p>
                      <strong>
                        Akarere:
                      </strong>{" "}
                      {order.district}
                    </p>

                    <p>
                      <strong>
                        Umurenge:
                      </strong>{" "}
                      {order.sector}
                    </p>

                    <p>
                      <strong>
                        Akagari:
                      </strong>{" "}
                      {order.cell}
                    </p>

                    <p>
                      <strong>
                        Umudugudu:
                      </strong>{" "}
                      {order.village}
                    </p>

                    <p>
                      <strong>
                        Itariki ya KOMANDE:
                      </strong>{" "}
                      {order.orderDate}
                    </p>

                    <div
                      style={{
                        marginTop: "15px",
                        padding: "12px",
                        borderRadius: "10px",
                        background: "#fff3cd",
                        color: "#856404",
                        fontWeight: "800",
                        textAlign: "center",
                      }}
                    >
                      🟡 TEGEREJE UMUHUZA
                    </div>

                  </div>

                )
              )

            )}

          </div>

          <button
            className="back"
            type="button"
            onClick={() =>
              setShowAgentOrders(false)
            }
          >
            ← SUBIRA KURI UMUHUZA
          </button>

          <button
            className="back"
            type="button"
            onClick={() => {
              setShowAgentOrders(false);
              setPage("home");
            }}
          >
            ← SUBIRA AHABANZA
          </button>

        </div>
      );
    }

    // ==========================================================
    // PENDING PRODUCTS
    // ==========================================================

    if (showPendingProducts) {
      return (
        <div className="dashboard">

          <div className="role-header">

            <div className="big-role-icon">
              🤝
            </div>

            <h1>UMUHUZA</h1>

            <h2>
              UMUSARURO UTARAGENZURWA
            </h2>

            <p>
              Kugenzura umusaruro
              utaragenzurwa
            </p>

          </div>

          <div className="card product-form-card">

            <button
              type="button"
              onClick={() =>
                setShowPendingProducts(false)
              }
            >
              ← SUBIRA KURI UMUHUZA
            </button>

            {pendingProducts.length === 0 ? (

              <div
                style={{
                  marginTop: "25px",
                  padding: "30px",
                  borderRadius: "15px",
                  background: "#f5f8f6",
                  textAlign: "center",
                }}
              >

                <h3>
                  Nta musaruro utegereje
                  kugenzurwa.
                </h3>

              </div>

            ) : (

              <div
                style={{
                  display: "grid",
                  gap: "20px",
                  marginTop: "25px",
                }}
              >

                {pendingProducts.map(
                  (product) => (

                    <div
                      key={product.id}
                      className="card"
                      style={{
                        textAlign: "left",
                        padding: "25px",
                      }}
                    >

                      <h3>
                        {product.name}
                      </h3>

                      <p>
                        <strong>
                          Ubwoko:
                        </strong>{" "}
                        {product.type}
                      </p>

                      <p>
                        <strong>
                          Ingano:
                        </strong>{" "}
                        {product.quantity}{" "}
                        {product.unit}
                      </p>

                      <p>
                        <strong>
                          Igiciro:
                        </strong>{" "}
                        {product.price} RWF
                      </p>

                      <p>
                        <strong>
                          Intara:
                        </strong>{" "}
                        {product.province}
                      </p>

                      <p>
                        <strong>
                          Akarere:
                        </strong>{" "}
                        {product.district}
                      </p>

                      <p>
                        <strong>
                          Umurenge:
                        </strong>{" "}
                        {product.sector}
                      </p>

                      <p>
                        <strong>
                          Akagari:
                        </strong>{" "}
                        {product.cell}
                      </p>

                      <p>
                        <strong>
                          Umudugudu:
                        </strong>{" "}
                        {product.village}
                      </p>

                      <p>
                        <strong>
                          Telefoni:
                        </strong>{" "}
                        {product.phone}
                      </p>

                      <p>
                        <strong>
                          Itariki yashyiriweho:
                        </strong>{" "}
                        {product.createdAt}
                      </p>

                      <div
                        style={{
                          marginTop: "15px",
                          padding: "12px",
                          borderRadius: "10px",
                          background: "#fff3cd",
                          color: "#856404",
                          fontWeight: "800",
                          textAlign: "center",
                        }}
                      >
                        🟡 NTABWO WAGENZUWE
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleVerifyProduct(
                            product.id
                          )
                        }
                        style={{
                          marginTop: "15px",
                        }}
                      >
                        🔎 AGENZURE UMUSARURO
                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

          <button
            className="back"
            type="button"
            onClick={() => {
              setShowPendingProducts(false);
              setPage("home");
            }}
          >
            ← SUBIRA AHABANZA
          </button>

        </div>
      );
    }

    // ==========================================================
    // VERIFIED PRODUCTS
    // ==========================================================

    if (showVerifiedProducts) {
      return (
        <div className="dashboard">

          <div className="role-header">

            <div className="big-role-icon">
              🤝
            </div>

            <h1>UMUHUZA</h1>

            <h2>
              🟠 WAGENZUWE —
              NTABWO WEMEJWE
            </h2>

            <p>
              Umusaruro wagenzuwe
              ariko utaremezwa
            </p>

          </div>

          <div className="card product-form-card">

            <button
              type="button"
              onClick={() =>
                setShowVerifiedProducts(false)
              }
            >
              ← SUBIRA KURI UMUHUZA
            </button>

            {verifiedProducts.length === 0 ? (

              <div
                style={{
                  marginTop: "25px",
                  padding: "30px",
                  borderRadius: "15px",
                  background: "#f5f8f6",
                  textAlign: "center",
                }}
              >

                <h3>
                  Nta musaruro wagenzuwe
                  utaremezwa.
                </h3>

              </div>

            ) : (

              <div
                style={{
                  display: "grid",
                  gap: "20px",
                  marginTop: "25px",
                }}
              >

                {verifiedProducts.map(
                  (product) => (

                    <div
                      key={product.id}
                      className="card"
                      style={{
                        textAlign: "left",
                        padding: "25px",
                      }}
                    >

                      <h3>
                        {product.name}
                      </h3>

                      <p>
                        <strong>
                          Ubwoko:
                        </strong>{" "}
                        {product.type}
                      </p>

                      <p>
                        <strong>
                          Ingano:
                        </strong>{" "}
                        {product.quantity}{" "}
                        {product.unit}
                      </p>

                      <p>
                        <strong>
                          Igiciro:
                        </strong>{" "}
                        {product.price} RWF
                      </p>

                      <p>
                        <strong>
                          Intara:
                        </strong>{" "}
                        {product.province}
                      </p>

                      <p>
                        <strong>
                          Akarere:
                        </strong>{" "}
                        {product.district}
                      </p>

                      <p>
                        <strong>
                          Umurenge:
                        </strong>{" "}
                        {product.sector}
                      </p>

                      <p>
                        <strong>
                          Akagari:
                        </strong>{" "}
                        {product.cell}
                      </p>

                      <p>
                        <strong>
                          Umudugudu:
                        </strong>{" "}
                        {product.village}
                      </p>

                      <p>
                        <strong>
                          Telefoni:
                        </strong>{" "}
                        {product.phone}
                      </p>

                      <p>
                        <strong>
                          Itariki yashyiriweho:
                        </strong>{" "}
                        {product.createdAt}
                      </p>

                      <p>
                        <strong>
                          Itariki wagenzuwe:
                        </strong>{" "}
                        {product.verifiedAt}
                      </p>

                      <div
                        style={{
                          marginTop: "15px",
                          padding: "15px",
                          borderRadius: "10px",
                          background: "#ffe8cc",
                          color: "#9a4d00",
                          fontWeight: "800",
                        }}
                      >

                        <div
                          style={{
                            textAlign: "center",
                            marginBottom: "10px",
                          }}
                        >
                          🟠 WAGENZUWE —
                          NTABWO WEMEJWE
                        </div>

                        <div
                          style={{
                            background: "#fff",
                            padding: "12px",
                            borderRadius: "8px",
                          }}
                        >

                          <strong>
                            IMPAMVU:
                          </strong>

                          <p>
                            {
                              product.verificationReason
                            }
                          </p>

                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleApproveProduct(
                            product.id
                          )
                        }
                        style={{
                          marginTop: "15px",
                        }}
                      >
                        🟢 YEMEZA UMUSARURO
                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

          <button
            className="back"
            type="button"
            onClick={() => {
              setShowVerifiedProducts(false);
              setPage("home");
            }}
          >
            ← SUBIRA AHABANZA
          </button>

        </div>
      );
    }

    // ==========================================================
    // APPROVED PRODUCTS
    // ==========================================================

    if (showApprovedProducts) {
      return (
        <div className="dashboard">

          <div className="role-header">

            <div className="big-role-icon">
              🤝
            </div>

            <h1>UMUHUZA</h1>

            <h2>
              🟢 UMUSARURO WEMEJWE
            </h2>

            <p>
              Umusaruro umaze kugenzurwa
              no kwemezwa
            </p>

          </div>

          <div className="card product-form-card">

            <button
              type="button"
              onClick={() =>
                setShowApprovedProducts(false)
              }
            >
              ← SUBIRA KURI UMUHUZA
            </button>

            {approvedProducts.length === 0 ? (

              <div
                style={{
                  marginTop: "25px",
                  padding: "30px",
                  borderRadius: "15px",
                  background: "#f5f8f6",
                  textAlign: "center",
                }}
              >

                <h3>
                  Nta musaruro wemejwe uraboneka.
                </h3>

              </div>

            ) : (

              <div
                style={{
                  display: "grid",
                  gap: "20px",
                  marginTop: "25px",
                }}
              >

                {approvedProducts.map(
                  (product) => (

                    <div
                      key={product.id}
                      className="card"
                      style={{
                        textAlign: "left",
                        padding: "25px",
                      }}
                    >

                      <h3>
                        {product.name}
                      </h3>

                      <p>
                        <strong>
                          Ubwoko:
                        </strong>{" "}
                        {product.type}
                      </p>

                      <p>
                        <strong>
                          Ingano:
                        </strong>{" "}
                        {product.quantity}{" "}
                        {product.unit}
                      </p>

                      <p>
                        <strong>
                          Igiciro:
                        </strong>{" "}
                        {product.price} RWF
                      </p>

                      <p>
                        <strong>
                          Intara:
                        </strong>{" "}
                        {product.province}
                      </p>

                      <p>
                        <strong>
                          Akarere:
                        </strong>{" "}
                        {product.district}
                      </p>

                      <p>
                        <strong>
                          Umurenge:
                        </strong>{" "}
                        {product.sector}
                      </p>

                      <p>
                        <strong>
                          Akagari:
                        </strong>{" "}
                        {product.cell}
                      </p>

                      <p>
                        <strong>
                          Umudugudu:
                        </strong>{" "}
                        {product.village}
                      </p>

                      <p>
                        <strong>
                          Telefoni:
                        </strong>{" "}
                        {product.phone}
                      </p>

                      <p>
                        <strong>
                          Itariki yashyiriweho:
                        </strong>{" "}
                        {product.createdAt}
                      </p>

                      <p>
                        <strong>
                          Itariki yemejwe:
                        </strong>{" "}
                        {product.approvedAt}
                      </p>

                      <div
                        style={{
                          marginTop: "15px",
                          padding: "12px",
                          borderRadius: "10px",
                          background: "#d4edda",
                          color: "#155724",
                          fontWeight: "800",
                          textAlign: "center",
                        }}
                      >
                        🟢 WEMEJWE
                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

          <button
            className="back"
            type="button"
            onClick={() => {
              setShowApprovedProducts(false);
              setPage("home");
            }}
          >
            ← SUBIRA AHABANZA
          </button>

        </div>
      );
    }

    // ==========================================================
    // UMUHUZA HOME
    // ==========================================================

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
              Reba umusaruro utaragenzurwa.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowPendingProducts(true);
                setShowVerifiedProducts(false);
                setShowApprovedProducts(false);
                setShowAgentOrders(false);
              }}
            >
              AGENZURE
            </button>

          </div>

          <div className="card">

            <h2>
              🟠 WAGENZUWE —
              NTABWO WEMEJWE
            </h2>

            <p>
              Reba umusaruro wagenzuwe
              ariko utaremezwa.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowVerifiedProducts(true);
                setShowPendingProducts(false);
                setShowApprovedProducts(false);
                setShowAgentOrders(false);
              }}
            >
              REBA IMPAMVU
            </button>

          </div>

          <div className="card">

            <h2>
              🟢 UMUSARURO WEMEJWE
            </h2>

            <p>
              Reba umusaruro wemejwe
              ushobora kubonwa n'abaguzi.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowApprovedProducts(true);
                setShowPendingProducts(false);
                setShowVerifiedProducts(false);
                setShowAgentOrders(false);
              }}
            >
              REBA WEMEJWE
            </button>

          </div>

          <div className="card">

            <h2>
              🛒 KOMANDE
            </h2>

            <p>
              Reba KOMANDE z'abaguzi
              zitegereje kugenzurwa.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowAgentOrders(true);
                setShowPendingProducts(false);
                setShowVerifiedProducts(false);
                setShowApprovedProducts(false);
              }}
            >
              REBA KOMANDE
            </button>

          </div>

          <div className="card">

            <h2>
              🚚 DELIVERY
            </h2>

            <p>
              Kurikirana itangwa ry'umusaruro
              ku muguzi.
            </p>

            <button
              type="button"
            >
              REBA DELIVERY
            </button>

          </div>

        </div>

        <button
          className="back"
          type="button"
          onClick={() => {
            setShowPendingProducts(false);
            setShowVerifiedProducts(false);
            setShowApprovedProducts(false);
            setShowAgentOrders(false);
            setPage("home");
          }}
        >
          ← SUBIRA AHABANZA
        </button>

      </div>
    );
  }

  // ============================================================
  // UMUGUZI
  // ============================================================

  if (page === "buyer") {

    const buyerApprovedProducts =
      myProducts.filter(
        (product) =>
          product.status === "WEMEJWE"
      );

    // ==========================================================
    // TANGA KOMANDE
    // ==========================================================

    if (
      showOrderForm &&
      selectedBuyerProduct
    ) {
      return (
        <div className="dashboard">

          <div className="role-header">

            <div className="big-role-icon">
              🛒
            </div>

            <h1>UMUGUZI</h1>

            <h2>
              🛒 TANGA KOMANDE
            </h2>

            <p>
              Tanga KOMANDE ku musaruro
              wemejwe.
            </p>

          </div>

          <div className="card product-form-card">

            <h2>
              {selectedBuyerProduct.name}
            </h2>

            <p>
              <strong>
                Ubwoko:
              </strong>{" "}
              {selectedBuyerProduct.type}
            </p>

            <p>
              <strong>
                Ingano ihari:
              </strong>{" "}
              {selectedBuyerProduct.quantity}{" "}
              {selectedBuyerProduct.unit}
            </p>

            <p>
              <strong>
                Igiciro:
              </strong>{" "}
              {selectedBuyerProduct.price} RWF
            </p>

            <div
              style={{
                marginTop: "15px",
                marginBottom: "20px",
                padding: "12px",
                borderRadius: "10px",
                background: "#d4edda",
                color: "#155724",
                fontWeight: "800",
                textAlign: "center",
              }}
            >
              🟢 WEMEJWE
            </div>

            <form
              onSubmit={
                handleBuyerOrderSubmit
              }
            >

              {/* ==================================================
                  BUYER NAME
              ================================================== */}

              <div>

                <label>
                  Izina ry'umuguzi
                </label>

                <input
                  type="text"
                  name="buyerName"
                  value={
                    buyerOrder.buyerName
                  }
                  onChange={
                    handleBuyerOrderChange
                  }
                  placeholder="Urugero: Jean de Dieu"
                  required
                />

              </div>

              {/* ==================================================
                  QUANTITY
              ================================================== */}

              <div>

                <label>
                  Ingano nshaka (
                  {selectedBuyerProduct.unit}
                  )
                </label>

                <input
                  type="number"
                  name="quantity"
                  value={
                    buyerOrder.quantity
                  }
                  onChange={
                    handleBuyerOrderChange
                  }
                  placeholder={
                    "Urugero: 100 " +
                    selectedBuyerProduct.unit
                  }
                  min="1"
                  max={
                    selectedBuyerProduct.quantity
                  }
                  required
                />

              </div>

              {/* ==================================================
                  DELIVERY LOCATION
              ================================================== */}

              <div>

                <label>
                  Aho nzakirira
                </label>

                <input
                  type="text"
                  name="deliveryLocation"
                  value={
                    buyerOrder.deliveryLocation
                  }
                  onChange={
                    handleBuyerOrderChange
                  }
                  placeholder="Urugero: Kigali, Gasabo"
                  required
                />

              </div>

              {/* ==================================================
                  BUYER PHONE
              ================================================== */}

              <div>

                <label>
                  Telefoni y'umuguzi
                </label>

                <input
                  type="tel"
                  name="buyerPhone"
                  value={
                    buyerOrder.buyerPhone
                  }
                  onChange={
                    handleBuyerOrderChange
                  }
                  placeholder="Urugero: 078..."
                  required
                />

              </div>

              <button type="submit">
                🛒 TANGA KOMANDE
              </button>

            </form>

          </div>

          <button
            className="back"
            type="button"
            onClick={() => {
              setShowOrderForm(false);
              setSelectedBuyerProduct(null);
            }}
          >
            ← SUBIRA KU MUSARURO
          </button>

        </div>
      );
    }

    // ==========================================================
    // SHAKISHA UMUSARURO
    // ==========================================================

    if (showBuyerProducts) {
      return (
        <div className="dashboard">

          <div className="role-header">

            <div className="big-role-icon">
              🛒
            </div>

            <h1>UMUGUZI</h1>

            <h2>
              UMUSARURO WEMEJWE
            </h2>

            <p>
              Umusaruro wemejwe
              n'umuhuza gusa.
            </p>

          </div>

          <div className="cards">

            {buyerApprovedProducts.length ===
            0 ? (

              <div className="card">

                <h2>
                  📦 NTA MUSARURO WEMEJWE
                </h2>

                <p>
                  Kugeza ubu nta musaruro
                  wemejwe uri kuboneka.
                </p>

              </div>

            ) : (

              buyerApprovedProducts.map(
                (product) => (

                  <div
                    key={product.id}
                    className="card"
                    style={{
                      textAlign: "left",
                      padding: "25px",
                    }}
                  >

                    <h3>
                      {product.name}
                    </h3>

                    <p>
                      <strong>
                        Ubwoko:
                      </strong>{" "}
                      {product.type}
                    </p>

                    <p>
                      <strong>
                        Ingano:
                      </strong>{" "}
                      {product.quantity}{" "}
                      {product.unit}
                    </p>

                    <p>
                      <strong>
                        Igiciro:
                      </strong>{" "}
                      {product.price} RWF
                    </p>

                    <p>
                      <strong>
                        Intara:
                      </strong>{" "}
                      {product.province}
                    </p>

                    <p>
                      <strong>
                        Akarere:
                      </strong>{" "}
                      {product.district}
                    </p>

                    <p>
                      <strong>
                        Umurenge:
                      </strong>{" "}
                      {product.sector}
                    </p>

                    <p>
                      <strong>
                        Akagari:
                      </strong>{" "}
                      {product.cell}
                    </p>

                    <p>
                      <strong>
                        Umudugudu:
                      </strong>{" "}
                      {product.village}
                    </p>

                    <p>
                      <strong>
                        Telefoni:
                      </strong>{" "}
                      {product.phone}
                    </p>

                    <p>
                      <strong>
                        Itariki yashyiriweho:
                      </strong>{" "}
                      {product.createdAt}
                    </p>

                    {product.approvedAt && (
                      <p>
                        <strong>
                          Itariki yemejwe:
                        </strong>{" "}
                        {product.approvedAt}
                      </p>
                    )}

                    <div
                      style={{
                        marginTop: "15px",
                        padding: "12px",
                        borderRadius: "10px",
                        background: "#d4edda",
                        color: "#155724",
                        fontWeight: "800",
                        textAlign: "center",
                      }}
                    >
                      🟢 WEMEJWE
                    </div>

                    <button
                      type="button"
                      onClick={() => {

                        setSelectedBuyerProduct(
                          product
                        );

                        setBuyerOrder({
                          buyerName: "",
                          quantity: "",
                          deliveryLocation: "",
                          buyerPhone: "",
                        });

                        setShowOrderForm(true);

                      }}
                      style={{
                        marginTop: "15px",
                      }}
                    >
                      🛒 TANGA KOMANDE
                    </button>

                  </div>

                )
              )

            )}

          </div>

          <button
            className="back"
            type="button"
            onClick={() => {
              setShowBuyerProducts(false);
              setShowOrderForm(false);
              setSelectedBuyerProduct(null);
            }}
          >
            ← SUBIRA KURI UMUSARURO
          </button>

          <button
            className="back"
            type="button"
            onClick={() => {
              setShowBuyerProducts(false);
              setShowOrderForm(false);
              setSelectedBuyerProduct(null);
              setPage("home");
            }}
          >
            ← SUBIRA AHABANZA
          </button>

        </div>
      );
    }

    // ==========================================================
    // UMUGUZI HOME
    // ==========================================================

    return (
      <div className="dashboard">

        <div className="role-header">

          <div className="big-role-icon">
            🛒
          </div>

          <h1>UMUGUZI</h1>

          <h2>
            ABAGUZI
          </h2>

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
              Shakisha umusaruro
              wemejwe n'umuhuza.
            </p>

            <button
              type="button"
              onClick={() =>
                setShowBuyerProducts(true)
              }
            >
              SHAKISHA
            </button>

          </div>

          <div className="card">

            <h2>
              🛒 TANGA KOMANDE
            </h2>

            <p>
              Hitamo umusaruro ushaka
              utange KOMANDE.
            </p>

            <button
              type="button"
              onClick={() => {
                alert(
                  "Banza ushakishe umusaruro WEMEJWE."
                );
              }}
            >
              TANGA KOMANDE
            </button>

          </div>

          <div className="card">

            <h2>
              📋 KOMANDE ZANJYE
            </h2>

            <p>
              Reba KOMANDE watanze
              n'uko zihagaze.
            </p>

            <button
              type="button"
              onClick={() => {
                alert(
                  "KOMANDE ZANJYE izakorwa mu ntambwe ikurikira."
                );
              }}
            >
              REBA KOMANDE
            </button>

          </div>

          <div className="card">

            <h2>
              🚚 DELIVERY
            </h2>

            <p>
              Kurikirana uko umusaruro
              uri kugera aho wifuza.
            </p>

            <button
              type="button"
              onClick={() => {
                alert(
                  "DELIVERY izakorwa mu ntambwe ikurikira."
                );
              }}
            >
              KURIKIRANA
            </button>

          </div>

        </div>

        <button
          className="back"
          type="button"
          onClick={() =>
            setPage("home")
          }
        >
          ← SUBIRA AHABANZA
        </button>

      </div>
    );
  }

  // ============================================================
  // HOME
  // ============================================================

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
          Huza umuhinzi cyangwa umworozi
          n'umuguzi, umuhuza agenzure
          umusaruro mbere ya KOMANDE.
        </p>

      </div>

      <div className="roles">

        <button
          className="farmer"
          onClick={() =>
            setPage("farmer")
          }
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
          onClick={() =>
            setPage("livestock")
          }
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
          onClick={() =>
            setPage("agent")
          }
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
          onClick={() => {

            setShowBuyerProducts(false);

            setShowOrderForm(false);

            setSelectedBuyerProduct(null);

            setPage("buyer");

          }}
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