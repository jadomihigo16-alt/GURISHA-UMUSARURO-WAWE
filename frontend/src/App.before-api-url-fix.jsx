import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import QRCode from "qrcode";

const GIS_BASE =
  "https://moegis.environment.gov.rw/server/rest/services/Hosted/Administrative_boundaries/FeatureServer";

const districtsByProvince = {
  "Umujyi wa Kigali": [
    "Gasabo",
    "Kicukiro",
    "Nyarugenge",
  ],

  Amajyepfo: [
    "Gisagara",
    "Huye",
    "Kamonyi",
    "Muhanga",
    "Nyamagabe",
    "Nyanza",
    "Nyaruguru",
    "Ruhango",
  ],

  Iburengerazuba: [
    "Karongi",
    "Ngororero",
    "Nyabihu",
    "Nyamasheke",
    "Rubavu",
    "Rusizi",
    "Rutsiro",
  ],

  Iburasirazuba: [
    "Bugesera",
    "Gatsibo",
    "Kayonza",
    "Kirehe",
    "Ngoma",
    "Nyagatare",
    "Rwamagana",
  ],

  Amajyaruguru: [
    "Burera",
    "Gakenke",
    "Gicumbi",
    "Musanze",
    "Rulindo",
  ],
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f7f5",
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "#17351f",
  },

  header: {
    background: "#116530",
    color: "#fff",
    padding: "18px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontSize: "25px",
    fontWeight: "800",
  },

  subtitle: {
    margin: "5px 0 0",
    fontSize: "14px",
    opacity: 0.9,
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "25px 18px 50px",
  },

  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "18px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "15px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: "1px solid #cbd8ce",
    borderRadius: "8px",
    fontSize: "15px",
    background: "#fff",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    fontWeight: "700",
    fontSize: "14px",
  },

  field: {
    marginBottom: "14px",
  },

  button: {
    border: 0,
    borderRadius: "8px",
    padding: "11px 16px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    background: "#116530",
    color: "#fff",
  },

  secondaryButton: {
    border: 0,
    borderRadius: "8px",
    padding: "10px 15px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    background: "#e9f1eb",
    color: "#116530",
  },

  dangerButton: {
    border: 0,
    borderRadius: "8px",
    padding: "10px 15px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    background: "#b42318",
    color: "#fff",
  },

  warningButton: {
    border: 0,
    borderRadius: "8px",
    padding: "10px 15px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    background: "#d97706",
    color: "#fff",
  },

  status: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "800",
  },

  menu: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
    marginBottom: "22px",
  },

  menuButton: {
    width: "100%",
    padding: "16px",
    border: "1px solid #d6e3d9",
    background: "#fff",
    color: "#116530",
    borderRadius: "10px",
    fontWeight: "800",
    cursor: "pointer",
    textAlign: "left",
  },

  info: {
    background: "#eef7f0",
    borderLeft: "4px solid #116530",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "15px",
  },

  row: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
  },
};

