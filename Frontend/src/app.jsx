import { useState, useEffect } from "react";

const API = "http://localhost:5000";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700;800&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Syne', sans-serif;
    background: #0a0a0f;
    color: #e8e6e0;
    min-height: 100vh;
  }

  :root {
    --accent: #c8ff00;
    --accent2: #ff6b35;
    --surface: #13131a;
    --surface2: #1c1c26;
    --border: rgba(255,255,255,0.07);
    --text-muted: #6b6b7a;
  }
`;

function StatPill({ label, value }) {
  return (
    <div style={{
      background: "var(--surface2)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      padding: "10px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 2,
    }}>
      <span style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>{value}</span>
    </div>
  );
}

function Field({ label, children, error }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
        {label}
      </label>
      {children}
      {error && <span style={{ fontSize: 12, color: "#ff6b6b" }}>{error}</span>}
    </div>
  );
}

const inputStyle = {
  background: "var(--surface2)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "12px 14px",
  color: "#e8e6e0",
  fontSize: 14,
  fontFamily: "'Syne', sans-serif",
  outline: "none",
  width: "100%",
  transition: "border-color 0.2s",
};

export default function App() {
  const [options, setOptions] = useState(null);
  const [form, setForm] = useState({ name: "", company: "", year: "", kms_driven: "", fuel_type: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    fetch(`${API}/options`)
      .then(r => r.json())
      .then(d => {
        setOptions(d);
        setForm(f => ({ ...f, year: d.year_max.toString() }));
      })
      .catch(() => setApiError("Cannot reach backend. Make sure Flask is running on port 5000."));
  }, []);

  const filteredNames = options
    ? options.names.filter(n => !form.company || n.startsWith(form.company))
    : [];

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
    setFieldErrors(e => ({ ...e, [key]: "" }));
    setResult(null);
    if (key === "company") setForm(f => ({ ...f, company: val, name: "" }));
  }

  async function handleSubmit() {
    const errors = {};
    if (!form.name)       errors.name = "Select a car model";
    if (!form.company)    errors.company = "Select a company";
    if (!form.year)       errors.year = "Enter year";
    if (!form.kms_driven) errors.kms_driven = "Enter kilometres driven";
    if (!form.fuel_type)  errors.fuel_type = "Select fuel type";
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    setLoading(true);
    setApiError("");
    setResult(null);
    try {
      const res = await fetch(`${API}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, year: Number(form.year), kms_driven: Number(form.kms_driven) }),
      });
      const data = await res.json();
      if (!res.ok) setApiError(data.error || "Prediction failed");
      else setResult(data);
    } catch {
      setApiError("Network error. Is the Flask server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div style={{ minHeight: "100vh", padding: "40px 20px" }}>

        {/* Header */}
        <div style={{ maxWidth: 680, margin: "0 auto 40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 12px var(--accent)" }} />
            <span style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
              ML Price Engine
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Quikr Car<br />
            <span style={{ color: "var(--accent)" }}>Price Predictor</span>
          </h1>
          <p style={{ marginTop: 12, color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}>
            Linear regression trained on 815 real Quikr listings. Enter car details to get an estimated resale price.
          </p>
        </div>

        {/* Stats row */}
        {options && (
          <div style={{ maxWidth: 680, margin: "0 auto 32px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <StatPill label="Training records" value="815" />
            <StatPill label="Car brands" value={options.companies.length} />
            <StatPill label="Fuel types" value={options.fuel_types.length} />
          </div>
        )}

        {apiError && (
          <div style={{ maxWidth: 680, margin: "0 auto 24px", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 10, padding: "14px 18px", fontSize: 13, color: "#ff9999" }}>
            {apiError}
          </div>
        )}

        {/* Form card */}
        <div style={{ maxWidth: 680, margin: "0 auto", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "32px" }}>

          {!options ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)", fontSize: 14 }}>
              {apiError ? apiError : "Connecting to backend…"}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

              <Field label="Brand" error={fieldErrors.company}>
                <select value={form.company} onChange={e => set("company", e.target.value)} style={inputStyle}>
                  <option value="">Select brand…</option>
                  {options.companies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>

              <Field label="Car model" error={fieldErrors.name}>
                <select value={form.name} onChange={e => set("name", e.target.value)} style={inputStyle} disabled={!form.company}>
                  <option value="">{form.company ? "Select model…" : "Pick brand first"}</option>
                  {filteredNames.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </Field>

              <Field label="Year" error={fieldErrors.year}>
                <input
                  type="number"
                  min={options.year_min} max={options.year_max}
                  value={form.year}
                  onChange={e => set("year", e.target.value)}
                  placeholder={`${options.year_min} – ${options.year_max}`}
                  style={inputStyle}
                />
              </Field>

              <Field label="Kilometres driven" error={fieldErrors.kms_driven}>
                <input
                  type="number"
                  min={0} max={options.kms_max}
                  value={form.kms_driven}
                  onChange={e => set("kms_driven", e.target.value)}
                  placeholder="e.g. 45000"
                  style={inputStyle}
                />
              </Field>

              <Field label="Fuel type" error={fieldErrors.fuel_type}>
                <select value={form.fuel_type} onChange={e => set("fuel_type", e.target.value)} style={inputStyle}>
                  <option value="">Select…</option>
                  {options.fuel_types.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </Field>

              {/* Submit spans full width */}
              <div style={{ gridColumn: "1 / -1", marginTop: 8 }}>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "16px",
                    background: loading ? "var(--surface2)" : "var(--accent)",
                    color: loading ? "var(--text-muted)" : "#0a0a0f",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: "'Syne', sans-serif",
                    letterSpacing: "0.02em",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {loading ? "Predicting…" : "Predict Price →"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Result card */}
        {result && (
          <div style={{
            maxWidth: 680,
            margin: "24px auto 0",
            background: "var(--surface)",
            border: "1px solid rgba(200,255,0,0.2)",
            borderRadius: 16,
            padding: "32px",
            animation: "fadeIn 0.4s ease",
          }}>
            <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:none } }`}</style>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", marginBottom: 8 }}>
              Estimated resale value
            </div>
            <div style={{ fontSize: "clamp(36px, 7vw, 56px)", fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.02em", lineHeight: 1 }}>
              {result.formatted}
            </div>
            <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              <StatPill label="Brand" value={result.input.company} />
              <StatPill label="Year" value={result.input.year} />
              <StatPill label="Fuel" value={result.input.fuel_type} />
            </div>
            <p style={{ marginTop: 16, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
              Predicted by a Linear Regression model trained on Quikr listings. Actual resale price may vary based on condition, location, and negotiation.
            </p>
          </div>
        )}

      </div>
    </>
  );
}