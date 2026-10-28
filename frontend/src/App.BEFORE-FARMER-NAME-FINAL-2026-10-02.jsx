import { useEffect, useState } from "react";

const districtsByProvince = {
  "Umujyi wa Kigali": [
    "Gasabo",
    "Kicukiro",
    "Nyarugenge",
  ],

  "Amajyepfo": [
    "Gisagara",
    "Huye",
    "Kamonyi",
    "Muhanga",
    "Nyamagabe",
    "Nyanza",
    "Nyaruguru",
    "Ruhango",
  ],

  "Iburengerazuba": [
    "Karongi",
    "Ngororero",
    "Nyabihu",
    "Nyamasheke",
    "Rubavu",
    "Rusizi",
    "Rutsiro",
  ],

  "Iburasirazuba": [
    "Bugesera",
    "Gatsibo",
    "Kayonza",
    "Kirehe",
    "Ngoma",
    "Nyagatare",
    "Rwamagana",
  ],

  "Amajyaruguru": [
    "Burera",
    "Gakenke",
    "Gicumbi",
    "Musanze",
    "Rulindo",
  ],
};

const GIS_BASE =
  "https://moegis.environment.gov.rw/server/rest/services/Hosted/Administrative_boundaries/FeatureServer";

function App() {
  const [page, setPage] = useState("home");

  // =========================
  // FARMER
  // =========================

  const [showFarmerProductForm, setShowFarmerProductForm] =
    useState(false);

  const [showMyProducts, setShowMyProducts] =
    useState(false);

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

  // =========================
  // LOCATION DROPDOWNS
  // =========================

  const [availableSectors, setAvailableSectors] =
    useState([]);

  const [availableCells, setAvailableCells] =
    useState([]);

  const [availableVillages, setAvailableVillages] =
    useState([]);

  // =========================
  // UMUHUZA
  // =========================

  const [showPendingProducts, setShowPendingProducts] =
    useState(false);

  const [showVerifiedProducts, setShowVerifiedProducts] =
    useState(false);

  const [showApprovedProducts, setShowApprovedProducts] =
    useState(false);

  const [showAgentOrders, setShowAgentOrders] =
    useState(false);

  const [showApprovedOrders, setShowApprovedOrders] =
    useState(false);

  const [showRejectedOrders, setShowRejectedOrders] =
    useState(false);

  // =========================
  // UMUGUZI
  // =========================

  const [showBuyerProducts, setShowBuyerProducts] =
    useState(false);

  const [selectedBuyerProduct, setSelectedBuyerProduct] =
    useState(null);

  const [showOrderForm, setShowOrderForm] =
    useState(false);

  // =========================
  // KOMANDE
  // =========================

  const [orders, setOrders] = useState([]);

  const [buyerOrder, setBuyerOrder] = useState({
    buyerName: "",
    quantity: "",
    deliveryLocation: "",
    buyerPhone: "",
  });

  // =========================
  // AKARERE
  // =========================

  const availableDistricts =
    districtsByProvince[
      farmerProduct.province
    ] || [];

  // =========================
  // LOAD IMIRENGE
  // AKARERE → UMURENGE
  // =========================

  useEffect(() => {
    if (!farmerProduct.district) {
      setAvailableSectors([]);
      return;
    }

    const loadSectors = async () => {
      try {
        const where = encodeURIComponent(
          `district='${farmerProduct.district}'`
        );

        const url =
          `${GIS_BASE}/1/query` +
          `?where=${where}` +
          "&outFields=sector" +
          "&returnGeometry=false" +
          "&orderByFields=sector" +
          "&f=json";

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            "Failed to load sectors"
          );
        }

        const data = await response.json();

        const sectors = [
          ...new Set(
            (data.features || [])
              .map(
                (item) =>
                  item.attributes?.sector
              )
              .filter(Boolean)
          ),
        ];

        setAvailableSectors(sectors);
      } catch (error) {
        console.error(
          "Sector loading error:",
          error
        );

        setAvailableSectors([]);

        alert(
          "Imirenge ntiyabonetse. Ongera ugerageze."
        );
      }
    };

    loadSectors();
  }, [farmerProduct.district]);

  // =========================
  // LOAD UTUGARI
  // UMURENGE → AKAGARI
  // =========================

  useEffect(() => {
    if (
      !farmerProduct.district ||
      !farmerProduct.sector
    ) {
      setAvailableCells([]);
      return;
    }

    const loadCells = async () => {
      try {
        const where = encodeURIComponent(
          `district='${farmerProduct.district}' AND sector='${farmerProduct.sector}'`
        );

        const url =
          `${GIS_BASE}/2/query` +
          `?where=${where}` +
          "&outFields=cell" +
          "&returnGeometry=false" +
          "&orderByFields=cell" +
          "&f=json";

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            "Failed to load cells"
          );
        }

        const data = await response.json();

        const cells = [
          ...new Set(
            (data.features || [])
              .map(
                (item) =>
                  item.attributes?.cell
              )
              .filter(Boolean)
          ),
        ];

        setAvailableCells(cells);
      } catch (error) {
        console.error(
          "Cell loading error:",
          error
        );

        setAvailableCells([]);

        alert(
          "Utugari ntitwabashije kuboneka. Ongera ugerageze."
        );
      }
    };

    loadCells();
  }, [
    farmerProduct.district,
    farmerProduct.sector,
  ]);

  // =========================
  // LOAD IMIDUGUDU
  // AKAGARI → UMUDUGUDU
  // =========================

  useEffect(() => {
    if (
      !farmerProduct.sector ||
      !farmerProduct.cell
    ) {
      setAvailableVillages([]);
      return;
    }

    const loadVillages = async () => {
      try {
        const where = encodeURIComponent(
          `sector='${farmerProduct.sector}' AND cell='${farmerProduct.cell}'`
        );

        const url =
          `${GIS_BASE}/3/query` +
          `?where=${where}` +
          "&outFields=village" +
          "&returnGeometry=false" +
          "&orderByFields=village" +
          "&f=json";

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            "Failed to load villages"
          );
        }

        const data = await response.json();

        const villages = [
          ...new Set(
            (data.features || [])
              .map(
                (item) =>
                  item.attributes?.village
              )
              .filter(Boolean)
          ),
        ];

        setAvailableVillages(villages);
      } catch (error) {
        console.error(
          "Village loading error:",
          error
        );

        setAvailableVillages([]);

        alert(
          "Imidugudu ntibashije kuboneka. Ongera ugerageze."
        );
      }
    };

    loadVillages();
  }, [
    farmerProduct.sector,
    farmerProduct.cell,
  ]);

  // =========================
  // FARMER PRODUCT SUBMIT
  // =========================

  const handleFarmerProductSubmit = (e) => {
    e.preventDefault();

    if (!farmerProduct.name.trim()) {
      alert("Andika izina ry'umusaruro.");
      return;
    }

    if (!farmerProduct.type.trim()) {
      alert("Hitamo ubwoko bw'umusaruro.");
      return;
    }

    if (!farmerProduct.quantity) {
      alert("Andika ingano y'umusaruro.");
      return;
    }

    if (!farmerProduct.unit.trim()) {
      alert("Hitamo igipimo.");
      return;
    }

    if (!farmerProduct.province) {
      alert("Hitamo Intara.");
      return;
    }

    if (!farmerProduct.district) {
      alert("Hitamo Akarere.");
      return;
    }

    if (!farmerProduct.sector) {
      alert("Hitamo Umurenge.");
      return;
    }

    if (!farmerProduct.cell) {
      alert("Hitamo Akagari.");
      return;
    }

    if (!farmerProduct.village) {
      alert("Hitamo Umudugudu.");
      return;
    }

    if (!farmerProduct.phone.trim()) {
      alert("Andika telefoni y'umuhinzi.");
      return;
    }

    const newProduct = {
      ...farmerProduct,
      id: Date.now(),
      status: "NTABWO WAGENZUWE",
      createdAt:
        new Date().toLocaleDateString("rw-RW"),
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

    setAvailableSectors([]);
    setAvailableCells([]);
    setAvailableVillages([]);

    setShowFarmerProductForm(false);
  };

  // =========================
  // VERIFY PRODUCT
  // =========================

  const handleVerifyProduct = (productId) => {
    const reason = window.prompt(
      "ANDIKA IMPAMVU UMUSARURO UTAREMEJWE:"
    );

    if (reason === null) return;

    if (!reason.trim()) {
      alert("Ugomba kwandika IMPAMVU.");
      return;
    }

    setMyProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,
              status:
                "WAGENZUWE — NTABWO WEMEJWE",
              verificationReason:
                reason.trim(),
              verifiedAt:
                new Date().toLocaleDateString(
                  "rw-RW"
                ),
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

  // =========================
  // APPROVE PRODUCT
  // =========================

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
                new Date().toLocaleDateString(
                  "rw-RW"
                ),
            }
          : product
      )
    );

    alert(
      "Umusaruro wemejwe neza.\n\n" +
        "Status: WEMEJWE"
    );
  };

  // =========================
  // BUYER ORDER
  // =========================

  const handleBuyerOrderSubmit = (e) => {
    e.preventDefault();

    if (!selectedBuyerProduct) {
      alert("Hitamo umusaruro ubanza.");
      return;
    }

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
        "Andika aho uzakirira umusaruro."
      );
      return;
    }

    if (!buyerOrder.buyerPhone.trim()) {
      alert(
        "Andika telefoni y'umuguzi."
      );
      return;
    }

    const newOrder = {
      id: Date.now(),
      buyerName:
        buyerOrder.buyerName.trim(),
      buyerPhone:
        buyerOrder.buyerPhone.trim(),
      deliveryLocation:
        buyerOrder.deliveryLocation.trim(),
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
      orderDate:
        new Date().toLocaleDateString(
          "rw-RW"
        ),
      status: "TEGEREJE UMUHUZA",
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

    setBuyerOrder({
      buyerName: "",
      quantity: "",
      deliveryLocation: "",
      buyerPhone: "",
    });

    setSelectedBuyerProduct(null);
    setShowOrderForm(false);
  };

  // =========================
  // APPROVE ORDER
  // =========================

  const handleApproveOrder = (orderId) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status:
                "YEMEJWE N'UMUHUZA",
              approvedAt:
                new Date().toLocaleDateString(
                  "rw-RW"
                ),
            }
          : order
      )
    );

    alert(
      "KOMANDE YEMEJWE.\n\n" +
        "Status: YEMEJWE N'UMUHUZA"
    );
  };

  // =========================
  // REJECT ORDER
  // =========================

  const handleRejectOrder = (orderId) => {
    const reason = window.prompt(
      "ANDIKA IMPAMVU KOMANDE YANZWE:"
    );

    if (reason === null) return;

    if (!reason.trim()) {
      alert("Ugomba kwandika IMPAMVU.");
      return;
    }

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status:
                "YANZWE N'UMUHUZA",
              rejectionReason:
                reason.trim(),
              rejectedAt:
                new Date().toLocaleDateString(
                  "rw-RW"
                ),
            }
          : order
      )
    );

    alert(
      "KOMANDE YANZWE.\n\n" +
        "Status: YANZWE N'UMUHUZA\n\n" +
        "IMPAMVU: " +
        reason.trim()
    );
  };

  // =========================
  // FILTERS
  // =========================

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

  const pendingOrders =
    orders.filter(
      (order) =>
        order.status ===
        "TEGEREJE UMUHUZA"
    );

  const approvedOrders =
    orders.filter(
      (order) =>
        order.status ===
        "YEMEJWE N'UMUHUZA"
    );

  const rejectedOrders =
    orders.filter(
      (order) =>
        order.status ===
        "YANZWE N'UMUHUZA"
    );

  // =========================
  // FARMER PAGE
  // =========================

  if (page === "farmer") {
    if (showFarmerProductForm) {
      return (
        <div style={styles.page}>
          <button
            onClick={() =>
              setShowFarmerProductForm(false)
            }
          >
            ← SUBIRA
          </button>

          <h1>➕ SHYIRA KU ISOKO</h1>

          <form
            onSubmit={
              handleFarmerProductSubmit
            }
            style={styles.card}
          >
            <input
              placeholder="Izina ry'umusaruro"
              value={farmerProduct.name}
              onChange={(e) =>
                setFarmerProduct({
                  ...farmerProduct,
                  name: e.target.value,
                })
              }
              style={styles.input}
            />

            <select
              value={farmerProduct.type}
              onChange={(e) =>
                setFarmerProduct({
                  ...farmerProduct,
                  type: e.target.value,
                })
              }
              style={styles.input}
            >
              <option value="">
                Hitamo ubwoko
              </option>

              <option value="UBUHINZI">
                UBUHINZI
              </option>

              <option value="UBWOROZI">
                UBWOROZI
              </option>
            </select>

            <input
              type="file"
              onChange={(e) =>
                setFarmerProduct({
                  ...farmerProduct,
                  media:
                    e.target.files?.[0] ||
                    null,
                })
              }
              style={styles.input}
            />

            <input
              type="number"
              placeholder="Ingano"
              value={farmerProduct.quantity}
              onChange={(e) =>
                setFarmerProduct({
                  ...farmerProduct,
                  quantity: e.target.value,
                })
              }
              style={styles.input}
            />

            <select
              value={farmerProduct.unit}
              onChange={(e) =>
                setFarmerProduct({
                  ...farmerProduct,
                  unit: e.target.value,
                })
              }
              style={styles.input}
            >
              <option value="">
                Hitamo igipimo
              </option>

              <option value="KG">
                KG
              </option>

              <option value="TON">
                TON
              </option>

              <option value="LITRE">
                LITRE
              </option>

              <option value="INKA">
                INKA
              </option>

              <option value="IHENE">
                IHENE
              </option>

              <option value="INTAMA">
                INTAMA
              </option>

              <option value="INKOKO">
                INKOKO
              </option>
            </select>

            <input
              placeholder="Igiciro"
              value={farmerProduct.price}
              onChange={(e) =>
                setFarmerProduct({
                  ...farmerProduct,
                  price: e.target.value,
                })
              }
              style={styles.input}
            />

            {/* INTARA */}
            <select
              value={farmerProduct.province}
              onChange={(e) =>
                setFarmerProduct({
                  ...farmerProduct,
                  province:
                    e.target.value,
                  district: "",
                  sector: "",
                  cell: "",
                  village: "",
                })
              }
              style={styles.input}
            >
              <option value="">
                Hitamo Intara
              </option>

              <option value="Umujyi wa Kigali">
                Umujyi wa Kigali
              </option>

              <option value="Amajyepfo">
                Amajyepfo
              </option>

              <option value="Iburengerazuba">
                Iburengerazuba
              </option>

              <option value="Iburasirazuba">
                Iburasirazuba
              </option>

              <option value="Amajyaruguru">
                Amajyaruguru
              </option>
            </select>

            {/* AKARERE */}
            <select
              value={farmerProduct.district}
              onChange={(e) =>
                setFarmerProduct({
                  ...farmerProduct,
                  district:
                    e.target.value,
                  sector: "",
                  cell: "",
                  village: "",
                })
              }
              style={styles.input}
              disabled={
                !farmerProduct.province
              }
            >
              <option value="">
                {farmerProduct.province
                  ? "Hitamo Akarere"
                  : "Banza uhitemo Intara"}
              </option>

              {availableDistricts.map(
                (district) => (
                  <option
                    key={district}
                    value={district}
                  >
                    {district}
                  </option>
                )
              )}
            </select>

            {/* UMURENGE */}
            <select
              value={farmerProduct.sector}
              onChange={(e) =>
                setFarmerProduct({
                  ...farmerProduct,
                  sector:
                    e.target.value,
                  cell: "",
                  village: "",
                })
              }
              style={styles.input}
              disabled={
                !farmerProduct.district
              }
            >
              <option value="">
                {farmerProduct.district
                  ? "Hitamo Umurenge"
                  : "Banza uhitemo Akarere"}
              </option>

              {availableSectors.map(
                (sector) => (
                  <option
                    key={sector}
                    value={sector}
                  >
                    {sector}
                  </option>
                )
              )}
            </select>

            {/* AKAGARI */}
            <select
              value={farmerProduct.cell}
              onChange={(e) =>
                setFarmerProduct({
                  ...farmerProduct,
                  cell:
                    e.target.value,
                  village: "",
                })
              }
              style={styles.input}
              disabled={
                !farmerProduct.sector
              }
            >
              <option value="">
                {farmerProduct.sector
                  ? "Hitamo Akagari"
                  : "Banza uhitemo Umurenge"}
              </option>

              {availableCells.map(
                (cell) => (
                  <option
                    key={cell}
                    value={cell}
                  >
                    {cell}
                  </option>
                )
              )}
            </select>

            {/* UMUDUGUDU */}
            <select
              value={farmerProduct.village}
              onChange={(e) =>
                setFarmerProduct({
                  ...farmerProduct,
                  village:
                    e.target.value,
                })
              }
              style={styles.input}
              disabled={
                !farmerProduct.cell
              }
            >
              <option value="">
                {farmerProduct.cell
                  ? "Hitamo Umudugudu"
                  : "Banza uhitemo Akagari"}
              </option>

              {availableVillages.map(
                (village) => (
                  <option
                    key={village}
                    value={village}
                  >
                    {village}
                  </option>
                )
              )}
            </select>

            <input
              placeholder="Telefoni y'umuhinzi"
              value={farmerProduct.phone}
              onChange={(e) =>
                setFarmerProduct({
                  ...farmerProduct,
                  phone: e.target.value,
                })
              }
              style={styles.input}
            />

            <button
              type="submit"
              style={
                styles.primaryButton
              }
            >
              📤 SHYIRA KU ISOKO
            </button>
          </form>
        </div>
      );
    }

    if (showMyProducts) {
      return (
        <div style={styles.page}>
          <button
            onClick={() =>
              setShowMyProducts(false)
            }
          >
            ← SUBIRA
          </button>

          <h1>
            📦 UMUSARURO WANJYE
          </h1>

          {myProducts.length === 0 ? (
            <p>
              Nta musaruro urashyirwa ku isoko.
            </p>
          ) : (
            myProducts.map((product) => (
              <div
                key={product.id}
                style={styles.card}
              >
                <h2>{product.name}</h2>

                <p>
                  <strong>Ubwoko:</strong>{" "}
                  {product.type}
                </p>

                <p>
                  <strong>Ingano:</strong>{" "}
                  {product.quantity}{" "}
                  {product.unit}
                </p>

                <p>
                  <strong>Igiciro:</strong>{" "}
                  {product.price}
                </p>

                <p>
                  <strong>Intara:</strong>{" "}
                  {product.province}
                </p>

                <p>
                  <strong>Akarere:</strong>{" "}
                  {product.district}
                </p>

                <p>
                  <strong>Umurenge:</strong>{" "}
                  {product.sector}
                </p>

                <p>
                  <strong>Akagari:</strong>{" "}
                  {product.cell}
                </p>

                <p>
                  <strong>Umudugudu:</strong>{" "}
                  {product.village}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {product.status}
                </p>

                {product.verificationReason && (
                  <p>
                    <strong>IMPAMVU:</strong>{" "}
                    {
                      product.verificationReason
                    }
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      );
    }

    return (
      <div style={styles.page}>
        <button
          onClick={() => setPage("home")}
        >
          ← AHABANZA
        </button>

        <h1>👨‍🌾 UMUHINZI</h1>

        <div style={styles.grid}>
          <button
            style={styles.menuButton}
            onClick={() =>
              setShowFarmerProductForm(
                true
              )
            }
          >
            ➕ SHYIRA KU ISOKO
          </button>

          <button
            style={styles.menuButton}
            onClick={() =>
              setShowMyProducts(true)
            }
          >
            📦 UMUSARURO WANJYE
          </button>

          <button
            style={styles.menuButton}
            onClick={() =>
              alert(
                "KOMANDE Z'UMUHINZI ziri gutegurwa."
              )
            }
          >
            🛒 KOMANDE
          </button>

          <button
            style={styles.menuButton}
            onClick={() =>
              alert(
                "DELIVERY iri gutegurwa."
              )
            }
          >
            🚚 DELIVERY
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // LIVESTOCK
  // =========================

  if (page === "livestock") {
    return (
      <div style={styles.page}>
        <button
          onClick={() => setPage("home")}
        >
          ← AHABANZA
        </button>

        <h1>🐄 UBWOROZI</h1>

        <div style={styles.card}>
          <h2>
            GURISHA UMUSARURO WAWE
          </h2>

          <p>
            Igice cy'ubworozi kiri
            gutegurwa.
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // UMUHUZA
  // =========================

  if (page === "agent") {
    if (showAgentOrders) {
      return (
        <div style={styles.page}>
          <button
            onClick={() =>
              setShowAgentOrders(false)
            }
          >
            ← SUBIRA
          </button>

          <h1>
            🟡 KOMANDE ZITEGEREJE
          </h1>

          {pendingOrders.length === 0 ? (
            <p>
              Nta KOMANDE itegereje UMUHUZA.
            </p>
          ) : (
            pendingOrders.map((order) => (
              <div
                key={order.id}
                style={styles.card}
              >
                <h2>
                  🛒 {order.productName}
                </h2>

                <p>
                  <strong>Umuguzi:</strong>{" "}
                  {order.buyerName}
                </p>

                <p>
                  <strong>Telefoni:</strong>{" "}
                  {order.buyerPhone}
                </p>

                <p>
                  <strong>Aho izakirirwa:</strong>{" "}
                  {order.deliveryLocation}
                </p>

                <p>
                  <strong>Ingano:</strong>{" "}
                  {order.requestedQuantity}{" "}
                  {order.unit}
                </p>

                <p>
                  <strong>Ingano ihari:</strong>{" "}
                  {order.availableQuantity}{" "}
                  {order.unit}
                </p>

                <p>
                  <strong>Umuhinzi:</strong>{" "}
                  {order.farmerPhone}
                </p>

                <p>
                  <strong>Intara:</strong>{" "}
                  {order.province}
                </p>

                <p>
                  <strong>Akarere:</strong>{" "}
                  {order.district}
                </p>

                <p>
                  <strong>Umurenge:</strong>{" "}
                  {order.sector}
                </p>

                <p>
                  <strong>Akagari:</strong>{" "}
                  {order.cell}
                </p>

                <p>
                  <strong>Umudugudu:</strong>{" "}
                  {order.village}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  🟡 TEGEREJE UMUHUZA
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: "12px",
                    marginTop: "15px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleApproveOrder(
                        order.id
                      )
                    }
                    style={{
                      ...styles.primaryButton,
                      background:
                        "#198754",
                    }}
                  >
                    🟢 YEMEZA KOMANDE
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleRejectOrder(
                        order.id
                      )
                    }
                    style={{
                      ...styles.primaryButton,
                      background:
                        "#dc3545",
                    }}
                  >
                    🔴 YANGA KOMANDE
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      );
    }

    if (showApprovedOrders) {
      return (
        <div style={styles.page}>
          <button
            onClick={() =>
              setShowApprovedOrders(false)
            }
          >
            ← SUBIRA
          </button>

          <h1>
            🟢 KOMANDE ZEMEJWE
          </h1>

          {approvedOrders.length === 0 ? (
            <p>
              Nta KOMANDE yemejwe iraboneka.
            </p>
          ) : (
            approvedOrders.map((order) => (
              <div
                key={order.id}
                style={styles.card}
              >
                <h2>
                  🟢 {order.productName}
                </h2>

                <p>
                  <strong>Umuguzi:</strong>{" "}
                  {order.buyerName}
                </p>

                <p>
                  <strong>Telefoni:</strong>{" "}
                  {order.buyerPhone}
                </p>

                <p>
                  <strong>Ingano:</strong>{" "}
                  {order.requestedQuantity}{" "}
                  {order.unit}
                </p>

                <p>
                  <strong>Aho izakirirwa:</strong>{" "}
                  {order.deliveryLocation}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  🟢 YEMEJWE N'UMUHUZA
                </p>

                <p>
                  <strong>Itariki:</strong>{" "}
                  {order.approvedAt}
                </p>
              </div>
            ))
          )}
        </div>
      );
    }

    if (showRejectedOrders) {
      return (
        <div style={styles.page}>
          <button
            onClick={() =>
              setShowRejectedOrders(false)
            }
          >
            ← SUBIRA
          </button>

          <h1>
            🔴 KOMANDE ZANZWE
          </h1>

          {rejectedOrders.length === 0 ? (
            <p>
              Nta KOMANDE yanze iraboneka.
            </p>
          ) : (
            rejectedOrders.map((order) => (
              <div
                key={order.id}
                style={styles.card}
              >
                <h2>
                  🔴 {order.productName}
                </h2>

                <p>
                  <strong>Umuguzi:</strong>{" "}
                  {order.buyerName}
                </p>

                <p>
                  <strong>Telefoni:</strong>{" "}
                  {order.buyerPhone}
                </p>

                <p>
                  <strong>Ingano:</strong>{" "}
                  {order.requestedQuantity}{" "}
                  {order.unit}
                </p>

                <p>
                  <strong>Aho izakirirwa:</strong>{" "}
                  {order.deliveryLocation}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  🔴 YANZWE N'UMUHUZA
                </p>

                <p>
                  <strong>IMPAMVU:</strong>{" "}
                  {order.rejectionReason}
                </p>

                <p>
                  <strong>Itariki:</strong>{" "}
                  {order.rejectedAt}
                </p>
              </div>
            ))
          )}
        </div>
      );
    }

    if (showPendingProducts) {
      return (
        <div style={styles.page}>
          <button
            onClick={() =>
              setShowPendingProducts(false)
            }
          >
            ← SUBIRA
          </button>

          <h1>
            🔎 UMUSARURO UTARAGENZURWA
          </h1>

          {pendingProducts.length === 0 ? (
            <p>
              Nta musaruro utegereje igenzurwa.
            </p>
          ) : (
            pendingProducts.map((product) => (
              <div
                key={product.id}
                style={styles.card}
              >
                <h2>{product.name}</h2>

                <p>
                  <strong>Ubwoko:</strong>{" "}
                  {product.type}
                </p>

                <p>
                  <strong>Ingano:</strong>{" "}
                  {product.quantity}{" "}
                  {product.unit}
                </p>

                <p>
                  <strong>Intara:</strong>{" "}
                  {product.province}
                </p>

                <p>
                  <strong>Akarere:</strong>{" "}
                  {product.district}
                </p>

                <p>
                  <strong>Umurenge:</strong>{" "}
                  {product.sector}
                </p>

                <p>
                  <strong>Akagari:</strong>{" "}
                  {product.cell}
                </p>

                <p>
                  <strong>Umudugudu:</strong>{" "}
                  {product.village}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  🟡 NTABWO WAGENZUWE
                </p>

                <button
                  type="button"
                  onClick={() =>
                    handleVerifyProduct(
                      product.id
                    )
                  }
                  style={
                    styles.primaryButton
                  }
                >
                  🔎 GENZURA
                </button>
              </div>
            ))
          )}
        </div>
      );
    }

    if (showVerifiedProducts) {
      return (
        <div style={styles.page}>
          <button
            onClick={() =>
              setShowVerifiedProducts(false)
            }
          >
            ← SUBIRA
          </button>

          <h1>
            🟠 WAGENZUWE — NTABWO WEMEJWE
          </h1>

          {verifiedProducts.length === 0 ? (
            <p>
              Nta musaruro utegereje kwemezwa.
            </p>
          ) : (
            verifiedProducts.map((product) => (
              <div
                key={product.id}
                style={styles.card}
              >
                <h2>{product.name}</h2>

                <p>
                  <strong>IMPAMVU:</strong>{" "}
                  {
                    product.verificationReason
                  }
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  🟠 WAGENZUWE — NTABWO WEMEJWE
                </p>

                <button
                  type="button"
                  onClick={() =>
                    handleApproveProduct(
                      product.id
                    )
                  }
                  style={{
                    ...styles.primaryButton,
                    background:
                      "#198754",
                  }}
                >
                  🟢 EMEZA UMUSARURO
                </button>
              </div>
            ))
          )}
        </div>
      );
    }

    if (showApprovedProducts) {
      return (
        <div style={styles.page}>
          <button
            onClick={() =>
              setShowApprovedProducts(false)
            }
          >
            ← SUBIRA
          </button>

          <h1>
            🟢 UMUSARURO WEMEJWE
          </h1>

          {approvedProducts.length === 0 ? (
            <p>
              Nta musaruro wemejwe uraboneka.
            </p>
          ) : (
            approvedProducts.map((product) => (
              <div
                key={product.id}
                style={styles.card}
              >
                <h2>{product.name}</h2>

                <p>
                  <strong>Intara:</strong>{" "}
                  {product.province}
                </p>

                <p>
                  <strong>Akarere:</strong>{" "}
                  {product.district}
                </p>

                <p>
                  <strong>Umurenge:</strong>{" "}
                  {product.sector}
                </p>

                <p>
                  <strong>Akagari:</strong>{" "}
                  {product.cell}
                </p>

                <p>
                  <strong>Umudugudu:</strong>{" "}
                  {product.village}
                </p>

                <p>
                  <strong>Ingano:</strong>{" "}
                  {product.quantity}{" "}
                  {product.unit}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  🟢 WEMEJWE
                </p>
              </div>
            ))
          )}
        </div>
      );
    }

    return (
      <div style={styles.page}>
        <button
          onClick={() => setPage("home")}
        >
          ← AHABANZA
        </button>

        <h1>🤝 UMUHUZA</h1>

        <div style={styles.grid}>
          <button
            style={styles.menuButton}
            onClick={() => {
              setShowPendingProducts(true);
              setShowVerifiedProducts(false);
              setShowApprovedProducts(false);
              setShowAgentOrders(false);
              setShowApprovedOrders(false);
              setShowRejectedOrders(false);
            }}
          >
            🔎 UMUSARURO UTARAGENZURWA
          </button>

          <button
            style={styles.menuButton}
            onClick={() => {
              setShowVerifiedProducts(true);
              setShowPendingProducts(false);
              setShowApprovedProducts(false);
              setShowAgentOrders(false);
              setShowApprovedOrders(false);
              setShowRejectedOrders(false);
            }}
          >
            🟠 WAGENZUWE — NTABWO WEMEJWE
          </button>

          <button
            style={styles.menuButton}
            onClick={() => {
              setShowApprovedProducts(true);
              setShowPendingProducts(false);
              setShowVerifiedProducts(false);
              setShowAgentOrders(false);
              setShowApprovedOrders(false);
              setShowRejectedOrders(false);
            }}
          >
            🟢 UMUSARURO WEMEJWE
          </button>

          <button
            style={styles.menuButton}
            onClick={() => {
              setShowAgentOrders(true);
              setShowPendingProducts(false);
              setShowVerifiedProducts(false);
              setShowApprovedProducts(false);
              setShowApprovedOrders(false);
              setShowRejectedOrders(false);
            }}
          >
            🟡 KOMANDE ZITEGEREJE
          </button>

          <button
            style={{
              ...styles.menuButton,
              background: "#198754",
              color: "#fff",
            }}
            onClick={() => {
              setShowApprovedOrders(true);
              setShowAgentOrders(false);
              setShowPendingProducts(false);
              setShowVerifiedProducts(false);
              setShowApprovedProducts(false);
              setShowRejectedOrders(false);
            }}
          >
            🟢 KOMANDE ZEMEJWE
          </button>

          <button
            style={{
              ...styles.menuButton,
              background: "#dc3545",
              color: "#fff",
            }}
            onClick={() => {
              setShowRejectedOrders(true);
              setShowAgentOrders(false);
              setShowPendingProducts(false);
              setShowVerifiedProducts(false);
              setShowApprovedProducts(false);
              setShowApprovedOrders(false);
            }}
          >
            🔴 KOMANDE ZANZWE
          </button>

          <button
            style={styles.menuButton}
            onClick={() =>
              alert(
                "DELIVERY iri gutegurwa."
              )
            }
          >
            🚚 DELIVERY
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // BUYER
  // =========================

  if (page === "buyer") {
    if (
      showOrderForm &&
      selectedBuyerProduct
    ) {
      return (
        <div style={styles.page}>
          <button
            onClick={() => {
              setShowOrderForm(false);
              setSelectedBuyerProduct(
                null
              );
            }}
          >
            ← SUBIRA
          </button>

          <h1>🛒 TANGA KOMANDE</h1>

          <div style={styles.card}>
            <h2>
              {selectedBuyerProduct.name}
            </h2>

            <p>
              <strong>
                Ingano ihari:
              </strong>{" "}
              {selectedBuyerProduct.quantity}{" "}
              {selectedBuyerProduct.unit}
            </p>

            <form
              onSubmit={
                handleBuyerOrderSubmit
              }
            >
              <input
                placeholder="Izina ry'umuguzi"
                value={
                  buyerOrder.buyerName
                }
                onChange={(e) =>
                  setBuyerOrder({
                    ...buyerOrder,
                    buyerName:
                      e.target.value,
                  })
                }
                style={styles.input}
              />

              <input
                type="number"
                placeholder="Ingano nshaka"
                value={
                  buyerOrder.quantity
                }
                onChange={(e) =>
                  setBuyerOrder({
                    ...buyerOrder,
                    quantity:
                      e.target.value,
                  })
                }
                style={styles.input}
              />

              <input
                placeholder="Aho nzakirira"
                value={
                  buyerOrder.deliveryLocation
                }
                onChange={(e) =>
                  setBuyerOrder({
                    ...buyerOrder,
                    deliveryLocation:
                      e.target.value,
                  })
                }
                style={styles.input}
              />

              <input
                placeholder="Telefoni y'umuguzi"
                value={
                  buyerOrder.buyerPhone
                }
                onChange={(e) =>
                  setBuyerOrder({
                    ...buyerOrder,
                    buyerPhone:
                      e.target.value,
                  })
                }
                style={styles.input}
              />

              <button
                type="submit"
                style={
                  styles.primaryButton
                }
              >
                🛒 TANGA KOMANDE
              </button>
            </form>
          </div>
        </div>
      );
    }

    if (showBuyerProducts) {
      return (
        <div style={styles.page}>
          <button
            onClick={() =>
              setShowBuyerProducts(false)
            }
          >
            ← SUBIRA
          </button>

          <h1>
            🛒 UMUSARURO WEMEJWE
          </h1>

          {approvedProducts.length === 0 ? (
            <p>
              Nta musaruro wemejwe uraboneka.
            </p>
          ) : (
            approvedProducts.map((product) => (
              <div
                key={product.id}
                style={styles.card}
              >
                <h2>{product.name}</h2>

                <p>
                  <strong>Ubwoko:</strong>{" "}
                  {product.type}
                </p>

                <p>
                  <strong>Ingano:</strong>{" "}
                  {product.quantity}{" "}
                  {product.unit}
                </p>

                <p>
                  <strong>Intara:</strong>{" "}
                  {product.province}
                </p>

                <p>
                  <strong>Akarere:</strong>{" "}
                  {product.district}
                </p>

                <p>
                  <strong>Umurenge:</strong>{" "}
                  {product.sector}
                </p>

                <p>
                  <strong>Akagari:</strong>{" "}
                  {product.cell}
                </p>

                <p>
                  <strong>Umudugudu:</strong>{" "}
                  {product.village}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  🟢 WEMEJWE
                </p>

                <button
                  type="button"
                  style={
                    styles.primaryButton
                  }
                  onClick={() => {
                    setSelectedBuyerProduct(
                      product
                    );
                    setShowOrderForm(true);
                  }}
                >
                  🛒 TANGA KOMANDE
                </button>
              </div>
            ))
          )}
        </div>
      );
    }

    return (
      <div style={styles.page}>
        <button
          onClick={() => setPage("home")}
        >
          ← AHABANZA
        </button>

        <h1>🛍️ UMUGUZI</h1>

        <div style={styles.grid}>
          <button
            style={styles.menuButton}
            onClick={() =>
              setShowBuyerProducts(true)
            }
          >
            🛒 REBA UMUSARURO WEMEJWE
          </button>

          <button
            style={styles.menuButton}
            onClick={() =>
              alert(
                "KOMANDE ZANJYE iri gutegurwa."
              )
            }
          >
            📋 KOMANDE ZANJYE
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // HOME
  // =========================

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <h1>
          🌾 GURISHA UMUSARURO WAWE
        </h1>

        <p>
          UBUHINZI • UBWOROZI • ISOKO
        </p>

        <p>
          Huza umusaruro wawe n'abaguzi
          hifashishijwe UMUHUZA.
        </p>
      </div>

      <div style={styles.grid}>
        <button
          style={styles.menuButton}
          onClick={() => setPage("farmer")}
        >
          👨‍🌾 UMUHINZI
        </button>

        <button
          style={styles.menuButton}
          onClick={() =>
            setPage("livestock")
          }
        >
          🐄 UBWOROZI
        </button>

        <button
          style={styles.menuButton}
          onClick={() => setPage("agent")}
        >
          🤝 UMUHUZA
        </button>

        <button
          style={styles.menuButton}
          onClick={() => setPage("buyer")}
        >
          🛍️ UMUGUZI
        </button>
      </div>
    </div>
  );
}

// =========================
// STYLES
// =========================

const styles = {
  page: {
    minHeight: "100vh",
    padding: "25px",
    background: "#f5f7f6",
    fontFamily:
      "Arial, sans-serif",
    boxSizing: "border-box",
  },

  hero: {
    maxWidth: "900px",
    margin: "0 auto 30px",
    background: "#ffffff",
    padding: "30px",
    borderRadius: "16px",
    textAlign: "center",
    boxShadow:
      "0 4px 14px rgba(0,0,0,0.08)",
  },

  grid: {
    maxWidth: "900px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "15px",
  },

  menuButton: {
    border: "none",
    borderRadius: "12px",
    padding: "20px",
    background: "#ffffff",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "700",
    boxShadow:
      "0 3px 10px rgba(0,0,0,0.08)",
  },

  card: {
    maxWidth: "900px",
    margin: "20px auto",
    background: "#ffffff",
    padding: "20px",
    borderRadius: "14px",
    boxShadow:
      "0 3px 12px rgba(0,0,0,0.08)",
  },

  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
    fontSize: "15px",
    background: "#fff",
  },

  primaryButton: {
    width: "100%",
    border: "none",
    borderRadius: "8px",
    padding: "13px",
    background: "#198754",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
    marginTop: "8px",
  },
};

export default App;