function App() {
  const [page, setPage] = useState("home");

  const [
    showFarmerProductForm,
    setShowFarmerProductForm,
  ] = useState(false);

  const [
    showMyProducts,
    setShowMyProducts,
  ] = useState(false);

  const [myProducts, setMyProducts] = useState([]);
useEffect(() => {
  const loadProducts = async () => {
    try {
      const response = await fetch(
        "https://ccpt-backend-ten.vercel.app/api/products"
      );

      const data = await response.json();

      if (data.success) {
        setMyProducts(data.products);
      }
    } catch (error) {
      console.error("LOAD PRODUCTS ERROR:", error);
    }
  };

  loadProducts();
}, []);
  const [farmerProduct, setFarmerProduct] = useState({
    farmerName: "",
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

  const [
    availableSectors,
    setAvailableSectors,
  ] = useState([]);

  const [
    availableCells,
    setAvailableCells,
  ] = useState([]);

  const [
    availableVillages,
    setAvailableVillages,
  ] = useState([]);

  const [
    showPendingProducts,
    setShowPendingProducts,
  ] = useState(false);

  const [
    showVerifiedProducts,
    setShowVerifiedProducts,
  ] = useState(false);

  const [
    showApprovedProducts,
    setShowApprovedProducts,
  ] = useState(false);

  const [
    showAgentOrders,
    setShowAgentOrders,
  ] = useState(false);

  const [
    showApprovedOrders,
    setShowApprovedOrders,
  ] = useState(false);

  const [
    showRejectedOrders,
    setShowRejectedOrders,
  ] = useState(false);

  const [
    showDelivery,
    setShowDelivery,
  ] = useState(false);

  const [
    showBuyerProducts,
    setShowBuyerProducts,
  ] = useState(false);

  const [
    selectedBuyerProduct,
    setSelectedBuyerProduct,
  ] = useState(null);

  const [
    showOrderForm,
    setShowOrderForm,
  ] = useState(false);

  const [orders, setOrders] = useState([]);
const [buyerHistoryPhone, setBuyerHistoryPhone] = useState("");

  const [buyerOrder, setBuyerOrder] = useState({
    buyerName: "",
    province: "",
    district: "",
    sector: "",
    cell: "",
    village: "",
    quantity: "",
    buyerPhone: "",
  });

  const [
    buyerSectors,
    setBuyerSectors,
  ] = useState([]);

  const [
    buyerCells,
    setBuyerCells,
  ] = useState([]);

  const [
    buyerVillages,
    setBuyerVillages,
  ] = useState([]);

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
          throw new Error("Failed to load sectors");
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
          throw new Error("Failed to load cells");
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
          "Imidugudu ntiyabonetse. Ongera ugerageze."
        );
      }
    };

    loadVillages();
  }, [
    farmerProduct.sector,
    farmerProduct.cell,
  ]);

  useEffect(() => {
    if (!buyerOrder.district) {
      setBuyerSectors([]);
      return;
    }

    const loadBuyerSectors = async () => {
      try {
        const where = encodeURIComponent(
          `district='${buyerOrder.district}'`
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
            "Failed to load buyer sectors"
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

        setBuyerSectors(sectors);
      } catch (error) {
        console.error(
          "Buyer sector loading error:",
          error
        );

        setBuyerSectors([]);
      }
    };

    loadBuyerSectors();
  }, [buyerOrder.district]);

  useEffect(() => {
    if (
      !buyerOrder.district ||
      !buyerOrder.sector
    ) {
      setBuyerCells([]);
      return;
    }

    const loadBuyerCells = async () => {
      try {
        const where = encodeURIComponent(
          `district='${buyerOrder.district}' AND sector='${buyerOrder.sector}'`
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
            "Failed to load buyer cells"
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

        setBuyerCells(cells);
      } catch (error) {
        console.error(
          "Buyer cell loading error:",
          error
        );

        setBuyerCells([]);
      }
    };

    loadBuyerCells();
  }, [
    buyerOrder.district,
    buyerOrder.sector,
  ]);

  useEffect(() => {
    if (
      !buyerOrder.sector ||
      !buyerOrder.cell
    ) {
      setBuyerVillages([]);
      return;
    }

    const loadBuyerVillages = async () => {
      try {
        const where = encodeURIComponent(
          `sector='${buyerOrder.sector}' AND cell='${buyerOrder.cell}'`
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
            "Failed to load buyer villages"
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

        setBuyerVillages(villages);
      } catch (error) {
        console.error(
          "Buyer village loading error:",
          error
        );

        setBuyerVillages([]);
      }
    };

    loadBuyerVillages();
  }, [
    buyerOrder.sector,
    buyerOrder.cell,
  ]);

  const handleFarmerProductSubmit = async (e) => {
  e.preventDefault();

  if (!farmerProduct.farmerName.trim()) {
    alert("Andika izina ry'Umuhinzi / Umworozi.");
    return;
  }

  if (!farmerProduct.name.trim()) {
    alert("Andika izina ry'umusaruro.");
    return;
  }

  if (!farmerProduct.type) {
    alert("Hitamo ubwoko bw'umusaruro.");
    return;
  }

  if (!farmerProduct.quantity) {
    alert("Andika ingano y'umusaruro.");
    return;
  }

  if (!farmerProduct.unit) {
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

  try {
    const productPayload = {
      name: farmerProduct.name,
      type: farmerProduct.type,
      farmerName: farmerProduct.farmerName.trim(),
      farmerPhone: farmerProduct.phone,
      quantity: Number(farmerProduct.quantity),
      unit: farmerProduct.unit,
      price: Number(farmerProduct.price || 0),
      province: farmerProduct.province,
      district: farmerProduct.district,
      sector: farmerProduct.sector,
      cell: farmerProduct.cell,
      village: farmerProduct.village,
      status: "NTABWO WAGENZUWE",
    };

    const response = await fetch(
      "https://ccpt-backend-ten.vercel.app/api/products",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productPayload),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "UMUSARURO NTABWO WABITSWE."
      );
    }

    const savedProduct = {
      ...farmerProduct,
      id: data.product.id,farmer_name:
  data.product.farmer_name || farmerProduct.farmerName.trim(),
farmer_phone:
  data.product.farmer_phone || farmerProduct.phone.trim(),
      status: data.product.status,
      createdAt: new Date().toLocaleDateString("rw-RW"),
    };

    setMyProducts((prev) => [
      savedProduct,
      ...prev,
    ]);

    alert(
      "UMUSARURO WABITSWE NEZA MURI DATABASE.\n\n" +
        "Status: NTABWO WAGENZUWE\n\n" +
        "UMUHUZA agomba kuwugenura mbere yo kwemezwa."
    );

    setFarmerProduct({
      farmerName: "",
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
    setShowMyProducts(true);
  } catch (error) {
    console.error("FARMER PRODUCT SAVE ERROR:", error);

    alert(
      "UMUSARURO NTABWO WABASHIJE KUBIKWA MURI DATABASE.\n\n" +
        "Reba niba backend iri gukora kuri port 5001."
    );
  }
};
const handleVerifyProduct = (productId) => {
    const reason = window.prompt(
      "ANDIKA IMPAMVU UMUSARURO UTAREMEJWE:"
    );

    if (reason === null) return;

    if (!reason.trim()) {
      alert(
        "Ugomba kwandika IMPAMVU."
      );
      return;
    }

    setMyProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,
              status:
                "WAGENZUWE - NTABWO WEMEJWE",
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
        "Status: WAGENZUWE - NTABWO WEMEJWE\n\n" +
        "IMPAMVU: " +
        reason.trim()
    );
  };

  const handleApproveProduct = (productId) => {
    setMyProducts((prev) =>
      prev.map((product) =>
        product.id === productId &&
        product.status ===
          "WAGENZUWE - NTABWO WEMEJWE"
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

  const handleBuyerOrderSubmit = async (e) => {
  e.preventDefault();

  if (!selectedBuyerProduct) {
    alert("Hitamo umusaruro ubanza.");
    return;
  }

  if (!buyerOrder.buyerName.trim()) {
    alert("Andika izina ry'umuguzi.");
    return;
  }

  if (!buyerOrder.province) {
    alert("Hitamo Intara aho uzakirira umusaruro.");
    return;
  }

  if (!buyerOrder.district) {
    alert("Hitamo Akarere aho uzakirira umusaruro.");
    return;
  }

  if (!buyerOrder.sector) {
    alert("Hitamo Umurenge aho uzakirira umusaruro.");
    return;
  }

  if (!buyerOrder.cell) {
    alert("Hitamo Akagari aho uzakirira umusaruro.");
    return;
  }

  if (!buyerOrder.village) {
    alert("Hitamo Umudugudu aho uzakirira umusaruro.");
    return;
  }

  const requestedQuantity = Number(buyerOrder.quantity);
  const availableQuantity = Number(selectedBuyerProduct.quantity);

  if (requestedQuantity <= 0) {
    alert("Andika ingano irenze 0.");
    return;
  }

  if (requestedQuantity > availableQuantity) {
    alert(
      "Ingano wasabye irenze umusaruro uhari.\n\n" +
        "Ingano ihari: " +
        selectedBuyerProduct.quantity +
        " " +
        selectedBuyerProduct.unit
    );
    return;
  }

  if (!buyerOrder.buyerPhone.trim()) {
    alert("Andika telefoni y'umuguzi.");
    return;
  }

  const deliveryLocation =
    `${buyerOrder.province} / ${buyerOrder.district} / ${buyerOrder.sector} / ${buyerOrder.cell} / ${buyerOrder.village}`;

  const orderPayload = {
    productId: selectedBuyerProduct.id,
    productName: selectedBuyerProduct.name,
    productType: selectedBuyerProduct.type,

    buyerName: buyerOrder.buyerName.trim(),
    buyerPhone: buyerOrder.buyerPhone.trim(),

    farmerName: selectedBuyerProduct.farmer_name || selectedBuyerProduct.farmerName || "",
   farmerPhone: selectedBuyerProduct.farmer_phone || selectedBuyerProduct.phone || "",

    availableQuantity: selectedBuyerProduct.quantity,
    requestedQuantity: buyerOrder.quantity,

    unit: selectedBuyerProduct.unit,
    price: selectedBuyerProduct.price,

    province: selectedBuyerProduct.province,
    district: selectedBuyerProduct.district,
    sector: selectedBuyerProduct.sector,
    cell: selectedBuyerProduct.cell,
    village: selectedBuyerProduct.village,

    buyerProvince: buyerOrder.province,
    buyerDistrict: buyerOrder.district,
    buyerSector: buyerOrder.sector,
    buyerCell: buyerOrder.cell,
    buyerVillage: buyerOrder.village,

    status: "TEGEREJE UMUHUZA",
  };

  try {
    const response = await fetch(
      "https://ccpt-backend-ten.vercel.app/api/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "KOMANDE ntiyabitswe."
      );
    }

    const savedOrder = data.order;

    setBuyerHistoryPhone(
      buyerOrder.buyerPhone.trim()
    );

    const newOrder = {
      id: savedOrder.id,

      buyerName: buyerOrder.buyerName.trim(),
      buyerPhone: buyerOrder.buyerPhone.trim(),

      productId: selectedBuyerProduct.id,
      productName: selectedBuyerProduct.name,
      productType: selectedBuyerProduct.type,

      farmerName: selectedBuyerProduct.farmerName,
      farmerPhone: selectedBuyerProduct.phone,

      availableQuantity: selectedBuyerProduct.quantity,

      unit: selectedBuyerProduct.unit,
      price: selectedBuyerProduct.price,

      requestedQuantity: buyerOrder.quantity,

      province: selectedBuyerProduct.province,
      district: selectedBuyerProduct.district,
      sector: selectedBuyerProduct.sector,
      cell: selectedBuyerProduct.cell,
      village: selectedBuyerProduct.village,

      buyerProvince: buyerOrder.province,
      buyerDistrict: buyerOrder.district,
      buyerSector: buyerOrder.sector,
      buyerCell: buyerOrder.cell,
      buyerVillage: buyerOrder.village,

      deliveryLocation,

      orderDate: new Date().toLocaleDateString("rw-RW"),

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
        "Umuhinzi: " +
        selectedBuyerProduct.farmerName +
        "\n" +
        "Umusaruro: " +
        selectedBuyerProduct.name +
        "\n" +
        "Ingano: " +
        buyerOrder.quantity +
        " " +
        selectedBuyerProduct.unit +
        "\n\n" +
        "AHO UMUGUGUZI AZAKIRIRA:\n" +
        deliveryLocation +
        "\n\n" +
        "Telefoni: " +
        buyerOrder.buyerPhone +
        "\n\n" +
        "KOMANDE yabitswe muri DATABASE kandi yoherejwe kuri UMUHUZA."
    );

    setBuyerOrder({
      buyerName: "",
      province: "",
      district: "",
      sector: "",
      cell: "",
      village: "",
      quantity: "",
      buyerPhone: "",
    });

    setBuyerSectors([]);
    setBuyerCells([]);
    setBuyerVillages([]);

    setSelectedBuyerProduct(null);
    setShowOrderForm(false);
  } catch (error) {
    console.error(
      "BUYER ORDER ERROR:",
      error
    );

    alert(
      "KOMANDE ntiyabitswe.\n\n" +
        "Reba niba BACKEND iri gukora kuri port 5001."
    );
  }
};
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

  const handleRejectOrder = (orderId) => {
    const reason = window.prompt(
      "ANDIKA IMPAMVU KOMANDE YANZWE:"
    );

    if (reason === null) return;

    if (!reason.trim()) {
      alert(
        "Ugomba kwandika IMPAMVU."
      );
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

  /*
   * =========================================================
   * DELIVERY RECEIPT + QR CODE
   * =========================================================
   */
  const handleDownloadDeliveryReceipt = async (
    order
  ) => {
    try {
      const quantity = Number(
        order.requestedQuantity || 0
      );

      const priceMatch = String(
        order.price || ""
      )
        .replace(/,/g, "")
        .match(/-?\d+(\.\d+)?/);

      const unitPrice = priceMatch
        ? Number(priceMatch[0])
        : 0;

      const total =
        quantity * unitPrice;

      const farmerLocation =
        `${order.province || "-"} / ${order.district || "-"} / ${order.sector || "-"} / ${order.cell || "-"} / ${order.village || "-"}`;

      const buyerLocation =
        `${order.buyerProvince || "-"} / ${order.buyerDistrict || "-"} / ${order.buyerSector || "-"} / ${order.buyerCell || "-"} / ${order.buyerVillage || "-"}`;

      const receiptDate =
        new Date().toLocaleDateString(
          "rw-RW"
        );

      const totalText =
        total > 0
          ? `${total.toLocaleString(
              "en-US"
            )} RWF`
          : "Ntabwo cyashyizweho";

      /*
       * Amakuru ashyirwa muri QR Code.
       * Iyo QR iskanwe, aya makuru yose aragaragara.
       */
      const receiptData = [
        "GURISHA UMUSARURO WAWE",
        "DELIVERY RECEIPT",
        `KOMANDE #: ${order.id}`,
        `Itariki: ${receiptDate}`,
        `Status: ${order.status}`,
        `Umuhinzi: ${order.farmerName || "-"}`,
        `Telefoni y'umuhinzi: ${order.farmerPhone || "-"}`,
        `Umuguzi: ${order.buyerName || "-"}`,
        `Telefoni y'umuguzi: ${order.buyerPhone || "-"}`,
        `Umusaruro: ${order.productName || "-"}`,
        `Ubwoko: ${order.productType || "-"}`,
        `Ingano: ${order.requestedQuantity || "-"} ${order.unit || ""}`,
        `Igiciro: ${order.price || "-"}`,
        `Amafaranga yose: ${totalText}`,
        `Aho umusaruro uri: ${farmerLocation}`,
        `Aho umuguzi azakiririra: ${buyerLocation}`,
      ].join("\n");

      const qrCodeDataUrl =
        await QRCode.toDataURL(
          receiptData,
          {
            width: 300,
            margin: 2,
            errorCorrectionLevel: "M",
          }
        );

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      /*
       * HEADER
       */
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);

      doc.text(
        "GURISHA UMUSARURO WAWE",
        105,
        20,
        {
          align: "center",
        }
      );

      doc.setFontSize(14);

      doc.text(
        "DELIVERY RECEIPT",
        105,
        30,
        {
          align: "center",
        }
      );

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      doc.text(
        "Receipt yemeza amakuru ya KOMANDE na DELIVERY.",
        105,
        37,
        {
          align: "center",
        }
      );

      let y = 48;

      /*
       * Helper yo kwandika umurongo
       */
      const addLine = (
        label,
        value,
        options = {}
      ) => {
        const labelX =
          options.labelX || 20;

        const valueX =
          options.valueX || 70;

        const width =
          options.width || 115;

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.text(
          String(label),
          labelX,
          y
        );

        doc.setFont(
          "helvetica",
          "normal"
        );

        const lines =
          doc.splitTextToSize(
            String(value || "-"),
            width
          );

        doc.text(
          lines,
          valueX,
          y
        );

        y += Math.max(
          7,
          lines.length * 5
        );
      };

      /*
       * KOMANDE
       */
      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(11);

      doc.text(
        "AMAKURU YA KOMANDE",
        20,
        y
      );

      y += 8;

      doc.setFontSize(10);

      addLine(
        "KOMANDE #:",
        order.id
      );

      addLine(
        "Itariki:",
        receiptDate
      );

      addLine(
        "Status:",
        order.status
      );

      /*
       * UMUHINZI
       */
      y += 3;

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(11);

      doc.text(
        "UMUHINZI",
        20,
        y
      );

      y += 8;

      doc.setFontSize(10);

      addLine(
        "Izina:",
        order.farmer_name || order.farmerName || "-"
      );
      addLine(
        "Telefoni:",
        order.farmerPhone
      );

      /*
       * UMUGUZI
       */
      y += 3;

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(11);

      doc.text(
        "UMUGUZI",
        20,
        y
      );

      y += 8;

      doc.setFontSize(10);

      addLine(
        "Izina:",
        order.buyerName
      );

      addLine(
        "Telefoni:",
        order.buyerPhone
      );

      /*
       * UMUSARURO
       */
      y += 3;

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(11);

      doc.text(
        "UMUSARURO",
        20,
        y
      );

      y += 8;

      doc.setFontSize(10);

      addLine(
        "Umusaruro:",
        order.productName
      );

      addLine(
        "Ubwoko:",
        order.productType
      );

      addLine(
        "Ingano:",
        `${order.requestedQuantity || "-"} ${
          order.unit || ""
        }`
      );

      addLine(
        "Igiciro:",
        order.price ||
          "Ntabwo cyashyizweho"
      );

      addLine(
        "AMAFARANGA YOSE:",
        totalText
      );

      /*
       * AHO UMUSARURO URI
       */
      y += 3;

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(11);

      doc.text(
        "AHO UMUSARURO URI",
        20,
        y
      );

      y += 8;

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(10);

      const farmerLocationLines =
        doc.splitTextToSize(
          farmerLocation,
          170
        );

      doc.text(
        farmerLocationLines,
        20,
        y
      );

      y +=
        farmerLocationLines.length *
          5 +
        7;

      /*
       * AHO UMUGUZI AZAKIRIRA
       */
      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(11);

      doc.text(
        "AHO UMUGUZI AZAKIRIRA",
        20,
        y
      );

      y += 8;

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(10);

      const buyerLocationLines =
        doc.splitTextToSize(
          buyerLocation,
          170
        );

      doc.text(
        buyerLocationLines,
        20,
        y
      );

      y +=
        buyerLocationLines.length *
          5 +
        10;

      /*
       * QR CODE
       */
      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(11);

      doc.text(
        "QR CODE",
        150,
        y
      );

      y += 5;

      doc.addImage(
        qrCodeDataUrl,
        "PNG",
        145,
        y,
        45,
        45
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(8);

      doc.text(
        "Scan QR Code kugirango urebe",
        20,
        y + 8
      );

      doc.text(
        "amakuru ya DELIVERY RECEIPT.",
        20,
        y + 13
      );

      /*
       * FOOTER
       */
      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(10);

      doc.text(
        "GURISHA UMUSARURO WAWE",
        105,
        y + 57,
        {
          align: "center",
        }
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(8);

      doc.text(
        "DELIVERY RECEIPT - KOMANDE #" +
          order.id,
        105,
        y + 63,
        {
          align: "center",
        }
      );

      /*
       * DOWNLOAD
       */
      doc.save(
        `DELIVERY-RECEIPT-${order.id}.pdf`
      );
    } catch (error) {
      console.error(
        "DELIVERY RECEIPT ERROR:",
        error
      );

      alert(
        "DELIVERY RECEIPT ntiyabashije gukorwa.\n\n" +
          "Reba niba jspdf na qrcode byashyizwe muri frontend."
      );
    }
  };

  const handleStartDelivery = async (orderId) => {
  try {
    const response = await fetch(
      `https://ccpt-backend-ten.vercel.app/api/orders/${orderId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "TEGEREJE DELIVERY",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Ntibyashobotse kubika status."
      );
    }

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId &&
        order.status === "YEMEJWE N'UMUHUZA"
          ? {
              ...order,
              status: "TEGEREJE DELIVERY",
              deliveryPreparedAt:
                new Date().toLocaleDateString("rw-RW"),
            }
          : order
      )
    );

    alert(
      "KOMANDE yinjiye muri DELIVERY.\n\n" +
        "Status: TEGEREJE DELIVERY\n" +
        "Byabitswe muri PostgreSQL."
    );
  } catch (error) {
    console.error(
      "START DELIVERY ERROR:",
      error
    );

    alert(
      "DELIVERY NTABWO YABASHIJE KUBIKWA.\n\n" +
        "Reba niba backend iri gukora kuri port 5001."
    );
  }
};

  const handleSendDelivery = async (orderId) => {
  try {
    const response = await fetch(
      `https://ccpt-backend-ten.vercel.app/api/orders/${orderId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "YOHEREJWE",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Ntibyashobotse kubika status."
      );
    }

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId &&
        order.status === "TEGEREJE DELIVERY"
          ? {
              ...order,
              status: "YOHEREJWE",
              deliverySentAt:
                new Date().toLocaleDateString("rw-RW"),
            }
          : order
      )
    );

    alert(
      "DELIVERY yoherejwe.\n\n" +
        "Status: YOHEREJWE\n" +
        "Byabitswe muri PostgreSQL."
    );
  } catch (error) {
    console.error(
      "SEND DELIVERY ERROR:",
      error
    );

    alert(
      "DELIVERY NTABWO YABASHIJE KUBIKWA.\n\n" +
        "Reba niba backend iri gukora kuri port 5001."
    );
  }
};

  const handleDeliveryArrived = async (orderId) => {
    try {
      const response = await fetch(
        `https://ccpt-backend-ten.vercel.app/api/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "YAGEZE",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Ntibyashobotse kubika status."
        );
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId &&
          order.status === "YOHEREJWE"
            ? {
                ...order,
                status: "YAGEZE",
                deliveryArrivedAt:
                  new Date().toLocaleDateString("rw-RW"),
              }
            : order
        )
      );

      alert(
        "DELIVERY yageze ku muguzi.\n\n" +
          "Status: YAGEZE\n" +
          "Byabitswe muri PostgreSQL."
      );
    } catch (error) {
      console.error(
        "DELIVERY ARRIVED ERROR:",
        error
      );

      alert(
        "DELIVERY NTABWO YABASHIJE KUBIKWA.\n\n" +
          "Reba niba backend iri gukora kuri port 5001."
      );
    }
  };

    const handleBuyerReceivedProduct = async (orderId) => {
    try {
      const response = await fetch(
        `https://ccpt-backend-ten.vercel.app/api/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "YAKIRIWE N'UMUGUZI",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Ntibyashobotse kubika status."
        );
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId &&
          order.status === "YAGEZE"
            ? {
                ...order,
                status: "YAKIRIWE N'UMUGUZI",
                buyerReceivedAt:
                  new Date().toLocaleString("rw-RW"),
              }
            : order
        )
      );

      alert(
        "UMUSARURO WAKIRIWE NEZA.\n\n" +
          "STATUS: YAKIRIWE N'UMUGUZI\n" +
          "Byabitswe muri PostgreSQL."
      );
    } catch (error) {
      console.error(
        "BUYER RECEIVED ERROR:",
        error
      );

      alert(
        "Kwakira umusaruro ntibyabashije kubikwa.\n\n" +
          "Reba niba backend iri gukora kuri port 5001."
      );
    }
  };
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
        "WAGENZUWE - NTABWO WEMEJWE"
    );

  const approvedProducts =
    myProducts.filter(
      (product) =>
        product.status === "WEMEJWE"
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

  const deliveryOrders =
    orders.filter(
      (order) =>
        order.status ===
          "YEMEJWE N'UMUHUZA" ||
        order.status ===
          "TEGEREJE DELIVERY" ||
        order.status ===
          "YOHEREJWE" ||
        order.status === "YAGEZE"
    );

  const buyerDistricts =
    districtsByProvince[
      buyerOrder.province
    ] || [];

  const statusStyle = (status) => {
    if (status === "WEMEJWE") {
      return {
        ...styles.status,
        background: "#d9f2df",
        color: "#087a2d",
      };
    }

    if (
      status ===
      "WAGENZUWE - NTABWO WEMEJWE"
    ) {
      return {
        ...styles.status,
        background: "#fff1d6",
        color: "#a15c00",
      };
    }

    if (
      status ===
      "YANZWE N'UMUHUZA"
    ) {
      return {
        ...styles.status,
        background: "#fde4e2",
        color: "#b42318",
      };
    }

    if (status === "YAGEZE") {
      return {
        ...styles.status,
        background: "#d9f2df",
        color: "#087a2d",
      };
    }

    if (status === "YOHEREJWE") {
      return {
        ...styles.status,
        background: "#e5f0ff",
        color: "#1557a6",
      };
    }

    if (
      status ===
      "TEGEREJE DELIVERY"
    ) {
      return {
        ...styles.status,
        background: "#fff1d6",
        color: "#a15c00",
      };
    }

    return {
      ...styles.status,
      background: "#fff4cc",
      color: "#866500",
    };
  };

  const ProductCard = ({
    product,
    action,
  }) => (
    <div style={styles.card}>
      <div
        style={{
          ...styles.row,
          justifyContent:
            "space-between",
          marginBottom: "12px",
        }}
      >
        <h3
          style={{
            margin: 0,
            color: "#116530",
          }}
        >
          {product.name}
        </h3>

        <span
          style={statusStyle(
            product.status
          )}
        >
          {product.status}
        </span>
      </div>
<div>
  <strong>
    Umuhinzi:
  </strong>
  <br />
  {
    product.farmer_name
  }
</div>

<div>
  <strong>
    Telefoni y'umuhinzi:
  </strong>
  <br />
  {
    product.farmer_phone
  }
</div>

<div>
  <strong>
    Ubwoko:
  </strong>
  <br />
  {product.type}
</div>
      <div style={styles.grid}>
        

        <div>
          <strong>Ingano:</strong>
          <br />
          {product.quantity}{" "}
          {product.unit}
        </div>

        <div>
          <strong>Igiciro:</strong>
          <br />
          {product.price ||
            "Ntabwo yashyizweho"}
        </div>

        
        <div>
          <strong>Intara:</strong>
          <br />
          {product.province}
        </div>

        <div>
          <strong>Akarere:</strong>
          <br />
          {product.district}
        </div>

        <div>
          <strong>Umurenge:</strong>
          <br />
          {product.sector}
        </div>

        <div>
          <strong>Akagari:</strong>
          <br />
          {product.cell}
        </div>

        <div>
          <strong>Umudugudu:</strong>
          <br />
          {product.village}
        </div>
      </div>

      {product.verificationReason && (
        <div
          style={{
            ...styles.info,
            marginTop: "15px",
          }}
        >
          <strong>IMPAMVU:</strong>{" "}
          {product.verificationReason}
        </div>
      )}

      {action && (
        <div
          style={{
            marginTop: "16px",
          }}
        >
          {action}
        </div>
      )}
    </div>
  );

  if (page === "home") {
    return (
      <div style={styles.page}>
        <header
          style={{
            ...styles.header,
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div>
            <h1 style={styles.title}>
              GURISHA UMUSARURO WAWE
            </h1>

            <p style={styles.subtitle}>
              UBUHINZI / UBWOROZI / ISOKO
            </p>
          </div>
        </header>

        <main style={styles.container}>
          <div style={styles.card}>
            <h2>Murakaza neza</h2>

            <p>
              Guhuza abahinzi,
              aborozi, abahuza
              n'abaguzi kugira ngo
              umusaruro ubone isoko
              kandi komande zikurikiranwe.
            </p>
          </div>

          <div style={{
  ...styles.menu,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "22px",
  marginTop: "28px",
}}>
  <button
    style={{
      ...styles.menuButton,
      backgroundColor: "#218838",
      color: "#ffffff",
      padding: "28px 20px",
      minHeight: "160px",
      border: "none",
      borderRadius: "18px",
      fontSize: "23px",
      fontWeight: "bold",
      lineHeight: "1.8",
      cursor: "pointer",
      boxShadow: "0 5px 14px rgba(0,0,0,0.15)",
    }}
    onClick={() => setPage("farmer")}
  >
    <span style={{fontSize: "38px"}}>🌱</span>
    <br />
    UBWOROZI / UMUHINZI
    <br />
    <small style={{fontSize: "15px", fontWeight: "normal"}}>
      Shyiraho umusaruro
    </small>
  </button>

  <button
    style={{
      ...styles.menuButton,
      backgroundColor: "#f07818",
      color: "#ffffff",
      padding: "28px 20px",
      minHeight: "160px",
      border: "none",
      borderRadius: "18px",
      fontSize: "23px",
      fontWeight: "bold",
      lineHeight: "1.8",
      cursor: "pointer",
      boxShadow: "0 5px 14px rgba(0,0,0,0.15)",
    }}
    onClick={() => setPage("agent")}
  >
    <span style={{fontSize: "38px"}}>🤝</span>
    <br />
    UMUHUZA
    <br />
    <small style={{fontSize: "15px", fontWeight: "normal"}}>
      Genzura kandi wemeze
    </small>
  </button>

  <button
    style={{
      ...styles.menuButton,
      backgroundColor: "#087ff5",
      color: "#ffffff",
      padding: "28px 20px",
      minHeight: "160px",
      border: "none",
      borderRadius: "18px",
      fontSize: "23px",
      fontWeight: "bold",
      lineHeight: "1.8",
      cursor: "pointer",
      boxShadow: "0 5px 14px rgba(0,0,0,0.15)",
    }}
    onClick={() => setPage("buyer")}
  >
    <span style={{fontSize: "38px"}}>🛒</span>
    <br />
    UMUGUZI
    <br />
    <small style={{fontSize: "15px", fontWeight: "normal"}}>
      Shaka umusaruro
    </small>
  </button>
</div>
</main>
      </div>
    );
  }

  if (page === "farmer") {
    return (
      <div style={styles.page}>
        <header
          style={{
            ...styles.header,
            position: "relative",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                ...styles.title,
                textAlign: "center",
              }}
            >
              UBWOROZI / UMUHINZI
            </h1>

            <p style={styles.subtitle}>
              Gushyira umusaruro ku isoko
            </p>
          </div>

          <button
            style={{
              ...styles.secondaryButton,
              position: "absolute",
              left: "24px",
            }}
            onClick={() =>
              setPage("home")
            }
          >
             AHABANZA
          </button>
        </header>

        <main style={styles.container}>
          <div style={styles.menu}>
            <button
              style={styles.menuButton}
              onClick={() =>
                setShowFarmerProductForm(
                  !showFarmerProductForm
                )
              }
            >
              + UMUSARURO MUSHYA
            </button>

            <button
              style={styles.menuButton}
              onClick={() =>
                setShowMyProducts(
                  !showMyProducts
                )
              }
            >
               UMUSARURO WANJYE (
              {myProducts.length})
            </button>
          </div>

          {showFarmerProductForm && (
            <form
              onSubmit={
                handleFarmerProductSubmit
              }
              style={styles.card}
            >
              <h2>
                UMUSARURO MUSHYA
              </h2>

              <div style={styles.info}>
                Umusaruro mushya utangira kuri
                <strong>
                  {" "}
                  NTABWO WAGENZUWE
                </strong>
                . UMUHUZA ni we uzawugenzura.
              </div>

              <div style={styles.grid}>
                <div style={styles.field}>
                  <label style={styles.label}>
                    Izina ry'Umuhinzi / Umworozi
                  </label>

                  <input
                    style={styles.input}
                    value={
                      farmerProduct.farmerName
                    }
                    onChange={(e) =>
                      setFarmerProduct({
                        ...farmerProduct,
                        farmerName:
                          e.target.value,
                      })
                    }
                    placeholder="Andika izina ry'Umuhinzi / Umworozi"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    Izina ry'umusaruro
                  </label>

                  <input
                    style={styles.input}
                    value={
                      farmerProduct.name
                    }
                    onChange={(e) =>
                      setFarmerProduct({
                        ...farmerProduct,
                        name:
                          e.target.value,
                      })
                    }
                    placeholder="Urugero: Ibirayi"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    Ubwoko
                  </label>

                  <select
                    style={styles.input}
                    value={
                      farmerProduct.type
                    }
                    onChange={(e) =>
                      setFarmerProduct({
                        ...farmerProduct,
                        type:
                          e.target.value,
                      })
                    }
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
                </div>

                {farmerProduct.type === "UBWOROZI" && (
                  <div style={styles.field}>
                    <label style={styles.label}>
                      Ubwoko bw'itungo
                    </label>

                    <select
                      style={styles.input}
                      value={farmerProduct.livestockType || ""}
                      onChange={(e) =>
                        setFarmerProduct({
                          ...farmerProduct,
                          livestockType: e.target.value,
                          name: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Hitamo itungo</option>
                      <option value="Inka">Inka</option>
                      <option value="Ihene">Ihene</option>
                      <option value="Ingurube">Ingurube</option>
                      <option value="Intama">Intama</option>
                      <option value="Inkoko">Inkoko</option>
                      <option value="Inkwavu">Inkwavu</option>
                      <option value="Imbata">Imbata</option>
                      <option value="Inkware">Inkware</option>
                      <option value="Indogobe">Indogobe</option>
                      <option value="Ifarashi">Ifarashi</option>
                      <option value="Inzuki">Inzuki</option>
                      <option value="Ibindi">Ibindi</option>
                    </select>

                    <p>
                      Andika umubare w'amatungo n'igiciro
                      mu bice byabyo biri hepfo.
                    </p>
                  </div>
                )}

                <div style={styles.field}>
                  <label style={styles.label}>
                    Ifoto / Media
                  </label>

                  <input
                    style={styles.input}
                    type="file"
                    onChange={(e) =>
                      setFarmerProduct({
                        ...farmerProduct,
                        media:
                          e.target.files?.[0] ||
                          null,
                      })
                    }
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    Ingano
                  </label>

                  <input
                    style={styles.input}
                    type="number"
                    min="0"
                    value={
                      farmerProduct.quantity
                    }
                    onChange={(e) =>
                      setFarmerProduct({
                        ...farmerProduct,
                        quantity:
                          e.target.value,
                      })
                    }
                    placeholder="Urugero: 500"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    Igipimo
                  </label>

                  <select
                    style={styles.input}
                    value={
                      farmerProduct.unit
                    }
                    onChange={(e) =>
                      setFarmerProduct({
                        ...farmerProduct,
                        unit:
                          e.target.value,
                      })
                    }
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

                    <option value="LITRE">
                      LITRE
                    </option>

                    <option value="IBITUNGA">
                      IBITUNGA
                    </option>

                    <option value="AMACUPA">
                      AMACUPA
                    </option>

                    <option value="AMASANDUKU">
                      AMASANDUKU
                    </option>

                    <option value="ANDI">
                      ANDI
                    </option>
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    Igiciro
                  </label>

                  <input
                    style={styles.input}
                    value={
                      farmerProduct.price
                    }
                    onChange={(e) =>
                      setFarmerProduct({
                        ...farmerProduct,
                        price:
                          e.target.value,
                      })
                    }
                    placeholder="Urugero: 500 RWF/KG"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    Telefoni y'umuhinzi
                  </label>

                  <input
                    style={styles.input}
                    value={
                      farmerProduct.phone
                    }
                    onChange={(e) =>
                      setFarmerProduct({
                        ...farmerProduct,
                        phone:
                          e.target.value,
                      })
                    }
                    placeholder="07XXXXXXXX"
                  />
                </div>
              </div>

              <h3>
                AHO UMUSARURO URI
              </h3>

              <div style={styles.grid}>
                <div style={styles.field}>
                  <label style={styles.label}>
                    INTARA
                  </label>

                  <select
                    style={styles.input}
                    value={
                      farmerProduct.province
                    }
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
                  >
                    <option value="">
                      Hitamo Intara
                    </option>

                    {Object.keys(
                      districtsByProvince
                    ).map(
                      (province) => (
                        <option
                          key={province}
                          value={province}
                        >
                          {province}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    AKARERE
                  </label>

                  <select
                    style={styles.input}
                    value={
                      farmerProduct.district
                    }
                    disabled={
                      !farmerProduct.province
                    }
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
                  >
                    <option value="">
                      Hitamo Akarere
                    </option>

                    {(
                      districtsByProvince[
                        farmerProduct.province
                      ] || []
                    ).map(
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
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    UMURENGE
                  </label>

                  <select
                    style={styles.input}
                    value={
                      farmerProduct.sector
                    }
                    disabled={
                      !farmerProduct.district
                    }
                    onChange={(e) =>
                      setFarmerProduct({
                        ...farmerProduct,
                        sector:
                          e.target.value,
                        cell: "",
                        village: "",
                      })
                    }
                  >
                    <option value="">
                      Hitamo Umurenge
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
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    AKAGARI
                  </label>

                  <select
                    style={styles.input}
                    value={
                      farmerProduct.cell
                    }
                    disabled={
                      !farmerProduct.sector
                    }
                    onChange={(e) =>
                      setFarmerProduct({
                        ...farmerProduct,
                        cell:
                          e.target.value,
                        village: "",
                      })
                    }
                  >
                    <option value="">
                      Hitamo Akagari
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
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    UMUDUGUDU
                  </label>

                  <select
                    style={styles.input}
                    value={
                      farmerProduct.village
                    }
                    disabled={
                      !farmerProduct.cell
                    }
                    onChange={(e) =>
                      setFarmerProduct({
                        ...farmerProduct,
                        village:
                          e.target.value,
                      })
                    }
                  >
                    <option value="">
                      Hitamo Umudugudu
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
                </div>
              </div>

              <button
                type="submit"
                style={styles.button}
              >
                OHEREZA UMUSARURO
              </button>
            </form>
          )}

          {showMyProducts && (
            <div>
              <h2>
                UMUSARURO WANJYE
              </h2>

              {myProducts.length === 0 ? (
                <div style={styles.card}>
                  Nta musaruro urabikwa.
                </div>
              ) : (
                myProducts.map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  )
                )
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  if (page === "agent") {
    return (
      <div style={styles.page}>
        <header
          style={{
            ...styles.header,
            position: "relative",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                ...styles.title,
                textAlign: "center",
              }}
            >
              UMUHUZA
            </h1>

            <p style={styles.subtitle}>
              Kugenzura umusaruro no
              gukurikirana komande
            </p>
          </div>

          <button
            style={{
              ...styles.secondaryButton,
              position: "absolute",
              left: "24px",
            }}
            onClick={() =>
              setPage("home")
            }
          >
             AHABANZA
          </button>
        </header>

        <main style={styles.container}>
          <div style={styles.menu}>
            <button
              style={styles.menuButton}
              onClick={() =>
                setShowPendingProducts(
                  !showPendingProducts
                )
              }
            >
               UMUSARURO
              UTARAGENZURWA (
              {pendingProducts.length})
            </button>

            <button
              style={styles.menuButton}
              onClick={() =>
                setShowVerifiedProducts(
                  !showVerifiedProducts
                )
              }
            >
                WAGENZUWE - NTABWO
              WEMEJWE (
              {verifiedProducts.length})
            </button>

            <button
              style={styles.menuButton}
              onClick={() =>
                setShowApprovedProducts(
                  !showApprovedProducts
                )
              }
            >
               UMUSARURO WEMEJWE (
              {approvedProducts.length})
            </button>

            <button
              style={styles.menuButton}
              onClick={() =>
                setShowAgentOrders(
                  !showAgentOrders
                )
              }
            >
               KOMANDE ZITEGEREJE (
              {pendingOrders.length})
            </button>

            <button
              style={styles.menuButton}
              onClick={() =>
                setShowApprovedOrders(
                  !showApprovedOrders
                )
              }
            >
               KOMANDE ZEMEJWE (
              {approvedOrders.length})
            </button>

            <button
              style={styles.menuButton}
              onClick={() =>
                setShowRejectedOrders(
                  !showRejectedOrders
                )
              }
            >
              {rejectedOrders.length})
            </button>

            <button
              style={styles.menuButton}
              onClick={() =>
                setShowDelivery(
                  !showDelivery
                )
              }
            >
               DELIVERY (
              {deliveryOrders.length})
            </button>
          </div>

          {showPendingProducts && (
            <div>
              <h2>
                UMUSARURO
                UTARAGENZURWA
              </h2>

              {pendingProducts.length ===
              0 ? (
                <div style={styles.card}>
                  Nta musaruro utegereje
                  igenzura.
                </div>
              ) : (
                pendingProducts.map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      action={
                        <button
                          style={
                            styles.warningButton
                          }
                          onClick={() =>
                            handleVerifyProduct(
                              product.id
                            )
                          }
                        >
                          GENZURA
                        </button>
                      }
                    />
                  )
                )
              )}
            </div>
          )}

          {showVerifiedProducts && (
            <div>
              <h2>
                WAGENZUWE - NTABWO
                WEMEJWE
              </h2>

              {verifiedProducts.length ===
              0 ? (
                <div style={styles.card}>
                  Nta musaruro wagenzuwe
                  utegereje kwemezwa.
                </div>
              ) : (
                verifiedProducts.map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      action={
                        <button
                          style={styles.button}
                          onClick={() =>
                            handleApproveProduct(
                              product.id
                            )
                          }
                        >
                          EMEZA UMUSARURO
                        </button>
                      }
                    />
                  )
                )
              )}
            </div>
          )}

          {showApprovedProducts && (
            <div>
              <h2>
                UMUSARURO WEMEJWE
              </h2>

              {approvedProducts.length ===
              0 ? (
                <div style={styles.card}>
                  Nta musaruro wemejwe.
                </div>
              ) : (
                approvedProducts.map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  )
                )
              )}
            </div>
          )}

          {showAgentOrders && (
            <div>
              <h2>
                KOMANDE ZITEGEREJE
              </h2>

              {pendingOrders.length ===
              0 ? (
                <div style={styles.card}>
                  Nta KOMANDE ritegereje.
                </div>
              ) : (
                pendingOrders.map(
                  (order) => (
                    <div
                      key={order.id}
                      style={styles.card}
                    >
                      <h3>
                        KOMANDE #{order.id}
                      </h3>

                      <div
                        style={styles.grid}
                      >
                        <div>
                          <strong>
                            Umuhinzi:
                          </strong>
                          <br />
                          {
                            order.farmer_name
                          }
                        </div>

                        <div>
                          <strong>
                            Telefoni
                            y'umuhinzi:
                          </strong>
                          <br />
                          {
                            order.farmer_phone
                          }
                        </div>

                        <div>
                          <strong>
                            Umuguzi:
                          </strong>
                          <br />
                          {order.buyerName}
                        </div>

                        <div>
                          <strong>
                            Telefoni
                            y'umuguzi:
                          </strong>
                          <br />
                          {
                            order.buyerPhone
                          }
                        </div>

                        <div>
                          <strong>
                            Umusaruro:
                          </strong>
                          <br />
                          {order.productName}
                        </div>

                        <div>
                          <strong>
                            Ubwoko:
                          </strong>
                          <br />
                          {order.productType}
                        </div>

                        <div>
                          <strong>
                            Ingano:
                          </strong>
                          <br />
                          {
                            order.requestedQuantity
                          }{" "}
                          {order.unit}
                        </div>

                        <div>
                          <strong>
                            Igiciro:
                          </strong>
                          <br />
                          {order.price ||
                            "Ntabwo cyashyizweho"}
                        </div>

                        <div>
                          <strong>
                            AMAFARANGA YOSE:
                          </strong>
                          <br />
                          {(() => {
                            const quantity =
                              Number(
                                order.requestedQuantity ||
                                  0
                              );

                            const priceMatch =
                              String(
                                order.price ||
                                  ""
                              )
                                .replace(
                                  /,/g,
                                  ""
                                )
                                .match(
                                  /-?\d+(\.\d+)?/
                                );

                            const unitPrice =
                              priceMatch
                                ? Number(
                                    priceMatch[0]
                                  )
                                : 0;

                            const total =
                              quantity *
                              unitPrice;

                            return total >
                              0
                              ? `${total.toLocaleString(
                                  "en-US"
                                )} RWF`
                              : "Ntabwo cyashyizweho";
                          })()}
                        </div>

                        <div
                          style={{
                            gridColumn:
                              "1 / -1",
                            background:
                              "#f7faf8",
                            padding: "12px",
                            borderRadius:
                              "8px",
                          }}
                        >
                          <strong>
                            AHO UMUSARURO URI:
                          </strong>
                          <br />
                          {
                            order.province
                          }
                          {" ’ "}
                          {
                            order.district
                          }
                          {" ’ "}
                          {
                            order.sector
                          }
                          {" ’ "}
                          {order.cell}
                          {" ’ "}
                          {
                            order.village
                          }
                        </div>

                        <div
                          style={{
                            gridColumn:
                              "1 / -1",
                            background:
                              "#eef7f0",
                            padding: "12px",
                            borderRadius:
                              "8px",
                          }}
                        >
                          <strong>
                            AHO UMUGUZI AZAKIRIRA:
                          </strong>
                          <br />
                          {
                            order.buyerProvince
                          }
                          {" ’ "}
                          {
                            order.buyerDistrict
                          }
                          {" ’ "}
                          {
                            order.buyerSector
                          }
                          {" ’ "}
                          {
                            order.buyerCell
                          }
                          {" ’ "}
                          {
                            order.buyerVillage
                          }
                        </div>
                      </div>

                      <div
                        style={{
                          ...styles.row,
                          marginTop: "15px",
                        }}
                      >
                        <button
                          style={
                            styles.button
                          }
                          onClick={() =>
                            handleApproveOrder(
                              order.id
                            )
                          }
                        >
                          YEMEZA
                        </button>

                        <button
                          style={
                            styles.dangerButton
                          }
                          onClick={() =>
                            handleRejectOrder(
                              order.id
                            )
                          }
                        >
                          YANGA
                        </button>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          )}

          {showApprovedOrders && (
            <div>
              <h2>
                KOMANDE ZEMEJWE
              </h2>

              {approvedOrders.length ===
              0 ? (
                <div style={styles.card}>
                  Nta KOMANDE yemejwe.
                </div>
              ) : (
                approvedOrders.map(
                  (order) => (
                    <div
                      key={order.id}
                      style={styles.card}
                    >
                      <h3>
                        KOMANDE #{order.id}
                      </h3>

                      <p>
                        <strong>
                          Umuhinzi:
                        </strong>{" "}
                        {
                          order.farmerName
                        }
                      </p>

                      <p>
                        <strong>
                          Umuguzi:
                        </strong>{" "}
                        {
                          order.buyerName
                        }
                      </p>

                      <p>
                        <strong>
                          Umusaruro:
                        </strong>{" "}
                        {
                          order.productName
                        }
                      </p>

                      <p>
                        <strong>
                          Ingano:
                        </strong>{" "}
                        {
                          order.requestedQuantity
                        }{" "}
                        {order.unit}
                      </p>

                      <p>
                        <strong>
                          Igiciro:
                        </strong>{" "}
                        {order.price ||
                          "Ntabwo cyashyizweho"}
                      </p>

                      <p>
                        <strong>
                          AMAFARANGA YOSE:
                        </strong>{" "}
                        {(() => {
                          const quantity =
                            Number(
                              order.requestedQuantity ||
                                0
                            );

                          const priceMatch =
                            String(
                              order.price ||
                                ""
                            )
                              .replace(
                                /,/g,
                                ""
                              )
                              .match(
                                /-?\d+(\.\d+)?/
                              );

                          const unitPrice =
                            priceMatch
                              ? Number(
                                  priceMatch[0]
                                )
                              : 0;

                          const total =
                            quantity *
                            unitPrice;

                          return total >
                            0
                            ? `${total.toLocaleString(
                                "en-US"
                              )} RWF`
                            : "Ntabwo cyashyizweho";
                        })()}
                      </p>

                      <div
                        style={{
                          ...styles.info,
                          marginTop: "12px",
                        }}
                      >
                        <strong>
                          AHO UMUSARURO URI:
                        </strong>
                        <br />
                        {
                          order.province
                        }
                        {" ’ "}
                        {
                          order.district
                        }
                        {" ’ "}
                        {
                          order.sector
                        }
                        {" ’ "}
                        {order.cell}
                        {" ’ "}
                        {
                          order.village
                        }
                      </div>

                      <div
                        style={{
                          ...styles.info,
                          marginTop: "12px",
                        }}
                      >
                        <strong>
                          AHO UMUGUZI AZAKIRIRA:
                        </strong>
                        <br />
                        {
                          order.buyerProvince
                        }
                        {" ’ "}
                        {
                          order.buyerDistrict
                        }
                        {" ’ "}
                        {
                          order.buyerSector
                        }
                        {" ’ "}
                        {
                          order.buyerCell
                        }
                        {" ’ "}
                        {
                          order.buyerVillage
                        }
                      </div>

                      <span
                        style={statusStyle(
                          order.status
                        )}
                      >
                        {order.status}
                      </span>
                    </div>
                  )
                )
              )}
            </div>
          )}

          {showRejectedOrders && (
            <div>
              <h2>
                KOMANDE ZANZWE
              </h2>

              {rejectedOrders.length ===
              0 ? (
                <div style={styles.card}>
                  Nta KOMANDE yanze.
                </div>
              ) : (
                rejectedOrders.map(
                  (order) => (
                    <div
                      key={order.id}
                      style={styles.card}
                    >
                      <h3>
                        KOMANDE #{order.id}
                      </h3>

                      <p>
                        <strong>
                          Umuhinzi:
                        </strong>{" "}
                        {
                          order.farmerName
                        }
                      </p>

                      <p>
                        <strong>
                          Umuguzi:
                        </strong>{" "}
                        {
                          order.buyerName
                        }
                      </p>

                      <p>
                        <strong>
                          Umusaruro:
                        </strong>{" "}
                        {
                          order.productName
                        }
                      </p>

                      <div
                        style={styles.info}
                      >
                        <strong>
                          IMPAMVU:
                        </strong>{" "}
                        {
                          order.rejectionReason
                        }
                      </div>

                      <span
                        style={statusStyle(
                          order.status
                        )}
                      >
                        {order.status}
                      </span>
                    </div>
                  )
                )
              )}
            </div>
          )}

          {showDelivery && (
            <div>
              <h2>
                 DELIVERY
              </h2>

              {deliveryOrders.length ===
              0 ? (
                <div style={styles.card}>
                  Nta KOMANDE riri muri DELIVERY.
                </div>
              ) : (
                deliveryOrders.map(
                  (order) => (
                    <div
                      key={order.id}
                      style={styles.card}
                    >
                      <div
                        style={{
                          ...styles.row,
                          justifyContent:
                            "space-between",
                          marginBottom:
                            "15px",
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                          }}
                        >
                          KOMANDE #{order.id}
                        </h3>

                        <span
                          style={statusStyle(
                            order.status
                          )}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div
                        style={styles.grid}
                      >
                        <div>
                          <strong>
                            Umuhinzi:
                          </strong>
                          <br />
                          {
                            order.farmerName
                          }
                        </div>

                        <div>
                          <strong>
                            Telefoni y'umuhinzi:
                          </strong>
                          <br />
                          {
                            order.farmer_phone
                          }
                        </div>

                        <div>
                          <strong>
                            Umuguzi:
                          </strong>
                          <br />
                          {order.buyerName}
                        </div>

                        <div>
                          <strong>
                            Telefoni y'umuguzi:
                          </strong>
                          <br />
                          {
                            order.buyerPhone
                          }
                        </div>

                        <div>
                          <strong>
                            Umusaruro:
                          </strong>
                          <br />
                          {
                            order.productName
                          }
                        </div>

                        <div>
                          <strong>
                            Ubwoko:
                          </strong>
                          <br />
                          {
                            order.productType
                          }
                        </div>

                        <div>
                          <strong>
                            Ingano:
                          </strong>
                          <br />
                          {
                            order.requestedQuantity
                          }{" "}
                          {order.unit}
                        </div>

                        <div>
                          <strong>
                            Igiciro:
                          </strong>
                          <br />
                          {order.price ||
                            "Ntabwo cyashyizweho"}
                        </div>

                        <div>
                          <strong>
                            AMAFARANGA YOSE:
                          </strong>
                          <br />
                          {(() => {
                            const quantity =
                              Number(
                                order.requestedQuantity ||
                                  0
                              );

                            const priceMatch =
                              String(
                                order.price ||
                                  ""
                              )
                                .replace(
                                  /,/g,
                                  ""
                                )
                                .match(
                                  /-?\d+(\.\d+)?/
                                );

                            const unitPrice =
                              priceMatch
                                ? Number(
                                    priceMatch[0]
                                  )
                                : 0;

                            const total =
                              quantity *
                              unitPrice;

                            return total >
                              0
                              ? `${total.toLocaleString(
                                  "en-US"
                                )} RWF`
                              : "Ntabwo cyashyizweho";
                          })()}
                        </div>

                        <div
                          style={{
                            gridColumn:
                              "1 / -1",
                            background:
                              "#f7faf8",
                            padding: "12px",
                            borderRadius:
                              "8px",
                          }}
                        >
                          <strong>
                            AHO UMUSARURO URI:
                          </strong>
                          <br />

                          {
                            order.province
                          }
                          {" ’ "}
                          {
                            order.district
                          }
                          {" ’ "}
                          {
                            order.sector
                          }
                          {" ’ "}
                          {order.cell}
                          {" ’ "}
                          {
                            order.village
                          }
                        </div>

                        <div
                          style={{
                            gridColumn:
                              "1 / -1",
                            background:
                              "#eef7f0",
                            padding: "12px",
                            borderRadius:
                              "8px",
                          }}
                        >
                          <strong>
                            AHO UMUGUZI AZAKIRIRA:
                          </strong>
                          <br />

                          {
                            order.buyerProvince
                          }
                          {" ’ "}
                          {
                            order.buyerDistrict
                          }
                          {" ’ "}
                          {
                            order.buyerSector
                          }
                          {" ’ "}
                          {
                            order.buyerCell
                          }
                          {" ’ "}
                          {
                            order.buyerVillage
                          }
                        </div>
                      </div>

                      <div
                        style={{
                          ...styles.row,
                          marginTop:
                            "18px",
                        }}
                      >
                        {order.status ===
                          "YEMEJWE N'UMUHUZA" && (
                          <button
                            style={
                              styles.button
                            }
                            onClick={() =>
                              handleStartDelivery(
                                order.id
                              )
                            }
                          >
                            TANGIZA DELIVERY
                          </button>
                        )}

                        {order.status ===
                          "TEGEREJE DELIVERY" && (
                          <button
                            style={
                              styles.warningButton
                            }
                            onClick={() =>
                              handleSendDelivery(
                                order.id
                              )
                            }
                          >
                            OHEREZA DELIVERY
                          </button>
                        )}

                        {order.status ===
                          "YOHEREJWE" && (
                          <button
                            style={
                              styles.button
                            }
                            onClick={() =>
                              handleDeliveryArrived(
                                order.id
                              )
                            }
                          >
                            EMEZA KO YAGEZE
                          </button>
                        )}

                        <button
                          type="button"
                          style={{
                            ...styles.secondaryButton,
                            marginTop: "0px",
                          }}
                          onClick={() =>
                            handleDownloadDeliveryReceipt(
                              order
                            )
                          }
                        >
                           DOWNLOAD DELIVERY RECEIPT
                        </button>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  if (page === "buyer") {
    return (
      <div style={styles.page}>
        <header
          style={{
            ...styles.header,
            position: "relative",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                ...styles.title,
                textAlign: "center",
              }}
            >
              UMUGUZI
            </h1>

            <p style={styles.subtitle}>
              Shaka umusaruro wemejwe
              kandi utange KOMANDE
            </p>
          </div>

          <button
            style={{
              ...styles.secondaryButton,
              position: "absolute",
              left: "24px",
            }}
            onClick={() =>
              setPage("home")
            }
          >
             AHABANZA
          </button>
        </header>

        <main style={styles.container}>
          <div style={styles.menu}>
            <button
              style={styles.menuButton}
              onClick={() =>
                setShowBuyerProducts(
                  !showBuyerProducts
                )
              }
            >
               SHAKA UMUSARURO
            </button>
          </div>

          <div style={styles.info}>
            Umuguzi abona gusa
            <strong>
              {" "}
              UMUSARURO WEMEJWE
            </strong>
            .
          </div>

          {showBuyerProducts && (
            <div>
              <h2>
                UMUSARURO WEMEJWE
              </h2>

              {approvedProducts.length ===
              0 ? (
                <div style={styles.card}>
                  Nta musaruro wemejwe
                  uhari ubu.
                </div>
              ) : (
                approvedProducts.map(
                  (product) => (
                    <div
                      key={product.id}
                      style={styles.card}
                    >
                      <div
                        style={{
                          ...styles.row,
                          justifyContent:
                            "space-between",
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                          }}
                        >
                          {product.name}
                        </h3>

                        <span
                          style={statusStyle(
                            product.status
                          )}
                        >
                          WEMEJWE
                        </span>
                      </div>

                      <div
                        style={{
                          ...styles.grid,
                          marginTop: "15px",
                        }}
                      >
                        <div>
                          <strong>
                            Umuhinzi:
                          </strong>
                          <br />
                          {
                            product.farmer_name
                          }
                        </div>

                        <div>
                          <strong>
                            Ubwoko:
                          </strong>
                          <br />
                          {product.type}
                        </div>

                        <div>
                          <strong>
                            Ingano ihari:
                          </strong>
                          <br />
                          {
                            product.quantity
                          }{" "}
                          {product.unit}
                        </div>

                        <div>
                          <strong>
                            Igiciro:
                          </strong>
                          <br />
                          {product.price ||
                            "Ntabwo yashyizweho"}
                        </div>

                        <div>
                          <strong>
                            Intara:
                          </strong>
                          <br />
                          {
                            product.province
                          }
                        </div>

                        <div>
                          <strong>
                            Akarere:
                          </strong>
                          <br />
                          {
                            product.district
                          }
                        </div>

                        <div>
                          <strong>
                            Umurenge:
                          </strong>
                          <br />
                          {product.sector}
                        </div>

                        <div>
                          <strong>
                            Akagari:
                          </strong>
                          <br />
                          {product.cell}
                        </div>

                        <div>
                          <strong>
                            Umudugudu:
                          </strong>
                          <br />
                          {product.village}
                        </div>
                      </div>

                      <button
                        style={{
                          ...styles.button,
                          marginTop: "18px",
                        }}
                        onClick={() => {
                          setSelectedBuyerProduct(
                            product
                          );

                          setBuyerOrder({
                            buyerName: "",
                            province: "",
                            district: "",
                            sector: "",
                            cell: "",
                            village: "",
                            quantity: "",
                            buyerPhone: "",
                          });

                          setBuyerSectors([]);
                          setBuyerCells([]);
                          setBuyerVillages([]);

                          setShowOrderForm(
                            true
                          );
                        }}
                      >
                        KOMANDE
                      </button>
                    </div>
                  )
                )
              )}
            </div>
          )}

          {showOrderForm &&
            selectedBuyerProduct && (
              <form
                onSubmit={
                  handleBuyerOrderSubmit
                }
                style={styles.card}
              >
                <h2>
                  KOMANDE
                </h2>

                <div style={styles.info}>
                  <strong>
                    Umusaruro:
                  </strong>{" "}
                  {
                    selectedBuyerProduct.name
                  }
                  <br />

                  <strong>
                    Umuhinzi:
                  </strong>{" "}
                  {
                    selectedBuyerProduct.farmer_name
                  }
                  <br />

                  <strong>
                    Ingano ihari:
                  </strong>{" "}
                  {
                    selectedBuyerProduct.quantity
                  }{" "}
                  {
                    selectedBuyerProduct.unit
                  }
                  <br />

                  <strong>
                    Igiciro:
                  </strong>{" "}
                  {
                    selectedBuyerProduct.price ||
                    "Ntabwo cyashyizweho"
                  }
                </div>

                <div style={styles.grid}>
                  <div style={styles.field}>
                    <label style={styles.label}>
                      Izina ry'umuguzi
                    </label>

                    <input
                      style={styles.input}
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
                      placeholder="Andika izina ry'umuguzi"
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>
                      Ingano nshaka
                    </label>

                    <input
                      style={styles.input}
                      type="number"
                      min="1"
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
                      placeholder={
                        "Max " +
                        selectedBuyerProduct.quantity
                      }
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>
                      Telefoni y'umuguzi
                    </label>

                    <input
                      style={styles.input}
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
                      placeholder="07XXXXXXXX"
                    />
                  </div>
                </div>

                <h3>
                  AHO NZAKIRIRA UMUSARURO
                </h3>

                <div style={styles.info}>
                  Hitamo aho umusaruro
                  uzakirirwa ukoresheje
                  dropdown.
                </div>

                <div style={styles.grid}>
                  <div style={styles.field}>
                    <label style={styles.label}>
                      INTARA
                    </label>

                    <select
                      style={styles.input}
                      value={
                        buyerOrder.province
                      }
                      onChange={(e) =>
                        setBuyerOrder({
                          ...buyerOrder,
                          province:
                            e.target.value,
                          district: "",
                          sector: "",
                          cell: "",
                          village: "",
                        })
                      }
                    >
                      <option value="">
                        Hitamo Intara
                      </option>

                      {Object.keys(
                        districtsByProvince
                      ).map(
                        (province) => (
                          <option
                            key={province}
                            value={
                              province
                            }
                          >
                            {province}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>
                      AKARERE
                    </label>

                    <select
                      style={styles.input}
                      value={
                        buyerOrder.district
                      }
                      disabled={
                        !buyerOrder.province
                      }
                      onChange={(e) =>
                        setBuyerOrder({
                          ...buyerOrder,
                          district:
                            e.target.value,
                          sector: "",
                          cell: "",
                          village: "",
                        })
                      }
                    >
                      <option value="">
                        {buyerOrder.province
                          ? "Hitamo Akarere"
                          : "Banza uhitemo Intara"}
                      </option>

                      {buyerDistricts.map(
                        (district) => (
                          <option
                            key={district}
                            value={
                              district
                            }
                          >
                            {district}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>
                      UMURENGE
                    </label>

                    <select
                      style={styles.input}
                      value={
                        buyerOrder.sector
                      }
                      disabled={
                        !buyerOrder.district
                      }
                      onChange={(e) =>
                        setBuyerOrder({
                          ...buyerOrder,
                          sector:
                            e.target.value,
                          cell: "",
                          village: "",
                        })
                      }
                    >
                      <option value="">
                        {buyerOrder.district
                          ? "Hitamo Umurenge"
                          : "Banza uhitemo Akarere"}
                      </option>

                      {buyerSectors.map(
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
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>
                      AKAGARI
                    </label>

                    <select
                      style={styles.input}
                      value={
                        buyerOrder.cell
                      }
                      disabled={
                        !buyerOrder.sector
                      }
                      onChange={(e) =>
                        setBuyerOrder({
                          ...buyerOrder,
                          cell:
                            e.target.value,
                          village: "",
                        })
                      }
                    >
                      <option value="">
                        {buyerOrder.sector
                          ? "Hitamo Akagari"
                          : "Banza uhitemo Umurenge"}
                      </option>

                      {buyerCells.map(
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
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>
                      UMUDUGUDU
                    </label>

                    <select
                      style={styles.input}
                      value={
                        buyerOrder.village
                      }
                      disabled={
                        !buyerOrder.cell
                      }
                      onChange={(e) =>
                        setBuyerOrder({
                          ...buyerOrder,
                          village:
                            e.target.value,
                        })
                      }
                    >
                      <option value="">
                        {buyerOrder.cell
                          ? "Hitamo Umudugudu"
                          : "Banza uhitemo Akagari"}
                      </option>

                      {buyerVillages.map(
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
                  </div>
                </div>

                <div
                  style={{
                    ...styles.info,
                    marginTop: "10px",
                  }}
                >
                  <strong>
                    AHO NZAKIRIRA:
                  </strong>
                  <br />

                  {buyerOrder.province ||
                    "INTARA"}{" "}
                  ’{" "}
                  {buyerOrder.district ||
                    "AKARERE"}{" "}
                  ’{" "}
                  {buyerOrder.sector ||
                    "UMURENGE"}{" "}
                  ’{" "}
                  {buyerOrder.cell ||
                    "AKAGARI"}{" "}
                  ’{" "}
                  {buyerOrder.village ||
                    "UMUDUGUDU"}
                </div>

                <div
                  style={{
                    ...styles.row,
                    marginTop: "18px",
                  }}
                >
                  <button
                    type="submit"
                    style={styles.button}
                  >
                    OHEREZA KOMANDE
                  </button>

                  <button
                    type="button"
                    style={
                      styles.secondaryButton
                    }
                    onClick={() => {
                      setShowOrderForm(false);
                      setSelectedBuyerProduct(
                        null
                      );
                    }}
                  >
                    FUNGA
                  </button>
                </div>
              </form>
            )}
        
            {/* KOMANDE ZANJYE */}
            <section
              style={{
                marginTop: "30px",
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "12px",
              }}
            >
              <h2>KOMANDE ZANJYE</h2>

              {orders.filter(
                (order) =>
                  order.buyerPhone &&
                  buyerHistoryPhone &&
                  order.buyerPhone.trim() ===
                    buyerOrder.buyerPhone.trim()
              ).length === 0 ? (
                <p>Nta KOMANDE urafite ubu.</p>
              ) : (
                orders
                  .filter(
                    (order) =>
                      order.buyerPhone &&
                      buyerOrder.buyerPhone &&
                      order.buyerPhone.trim() ===
                        buyerOrder.buyerPhone.trim()
                  )
                  .map((order) => (
                    <div
                      key={order.id}
                      style={{
                        marginTop: "15px",
                        padding: "15px",
                        border: "1px solid #ccc",
                        borderRadius: "10px",
                      }}
                    >
                      <h3>
                        KOMANDE #{order.id}
                      </h3>

                      <p>
                        <strong>UMUSARURO:</strong>{" "}
                        {order.productName}
                      </p>

                      <p>
                        <strong>UMUHINZI:</strong>{" "}
                        {order.farmer_name}
                      </p>

                      <p>
                        <strong>INGANO:</strong>{" "}
                        {order.requestedQuantity}{" "}
                        {order.unit}
                      </p>

                      <p>
                        <strong>IGICIRO:</strong>{" "}
                        {order.price} FRW
                      </p>

                      <p>
                        <strong>STATUS:</strong>{" "}
                        {order.status}
                      </p>

                      {order.status === "YAGEZE" && (
                        <button
                          type="button"
                          style={{
                            ...styles.button,
                            backgroundColor: "#198754",
                            color: "#fff",
                            marginTop: "10px",
                          }}
                          onClick={() =>
                            handleBuyerReceivedProduct(
                              order.id
                            )
                          }
                        >
                           NAKIRIYE UMUSARURO
                        </button>
                      )}

                      {order.status ===
                        "YAKIRIWE N'UMUGUZI" && (
                        <div
                          style={{
                            marginTop: "12px",
                            padding: "12px",
                            borderRadius: "8px",
                            backgroundColor: "#e8f5e9",
                          }}
                        >
                          <strong>
                             UMUSARURO WAKIRIWE NEZA
                          </strong>

                          <br />

                          <strong>STATUS:</strong>{" "}
                          YAKIRIWE N'UMUGUZI

                          <br />

                          <strong>
                            IGIHE WAKIRIYE:
                          </strong>{" "}
                          {order.buyerReceivedAt}
                        </div>
                      )}
                    </div>
                  ))
              )}
            </section></main>
      </div>
    );
  }

  return null;
}

export default App;
















