import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

const API = "http://localhost:5001/api";

const emptyForm = {
  full_name: "",
  phone: "",
  password: "",
  role: "UMUHINZI",
  farmer_id: "",
  province: "",
  district: "",
  sector: "",
  cell: "",
  village: "",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  border: "1px solid #ced4da",
  borderRadius: "8px",
  fontSize: "15px",
  boxSizing: "border-box",
};

const buttonStyle = {
  padding: "11px 18px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

export default function AdminDashboard({ onBack }) {
  const [token, setToken] = useState(
    () => sessionStorage.getItem("gurisha_admin_token") || ""
  );
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showGeoAnalytics, setShowGeoAnalytics] = useState(false);
  const [geoProvince, setGeoProvince] = useState("");
  const [geoDistrict, setGeoDistrict] = useState("");
  const [geoSector, setGeoSector] = useState("");
  const [geoCell, setGeoCell] = useState("");
  const [geoVillage, setGeoVillage] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [showSoldOrders, setShowSoldOrders] = useState(false);
  const [showSystemUsers, setShowSystemUsers] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [farmerSearch, setFarmerSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activityForAccountId, setActivityForAccountId] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [resetPasswordMessage, setResetPasswordMessage] = useState("");
  const [resetPasswordError, setResetPasswordError] = useState("");

  const request = async (path, options = {}, authToken = token) => {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "HABAYE IKOSA.");
    }

    return data;
  };

  const loadDashboard = async (authToken = token) => {
    const [usersData, farmersData, ordersData, productsData] = await Promise.all([
      request("/admin/users", {}, authToken),
      request("/admin/farmers", {}, authToken),
      request("/orders", {}, authToken),
      request("/products", {}, authToken),
    ]);

    setUsers(usersData.users || []);
    setFarmers(farmersData.farmers || []);
    setOrders(ordersData.orders || []);
    setProducts(productsData.products || []);
  };

  const logout = () => {
    sessionStorage.removeItem("gurisha_admin_token");
    setToken("");
    setUser(null);
    setUsers([]);
    setFarmers([]);
    setOrders([]);
    setProducts([]);
    setPassword("");
  };

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const verify = async () => {
      try {
        const data = await request("/auth/me", {}, token);

        if (cancelled) return;

        if (data.user?.role !== "ADMIN") {
          logout();
          setLoginError("IYI KONTI N'IYA ADMIN GUSA.");
          return;
        }

        setUser(data.user);
        await loadDashboard(token);
      } catch (err) {
        if (!cancelled) {
          logout();
          setLoginError(err.message || "ONGERA WINJIRE.");
        }
      }
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");

    try {
      const data = await request(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ phone, password }),
        },
        ""
      );

      if (data.user?.role !== "ADMIN") {
        setLoginError("IYI KONTI N'IYA ADMIN GUSA.");
        return;
      }

      sessionStorage.setItem("gurisha_admin_token", data.token);
      setToken(data.token);
      setUser(data.user);
      setPassword("");

      await loadDashboard(data.token);
    } catch (err) {
      setLoginError(err.message || "KWINJIRA BYANZE.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (name, value) => {
    setForm((old) => ({ ...old, [name]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role: form.role,
      };

      if (form.role === "UMUHINZI") {
        payload.farmer_id = Number(form.farmer_id);
      }

      if (form.role === "UMUHUZA") {
        payload.province = form.province;
        payload.district = form.district;
        payload.sector = form.sector;
        payload.cell = form.cell;
        payload.village = form.village;
      }

      const result = await request("/admin/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setMessage(result.message || "KONTI YAKOZWE NEZA.");
      setForm(emptyForm);
      await loadDashboard();
    } catch (err) {
      setError(err.message || "KONTI NTIYAKOZWE.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (account) => {
    const action = account.is_active ? "guhagarika" : "gukora";
    if (!window.confirm(`Urashaka ${action} konti ya ${account.full_name}?`)) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await request(`/admin/users/${account.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !account.is_active }),
      });

      setMessage("IMIMERERE YA KONTI YAHINDUTSE NEZA.");
      await loadDashboard();
    } catch (err) {
      setError(err.message || "GUHINDURA IMIMERERE BYANZE.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetPasswordMessage("");
    setResetPasswordError("");

    if (newPassword.length < 8) {
      setResetPasswordError("PASSWORD IGOMBA KUBA NIBURA INYUGUTI 8.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setResetPasswordError("PASSWORD ZOMBI NTIZIHURA.");
      return;
    }

    if (!window.confirm(`Urashaka guhindura password ya ${selectedAccount.full_name}?`)) {
      return;
    }

    setResetPasswordLoading(true);

    try {
      const result = await request(
        `/admin/users/${selectedAccount.id}/reset-password`,
        {
          method: "POST",
          body: JSON.stringify({ new_password: newPassword }),
        }
      );

      setResetPasswordMessage(result.message || "PASSWORD NSHYA YAKOZWE NEZA.");
      setNewPassword("");
      setConfirmNewPassword("");

      await loadAccountActivity(selectedAccount);
    } catch (err) {
      setResetPasswordError(err.message || "GUSUBIRAMO PASSWORD BYANZE.");
    } finally {
      setResetPasswordLoading(false);
    }
  };
  const loadAccountActivity = async (account) => {
    setActivityLoading(true);
    setActivityError("");
    setActivities([]);
    setActivityForAccountId(account.id);

    try {
      const data = await request(
        `/admin/users/${account.id}/activity`
      );
      setActivities(data.activities || []);
    } catch (err) {
      setActivityError(err.message || "KUREBA AMATEKA BYANZE.");
    } finally {
      setActivityLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={pageStyle}>
        <div style={loginCard}>
          <button style={{ ...buttonStyle, background: "#e9ecef" }} onClick={onBack}>
            AHABANZA
          </button>

          <h1 style={{ color: "#123b63", textAlign: "center" }}>
            ADMIN LOGIN
          </h1>
          <p style={{ textAlign: "center", color: "#666" }}>
            Injira ukoresheje telefoni n'ijambo ry'ibanga.
          </p>

          {loginError && <p style={errorStyle}>{loginError}</p>}

          <form onSubmit={handleLogin}>
            <label>Telefoni</label>
            <input
              style={inputStyle}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Andika telefoni"
              required
            />

            <label style={labelStyle}>Ijambo ry'ibanga</label>
            <input
              style={inputStyle}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Andika ijambo ry'ibanga"
              required
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                ...buttonStyle,
                width: "100%",
                marginTop: "22px",
                background: "#123b63",
                color: "white",
              }}
            >
              {loading ? "TURAGENZURA..." : "INJIRA"}
            </button>
          </form>
        </div>
      </div>
    );
  }



          
  // RAPORO YUZUYE - EXCEL
  const exportAdminExcel = () => {
    const workbook = XLSX.utils.book_new();

    const summary = [
      ["GURISHA UMUSARURO WAWE - RAPORO YA ADMIN"],
      ["Itariki", new Date().toLocaleString()],
      ["Abakoresha bose", users.length],
      ["Abahinzi", farmers.length],
      ["Komande zose", orders.length],
      ["Umusaruro wose", products.length],
      [],
      ["STATUS YA KOMANDE", "UMUBARE", "AGACIRO (RWF)"],
      ...(() => {
        const map = {};
        orders.forEach((o) => {
          const status = o.status || "NTIBIZWI";
          if (!map[status]) map[status] = { count: 0, value: 0 };
          map[status].count += 1;
          map[status].value +=
            Number(o.requested_quantity || 0) * Number(o.price || 0);
        });
        return Object.entries(map).map(([status, data]) => [
          status, data.count, data.value
        ]);
      })()
    ];

    const sheets = [
      ["Incamake", summary],
      ["Abakoresha", Array.isArray(users) ? users : []],
      ["Abahinzi", Array.isArray(farmers) ? farmers : []],
      ["Komande", Array.isArray(orders) ? orders : []],
      ["Umusaruro", Array.isArray(products) ? products : []],
    ];

    sheets.forEach(([name, rows]) => {
      const worksheet = Array.isArray(rows[0])
        ? XLSX.utils.aoa_to_sheet(rows)
        : XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, worksheet, name);
    });

    XLSX.writeFile(
      workbook,
      `GURISHA_UMUSARURO_RAPORO_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // RAPORO YUZUYE - PDF
  const exportAdminPDF = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    let y = 18;

    const line = (value, size = 10) => {
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(String(value), 180);
      lines.forEach((item) => {
        if (y > pageHeight - 18) {
          doc.addPage();
          y = 18;
        }
        doc.text(item, 15, y);
        y += 6;
      });
    };

    line("GURISHA UMUSARURO WAWE", 16);
    line("ADMIN DASHBOARD - RAPORO YUZUYE", 13);
    line(`Itariki: ${new Date().toLocaleString()}`);
    y += 3;

    line("1. INCAMAKE RUSANGE", 13);
    line(`Abakoresha bose: ${users.length}`);
    line(`Abahinzi: ${farmers.length}`);
    line(`Komande zose: ${orders.length}`);
    line(`Umusaruro wose: ${products.length}`);

    const totalOrderValue = orders.reduce(
      (sum, o) =>
        sum +
        Number(o.requested_quantity || 0) * Number(o.price || 0),
      0
    );

    line(
      `Agaciro k'amakomende yose: ${totalOrderValue.toLocaleString()} RWF`
    );
    line(
      "Icyitonderwa: Agaciro ka komande ni ingano yasabwe x igiciro; si amafaranga yemejwe ko yishyuwe."
    );
    y += 4;

    line("2. RAPORO YA KOMANDE", 13);
    orders.forEach((o, index) => {
      line(
        `${index + 1}. ${o.product_name || o.product_id || "Umusaruro"} | ` +
        `Status: ${o.status || "NTIBIZWI"} | ` +
        `Ingano: ${o.requested_quantity || 0} | ` +
        `Igiciro: ${Number(o.price || 0).toLocaleString()} RWF`
      );
    });

    y += 4;
    line("3. RAPORO Y'UMUSARURO", 13);
    products.forEach((p, index) => {
      line(
        `${index + 1}. ${p.product_name || p.name || p.variety || "Umusaruro"} | ` +
        `Ingano: ${p.quantity || 0} | ` +
        `Igiciro: ${Number(p.resale_price || p.offered_price || p.price || 0).toLocaleString()} RWF | ` +
        `Akarere: ${p.district || "Ntabwo kazwi"}`
      );
    });

    y += 4;
    line("4. RAPORO Y'ABAKORESHA", 13);
    users.forEach((u, index) => {
      line(
        `${index + 1}. ${u.name || u.full_name || u.username || "Konti"} | ` +
        `${u.role || "Uruhare rutazwi"} | ${u.phone || ""}`
      );
    });

    doc.save(
      `GURISHA_UMUSARURO_RAPORO_${new Date().toISOString().slice(0, 10)}.pdf`
    );
  };

  // GUSANGIZA RAPORO
  const shareAdminReport = async () => {
    const report =
      "GURISHA UMUSARURO WAWE - RAPORO YA ADMIN\n\n" +
      `Abakoresha: ${users.length}\n` +
      `Abahinzi: ${farmers.length}\n` +
      `Komande: ${orders.length}\n` +
      `Umusaruro: ${products.length}\n` +
      `Agaciro ka komande: ${orders.reduce(
        (sum, o) =>
          sum + Number(o.requested_quantity || 0) * Number(o.price || 0),
        0
      ).toLocaleString()} RWF\n` +
      `Itariki: ${new Date().toLocaleString()}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "GURISHA UMUSARURO WAWE - RAPORO",
          text: report,
        });
        return;
      } catch (error) {
        if (error.name === "AbortError") return;
      }
    }

    window.open(
      "https://wa.me/?text=" + encodeURIComponent(report),
      "_blank"
    );
  };

  // EMAIL
  const emailAdminReport = () => {
    const report =
      "GURISHA UMUSARURO WAWE - RAPORO YA ADMIN\n\n" +
      `Abakoresha: ${users.length}\n` +
      `Abahinzi: ${farmers.length}\n` +
      `Komande: ${orders.length}\n` +
      `Umusaruro: ${products.length}\n` +
      `Agaciro ka komande: ${orders.reduce(
        (sum, o) =>
          sum + Number(o.requested_quantity || 0) * Number(o.price || 0),
        0
      ).toLocaleString()} RWF\n` +
      `Itariki: ${new Date().toLocaleString()}`;

    window.location.href =
      "mailto:?subject=" +
      encodeURIComponent("GURISHA UMUSARURO WAWE - RAPORO YA ADMIN") +
      "&body=" +
      encodeURIComponent(report);
  };

  // PRINT
  const printAdminReport = () => {
    window.print();
  };
  
  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={{ margin: 0 }}>ADMIN DASHBOARD</h1>
          <p style={{ margin: "8px 0 0" }}>
            GURISHA UMUSARURO WAWE — Ubuyobozi bw'ikoranabuhanga
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            style={{
              ...buttonStyle,
              minWidth: "112px",
              background: "white",
              color: "#123b63",
            }}
            onClick={onBack}
          >
            AHABANZA
          </button>
          <button
            type="button"
            style={{
              ...buttonStyle,
              minWidth: "112px",
              background: "#b02a37",
              color: "white",
            }}
            onClick={logout}
          >
            SOHOKA
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "25px auto", padding: "0 15px" }}>
        <section style={panelStyle}>
          <h2>Murakaza neza, {user.full_name}</h2>
          <p>Uruhare: <strong>ADMIN</strong></p>
          <button
            style={{ ...buttonStyle, background: "#123b63", color: "white" }}
            onClick={() => loadDashboard().catch((err) => setError(err.message))}
          >
            <span>VUGURURA AMAKURU</span>
          </button>
        </section>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "12px",
          margin: "16px 0 22px",
        }}>
          <button type="button"
            onClick={() => setShowSoldOrders(v => !v)}
            style={{
              background: "#176b35", color: "white", border: "none",
              borderRadius: "10px", padding: "15px 12px",
              width: "100%", minHeight: "62px",
              fontWeight: "bold", fontSize: "clamp(12px, 1.5vw, 14px)",
              lineHeight: 1.4, cursor: "pointer",
            }}>
            {showSoldOrders ? "HISHA IBYAGURISHIJWE" : "FUNGURA IBYAGURISHIJWE"}
            {" "}({orders.length})
          </button>

          <button type="button"
            onClick={() => setShowSystemUsers(v => !v)}
            style={{
              background: "#123b63", color: "white", border: "none",
              borderRadius: "10px", padding: "15px 12px",
              width: "100%", minHeight: "62px",
              fontWeight: "bold", fontSize: "clamp(12px, 1.5vw, 14px)",
              lineHeight: 1.4, cursor: "pointer",
            }}>
            {showSystemUsers ? "HISHA ABAKORESHA BA SYSTEM" : "ABAKORESHA BA SYSTEM"}
            {" "}({users.length})
          </button>

          <button type="button"
            onClick={() => setShowCreateAccount(v => !v)}
            style={{
              background: "#198754", color: "white", border: "none",
              borderRadius: "10px", padding: "15px 12px",
              width: "100%", minHeight: "62px",
              fontWeight: "bold", fontSize: "clamp(12px, 1.5vw, 14px)",
              lineHeight: 1.4, cursor: "pointer",
            }}>
            {showCreateAccount ? "HISHA KORA KONTI" : "KORA KONTI"}
          </button>
        </div>

        <section style={statsGrid}>
          <div style={statCard}>
            <h3>Konti zose</h3>
            <strong>{users.length}</strong>
          </div>
          <div style={statCard}>
            <h3>Konti zikora</h3>
            <strong>{users.filter((u) => u.is_active).length}</strong>
          </div>
          <div style={statCard}>
            <h3>ADMIN</h3>
            <strong>{users.filter((u) => u.role === "ADMIN").length}</strong>
          </div>
          <div style={statCard}>
            <h3>UMUHINZI</h3>
            <strong>{users.filter((u) => u.role === "UMUHINZI").length}</strong>
          </div>
          <div style={statCard}>
            <h3>UMUCURUZI</h3>
            <strong>{users.filter((u) => u.role === "UMUHUZA").length}</strong>
          </div>
          <div style={statCard}>
            <h3>UMUGUZI</h3>
            <strong>{users.filter((u) => u.role === "UMUGUZI").length}</strong>
          </div>
          <div style={statCard}>
            <h3>Abahinzi bashobora guhabwa konti</h3>
            <strong>{farmers.filter((f) => !f.has_account).length}</strong>
          </div>
        </section>
        <div style={{ margin: "18px 0" }}>
          <button
            type="button"
            onClick={() => setShowAnalytics((previous) => !previous)}
            style={{
              width: "100%",
              padding: "16px 20px",
              border: "none",
              borderRadius: "10px",
              background: "#123b63",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {showAnalytics
              ? "HISHA RAPORO N'ISESENGURA ▲"
              : "FUNGURA RAPORO N'ISESENGURA ▼"}
          </button>
        </div>

        
        {/* IBYEREKEYE GUKURAMO NO GUSANGIZA RAPORO */}
        <section
          aria-label="Ibikorwa byo gukuramo no gusangiza raporo"
          style={{
            display: "flex",
            alignItems: "stretch",
            flexWrap: "wrap",
            gap: "12px",
            margin: "15px 0 20px",
            padding: "16px",
            background: "#f1f5f9",
            borderRadius: "10px",
          }}
        >
          <button
            type="button"
            onClick={exportAdminExcel}
            style={{
              ...buttonStyle,
              flex: "1 1 150px",
              background: "#166534",
              color: "white",
            }}
          >
            EXCEL (.xlsx)
          </button>
          <button
            type="button"
            onClick={exportAdminPDF}
            style={{
              ...buttonStyle,
              flex: "1 1 150px",
              background: "#b91c1c",
              color: "white",
            }}
          >
            DOWNLOAD PDF
          </button>
          <button
            type="button"
            onClick={shareAdminReport}
            style={{
              ...buttonStyle,
              flex: "1 1 170px",
              background: "#15803d",
              color: "white",
            }}
          >
            SANGIZA / WHATSAPP
          </button>
          <button
            type="button"
            onClick={emailAdminReport}
            style={{
              ...buttonStyle,
              flex: "1 1 130px",
              background: "#1d4ed8",
              color: "white",
            }}
          >
            EMAIL
          </button>
          <button
            type="button"
            onClick={printAdminReport}
            style={{
              ...buttonStyle,
              flex: "1 1 130px",
              background: "#475569",
              color: "white",
            }}
          >
            PRINT
          </button>
        </section>

        {/* GEOGRAPHICAL ANALYTICS */}
        <section style={panelStyle}>
          <button
            type="button"
            onClick={() => setShowGeoAnalytics((previous) => !previous)}
            style={{
              width: "100%",
              padding: "16px 20px",
              border: "none",
              borderRadius: "10px",
              background: "#14532d",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {showGeoAnalytics
              ? "HISHA RAPORO Z'UTURERE ▲"
              : "FUNGURA RAPORO Z'UTURERE ▼"}
          </button>

          {showGeoAnalytics && (() => {
            const clean = (value) =>
              String(value || "").trim() || "Ntabwo byashyizweho";

            const normalizeLocation = (value) => {
              const name = clean(value).toLocaleLowerCase("en")
                .replace(/\s+/g, " ");

              if (name === "western") return "iburengerazuba";

              return name;
            };

            const displayLocation = (value) => {
              const name = normalizeLocation(value);

              if (name === "iburengerazuba") return "Iburengerazuba";
              if (name === "ntabwo byashyizweho") return "Ntabwo byashyizweho";

              return name.split(" ").map((word) =>
                word.charAt(0).toLocaleUpperCase("en") + word.slice(1)
              ).join(" ");
            };

            const isSold = (p) =>
              p.is_sold === true ||
              String(p.is_sold).toLowerCase() === "true";

            const filtered = products.filter((p) =>
              (!geoProvince || normalizeLocation(p.province) === normalizeLocation(geoProvince)) &&
              (!geoDistrict || normalizeLocation(p.district) === normalizeLocation(geoDistrict)) &&
              (!geoSector || normalizeLocation(p.sector) === normalizeLocation(geoSector)) &&
              (!geoCell || normalizeLocation(p.cell) === normalizeLocation(geoCell)) &&
              (!geoVillage || normalizeLocation(p.village) === normalizeLocation(geoVillage))
            );

            const filteredOrders = orders.filter((o) =>
              (!geoProvince || normalizeLocation(o.province) === normalizeLocation(geoProvince)) &&
              (!geoDistrict || normalizeLocation(o.district) === normalizeLocation(geoDistrict)) &&
              (!geoSector || normalizeLocation(o.sector) === normalizeLocation(geoSector)) &&
              (!geoCell || normalizeLocation(o.cell) === normalizeLocation(geoCell)) &&
              (!geoVillage || normalizeLocation(o.village) === normalizeLocation(geoVillage))
            );

            const money = (value) =>
              `${Math.round(Number(value) || 0).toLocaleString("en-US")} RWF`;

            const productPrice = (p) =>
              Number(p.resale_price ?? p.offered_price ?? p.price) || 0;

            const unique = (field, source) =>
              [...new Set(
                source.map((p) => normalizeLocation(p[field]))
              )]
                .sort((a, b) => a.localeCompare(b))
                .map((name) => displayLocation(name));

            const groupField = geoVillage
              ? "village"
              : geoCell
              ? "village"
              : geoSector
              ? "cell"
              : geoDistrict
              ? "sector"
              : geoProvince
              ? "district"
              : "province";

            const grouped = Object.values(
              filtered.reduce((acc, p) => {
                const key = normalizeLocation(p[groupField]);

                if (!acc[key]) {
                  acc[key] = {
                    name: displayLocation(p[groupField]),
                    total: 0,
                    sold: 0,
                    quantity: 0,
                    soldQuantity: 0,
                    stockValue: 0,
                    orderValue: 0,
                    orderCount: 0,
                  };
                }

                acc[key].total += 1;
                acc[key].quantity += Number(p.quantity) || 0;

                if (!isSold(p)) {
                  acc[key].stockValue +=
                    (Number(p.quantity) || 0) * productPrice(p);
                }

                if (isSold(p)) {
                  acc[key].sold += 1;
                  acc[key].soldQuantity += Number(p.quantity) || 0;
                }

                return acc;
              }, {})
            );

            for (const order of filteredOrders) {
              const key = normalizeLocation(order[groupField]);

              let item = grouped.find(
                (entry) => normalizeLocation(entry.name) === key
              );

              if (!item) {
                item = {
                  name: displayLocation(order[groupField]),
                  total: 0,
                  sold: 0,
                  quantity: 0,
                  soldQuantity: 0,
                  stockValue: 0,
                  orderValue: 0,
                  orderCount: 0,
                };
                grouped.push(item);
              }

              item.orderCount += 1;
              item.orderValue +=
                (Number(order.requested_quantity) || 0) *
                (Number(order.price) || 0);
            }

            grouped.sort((a, b) => a.name.localeCompare(b.name));

            const totalSold = filtered.filter(isSold).length;
            const totalQuantity = filtered.reduce(
              (sum, p) => sum + (Number(p.quantity) || 0), 0
            );

            const totalStockValue = filtered
              .filter((p) => !isSold(p))
              .reduce(
                (sum, p) =>
                  sum + (Number(p.quantity) || 0) * productPrice(p),
                0
              );

            const totalOrderValue = filteredOrders.reduce(
              (sum, o) =>
                sum +
                (Number(o.requested_quantity) || 0) *
                (Number(o.price) || 0),
              0
            );

            const pendingOrderValue = filteredOrders
              .filter((o) => String(o.status || "").trim().toUpperCase() === "TEGEREJE UMUHUZA")
              .reduce((sum, o) => sum + (Number(o.requested_quantity) || 0) * (Number(o.price) || 0), 0);

            const acceptedOrderValue = filteredOrders
              .filter((o) => String(o.status || "").trim().toUpperCase() === "YEMEJWE N'UMUHUZA")
              .reduce((sum, o) => sum + (Number(o.requested_quantity) || 0) * (Number(o.price) || 0), 0);

            const deliveryOrderValue = filteredOrders
              .filter((o) => ["TEGEREJE DELIVERY", "YOHEREJWE", "YAHAGEZE", "YAKIRIWE N'UMUGUZI"].includes(String(o.status || "").trim().toUpperCase()))
              .reduce((sum, o) => sum + (Number(o.requested_quantity) || 0) * (Number(o.price) || 0), 0);

            
            // RAPORO Y'AGACIRO KA KOMANDE KURI BURI STATUS
            const orderStatusSummary = Object.values(
              filteredOrders.reduce((acc, order) => {
                const status = String(
                  order.status || "STATUS ITAZWI"
                ).trim();

                if (!acc[status]) {
                  acc[status] = {
                    status,
                    count: 0,
                    value: 0,
                  };
                }

                acc[status].count += 1;
                acc[status].value +=
                  (Number(order.requested_quantity) || 0) *
                  (Number(order.price) || 0);

                return acc;
              }, {})
            ).sort((a, b) => a.status.localeCompare(b.status));
const options = {
              width: "100%",
              padding: "11px",
              border: "1px solid #cbd5e1",
              borderRadius: "7px",
              background: "white",
              marginTop: "6px",
            };

            const locationFilters = [
              {
                label: "INTARA",
                value: geoProvince,
                setter: setGeoProvince,
                field: "province",
                source: products,
              },
              {
                label: "AKARERE",
                value: geoDistrict,
                setter: setGeoDistrict,
                field: "district",
                source: products.filter((p) =>
                  !geoProvince || normalizeLocation(p.province) === normalizeLocation(geoProvince)
                ),
              },
              {
                label: "UMURENGE",
                value: geoSector,
                setter: setGeoSector,
                field: "sector",
                source: products.filter((p) =>
                  (!geoProvince || normalizeLocation(p.province) === normalizeLocation(geoProvince)) &&
                  (!geoDistrict || normalizeLocation(p.district) === normalizeLocation(geoDistrict))
                ),
              },
              {
                label: "AKAGARI",
                value: geoCell,
                setter: setGeoCell,
                field: "cell",
                source: products.filter((p) =>
                  (!geoProvince || normalizeLocation(p.province) === normalizeLocation(geoProvince)) &&
                  (!geoDistrict || normalizeLocation(p.district) === normalizeLocation(geoDistrict)) &&
                  (!geoSector || normalizeLocation(p.sector) === normalizeLocation(geoSector))
                ),
              },
              {
                label: "UMUDUGUDU",
                value: geoVillage,
                setter: setGeoVillage,
                field: "village",
                source: products.filter((p) =>
                  (!geoProvince || normalizeLocation(p.province) === normalizeLocation(geoProvince)) &&
                  (!geoDistrict || normalizeLocation(p.district) === normalizeLocation(geoDistrict)) &&
                  (!geoSector || normalizeLocation(p.sector) === normalizeLocation(geoSector)) &&
                  (!geoCell || normalizeLocation(p.cell) === normalizeLocation(geoCell))
                ),
              },
            ];

            return (
              <div style={{ marginTop: "20px" }}>
                <h2 style={{ color: "#14532d" }}>
                  RAPORO Z'UTURERE
                </h2>

                <p style={{ color: "#64748b" }}>
                  Isesengura ry'umusaruro kuva ku Ntara kugeza ku Mudugudu.
                </p>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                  gap: "12px",
                  marginBottom: "20px",
                }}>
                  {locationFilters.map((filter) => (
                    <div key={filter.field}>
                      <label style={{ fontWeight: "bold" }}>
                        {filter.label}
                      </label>
                      <select
                        value={filter.value}
                        onChange={(e) => {
                          filter.setter(e.target.value);
                          if (filter.field === "province") {
                            setGeoDistrict("");
                            setGeoSector("");
                            setGeoCell("");
                            setGeoVillage("");
                          }
                          if (filter.field === "district") {
                            setGeoSector("");
                            setGeoCell("");
                            setGeoVillage("");
                          }
                          if (filter.field === "sector") {
                            setGeoCell("");
                            setGeoVillage("");
                          }
                          if (filter.field === "cell") {
                            setGeoVillage("");
                          }
                        }}
                        style={options}
                      >
                        <option value="">Byose</option>
                        {unique(filter.field, filter.source).map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setGeoProvince("");
                    setGeoDistrict("");
                    setGeoSector("");
                    setGeoCell("");
                    setGeoVillage("");
                  }}
                  style={{
                    padding: "10px 16px",
                    background: "#e2e8f0",
                    border: "none",
                    borderRadius: "7px",
                    cursor: "pointer",
                    marginBottom: "18px",
                  }}
                >
                  SUZUMA FILTRE ZOSE
                </button>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "12px",
                  marginBottom: "20px",
                }}>
                  {[
                    ["Ibicuruzwa byose", filtered.length],
                    ["Byagurishijwe", totalSold],
                    ["Bitagurishijwe", filtered.length - totalSold],
                    ["Ingano yose (KG)", totalQuantity.toLocaleString()],
                    ["Agaciro k'ibitaragurishwa", money(totalStockValue)],
                    ["Agaciro ka komande zose", money(totalOrderValue)],
                    ["Komande zitegereje umucuruzi", money(pendingOrderValue)],
                    ["Komande zemejwe", money(acceptedOrderValue)],
                    ["Komande ziri muri delivery", money(deliveryOrderValue)],
                  ].map(([label, value]) => (
                    <div key={label} style={{
                      background: "#f1f5f9",
                      padding: "16px",
                      borderRadius: "9px",
                      textAlign: "center",
                    }}>
                      <h2 style={{ color: "#14532d", margin: "0 0 8px" }}>
                        {value}
                      </h2>
                      <p style={{ margin: 0 }}>{label}</p>
                    </div>
                  ))}
                </div>

                            {/* RAPORO Y'AMAFARANGA KURI BURI STATUS */}
            <section style={{
              background: "#ffffff",
              padding: "20px",
              borderRadius: "12px",
              marginTop: "20px",
              marginBottom: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}>
              <h3>RAPORO Y'AMAFARANGA KURI BURI STATUS</h3>

              <p>
                Umubare wa komande n'agaciro kayo hakurikijwe aho zigeze.
              </p>

              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "12px", borderBottom: "2px solid #ddd" }}>
                        STATUS YA KOMANDE
                      </th>
                      <th style={{ padding: "12px", borderBottom: "2px solid #ddd" }}>
                        UMUBARE WA KOMANDE
                      </th>
                      <th style={{ padding: "12px", borderBottom: "2px solid #ddd" }}>
                        AGACIRO (RWF)
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {orderStatusSummary.map((item) => (
                      <tr key={item.status}>
                        <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                          <strong>{item.status}</strong>
                        </td>
                        <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                          {item.count}
                        </td>
                        <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                          {money(item.value)} RWF
                        </td>
                      </tr>
                    ))}

                    {orderStatusSummary.length === 0 && (
                      <tr>
                        <td colSpan={3} style={{ padding: "12px" }}>
                          Nta komande zihari.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
<h3 style={{ color: "#14532d" }}>
                  RAPORO: {groupField.toUpperCase()}
                </h3>

                

                <div style={{ overflowX: "auto" }}>
                  <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    background: "white",
                  }}>
                    <thead>
                      <tr style={{ background: "#e2e8f0" }}>
                        {[
                          groupField.toUpperCase(),
                          "BYOSE",
                          "BYAGURISHIJWE",
                          "BITAGURISHIJWE",
                          "INGANO (KG)",
                          "BYAGURISHIJWE (KG)",
                          "KOMANDE",
                          "AGACIRO K'IBITARAGURISHWA (RWF)",
                          "AGACIRO KA KOMANDE (RWF)",
                        ].map((heading) => (
                          <th key={heading} style={{
                            padding: "12px",
                            textAlign: "left",
                            borderBottom: "1px solid #cbd5e1",
                          }}>
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {grouped.map((item) => (
                        <tr key={item.name}>
                          <td style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>
                            {item.name}
                          </td>
                          <td style={{ padding: "12px" }}>{item.total}</td>
                          <td style={{ padding: "12px" }}>{item.sold}</td>
                          <td style={{ padding: "12px" }}>{item.total - item.sold}</td>
                          <td style={{ padding: "12px" }}>{item.quantity.toLocaleString()}</td>
                          <td style={{ padding: "12px" }}>{item.soldQuantity.toLocaleString()}</td>
                          <td style={{ padding: "12px" }}>{item.orderCount}</td>
                          <td style={{ padding: "12px" }}>{money(item.stockValue)}</td>
                          <td style={{ padding: "12px" }}>{money(item.orderValue)}</td>
                        </tr>
                      ))}
                      {grouped.length === 0 && (
                        <tr>
                          <td colSpan="9" style={{ padding: "20px", textAlign: "center" }}>
                            Nta makuru ahari muri aka gace.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </section>
        {showAnalytics && (
        <section style={panelStyle}>
          <h2 style={{ color: "#123b63", marginTop: 0 }}>
            RAPORO N'ISESENGURA (ANALYTICS)
          </h2>
          <p style={{ color: "#64748b" }}>
            Incamake y'umusaruro, komande n'ubucuruzi.
          </p>

          {(() => {
            const isSold = (p) =>
              p.is_sold === true ||
              String(p.is_sold).toLowerCase() === "true";

            const soldProducts = products.filter(isSold);
            const availableProducts = products.filter((p) => !isSold(p));

            const totalQuantity = products.reduce(
              (sum, p) => sum + (Number(p.quantity) || 0), 0
            );

            const soldQuantity = soldProducts.reduce(
              (sum, p) => sum + (Number(p.quantity) || 0), 0
            );

            const pendingOrders = orders.filter(
              (o) => String(o.status || "").trim().toUpperCase() === "TEGEREJE UMUHUZA"
            ).length;

            const acceptedOrders = orders.filter(
              (o) => String(o.status || "").trim().toUpperCase() === "YEMEJWE N'UMUHUZA"
            ).length;

            const deliveryOrders = orders.filter((o) =>
              ["TEGEREJE DELIVERY", "YOHEREJWE", "YAHAGEZE"].includes(
                String(o.status || "").trim().toUpperCase()
              )
            ).length;

            const orderValue = orders.reduce(
              (sum, o) =>
                sum +
                (Number(o.requested_quantity) || 0) *
                (Number(o.price) || 0),
              0
            );

            const cards = [
              { label: "UMUSARURO WOSE", value: products.length, color: "#123b63" },
              { label: "WAGURISHIJWE", value: soldProducts.length, color: "#198754" },
              { label: "UTARAGURISHWA", value: availableProducts.length, color: "#d97706" },
              { label: "KOMANDE ZOSE", value: orders.length, color: "#6f42c1" },
              { label: "ZITEGEREJE UMUCURUZI", value: pendingOrders, color: "#b7791f" },
              { label: "ZEMEJWE N'UMUCURUZI", value: acceptedOrders, color: "#198754" },
              { label: "ZIRI MURI DELIVERY", value: deliveryOrders, color: "#0d6efd" },
              { label: "INGANO Y'UMUSARURO (KG/IBINDI)", value: totalQuantity.toLocaleString("en-US"), color: "#0f766e" },
              { label: "INGANO YAGURISHIJWE", value: soldQuantity.toLocaleString("en-US"), color: "#9333ea" },
            ];

            const soldPercent = products.length
              ? Math.round((soldProducts.length / products.length) * 100)
              : 0;

            return (
              <>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
                  gap: "14px",
                  marginTop: "18px",
                }}>
                  {cards.map((card) => (
                    <div key={card.label} style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderLeft: `5px solid ${card.color}`,
                      borderRadius: "10px",
                      padding: "17px",
                      textAlign: "center",
                    }}>
                      <div style={{
                        color: "#475569",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}>
                        {card.label}
                      </div>
                      <div style={{
                        color: card.color,
                        fontSize: "26px",
                        fontWeight: "bold",
                        marginTop: "8px",
                      }}>
                        {card.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  marginTop: "20px",
                  padding: "18px",
                  background: "#f1f5f9",
                  borderRadius: "10px",
                }}>
                  <strong>IGIPIMO CY'UMUSARURO WAGURISHIJWE</strong>
                  <div style={{
                    height: "15px",
                    background: "#e2e8f0",
                    borderRadius: "20px",
                    overflow: "hidden",
                    marginTop: "12px",
                  }}>
                    <div style={{
                      width: `${soldPercent}%`,
                      height: "100%",
                      background: "#198754",
                      borderRadius: "20px",
                    }} />
                  </div>
                  <p style={{ marginBottom: 0, color: "#475569" }}>
                    {soldPercent}% by'umusaruro uri muri system wagurishijwe.
                  </p>
                </div>

                <div style={{
                  marginTop: "15px",
                  padding: "20px",
                  borderRadius: "10px",
                  background: "#e8f5e9",
                  textAlign: "center",
                }}>
                  <div style={{ color: "#176b35", fontWeight: "bold" }}>
                    AGACIRO K'AMAKOMANDE YOSE
                  </div>
                  <div style={{
                    color: "#176b35",
                    fontSize: "28px",
                    fontWeight: "bold",
                    marginTop: "8px",
                  }}>
                    {orderValue.toLocaleString("en-US")} RWF
                  </div>
                  <small style={{ color: "#52665a" }}>
                    Ibarwa hakoreshejwe ingano yasabwe × igiciro kuri komande.
                    Ntabwo bivuze ko aya mafaranga yamaze kwishyurwa.
                  </small>
                </div>
              </>
            );
          })()}
        </section>
        )}

        <section style={panelStyle}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}>
            
            <strong style={{
              background: "#e8f5e9",
              color: "#176b35",
              padding: "9px 14px",
              borderRadius: "8px",
            }}>
              KOMANDE: {orders.length}
            </strong>
          </div>

          {showSoldOrders && (
            <>
          <p style={{ color: "#555" }}>
            Urutonde rw'umusaruro wagiye utangirwaho komande,
            hamwe n'amakuru y'umuhinzi n'umuguzi.
          </p>

          {(() => {
            const getStatus = (order) =>
              String(order.status || "").trim().toUpperCase();

            const countStatus = (statuses) =>
              orders.filter(order => statuses.includes(getStatus(order))).length;

            const cards = [
              { label: "KOMANDE ZOSE", value: orders.length, color: "#1f2937" },
              { label: "ZITEGEREJE UMUCURUZI", value: countStatus(["TEGEREJE UMUHUZA"]), color: "#b7791f" },
              { label: "ZEMEJWE N'UMUCURUZI", value: countStatus(["YEMEJWE N'UMUHUZA"]), color: "#176b35" },
              { label: "ZANZWE N'UMUCURUZI", value: countStatus(["YANZWE N'UMUHUZA"]), color: "#b42318" },
              { label: "ZAKIRIWE N'UMUGUZI", value: countStatus(["YAKIRIWE N'UMUGUZI", "YAHAGEZE", "YAGEZE"]), color: "#176b8a" },
            ];

            const search = orderSearch.trim().toLowerCase();

            const filteredOrders = orders.filter(order => {
              const searchable = [
                order.id,
                order.product_name,
                order.product_type,
                order.farmer_name,
                order.farmer_phone,
                order.buyer_name,
                order.buyer_phone,
                order.district,
                order.sector,
                order.cell,
                order.village,
                order.status,
              ].join(" ").toLowerCase();

              return searchable.includes(search);
            });return (
              <>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))",
                  gap: "12px",
                  margin: "18px 0",
                }}>
                  {cards.map(card => (
                    <div key={card.label} style={{
                      background: "#f7f8fa",
                      border: "1px solid #e2e5e9",
                      borderLeft: `5px solid ${card.color}`,
                      borderRadius: "9px",
                      padding: "14px",
                    }}>
                      <div style={{ fontSize: "12px", color: "#555", fontWeight: "bold" }}>
                        {card.label}
                      </div>
                      <div style={{ fontSize: "25px", fontWeight: "bold", color: card.color, marginTop: "6px" }}>
                        {card.value}
                      </div>
                    </div>
                  ))}
                </div>

                <input
                  type="search"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Shakisha: ID, umusaruro, umuhinzi, umuguzi, telefoni, aho uva cyangwa status..."
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "13px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "14px",
                    marginBottom: "15px",
                  }}
                />

                <p style={{ color: "#555", fontWeight: "bold" }}>
                  Habonetse komande {filteredOrders.length} kuri {orders.length}
                </p>

                {orders.length === 0 ? (
                  <p style={{
                    padding: "18px",
                    textAlign: "center",
                    background: "#f5f6f7",
                    borderRadius: "8px",
                  }}>
                    Nta komande ziraboneka muri system.
                  </p>
                ) : filteredOrders.length === 0 ? (
                  <p style={{
                    padding: "18px",
                    textAlign: "center",
                    background: "#f5f6f7",
                    borderRadius: "8px",
                  }}>
                    Nta komande zihuye n'ibyo washakishije.
                  </p>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Umusaruro</th>
                          <th>Ingano yasabwe</th>
                          <th>Igiciro</th>
                          <th>Umuhinzi</th>
                          <th>Telefoni y'umuhinzi</th>
                          <th>Umuguzi</th>
                          <th>Telefoni y'umuguzi</th>
                          <th>Aho umusaruro uva</th>
                          <th>Imimerere ya komande</th>
                          <th>Itariki</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => (
                          <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>
                              <strong>{order.product_name || "-"}</strong>
                              <br />
                              <small>{order.product_type || "-"}</small>
                            </td>
                            <td>
                              {order.requested_quantity ?? "-"}{" "}
                              {order.unit || ""}
                            </td>
                            <td>
                              {order.price != null
                                ? `${Number(order.price).toLocaleString("en-US")} RWF`
                                : "-"}
                            </td>
                            <td>{order.farmer_name || "-"}</td>
                            <td>{order.farmer_phone || "-"}</td>
                            <td>{order.buyer_name || "-"}</td>
                            <td>{order.buyer_phone || "-"}</td>
                            <td>
                              {[
                                order.district,
                                order.sector,
                                order.cell,
                                order.village,
                              ].filter(Boolean).join(" / ") || "-"}
                            </td>
                            <td>
                              <strong style={{
                                color:
                                  getStatus(order) === "YARANGIYE"
                                    ? "#198754"
                                    : "#b7791f",
                              }}>
                                {order.status || "NTIBIZWI"}
                              </strong>
                            </td>
                            <td>
                              {order.created_at
                                ? new Date(order.created_at).toLocaleString("rw-RW")
                                : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            );
          })()}

          {orders.length === 0 ? (
            <p style={{
              padding: "18px",
              textAlign: "center",
              background: "#f5f6f7",
              borderRadius: "8px",
            }}>
              Nta komande ziraboneka muri system.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Umusaruro</th>
                    <th>Ingano yasabwe</th>
                    <th>Igiciro</th>
                    <th>Umuhinzi</th>
                    <th>Telefoni y'umuhinzi</th>
                    <th>Umuguzi</th>
                    <th>Telefoni y'umuguzi</th>
                    <th>Aho umusaruro uva</th>
                    <th>Imimerere ya komande</th>
                    <th>Itariki</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>

                      <td>
                        <strong>{order.product_name || "-"}</strong>
                        <br />
                        <small>{order.product_type || "-"}</small>
                      </td>

                      <td>
                        {order.requested_quantity ?? "-"}{" "}
                        {order.unit || ""}
                      </td>

                      <td>
                        {order.price != null
                          ? `${Number(order.price).toLocaleString("en-US")} RWF`
                          : "-"}
                      </td>

                      <td>{order.farmer_name || "-"}</td>
                      <td>{order.farmer_phone || "-"}</td>

                      <td>{order.buyer_name || "-"}</td>
                      <td>{order.buyer_phone || "-"}</td>

                      <td>
                        {[
                          order.district,
                          order.sector,
                          order.cell,
                          order.village,
                        ].filter(Boolean).join(" / ") || "-"}
                      </td>

                      <td>
                        <strong style={{
                          color:
                            String(order.status || "").toUpperCase() === "YARANGIYE"
                              ? "#198754"
                              : "#b7791f",
                        }}>
                          {order.status || "NTIBIZWI"}
                        </strong>
                      </td>

                      <td>
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString("rw-RW")
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        
            </>
          )}
</section>

        {message && <p style={successStyle}>{message}</p>}
        {error && <p style={errorStyle}>{error}</p>}

        {showCreateAccount && (
<section style={panelStyle}>
          <h2>KORA KONTI NSHYA</h2>

          <form onSubmit={handleCreateUser}>
            <div style={formGrid}>
              <div>
                <label style={labelStyle}>Amazina yuzuye</label>
                <input
                  style={inputStyle}
                  value={form.full_name}
                  onChange={(e) => updateField("full_name", e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Telefoni</label>
                <input
                  style={inputStyle}
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="07XXXXXXXX"
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Ijambo ry'ibanga</label>
                <input
                  style={inputStyle}
                  type="password"
                  minLength={6}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Uruhare rwa konti</label>
                <select
                  style={inputStyle}
                  value={form.role}
                  onChange={(e) => setForm({ ...emptyForm, role: e.target.value })}
                >
                  <option value="UMUHINZI">UMUHINZI / UMWOROZI</option>
                  <option value="UMUHUZA">UMUCURUZI</option>
                  <option value="UMUGUZI">UMUGUZI</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              {form.role === "UMUHINZI" && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Hitamo umuhinzi uhabwa iyi konti</label>
                  <input
                    style={inputStyle}
                    type="text"
                    placeholder="Shakisha ukoresheje ID, izina cyangwa telefoni..."
                    value={farmerSearch}
                    onChange={(e) => setFarmerSearch(e.target.value)}
                  />
                  <select
                    style={inputStyle}
                    value={form.farmer_id}
                    onChange={(e) => updateField("farmer_id", e.target.value)}
                    required
                  >
                    <option value="">-- HITAMO UMUHINZI --</option>
                    {farmers.filter((f) =>
                      !f.has_account &&
                      [
                        String(f.id),
                        f.farmer_name || "",
                        f.phone || "",
                      ].some((value) =>
                        String(value).toLowerCase().includes(farmerSearch.trim().toLowerCase())
                      )
                    ).map((farmer) => (
                      <option key={farmer.id} value={farmer.id}>
                        ID: {farmer.id} | {farmer.farmer_name} | {farmer.phone || "Nta telefoni"} | Ibicuruzwa: {farmer.products_count}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {form.role === "UMUHUZA" && (
                <>
                  {[
                    ["province", "Intara"],
                    ["district", "Akarere"],
                    ["sector", "Umurenge"],
                    ["cell", "Akagari"],
                    ["village", "Umudugudu"],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <label style={labelStyle}>{label}</label>
                      <input
                        style={inputStyle}
                        value={form[key]}
                        onChange={(e) => updateField(key, e.target.value)}
                        required
                      />
                    </div>
                  ))}
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                ...buttonStyle,
                marginTop: "20px",
                background: "#198754",
                color: "white",
              }}
            >
              {saving ? "TURAKORA..." : "KORA KONTI"}
            </button>
          </form>
        </section>
        )}

        {selectedAccount && (
          <section style={{ ...panelStyle, border: "2px solid #123b63" }}>
            <h2>AMAKURU Y'UMUKORESHA</h2>

            <p><strong>ID:</strong> {selectedAccount.id}</p>
            <p><strong>Amazina:</strong> {selectedAccount.full_name}</p>
            <p><strong>Telefoni:</strong> {selectedAccount.phone}</p>
            <p><strong>Uruhare:</strong> {selectedAccount.role}</p>
            <p><strong>Imimerere:</strong> {selectedAccount.is_active ? "IRAKORA" : "YARAHAGARITSWE"}</p>
            <p><strong>Itariki konti yakozwe:</strong> {selectedAccount.created_at ? new Date(selectedAccount.created_at).toLocaleString() : "-"}</p>

            {selectedAccount.role === "UMUHINZI" && (
              <p><strong>Umwirondoro w'umuhinzi:</strong> {selectedAccount.farmer_name || "-"} (ID: {selectedAccount.farmer_id || "-"})</p>
            )}

            {selectedAccount.role === "UMUHUZA" && (
              <>
                <p><strong>Izina ry'Umucuruzi:</strong> {selectedAccount.umuhuza_name || "-"}</p>
                <p><strong>Kode y'Umucuruzi:</strong> {selectedAccount.umuhuza_code || "-"}</p>
              </>
            )}

            <form
              onSubmit={handleResetPassword}
              style={{
                marginTop: "20px",
                padding: "16px",
                border: "1px solid #ced4da",
                borderRadius: "8px",
              }}
            >
              <h3>SUBIRIZA IJAMBO RY'IBANGA</h3>

              <label> PASSWORD NSHYA </label>
              <input
                style={inputStyle}
                type="password"
                autoComplete="new-password"
                placeholder="Andika password nshya"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
              />

              <label style={{ display: "block", marginTop: "12px" }}>
                ONGERA PASSWORD NSHYA
              </label>
              <input
                style={inputStyle}
                type="password"
                autoComplete="new-password"
                placeholder="Ongera wandike password nshya"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                minLength={8}
                required
              />

              {resetPasswordError && (
                <p style={{ color: "#b02a37" }}>{resetPasswordError}</p>
              )}

              {resetPasswordMessage && (
                <p style={{ color: "#198754" }}>{resetPasswordMessage}</p>
              )}

              <button
                type="submit"
                disabled={resetPasswordLoading}
                style={{
                  ...buttonStyle,
                  background: "#123b63",
                  color: "white",
                  marginTop: "12px",
                  opacity: resetPasswordLoading ? 0.6 : 1,
                }}
              >
                {resetPasswordLoading ? "BIRIMO GUKORA..." : "SUBIRIZA IJAMBO RY'IBANGA"}
              </button>
            </form>

            <button
              style={{ ...buttonStyle, background: "#6c757d", color: "white" }}
              onClick={() => setSelectedAccount(null)}
            >
              FUNGA AMAKURU
            </button>

            <button
              style={{
                ...buttonStyle,
                background: "#198754",
                color: "white",
                marginLeft: "8px",
              }}
              onClick={() => loadAccountActivity(selectedAccount)}
              disabled={activityLoading}
            >
              {activityLoading ? "BIRIMO GUSOMA..." : "AMATEKA Y'IBIKORWA"}
            </button>

            {activityForAccountId === selectedAccount.id && (
              <div style={{ marginTop: "18px" }}>
                <h3>AMATEKA Y'IBIKORWA BYA KONTI</h3>

                {activityError && (
                  <p style={{ color: "#b02a37" }}>{activityError}</p>
                )}

                {!activityLoading && !activityError && activities.length === 0 && (
                  <p>Nta mateka y'ibikorwa araboneka kuri iyi konti.</p>
                )}

                {activities.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      border: "1px solid #ced4da",
                      borderRadius: "8px",
                      padding: "12px",
                      marginBottom: "10px",
                    }}
                  >
                    <p><strong>Igikorwa:</strong> {item.action}</p>
                    <p><strong>Cyakozwe na:</strong> {item.admin_name || "ADMIN utazwi"}</p>
                    <p><strong>Itariki:</strong> {new Date(item.created_at).toLocaleString()}</p>
                    {item.details?.full_name && (
                      <p><strong>Amazina ya konti:</strong> {item.details.full_name}</p>
                    )}
                    {item.details?.phone && (
                      <p><strong>Telefoni ya konti:</strong> {item.details.phone}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section style={panelStyle}>
          

          {showSystemUsers && (<>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amazina</th>
                  <th>Telefoni</th>
                  <th>Uruhare</th>
                  <th>Umwirondoro</th>
                  <th>Imimerere</th>
                  <th>Igikorwa</th>
                </tr>
              </thead>
              <tbody>
                {users.map((account) => (
                  <tr key={account.id}>
                    <td>{account.id}</td>
                    <td>{account.full_name}</td>
                    <td>{account.phone}</td>
                    <td>{account.role}</td>
                    <td>
                      {account.role === "UMUHINZI"
                        ? `${account.farmer_name || "Umuhinzi"} (ID: ${account.farmer_id})`
                        : account.role === "UMUHUZA"
                          ? `${account.umuhuza_name || "Umucuruzi"} (${account.umuhuza_code || ""})`
                          : "-"}
                    </td>
                    <td>
                      <strong style={{ color: account.is_active ? "#198754" : "#b02a37" }}>
                        {account.is_active ? "IRAKORA" : "YARAHAGARITSWE"}
                      </strong>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedAccount(account)}
                        style={{ ...buttonStyle, background: "#123b63", color: "white", marginBottom: "6px" }}
                      >
                        REBA AMAKURU
                      </button>

                      <button
                        disabled={Number(account.id) === Number(user.id)}
                        onClick={() => toggleStatus(account)}
                        style={{
                          ...buttonStyle,
                          background: account.is_active ? "#b02a37" : "#198754",
                          color: "white",
                          opacity: Number(account.id) === Number(user.id) ? 0.5 : 1,
                        }}
                      >
                        {account.is_active ? "Hagarika" : "Koresha"}
                      </button>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td colSpan="7">Nta konti ziraboneka.</td>
                  </tr>
                )}
             
          </tbody>
            </table>
          </div>
        </>)}
          </section>
      </main>
    </div>
  );
}

const pageStyle = {
  width: "100%",
  maxWidth: "1600px",
  minHeight: "100vh",
  margin: "0 auto",
  padding: "0 20px 30px",
  boxSizing: "border-box",
  background: "#f1f4f8",
  fontFamily: "Arial, sans-serif",
};

const loginCard = {
  maxWidth: "430px",
  margin: "60px auto",
  padding: "28px",
  background: "white",
  borderRadius: "14px",
  boxShadow: "0 4px 18px rgba(0,0,0,0.1)",
};

const headerStyle = {
  background: "#123b63",
  color: "white",
  padding: "24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
  flexWrap: "wrap",
};

const panelStyle = {
  background: "white",
  padding: "22px",
  borderRadius: "12px",
  marginBottom: "22px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "15px",
  marginBottom: "22px",
};

const statCard = {
  background: "white",
  padding: "18px",
  borderRadius: "12px",
  textAlign: "center",
  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
};

const labelStyle = {
  display: "block",
  margin: "12px 0 7px",
  fontWeight: "bold",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "850px",
};

const successStyle = {
  background: "#d1e7dd",
  color: "#0f5132",
  padding: "12px",
  borderRadius: "8px",
};

const errorStyle = {
  background: "#f8d7da",
  color: "#842029",
  padding: "12px",
  borderRadius: "8px",
};


















