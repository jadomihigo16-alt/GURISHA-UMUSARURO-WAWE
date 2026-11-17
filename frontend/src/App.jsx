import RWANDA_LOCATIONS from "./data/rwanda-locations.json";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import AdminDashboard from "./AdminDashboard";

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
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerFullName, setRegisterFullName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerRole, setRegisterRole] = useState("UMUHINZI");
  const [registerProvince, setRegisterProvince] = useState("");
  const [registerDistrict, setRegisterDistrict] = useState("");
  const [registerSector, setRegisterSector] = useState("");
  const [registerCell, setRegisterCell] = useState("");
  const [registerVillage, setRegisterVillage] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterLoading(true);

    try {
      const response = await fetch(
        "https://gurisha-umusaruro-wawe.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: registerFullName.trim(),
            phone: registerPhone.trim(),
            password: registerPassword,
            role: registerRole,
            province: registerProvince,
            district: registerDistrict,
            sector: registerSector,
            cell: registerCell,
            village: registerVillage
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "GUKORA KONTI BYANZE.");
      }

      alert(data.message || "KONTI YAKOZWE NEZA.");

      setLoginPhone(registerPhone.trim());
      setLoginPassword("");

      setRegisterFullName("");
      setRegisterPhone("");
      setRegisterPassword("");
      setRegisterRole("UMUHINZI");
      setRegisterProvince("");
      setRegisterDistrict("");
      setRegisterSector("");
      setRegisterCell("");
      setRegisterVillage("");

      setPage("login");

    } catch (error) {
      setRegisterError(error.message || "GUKORA KONTI BYANZE.");
    } finally {
      setRegisterLoading(false);
    }
  };
  const handleLogout = () => {
    sessionStorage.removeItem("gurisha_token");
    sessionStorage.removeItem("gurisha_user");
    setLoginPhone("");
    setLoginPassword("");
    setLoginError("");
    setPage("home");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const response = await fetch("https://gurisha-umusaruro-wawe.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: loginPhone.trim(),
          password: loginPassword
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "KWINJIRA BYANZE.");
      }

      if (data.user.role === "ADMIN") {
        throw new Error("ADMIN AKORESHA LOGIN YE YIHARIYE.");
      }

      sessionStorage.setItem("gurisha_token", data.token);
      sessionStorage.setItem("gurisha_user", JSON.stringify(data.user));

      if (["UMUHINZI", "UMWOROZI"].includes(data.user.role)) {
        setPage("farmer");
      } else if (data.user.role === "UMUGUZI") {
        const buyerPhone = String(data.user.phone || "").trim();

        setBuyerHistoryPhone(buyerPhone);
        setBuyerOrder((prev) => ({
          ...prev,
          buyerPhone: buyerPhone,
        }));

        try {
          const ordersResponse = await fetch(
            `https://gurisha-umusaruro-wawe.onrender.com/api/orders/buyer/${encodeURIComponent(buyerPhone)}`
          );

          const ordersData = await ordersResponse.json();

          if (ordersResponse.ok && ordersData.success) {
            const buyerOrders = (ordersData.orders || []).map((order) => ({
              ...order,
              buyerPhone: order.buyer_phone || order.buyerPhone || buyerPhone,
              buyerName: order.buyer_name || order.buyerName || "",
              productName: order.product_name || order.productName || "",
              farmer_name: order.farmer_name || order.farmerName || "",
              requestedQuantity:
                order.requested_quantity || order.requestedQuantity || "",
              unit: order.unit || "",
              price: order.price || 0,
              status: order.status || "",
            }));

            setOrders(buyerOrders);
          } else {
            setOrders([]);
            console.error("KUBONA KOMANDE BYANZE:", ordersData.message);
          }
        } catch (error) {
          console.error("BUYER ORDERS ERROR:", error);
          setOrders([]);
        }

        setPage("buyer");
      } else if (data.user.role === "UMUCURUZI") {
        const profileResponse = await fetch(
          "https://gurisha-umusaruro-wawe.onrender.com/api/umucuruzi/me",
          { headers: { Authorization: `Bearer ${data.token}` } }
        );
        const profileData = await profileResponse.json();

        if (!profileResponse.ok || !profileData.success) {
          throw new Error(profileData.message || "UMWIRONDORO WA UMUCURUZI NTUBONETSE.");
        }

        setIntermediaryProfile({
          ...emptyIntermediaryProfile,
          ...profileData.profile
        });
        setPage("agent");
      } else {
        throw new Error("URU RWAWE NTIRWEMEWE.");
      }
    } catch (error) {
      sessionStorage.removeItem("gurisha_token");
      sessionStorage.removeItem("gurisha_user");
      setLoginError(error.message || "KWINJIRA BYANZE.");
    } finally {
      setLoginLoading(false);
    }
  };

  const emptyIntermediaryProfile = {
    full_name: "",
    phone: "",
    work_place: "",
    province: "",
    district: "",
    sector: "",
    cell: "",
    village: ""
  };

  const [intermediaryProfile, setIntermediaryProfile] =
    useState(emptyIntermediaryProfile);

  const [profileSaving, setProfileSaving] = useState(false);

  const [profileSectors, setProfileSectors] = useState([]);
  const [profileCells, setProfileCells] = useState([]);
  const [profileVillages, setProfileVillages] = useState([]);
  const [buyerSearch, setBuyerSearch] = useState("");
  const [buyerCategory, setBuyerCategory] = useState("BYOSE");
  const [farmerSearch, setFarmerSearch] = useState("");
  const [agentSearch, setAgentSearch] = useState("");

  const matchesProductSearch = (product, searchTerm) => {
    const searchable = [
      product.name,
      product.product_name,
      product.type,
      product.category,
      product.farmer_name,
      product.farmer_phone,
      product.phone,
      product.province,
      product.district,
      product.sector,
      product.cell,
      product.village,
      product.status,
      product.offer_status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchable.includes(searchTerm.trim().toLowerCase());
  };

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
      const token = sessionStorage.getItem("gurisha_token");
      const user = JSON.parse(
        sessionStorage.getItem("gurisha_user") || "null"
      );

      if (!token || !user?.role) {
        setMyProducts([]);
        return;
      }

      let endpoint = "";

      if (["UMUHINZI", "UMWOROZI"].includes(user.role)) {
        endpoint = "/api/products/mine";
      } else if (user.role === "UMUCURUZI") {
        endpoint = "/api/products";
      } else if (user.role === "UMUGUZI") {
        endpoint = "/api/products/approved";
      } else {
        setMyProducts([]);
        return;
      }

      const response = await fetch(
        `https://gurisha-umusaruro-wawe.onrender.com${endpoint}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setMyProducts(data.products);
      } else {
        setMyProducts([]);
        console.error("LOAD PRODUCTS:", data.message);
      }
    } catch (error) {
      console.error("LOAD PRODUCTS ERROR:", error);
    }
  };

  loadProducts();

  const refreshInterval = setInterval(loadProducts, 5000);

  return () => clearInterval(refreshInterval);
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
  // KUVUGURURA KOMANDE ZA UMUCURUZI BURI SEGONDA 15
  useEffect(() => {
    if (page !== "agent") return;

    let active = true;

    const loadAgentOrders = async () => {
      try {
        const token = sessionStorage.getItem("gurisha_token");
        if (!token) return;

        const response = await fetch(
          "https://gurisha-umusaruro-wawe.onrender.com/api/orders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (active && response.ok && data.success) {
          const normalizedOrders = (data.orders || []).map((order) => ({
            ...order,
            buyerName: order.buyer_name || order.buyerName || "",
            buyerPhone: order.buyer_phone || order.buyerPhone || "",
            productName: order.product_name || order.productName || "",
            productType: order.product_type || order.productType || "",
            farmerName: order.farmer_name || order.farmerName || "",
            farmerPhone: order.farmer_phone || order.farmerPhone || "",
            requestedQuantity:
              order.requested_quantity ?? order.requestedQuantity ?? "",
            availableQuantity:
              order.available_quantity ?? order.availableQuantity ?? "",
            buyerProvince: order.buyer_province || order.buyerProvince || "",
            buyerDistrict: order.buyer_district || order.buyerDistrict || "",
            buyerSector: order.buyer_sector || order.buyerSector || "",
            buyerCell: order.buyer_cell || order.buyerCell || "",
            buyerVillage: order.buyer_village || order.buyerVillage || "",
          }));

          setOrders(normalizedOrders);
        } else if (active && !response.ok) {
          console.error("KUBONA KOMANDE BYANZE:", data.message);
        }
      } catch (error) {
        console.error("AGENT ORDERS ERROR:", error);
      }
    };

    loadAgentOrders();
    const refreshTimer = setInterval(loadAgentOrders, 15000);

    return () => {
      active = false;
      clearInterval(refreshTimer);
    };
  }, [page]);

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
    if (!intermediaryProfile.district) {
      setProfileSectors([]);
      return;
    }

    const loadProfileSectors = async () => {
      try {
        const where = encodeURIComponent(
          `district='${intermediaryProfile.district}'`
        );
        const response = await fetch(
          `${GIS_BASE}/1/query?where=${where}&outFields=sector&returnGeometry=false&orderByFields=sector&f=json`
        );
        if (!response.ok) throw new Error("Failed to load sectors");
        const data = await response.json();
        setProfileSectors([
          ...new Set(
            (data.features || [])
              .map((item) => item.attributes?.sector)
              .filter(Boolean)
          ),
        ]);
      } catch (error) {
        console.error("PROFILE SECTORS ERROR:", error);
        setProfileSectors([]);
      }
    };

    loadProfileSectors();
  }, [intermediaryProfile.district]);

  useEffect(() => {
    if (!intermediaryProfile.district || !intermediaryProfile.sector) {
      setProfileCells([]);
      return;
    }

    const loadProfileCells = async () => {
      try {
        const where = encodeURIComponent(
          `district='${intermediaryProfile.district}' AND sector='${intermediaryProfile.sector}'`
        );
        const response = await fetch(
          `${GIS_BASE}/2/query?where=${where}&outFields=cell&returnGeometry=false&orderByFields=cell&f=json`
        );
        if (!response.ok) throw new Error("Failed to load cells");
        const data = await response.json();
        setProfileCells([
          ...new Set(
            (data.features || [])
              .map((item) => item.attributes?.cell)
              .filter(Boolean)
          ),
        ]);
      } catch (error) {
        console.error("PROFILE CELLS ERROR:", error);
        setProfileCells([]);
      }
    };

    loadProfileCells();
  }, [intermediaryProfile.district, intermediaryProfile.sector]);

  useEffect(() => {
    if (!intermediaryProfile.sector || !intermediaryProfile.cell) {
      setProfileVillages([]);
      return;
    }

    const loadProfileVillages = async () => {
      try {
        const where = encodeURIComponent(
          `sector='${intermediaryProfile.sector}' AND cell='${intermediaryProfile.cell}'`
        );
        const response = await fetch(
          `${GIS_BASE}/3/query?where=${where}&outFields=village&returnGeometry=false&orderByFields=village&f=json`
        );
        if (!response.ok) throw new Error("Failed to load villages");
        const data = await response.json();
        setProfileVillages([
          ...new Set(
            (data.features || [])
              .map((item) => item.attributes?.village)
              .filter(Boolean)
          ),
        ]);
      } catch (error) {
        console.error("PROFILE VILLAGES ERROR:", error);
        setProfileVillages([]);
      }
    };

    loadProfileVillages();
  }, [intermediaryProfile.sector, intermediaryProfile.cell]);
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

  const account = JSON.parse(sessionStorage.getItem("gurisha_user") || "null");
  const token = sessionStorage.getItem("gurisha_token");

  if (!account || !token || !["UMUHINZI", "UMWOROZI"].includes(account.role)) {
    alert("Banza winjire muri konti y'umuhinzi cyangwa umworozi.");
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



  try {
    const productPayload = {
      name: farmerProduct.name,
      type: farmerProduct.type,
      farmerName: account.full_name,
      farmerPhone: account.phone,
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
      "https://gurisha-umusaruro-wawe.onrender.com/api/products",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
  data.product.farmer_name || account.full_name,
farmer_phone:
  data.product.farmer_phone || account.phone,
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
        "UMUCURUZI agomba kuwugenura mbere yo kwemezwa."
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
const handleMarkProductSold = async (product) => {
  if (!window.confirm("Uremeza ko wagurishije uyu musaruro?")) return;

  try {
    const response = await fetch(
      `https://gurisha-umusaruro-wawe.onrender.com/api/products/${product.id}/sold`,
      { method: "POST" }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Ntibyashobotse.");
    }

    setMyProducts((prev) =>
      prev.map((item) =>
        String(item.id) === String(product.id)
          ? { ...item, is_sold: true, sold_at: data.product.sold_at }
          : item
      )
    );

    alert("Umusaruro wagaragajwe ko WAGURISHIJWE.");
  } catch (error) {
    alert("KUGARAGAZA KO WAGURISHIJWE BYANZE: " + error.message);
  }
};
const handleOfferPrice = async (product) => {
  const enteredPrice = window.prompt(
    "ANDIKA IGICIRO UMUCURUZI YIFUZA GUTANGA:"
  );

  if (enteredPrice === null) return;

  const offeredPrice = Number(
    String(enteredPrice).replace(",", ".")
  );

  if (!Number.isFinite(offeredPrice) || offeredPrice <= 0) {
    alert("IGICIRO UGOMBA KUBA UMUBARE URUTA ZERO.");
    return;
  }

  try {
    const response = await fetch(
      `https://gurisha-umusaruro-wawe.onrender.com/api/products/${product.id}/offer`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offeredPrice }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Ntibyashobotse.");
    }

    setMyProducts((prev) =>
      prev.map((item) =>
        String(item.id) === String(product.id)
          ? { ...item, ...data.product }
          : item
      )
    );

    alert("IGICIRO CYOHEREJWE KU MUHINZI NEZA.");
  } catch (error) {
    alert("KOHEREZA IGICIRO BYANZE: " + error.message);
  }
};

const handleOfferResponse = async (product, responseChoice) => {
  const message =
    responseChoice === "ACCEPTED"
      ? "Uremeza kwemera iki giciro?"
      : "Uremeza kwanga iki giciro?";

  if (!window.confirm(message)) return;

  try {
    const response = await fetch(
      `https://gurisha-umusaruro-wawe.onrender.com/api/products/${product.id}/offer-response`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: responseChoice }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Ntibyashobotse.");
    }

    setMyProducts((prev) =>
      prev.map((item) =>
        String(item.id) === String(product.id)
          ? { ...item, ...data.product }
          : item
      )
    );

    alert(
      responseChoice === "ACCEPTED"
        ? "WEMEYE IGICIRO NEZA."
        : "WANZE IGICIRO NEZA."
    );
  } catch (error) {
    alert("GUTANGA IGISUBIZO BYANZE: " + error.message);
  }
};
const handleVerifyProduct = async (productId) => {
    const reason = window.prompt(
      "ANDIKA IMPAMVU UMUSARURO UTAREMEJWE:"
    );

    if (reason === null) return;

    if (!reason.trim()) {
      alert("Ugomba kwandika IMPAMVU.");
      return;
    }

    try {
      const response = await fetch(
        `https://gurisha-umusaruro-wawe.onrender.com/api/products/${productId}/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: reason.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "KUGENZURA BYANZE.");
      }

      setMyProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? data.product
            : product
        )
      );

      alert(
        "Umusaruro wagenzuwe neza.\n\n" +
        "Status: WAGENZUWE - NTABWO WEMEJWE\n\n" +
        "IMPAMVU: " + reason.trim()
      );
    } catch (error) {
      alert("KUGENZURA UMUSARURO BYANZE: " + error.message);
    }
  };
  const handleApproveProduct = async (productId) => {
    const product = myProducts.find(
      (item) => String(item.id) === String(productId)
    );

    if (!product) {
      alert("UMUSARURO NTIWABONETSE.");
      return;
    }

    if (product.offer_status !== "ACCEPTED") {
      alert("UMUHINZI AGOMBA KUBA YEMEYE IGICIRO BURI MBERE.");
      return;
    }

    const enteredPrice = window.prompt(
      "ANDIKA IGICIRO UZAGURISHAHO UMUSARURO (RWF):"
    );

    if (enteredPrice === null) return;

    const resalePrice = Number(
      String(enteredPrice).replace(",", ".")
    );

    if (!Number.isFinite(resalePrice) || resalePrice <= 0) {
      alert("IGICIRO UGOMBA KUBA UMUBARE URUTA ZERO.");
      return;
    }

    if (!window.confirm(
      "Ugiye kwemeza umusaruro ku giciro cya " +
      resalePrice + " RWF. Uremeza?"
    )) return;

    try {
      const response = await fetch(
        `https://gurisha-umusaruro-wawe.onrender.com/api/products/${productId}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resalePrice }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "KWEMEZA UMUSARURO BYANZE.");
      }

      setMyProducts((prev) =>
        prev.map((item) =>
          String(item.id) === String(productId)
            ? { ...item, ...data.product }
            : item
        )
      );

      alert(
        "UMUSARURO WEMEJWE NEZA.\n\n" +
        "Igiciro cyo kugurishaho: " + data.product.resale_price + " RWF"
      );
    } catch (error) {
      alert("KWEMEZA UMUSARURO BYANZE: " + error.message);
    }
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
    price: Number(selectedBuyerProduct.resale_price),

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

    status: "TEGEREJE UMUCURUZI",
  };

  try {
    const response = await fetch(
      "https://gurisha-umusaruro-wawe.onrender.com/api/orders",
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
      price: Number(selectedBuyerProduct.resale_price),

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

      status: "TEGEREJE UMUCURUZI",
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
        "KOMANDE yabitswe muri DATABASE kandi yoherejwe kuri UMUCURUZI."
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
const handleApproveOrder = async (orderId) => {
  try {
    const response = await fetch(
      `https://gurisha-umusaruro-wawe.onrender.com/api/orders/${orderId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("gurisha_token")}`,
        },
        body: JSON.stringify({
          status: "YEMEJWE N'UMUCURUZI",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Kubika status byanze.");
    }

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "YEMEJWE N'UMUCURUZI",
              approvedAt: new Date().toLocaleDateString("rw-RW"),
            }
          : order
      )
    );

    // KUVUGURURA UMUSARURO UVE MURI DATABASE
    try {
      const productsResponse = await fetch(
        "https://gurisha-umusaruro-wawe.onrender.com/api/products"
      );

      const productsData = await productsResponse.json();

      if (productsResponse.ok && productsData.success) {
        setMyProducts(productsData.products);
      } else {
        console.error("PRODUCT REFRESH ERROR:", productsData);
      }
    } catch (refreshError) {
      console.error("PRODUCT REFRESH ERROR:", refreshError);
    }

    alert(
      "KOMANDE YEMEJWE kandi ibitswe muri PostgreSQL.\n\n" +
      "Umusaruro usigaye wavuguruwe."
    );
  } catch (error) {
    console.error("APPROVE ORDER ERROR:", error);
    alert("KOMANDE NTIYABASHIJE KUBIKWA. Reba backend.");
  }
};

  const handleRejectOrder = async (orderId) => {
  const reason = window.prompt(
    "ANDIKA IMPAMVU KOMANDE YANZWE:"
  );

  if (reason === null) return;

  if (!reason.trim()) {
    alert("Ugomba kwandika IMPAMVU.");
    return;
  }

  try {
    const response = await fetch(
      `https://gurisha-umusaruro-wawe.onrender.com/api/orders/${orderId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("gurisha_token")}`,
        },
        body: JSON.stringify({
          status: "YANZWE N'UMUCURUZI",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Kubika status byanze.");
    }

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "YANZWE N'UMUCURUZI",
              rejectionReason: reason.trim(),
              rejectedAt: new Date().toLocaleDateString("rw-RW"),
            }
          : order
      )
    );

    alert(
      "KOMANDE YANZWE kandi status ibitswe muri PostgreSQL.\n\n" +
      "IMPAMVU: " + reason.trim()
    );
  } catch (error) {
    console.error("REJECT ORDER ERROR:", error);
    alert("KOMANDE NTIYABASHIJE KUBIKWA. Reba backend kuri port 5001.");
  }
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
      `https://gurisha-umusaruro-wawe.onrender.com/api/orders/${orderId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("gurisha_token")}`,
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
        order.status === "YEMEJWE N'UMUCURUZI"
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
      `https://gurisha-umusaruro-wawe.onrender.com/api/orders/${orderId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("gurisha_token")}`,
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
        `https://gurisha-umusaruro-wawe.onrender.com/api/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("gurisha_token")}`,
          },
          body: JSON.stringify({
            status: "YAHAGEZE",
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
                status: "YAHAGEZE",
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
        `https://gurisha-umusaruro-wawe.onrender.com/api/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("gurisha_token")}`,
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
          order.status === "YOHEREJWE"
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
        "TEGEREJE UMUCURUZI"
    );

  const approvedOrders =
    orders.filter(
      (order) =>
        order.status ===
        "YEMEJWE N'UMUCURUZI"
    );

  const rejectedOrders =
    orders.filter(
      (order) =>
        order.status ===
        "YANZWE N'UMUCURUZI"
    );

  const deliveryOrders =
    orders.filter(
      (order) =>
        order.status ===
          "YEMEJWE N'UMUCURUZI" ||
        order.status ===
          "TEGEREJE DELIVERY" ||
        order.status ===
          "YOHEREJWE" ||
        order.status === "YAHAGEZE"
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
      "YANZWE N'UMUCURUZI"
    ) {
      return {
        ...styles.status,
        background: "#fde4e2",
        color: "#b42318",
      };
    }

    if (status === "YAHAGEZE") {
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
    Itariki yashyiriweho ku isoko:
  </strong>
  <br />
  {
    product.created_at
      ? new Date(product.created_at).toLocaleDateString("rw-RW")
      : product.createdAt || "-"
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

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
        <button
          type="button"
          onClick={() => {
            const doc = new jsPDF();
            const details = [
              "GURISHA UMUSARURO WAWE",
              `Umusaruro: ${product.name || ""}`,
              `Ubwoko: ${product.type || ""}`,
              `Umuhinzi: ${product.farmer_name || ""}`,
              `Telefoni: ${product.farmer_phone || ""}`,
              `Ingano: ${product.quantity || ""} ${product.unit || ""}`,
              `Igiciro: ${product.price || ""}`,
              `Intara: ${product.province || ""}`,
              `Akarere: ${product.district || ""}`,
              `Umurenge: ${product.sector || ""}`,
              `Akagari: ${product.cell || ""}`,
              `Umudugudu: ${product.village || ""}`,
              `Status: ${product.status || ""}`,
            ];
            doc.setFontSize(12);
            doc.text(details, 15, 20);
            doc.save(`Umusaruro_${product.id}.pdf`);
          }}
        >
          DOWNLOAD PDF
        </button>

        <button
          type="button"
          onClick={() => {
            const rows = [
              ["Izina", "Ubwoko", "Umuhinzi", "Telefoni", "Ingano", "Unit", "Igiciro", "Intara", "Akarere", "Umurenge", "Akagari", "Umudugudu", "Status"],
              [
                product.name, product.type, product.farmer_name,
                product.farmer_phone, product.quantity, product.unit,
                product.price, product.province, product.district,
                product.sector, product.cell, product.village, product.status
              ]
            ];
            const csv = "\uFEFF" + rows.map(row =>
              row.map(value => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")
            ).join("\r\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `Umusaruro_${product.id}.csv`;
            link.click();
            URL.revokeObjectURL(url);
          }}
        >
          DOWNLOAD EXCEL
        </button>

        <button
          type="button"
          onClick={() => {
            const message = [
              "GURISHA UMUSARURO WAWE",
              `Umusaruro: ${product.name || ""}`,
              `Ubwoko: ${product.type || ""}`,
              `Umuhinzi: ${product.farmer_name || ""}`,
              `Telefoni: ${product.farmer_phone || ""}`,
              `Ingano: ${product.quantity || ""} ${product.unit || ""}`,
              `Igiciro: ${product.price || ""}`,
              `Aho uherereye: ${product.district || ""}, ${product.sector || ""}`,
            ].join("\n");
            window.open(
              `https://wa.me/?text=${encodeURIComponent(message)}`,
              "_blank"
            );
          }}
        >
          SHARE WHATSAPP
        </button>

        <button
          type="button"
          onClick={async () => {
            const link = `${window.location.origin}${window.location.pathname}#product-${product.id}`;
            try {
              await navigator.clipboard.writeText(link);
              alert("LINK YAKOPOROWE.");
            } catch (error) {
              alert("Ntibyashobotse gukoporora link. Gerageza ukoreshe browser yawe.");
            }
          }}
        >
          COPY LINK
        </button>
      </div>

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

  const handleOpenAgent = async () => {
    try {
      const response = await fetch(
        "https://gurisha-umusaruro-wawe.onrender.com/api/intermediary-profile"
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "KUBONA UMWIRONDORO BYANZE.");
      }

      const profile = data.profile || emptyIntermediaryProfile;
      const savedProvince =
        profile.province ||
        Object.keys(districtsByProvince).find((province) =>
          (districtsByProvince[province] || []).includes(profile.district)
        ) ||
        "";

      setIntermediaryProfile({
        ...emptyIntermediaryProfile,
        ...profile,
        province: savedProvince,
      });

      const fields = [
        "full_name", "phone", "work_place", "province",
        "district", "sector", "cell", "village"
      ];

      const profileComplete = fields.every(
        (field) => String(profile[field] || "").trim() !== ""
      );

      setPage(profileComplete ? "agent" : "intermediary-profile");
    } catch (error) {
      console.error("LOAD INTERMEDIARY PROFILE ERROR:", error);
      alert("NTABWO DUSHOBOYE KUBONA UMWIRONDORO.\n\nReba niba backend iri gukora.");
    }
  };

  const handleSaveIntermediaryProfile = async (e) => {
    e.preventDefault();

    const fields = [
      "full_name", "phone", "work_place",
      "district", "sector", "cell", "village"
    ];

    const complete = fields.every(
      (field) => String(intermediaryProfile[field] || "").trim() !== ""
    );

    if (!complete) {
      alert("UZUZA AMAKURU YOSE Y'UMWIRONDORO.");
      return;
    }

    setProfileSaving(true);

    try {
      const response = await fetch(
        "https://gurisha-umusaruro-wawe.onrender.com/api/intermediary-profile",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(intermediaryProfile)
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "KUBIKA UMWIRONDORO BYANZE.");
      }

      setIntermediaryProfile(data.profile);
      alert("UMWIRONDORO WABITSWE NEZA.");
      setPage("agent");
    } catch (error) {
      console.error("SAVE INTERMEDIARY PROFILE ERROR:", error);
      alert(error.message || "KUBIKA UMWIRONDORO BYANZE.");
    } finally {
      setProfileSaving(false);
    }
  };

  if (page === "admin") {
    return <AdminDashboard onBack={() => setPage("home")} />;
  }
  if (page === "register") {
    return (
      <div style={styles.page}>
        <main style={{ ...styles.container, maxWidth: "520px", margin: "40px auto" }}>

          <h1 style={{
            ...styles.title,
            textAlign: "center",
            fontSize: "25px",
            fontWeight: "800",
            margin: 0,
          }}>
            GURISHA UMUSARURO WAWE
          </h1>

          <h2 style={{ textAlign: "center" }}>
            FUNGURA KONTI NSHYA
          </h2>

          <form onSubmit={handleRegister}
            style={{ display: "grid", gap: "12px" }}>

            <label>Amazina yose</label>
            <input
              type="text"
              required
              value={registerFullName}
              onChange={(e) => setRegisterFullName(e.target.value)}
              placeholder="Andika amazina yawe"
              style={{ padding: "14px", borderRadius: "8px" }}
            />

            <label>Telefoni</label>
            <input
              type="tel"
              required
              value={registerPhone}
              onChange={(e) => setRegisterPhone(e.target.value)}
              placeholder="Andika telefoni yawe"
              style={{ padding: "14px", borderRadius: "8px" }}
            />

            <label>Ijambo ry'ibanga</label>
            <input
              type="password"
              required
              minLength={8}
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              placeholder="Nibura inyuguti 8"
              style={{ padding: "14px", borderRadius: "8px" }}
            />

            <label>Hitamo ubwoko bwa konti</label>
            <select
              required
              value={registerRole}
              onChange={(e) => setRegisterRole(e.target.value)}
              style={{ padding: "14px", borderRadius: "8px" }}
            >
              <option value="UMUHINZI">UMUHINZI</option>
              <option value="UMWOROZI">UMWOROZI</option>
              <option value="UMUGUZI">UMUGUZI</option>
              <option value="UMUCURUZI">UMUCURUZI</option>
            </select>

            {registerRole === "UMUCURUZI" && (() => {
  const provinces = RWANDA_LOCATIONS.provinces || [];
  const districts = RWANDA_LOCATIONS.districts || [];
  const sectors = RWANDA_LOCATIONS.sectors || [];
  const cells = RWANDA_LOCATIONS.cells || [];
  const villages = RWANDA_LOCATIONS.villages || [];

  const getName = (item) =>
    item?.name || item?.name_rw || item?.label || item?.province_name ||
    item?.district_name || item?.sector_name || item?.cell_name ||
    item?.village_name || "";

  const getCode = (item) =>
    String(item?.code ?? item?.id ?? item?.value ?? "");

  const getParent = (item) =>
    String(item?.parentCode ?? item?.parent_code ?? item?.parent_id ??
      item?.province_code ?? item?.district_code ?? item?.sector_code ??
      item?.cell_code ?? "");

  const province = provinces.find(x => getName(x) === registerProvince);
  const district = districts.find(x => getName(x) === registerDistrict);
  const sector = sectors.find(x => getName(x) === registerSector);
  const cell = cells.find(x => getName(x) === registerCell);

  const children = (items, parent) => {
    if (!parent) return [];
    return items.filter(x => getParent(x) === getCode(parent));
  };

  const districtOptions = children(districts, province);
  const sectorOptions = children(sectors, district);
  const cellOptions = children(cells, sector);
  const villageOptions = children(villages, cell);

  const selectStyle = {
    padding: "14px",
    borderRadius: "8px",
    width: "100%",
    minHeight: "48px",
    border: "1px solid #ced4da",
    backgroundColor: "#ffffff",
    color: "#212529",
    fontSize: "16px"
  };

  return (
    <>
      <label>INTARA</label>
      <select required value={registerProvince} style={selectStyle}
        onChange={e => {
          setRegisterProvince(e.target.value);
          setRegisterDistrict("");
          setRegisterSector("");
          setRegisterCell("");
          setRegisterVillage("");
        }}>
        <option value="">-- Hitamo Intara --</option>
        {provinces.map((x, i) => (
          <option key={getCode(x) || i} value={getName(x)}>
            {getName(x)}
          </option>
        ))}
      </select>

      <label>AKARERE</label>
      <select required value={registerDistrict} style={selectStyle}
        disabled={!province}
        onChange={e => {
          setRegisterDistrict(e.target.value);
          setRegisterSector("");
          setRegisterCell("");
          setRegisterVillage("");
        }}>
        <option value="">-- Hitamo Akarere --</option>
        {districtOptions.map((x, i) => (
          <option key={getCode(x) || i} value={getName(x)}>
            {getName(x)}
          </option>
        ))}
      </select>

      <label>UMURENGE</label>
      <select required value={registerSector} style={selectStyle}
        disabled={!district}
        onChange={e => {
          setRegisterSector(e.target.value);
          setRegisterCell("");
          setRegisterVillage("");
        }}>
        <option value="">-- Hitamo Umurenge --</option>
        {sectorOptions.map((x, i) => (
          <option key={getCode(x) || i} value={getName(x)}>
            {getName(x)}
          </option>
        ))}
      </select>

      <label>AKAGARI</label>
      <select required value={registerCell} style={selectStyle}
        disabled={!sector}
        onChange={e => {
          setRegisterCell(e.target.value);
          setRegisterVillage("");
        }}>
        <option value="">-- Hitamo Akagari --</option>
        {cellOptions.map((x, i) => (
          <option key={getCode(x) || i} value={getName(x)}>
            {getName(x)}
          </option>
        ))}
      </select>

      <label>UMUDUGUDU</label>
      <select required value={registerVillage} style={selectStyle}
        disabled={!cell}
        onChange={e => setRegisterVillage(e.target.value)}>
        <option value="">-- Hitamo Umudugudu --</option>
        {villageOptions.map((x, i) => (
          <option key={getCode(x) || i} value={getName(x)}>
            {getName(x)}
          </option>
        ))}
      </select>
    </>
  );
})()}

            {registerError && (
              <p style={{ color: "red", fontWeight: "bold" }}>
                {registerError}
              </p>
            )}

            <button
              type="submit"
              disabled={registerLoading}
              style={styles.menuButton}
            >
              {registerLoading ? "TURI GUKORA KONTI..." : "FUNGURA KONTI"}
            </button>

          </form>

          <button
            type="button"
            onClick={() => setPage("login")}
            style={{ ...styles.secondaryButton, marginTop: "16px" }}
          >
            NSANGANYWE KONTI - INJIRA
          </button>

        </main>
      </div>
    );
  }
  if (page === "login") {
    return (
      <div style={styles.page}>
        <main style={{ ...styles.container, maxWidth: "480px", margin: "60px auto" }}>
          <h1 style={{ ...styles.title, textAlign: "center" }}>
            GURISHA UMUSARURO WAWE
          </h1>

          <h2 style={{ textAlign: "center" }}>KWINJIRA MURI KONTI</h2>

          <form onSubmit={handleLogin} style={{ display: "grid", gap: "16px" }}>
            <label>Telefoni</label>
            <input
              type="tel"
              value={loginPhone}
              onChange={(e) => setLoginPhone(e.target.value)}
              placeholder="Andika telefoni yawe"
              required
              style={{ padding: "14px", fontSize: "17px", borderRadius: "8px" }}
            />

            <label>Ijambo ry'ibanga</label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Andika ijambo ry'ibanga"
              required
              style={{ padding: "14px", fontSize: "17px", borderRadius: "8px" }}
            />

            {loginError && (
              <p style={{ color: "red", fontWeight: "bold" }}>
                {loginError}
              </p>
            )}

            <button type="submit" disabled={loginLoading} style={{ ...styles.menuButton, backgroundColor: "#198754", color: "#FFFFFF" }}>
              {loginLoading ? "TURI KWINJIZA..." : "INJIRA"}
            </button>
          </form>
          <button
            type="button"
            onClick={() => {
              setRegisterError("");
              setPage("register");
            }}
            style={{ ...styles.menuButton, marginTop: "14px", backgroundColor: "#0D6EFD", color: "#FFFFFF" }}
          >
            FUNGURA KONTI NSHYA
          </button>

          <button
            onClick={() => setPage("home")}
            style={{ ...styles.secondaryButton, marginTop: "18px", backgroundColor: "#495057", color: "#FFFFFF" }}
          >
            AHABANZA
          
          </button>
        </main>
      </div>
    );
  }

  if (page === "home") {
    return (
      <div
        style={{
          ...styles.page,
          minHeight: "100vh",
          backgroundColor: "#173b27",
          backgroundImage: "linear-gradient(rgba(0, 35, 15, 0.55), rgba(0, 35, 15, 0.72)), url('/images/hero-agriculture.png')",
          backgroundSize: "55% auto",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
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
              <span style={{ color: "#32CD32" }}>ABAHINZI</span>{" / "}<span style={{ color: "#FFD700" }}>ABOROZI</span>{" / "}<span style={{ color: "#38BDF8" }}>ABAGUZI</span>{" / "}<span style={{ color: "#FF8C00" }}>ISOKO</span>
            </p>
          </div>
        </header>

        <main style={{
          ...styles.container,
          display: "flex",
          flexDirection: "row",
          minHeight: "100vh",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "24px",
        }}>
          <div style={{ ...styles.card, flex: "1 1 0", maxWidth: "300px", marginTop: "0", padding: "20px" }}>
            <h2 style={{ fontSize: "22px", marginBottom: "10px", color: "#000000", fontWeight: "bold" }}>MURAKAZA NEZA</h2>

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
  gridTemplateColumns: "minmax(0, 1fr)",
  flex: "1 1 0",
  maxWidth: "300px",
  gap: "8px",
  marginTop: "0",
}}>
  <button
    style={{
      ...styles.menuButton,
      backgroundColor: "#218838",
      color: "#ffffff",
      padding: "5px 4px", minHeight: "48px",
      border: "none",
      borderRadius: "8px",
      fontSize: "20px",
      fontWeight: "bold",
      lineHeight: "1.2",
      cursor: "pointer",
      boxShadow: "0 5px 14px rgba(0,0,0,0.15)",
    }}
    onClick={() => setPage("login")}
  >
    
    <br />
    UBWOROZI / UMUHINZI
    <br />
    <small style={{fontSize: "16px", fontWeight: "normal"}}>
      Shyiraho umusaruro
    </small>
  </button>

  <button
    style={{
      ...styles.menuButton,
      backgroundColor: "#f07818",
      color: "#ffffff",
      padding: "5px 4px", minHeight: "48px",
      border: "none",
      borderRadius: "8px",
      fontSize: "20px",
      fontWeight: "bold",
      lineHeight: "1.2",
      cursor: "pointer",
      boxShadow: "0 5px 14px rgba(0,0,0,0.15)",
    }}
    onClick={() => setPage("login")}
  >
    
    <br />
    UMUCURUZI
    <br />
    <small style={{fontSize: "16px", fontWeight: "normal"}}>
      Genzura kandi wemeze
    </small>
  </button>

  <button
    style={{
      ...styles.menuButton,
      backgroundColor: "#087ff5",
      color: "#ffffff",
      padding: "5px 4px", minHeight: "48px",
      border: "none",
      borderRadius: "8px",
      fontSize: "20px",
      fontWeight: "bold",
      lineHeight: "1.2",
      cursor: "pointer",
      boxShadow: "0 5px 14px rgba(0,0,0,0.15)",
    }}
    onClick={() => setPage("login")}
  >
    
    <br />
    UMUGUZI
    <br />
    <small style={{fontSize: "16px", fontWeight: "normal"}}>
      Shaka umusaruro
    </small>
  </button>

  <button
    style={{
      ...styles.menuButton,
      backgroundColor: "#123b63",
      color: "#ffffff",
      padding: "5px 4px", minHeight: "48px",
      border: "none",
      borderRadius: "8px",
      fontSize: "20px",
      fontWeight: "bold",
      lineHeight: "1.2",
      cursor: "pointer",
      boxShadow: "0 5px 14px rgba(0,0,0,0.15)",
    }}
    onClick={() => setPage("admin")}
  >
    <br />
    ADMIN
    <br />
    <small style={{fontSize: "16px", fontWeight: "normal"}}>
      Ubuyobozi bwa system
    </small>
  </button></div>
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
              DASHBOARD Y'UMUHINZI N'UMWOROZI
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
            onClick={handleLogout}
          >
            &#8592; AHABANZA
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
                . UMUCURUZI ni we uzawugenzura.
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

              <input
                type="search"
                value={farmerSearch}
                onChange={(e) => setFarmerSearch(e.target.value)}
                placeholder="SHAKISHA UMUSARURO, UBWOKO, STATUS..."
                style={{ width: "100%", padding: "14px", marginBottom: "15px", border: "1px solid #94a3b8", borderRadius: "10px", fontSize: "16px", boxSizing: "border-box" }}
              />

              {myProducts.length === 0 ? (
                <div style={styles.card}>
                  Nta musaruro urabikwa.
                </div>
              ) : (
                myProducts.filter((product) => matchesProductSearch(product, farmerSearch)).map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      action={
                        product.is_sold ? (
                          <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", fontWeight: "bold", textAlign: "center" }}>
                            WAGURISHIJE
                          </div>
                        ) : (
                          <div style={{ display: "grid", gap: "10px" }}>
                            {product.offer_status === "PENDING" && (
                              <div style={{ background: "#fef3c7", color: "#92400e", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                                <strong>IGICIRO UMUCURUZI YAGUHAYE</strong>
                                <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                                  {Number(product.offered_price).toLocaleString("en-US")} RWF
                                </div>
                                <button type="button" onClick={() => handleOfferResponse(product, "ACCEPTED")} style={{ width: "100%", padding: "10px", marginTop: "8px", background: "#15803d", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                                  NEMEYE IGICIRO
                                </button>
                                <button type="button" onClick={() => handleOfferResponse(product, "REJECTED")} style={{ width: "100%", padding: "10px", marginTop: "8px", background: "#b91c1c", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                                  NANZE IGICIRO
                                </button>
                              </div>
                            )}
                            {product.offer_status === "ACCEPTED" && (
                              <div style={{ background: "#dcfce7", color: "#166534", padding: "12px", borderRadius: "8px", textAlign: "center", fontWeight: "bold" }}>
                                WEMEYE IGICIRO: {Number(product.offered_price).toLocaleString("en-US")} RWF
                              </div>
                            )}
                            {product.offer_status === "REJECTED" && (
                              <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", textAlign: "center", fontWeight: "bold" }}>
                                WANZE IGICIRO CYA UMUCURUZI
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => handleMarkProductSold(product)}
                              style={{ width: "100%", padding: "12px", background: "#b91c1c", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
                            >
                              NAGURISHIJE
                            </button>
                          </div>
                        )
                      }
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

  if (page === "intermediary-profile") {
    return (
      <div style={styles.page}>
        <header style={{ ...styles.header, justifyContent: "center" }}>
          <h1 style={styles.title}>UMWIRONDORO WA UMUCURUZI</h1>
        </header>

        <main style={{ ...styles.container, maxWidth: "650px" }}>
          <div style={styles.card}>
            <h2 style={{ textAlign: "center" }}>
              AMAKURU YAWE
            </h2>

            <p style={{ textAlign: "center", color: "#475569" }}>
              Banza wuzuze umwirondoro wawe kugira ngo ufungure Dashboard ya UMUCURUZI.
            </p>

            <form onSubmit={handleSaveIntermediaryProfile}>
              {[
                { key: "full_name", label: "IZINA" },
                { key: "phone", label: "TELEFONI" },
                { key: "work_place", label: "AHO URI GUKORERA (ADDRESS)" }
              ].map((field) => (
                <div key={field.key} style={{ marginBottom: "16px" }}>
                  <label style={{
                    display: "block",
                    fontWeight: "bold",
                    marginBottom: "7px"
                  }}>
                    {field.label}
                  </label>
                  <input
                    type="text"
                    required
                    value={intermediaryProfile[field.key] || ""}
                    onChange={(e) =>
                      setIntermediaryProfile((previous) => ({
                        ...previous,
                        [field.key]: e.target.value
                      }))
                    }
                    placeholder={field.label}
                    style={{
                      width: "100%",
                      padding: "13px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "9px",
                      fontSize: "16px",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              ))}

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "7px" }}>
                  INTARA
                </label>
                <select
                  required
                  style={styles.input}
                  value={intermediaryProfile.province || ""}
                  onChange={(e) =>
                    setIntermediaryProfile((previous) => ({
                      ...previous,
                      province: e.target.value,
                      district: "",
                      sector: "",
                      cell: "",
                      village: ""
                    }))
                  }
                >
                  <option value="">Hitamo Intara</option>
                  {Object.keys(districtsByProvince).map((province) => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "7px" }}>
                  AKARERE
                </label>
                <select
                  required
                  style={styles.input}
                  value={intermediaryProfile.district || ""}
                  disabled={!intermediaryProfile.province}
                  onChange={(e) =>
                    setIntermediaryProfile((previous) => ({
                      ...previous,
                      district: e.target.value,
                      sector: "",
                      cell: "",
                      village: ""
                    }))
                  }
                >
                  <option value="">Hitamo Akarere</option>
                  {(districtsByProvince[intermediaryProfile.province] || []).map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "7px" }}>
                  UMURENGE
                </label>
                <select
                  required
                  style={styles.input}
                  value={intermediaryProfile.sector || ""}
                  disabled={!intermediaryProfile.district}
                  onChange={(e) =>
                    setIntermediaryProfile((previous) => ({
                      ...previous,
                      sector: e.target.value,
                      cell: "",
                      village: ""
                    }))
                  }
                >
                  <option value="">Hitamo Umurenge</option>
                  {profileSectors.map((sector) => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "7px" }}>
                  AKAGARI
                </label>
                <select
                  required
                  style={styles.input}
                  value={intermediaryProfile.cell || ""}
                  disabled={!intermediaryProfile.sector}
                  onChange={(e) =>
                    setIntermediaryProfile((previous) => ({
                      ...previous,
                      cell: e.target.value,
                      village: ""
                    }))
                  }
                >
                  <option value="">Hitamo Akagari</option>
                  {profileCells.map((cell) => (
                    <option key={cell} value={cell}>{cell}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "7px" }}>
                  UMUDUGUDU
                </label>
                <select
                  required
                  style={styles.input}
                  value={intermediaryProfile.village || ""}
                  disabled={!intermediaryProfile.cell}
                  onChange={(e) =>
                    setIntermediaryProfile((previous) => ({
                      ...previous,
                      village: e.target.value
                    }))
                  }
                >
                  <option value="">Hitamo Umudugudu</option>
                  {profileVillages.map((village) => (
                    <option key={village} value={village}>{village}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={profileSaving}
                style={{
                  width: "100%",
                  padding: "15px",
                  background: "#15803d",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "17px",
                  fontWeight: "bold",
                  cursor: profileSaving ? "wait" : "pointer"
                }}
              >
                {profileSaving ? "BIKA..." : "BIKA UMWIRONDORO"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setPage("home")}
              style={{
                width: "100%",
                marginTop: "12px",
                padding: "12px",
                border: "1px solid #cbd5e1",
                borderRadius: "9px",
                background: "white",
                cursor: "pointer"
              }}
            >
              Â AHABANZA
            </button>
          </div>
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
              DASHBOARD Y'UMUCURUZI
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
            onClick={handleLogout}
          >
            &#8592; AHABANZA
          </button>
        </header>

        <main style={styles.container}>
          <div style={styles.menu}>
            <button onClick={() => setShowPendingProducts(!showPendingProducts)}
              style={{width:"100%",display:"flex",alignItems:"center",gap:"12px",padding:"14px",marginBottom:"10px",border:"1px solid #fed7aa",borderRadius:"12px",background:"#fff7ed",color:"#9a3412",fontWeight:"700",cursor:"pointer"}}>
              
              <span style={{flex:1,textAlign:"left"}}>UMUSARURO UTARAGENZURWA</span>
              <span style={{background:"#ea580c",color:"white",padding:"5px 12px",borderRadius:"20px"}}>{pendingProducts.length}</span>
            </button>

            <button onClick={() => setShowVerifiedProducts(!showVerifiedProducts)}
              style={{width:"100%",display:"flex",alignItems:"center",gap:"12px",padding:"14px",marginBottom:"10px",border:"1px solid #fbcfe8",borderRadius:"12px",background:"#fdf2f8",color:"#9d174d",fontWeight:"700",cursor:"pointer"}}>
              
              <span style={{flex:1,textAlign:"left"}}>WEMEJWE</span>
              <span style={{background:"#db2777",color:"white",padding:"5px 12px",borderRadius:"20px"}}>{verifiedProducts.length}</span>
            </button>

            <button onClick={() => setShowApprovedProducts(!showApprovedProducts)}
              style={{width:"100%",display:"flex",alignItems:"center",gap:"12px",padding:"14px",marginBottom:"10px",border:"1px solid #bbf7d0",borderRadius:"12px",background:"#f0fdf4",color:"#166534",fontWeight:"700",cursor:"pointer"}}>
              
              <span style={{flex:1,textAlign:"left"}}>WEMEJWE</span>
              <span style={{background:"#16a34a",color:"white",padding:"5px 12px",borderRadius:"20px"}}>{approvedProducts.length}</span>
            </button>

            <button onClick={() => setShowAgentOrders(!showAgentOrders)}
              style={{width:"100%",display:"flex",alignItems:"center",gap:"12px",padding:"14px",marginBottom:"10px",border:"1px solid #bfdbfe",borderRadius:"12px",background:"#eff6ff",color:"#1e40af",fontWeight:"700",cursor:"pointer"}}>
              
              <span style={{flex:1,textAlign:"left"}}>KOMANDE ZITEGEREJE</span>
              <span style={{background:"#2563eb",color:"white",padding:"5px 12px",borderRadius:"20px"}}>{pendingOrders.length}</span>
            </button>

            <button onClick={() => setShowApprovedOrders(!showApprovedOrders)}
              style={{width:"100%",display:"flex",alignItems:"center",gap:"12px",padding:"14px",marginBottom:"10px",border:"1px solid #ddd6fe",borderRadius:"12px",background:"#f5f3ff",color:"#5b21b6",fontWeight:"700",cursor:"pointer"}}>
              
              <span style={{flex:1,textAlign:"left"}}>KOMANDE ZEMEJWE</span>
              <span style={{background:"#7c3aed",color:"white",padding:"5px 12px",borderRadius:"20px"}}>{approvedOrders.length}</span>
            </button>

            <button onClick={() => setShowRejectedOrders(!showRejectedOrders)}
              style={{width:"100%",display:"flex",alignItems:"center",gap:"12px",padding:"14px",marginBottom:"10px",border:"1px solid #fecaca",borderRadius:"12px",background:"#fef2f2",color:"#991b1b",fontWeight:"700",cursor:"pointer"}}>
              
              <span style={{flex:1,textAlign:"left"}}>KOMANDE ZANZWE</span>
              <span style={{background:"#dc2626",color:"white",padding:"5px 12px",borderRadius:"20px"}}>{rejectedOrders.length}</span>
            </button>

            <button onClick={() => setShowDelivery(!showDelivery)}
              style={{width:"100%",display:"flex",alignItems:"center",gap:"12px",padding:"14px",marginBottom:"10px",border:"1px solid #99f6e4",borderRadius:"12px",background:"#f0fdfa",color:"#115e59",fontWeight:"700",cursor:"pointer"}}>
              
              <span style={{flex:1,textAlign:"left"}}>DELIVERY</span>
              <span style={{background:"#0d9488",color:"white",padding:"5px 12px",borderRadius:"20px"}}>{deliveryOrders.length}</span>
            </button>
          </div>

          {showPendingProducts && (
            <div>
              <h2>
                UMUSARURO
                UTARAGENZURWA
              </h2>

              <input
                type="search"
                value={agentSearch}
                onChange={(e) => setAgentSearch(e.target.value)}
                placeholder="SHAKISHA UMUSARURO, UMUHINZI, TELEFONI..."
                style={{ width: "100%", padding: "14px", marginBottom: "15px", border: "1px solid #94a3b8", borderRadius: "10px", fontSize: "16px", boxSizing: "border-box" }}
              />

              {pendingProducts.length ===
              0 ? (
                <div style={styles.card}>
                  Nta musaruro utegereje
                  igenzura.
                </div>
              ) : (
                pendingProducts.filter((product) => matchesProductSearch(product, agentSearch)).map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      action={
                        product.is_sold ? (
                          <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", fontWeight: "bold", textAlign: "center" }}>
                            WAGURISHIJE
                          </div>
                        ) : (
                          <button
                            style={styles.warningButton}
                            onClick={() => handleVerifyProduct(product.id)}
                          >
                            GENZURA
                          </button>
                        )
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

              <input
                type="search"
                value={agentSearch}
                onChange={(e) => setAgentSearch(e.target.value)}
                placeholder="SHAKISHA UMUSARURO, UMUHINZI, TELEFONI..."
                style={{ width: "100%", padding: "14px", marginBottom: "15px", border: "1px solid #94a3b8", borderRadius: "10px", fontSize: "16px", boxSizing: "border-box" }}
              />

              {verifiedProducts.length ===
              0 ? (
                <div style={styles.card}>
                  Nta musaruro wagenzuwe
                  utegereje kwemezwa.
                </div>
              ) : (
                verifiedProducts.filter((product) => matchesProductSearch(product, agentSearch)).map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      action={
                        product.is_sold ? (
                          <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", fontWeight: "bold", textAlign: "center" }}>
                            WAGURISHIJE
                          </div>
                        ) : (
                          <div style={{ display: "grid", gap: "10px" }}>
                            {product.offer_status === "PENDING" && (
                              <div style={{ background: "#fef3c7", color: "#92400e", padding: "12px", borderRadius: "8px", textAlign: "center", fontWeight: "bold" }}>
                                IGICIRO CYOHEREJWE: {Number(product.offered_price).toLocaleString("en-US")} RWF
                                <div>TEGEREZA IGISUBIZO CY'UMUHINZI</div>
                              </div>
                            )}
                            {product.offer_status === "ACCEPTED" && (
                              <div style={{ background: "#dcfce7", color: "#166534", padding: "12px", borderRadius: "8px", textAlign: "center", fontWeight: "bold" }}>
                                UMUHINZI YEMEYE IGICIRO: {Number(product.offered_price).toLocaleString("en-US")} RWF
                              </div>
                            )}
                            {product.offer_status === "REJECTED" && (
                              <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", textAlign: "center", fontWeight: "bold" }}>
                                UMUHINZI YANZE IGICIRO
                              </div>
                            )}
                            {product.offer_status !== "PENDING" && product.offer_status !== "ACCEPTED" && (
                              <button
                                type="button"
                                style={styles.button}
                                onClick={() => handleOfferPrice(product)}
                              >
                                TANGA IGICIRO
                              </button>
                            )}
                            <button
                              type="button"
                              style={styles.button}
                              onClick={() => handleApproveProduct(product.id)}
                            >
                              EMEZA UMUSARURO
                            </button>
                          </div>
                        )
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

              <input
                type="search"
                value={agentSearch}
                onChange={(e) => setAgentSearch(e.target.value)}
                placeholder="SHAKISHA UMUSARURO, UMUHINZI, TELEFONI..."
                style={{ width: "100%", padding: "14px", marginBottom: "15px", border: "1px solid #94a3b8", borderRadius: "10px", fontSize: "16px", boxSizing: "border-box" }}
              />

              {approvedProducts.length ===
              0 ? (
                <div style={styles.card}>
                  Nta musaruro wemejwe.
                </div>
              ) : (
                approvedProducts.filter((product) => matchesProductSearch(product, agentSearch)).map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      action={
                        product.is_sold ? (
                          <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", fontWeight: "bold", textAlign: "center" }}>
                            WAGURISHIJE
                          </div>
                        ) : (
                          <div style={{ display: "grid", gap: "10px" }}>
                            {product.offer_status === "PENDING" && (
                              <div style={{ background: "#fef3c7", color: "#92400e", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                                <strong>IGICIRO UMUCURUZI YAGUHAYE</strong>
                                <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                                  {Number(product.offered_price).toLocaleString("en-US")} RWF
                                </div>
                                <button type="button" onClick={() => handleOfferResponse(product, "ACCEPTED")} style={{ width: "100%", padding: "10px", marginTop: "8px", background: "#15803d", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                                  NEMEYE IGICIRO
                                </button>
                                <button type="button" onClick={() => handleOfferResponse(product, "REJECTED")} style={{ width: "100%", padding: "10px", marginTop: "8px", background: "#b91c1c", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                                  NANZE IGICIRO
                                </button>
                              </div>
                            )}
                            {product.offer_status === "ACCEPTED" && (
                              <div style={{ background: "#dcfce7", color: "#166534", padding: "12px", borderRadius: "8px", textAlign: "center", fontWeight: "bold" }}>
                                WEMEYE IGICIRO: {Number(product.offered_price).toLocaleString("en-US")} RWF
                              </div>
                            )}
                            {product.offer_status === "REJECTED" && (
                              <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", textAlign: "center", fontWeight: "bold" }}>
                                WANZE IGICIRO CYA UMUCURUZI
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => handleMarkProductSold(product)}
                              style={{ width: "100%", padding: "12px", background: "#b91c1c", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
                            >
                              NAGURISHIJE
                            </button>
                          </div>
                        )
                      }
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
              <input
                type="search"
                value={agentSearch}
                onChange={(e) => setAgentSearch(e.target.value)}
                placeholder="SHAKISHA KOMANDE, UMUGUZI, UMUHINZI, TELEFONI, UMUSARURO, AHO UHEREREYE..."
                style={{ width: "100%", padding: "14px", marginBottom: "15px", border: "1px solid #94a3b8", borderRadius: "10px", fontSize: "16px", boxSizing: "border-box" }}
              />


              {pendingOrders.length ===
              0 ? (
                <div style={styles.card}>
                  Nta KOMANDE ritegereje.
                </div>
              ) : (
                pendingOrders.filter((order) => !agentSearch.trim() || JSON.stringify(order).toLowerCase().includes(agentSearch.trim().toLowerCase())).map(
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
                          {" - "}
                          {
                            order.district
                          }
                          {" - "}
                          {
                            order.sector
                          }
                          {" - "}
                          {order.cell}
                          {" - "}
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
                          {" - "}
                          {
                            order.buyerDistrict
                          }
                          {" - "}
                          {
                            order.buyerSector
                          }
                          {" - "}
                          {
                            order.buyerCell
                          }
                          {" - "}
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
              <input
                type="search"
                value={agentSearch}
                onChange={(e) => setAgentSearch(e.target.value)}
                placeholder="SHAKISHA KOMANDE, UMUGUZI, UMUHINZI, TELEFONI, UMUSARURO, AHO UHEREREYE..."
                style={{ width: "100%", padding: "14px", marginBottom: "15px", border: "1px solid #94a3b8", borderRadius: "10px", fontSize: "16px", boxSizing: "border-box" }}
              />


              {approvedOrders.length ===
              0 ? (
                <div style={styles.card}>
                  Nta KOMANDE yemejwe.
                </div>
              ) : (
                approvedOrders.filter((order) => !agentSearch.trim() || JSON.stringify(order).toLowerCase().includes(agentSearch.trim().toLowerCase())).map(
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
                        {" - "}
                        {
                          order.district
                        }
                        {" - "}
                        {
                          order.sector
                        }
                        {" - "}
                        {order.cell}
                        {" - "}
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
                        {" - "}
                        {
                          order.buyerDistrict
                        }
                        {" - "}
                        {
                          order.buyerSector
                        }
                        {" - "}
                        {
                          order.buyerCell
                        }
                        {" - "}
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
              <input
                type="search"
                value={agentSearch}
                onChange={(e) => setAgentSearch(e.target.value)}
                placeholder="SHAKISHA KOMANDE, UMUGUZI, UMUHINZI, TELEFONI, UMUSARURO, AHO UHEREREYE..."
                style={{ width: "100%", padding: "14px", marginBottom: "15px", border: "1px solid #94a3b8", borderRadius: "10px", fontSize: "16px", boxSizing: "border-box" }}
              />


              {rejectedOrders.length ===
              0 ? (
                <div style={styles.card}>
                  Nta KOMANDE yanze.
                </div>
              ) : (
                rejectedOrders.filter((order) => !agentSearch.trim() || JSON.stringify(order).toLowerCase().includes(agentSearch.trim().toLowerCase())).map(
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
              <input
                type="search"
                value={agentSearch}
                onChange={(e) => setAgentSearch(e.target.value)}
                placeholder="SHAKISHA KOMANDE, UMUGUZI, UMUHINZI, TELEFONI, UMUSARURO, AHO UHEREREYE..."
                style={{ width: "100%", padding: "14px", marginBottom: "15px", border: "1px solid #94a3b8", borderRadius: "10px", fontSize: "16px", boxSizing: "border-box" }}
              />


              {deliveryOrders.length ===
              0 ? (
                <div style={styles.card}>
                  Nta KOMANDE riri muri DELIVERY.
                </div>
              ) : (
                deliveryOrders.filter((order) => !agentSearch.trim() || JSON.stringify(order).toLowerCase().includes(agentSearch.trim().toLowerCase())).map(
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
                          {" - "}
                          {
                            order.district
                          }
                          {" - "}
                          {
                            order.sector
                          }
                          {" - "}
                          {order.cell}
                          {" - "}
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
                          {" - "}
                          {
                            order.buyerDistrict
                          }
                          {" - "}
                          {
                            order.buyerSector
                          }
                          {" - "}
                          {
                            order.buyerCell
                          }
                          {" - "}
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
                          "YEMEJWE N'UMUCURUZI" && (
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
              DASHBOARD Y'UMUGUZI
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
            onClick={handleLogout}
          >
            &#8592; AHABANZA
          </button>
        </header>

        <main style={styles.container}>
          <div style={styles.menu}>
            <button
              style={{
                ...styles.menuButton,
                display: "block",
                width: "min(100%, 420px)",
                margin: "0 auto",
                textAlign: "center",
              }}
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
  <section style={{ background: "#f5f8f2", padding: "18px", borderRadius: "18px", marginTop: "18px" }}>
    <div style={{ background: "#174d35", color: "white", padding: "24px", borderRadius: "16px", marginBottom: "20px" }}>
      <div style={{ fontSize: "13px", letterSpacing: "2px", opacity: 0.85 }}>GURISHA UMUSARURO WAWE</div>
      <h2 style={{ fontSize: "27px", margin: "10px 0" }}>UMUGUZI</h2>
      <p style={{ margin: 0, lineHeight: 1.6 }}>Shaka umusaruro mwiza wemejwe, uhuze n'umuhinzi cyangwa umworozi, utange KOMANDE.</p>
    </div>

    <div style={{ background: "white", padding: "14px", borderRadius: "14px", marginBottom: "18px" }}>
      <input
        type="text"
        value={buyerSearch}
        onChange={(e) => setBuyerSearch(e.target.value)}
        placeholder="Shakisha umusaruro..."
        style={{ width: "100%", padding: "14px", border: "1px solid #dce5dc", borderRadius: "10px", fontSize: "15px", boxSizing: "border-box" }}
      />
    </div>

    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
      {["BYOSE", "UBUHINZI", "UBWOROZI"].map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => setBuyerCategory(category)}
          style={{
            padding: "10px 16px",
            borderRadius: "22px",
            border: "1px solid #174d35",
            background: buyerCategory === category ? "#174d35" : "white",
            color: buyerCategory === category ? "white" : "#174d35",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          {category === "BYOSE" ? "Byose" : category}
        </button>
      ))}
    </div>

    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", gap: "10px" }}>
      <h3 style={{ color: "#174d35", margin: 0 }}>UMUSARURO WEMEJWE</h3>
      <span style={{ fontSize: "12px", color: "#55705d" }}>{approvedProducts.length} products</span>
    </div>

    {approvedProducts.length === 0 ? (
      <div style={{ background: "white", padding: "25px", borderRadius: "14px", textAlign: "center" }}>
        <div style={{ fontSize: "35px" }}></div>
        Nta musaruro wemejwe uhari ubu.
      </div>
    ) : (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px" }}>
        {approvedProducts
          .filter((product) => {
            if (Number(product.resale_price) <= 0) return false;
            const search = buyerSearch.toLowerCase();
            const searchable = [
              product.name,
              product.type,
              product.farmer_name,
              product.district,
              product.sector,
              product.cell,
              product.village
            ].join(" ").toLowerCase();

            const matchesSearch = searchable.includes(search);
            const matchesCategory =
              buyerCategory === "BYOSE" ||
              String(product.type || "").toUpperCase().includes(buyerCategory);

            return matchesSearch && matchesCategory;
          })
          .map((product) => (
            <article
              key={product.id}
              style={{ background: "white", borderRadius: "15px", overflow: "hidden", border: "1px solid #e1e9df", boxShadow: "0 3px 10px rgba(0,0,0,0.05)" }}
            >
              <div style={{ height: "125px", background: "linear-gradient(135deg, #dcefdc, #f3f7df)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>UMUSARURO</div>

              <div style={{ padding: "15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
                  <h3 style={{ margin: 0, color: "#203b2b", fontSize: "17px" }}>{product.name}</h3>
                  <span style={{ background: product.is_sold ? "#fee2e2" : "#e2f4e7", color: product.is_sold ? "#991b1b" : "#176334", padding: "5px 8px", borderRadius: "15px", fontSize: "10px", fontWeight: "bold" }}>{product.is_sold ? "WAGURISHIJE" : "WEMEJWE"}</span>
                </div>

                <p style={{ color: "#647568", fontSize: "13px", margin: "9px 0" }}>
                  {product.type} | {product.quantity} {product.unit}
                </p>

                <div style={{ color: "#174d35", fontSize: "19px", fontWeight: "bold", margin: "10px 0" }}>
                  {product.resale_price} RWF 
                </div>

                <div style={{ fontSize: "13px", color: "#59675d", lineHeight: 1.8 }}>
                  <div>Umuhinzi/Umworozi: {product.farmer_name}</div>
                  <div>Akarere: {product.district}, Umurenge: {product.sector}</div>
                  <div>Akagari: {product.cell}, Umudugudu: {product.village}</div>
                </div>

                {!product.is_sold && (
                <button
                  type="button"
                  style={{ width: "100%", marginTop: "14px", padding: "12px", background: "#174d35", color: "white", border: "none", borderRadius: "9px", fontWeight: "bold", cursor: "pointer" }}
                  onClick={() => {
                    setSelectedBuyerProduct(product);
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
                    setShowOrderForm(true);
                  }}
                >
                  KOMANDE
                </button>
                )}
              </div>
            </article>
          ))}
      </div>
    )}
  </section>
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
                    selectedBuyerProduct.resale_price ||
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
                   - {" "}
                  {buyerOrder.district ||
                    "AKARERE"}{" "}
                   - {" "}
                  {buyerOrder.sector ||
                    "UMURENGE"}{" "}
                   - {" "}
                  {buyerOrder.cell ||
                    "AKAGARI"}{" "}
                   - {" "}
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

                      {["YOHEREJWE", "YAHAGEZE"].includes(order.status) && (
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












































































