import React, { useState, useRef, useMemo } from "react";
import logo from '../assets/login-logo.png'

// ─── Brand tokens (matching the original HTML) ───
const COLORS = {
  blue: "#285498",
  teal: "#0299CA",
  dark: "#0D274A",
  bg: "#f0f5fb",
  border: "#dde4ef",
  text: "#1a2740",
  muted: "#6b7a99",
};

const LOGO_HEADER_SRC =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzI1IiBoZWlnaHQ9Ijk1IiB2aWV3Qm94PSIwIDAgMzI1IDk1IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMzIuNjE2NyA4NS4xODQ5SDIwLjI4NzZWMzUuMjY0SDMyLjYxNjdWODUuMTg0OVoiIGZpbGw9IiMyODU0OTgiLz4KPHBhdGggZD0iTTUxLjYxNTggODUuMTg1NkgzOS4yODcxVjM1LjI2NDZINTAuNzA2M0w1MS43MTY4IDQxLjczMjFDNTMuMjU3OSAzOS4yMzEgNTUuNDgxMSAzNy4yODU3IDU4LjMzNTkgMzUuODcwOUM2MS4xOTA3IDM0LjQ1NjIgNjQuMzIzNCAzMy43NDg4IDY3LjY4MzUgMzMuNzQ4OEM3My45NDg5IDMzLjc0ODggNzguNjczMiAzNS41OTMgODEuODgxNyAzOS4zMDY4Qzg1LjA5MDEgNDMuMDIwNSA4Ni42ODE3IDQ4LjA3MzMgODYuNjgxNyA1NC40NjVWODUuMTg1Nkg3NC4zNTMxVjU3LjM5NTZDNzQuMzUzMSA1My4yMjcxIDczLjQxODMgNTAuMDk0NCA3MS41MjM1IDQ4LjA0OEM2OS42Mjg4IDQ2LjAwMTcgNjcuMDc3MSA0NC45NjU4IDYzLjg0MzQgNDQuOTY1OEM2MC4wMDMzIDQ0Ljk2NTggNTYuOTk2OSA0Ni4xNzg1IDU0Ljg0OTUgNDguNjAzOEM1Mi43MDIxIDUxLjAyOTEgNTEuNjE1OCA1NC4yNjI5IDUxLjYxNTggNTguMzA1MVY4NS4xODU2WiIgZmlsbD0iIzI4NTQ5OCIvPgo8cGF0aCBkPSJNMTEzLjI1OCA4Ni40OTg0QzEwOC40MDggODYuNDk4NCAxMDQuMjM5IDg1LjQxMjEgMTAwLjc3OCA4My4yMTQxQzk3LjMxNjggODEuMDE2MiA5NC42MTM2IDc3Ljk4NDUgOTIuNjkzNSA3NC4wNjg3QzkwLjc3MzUgNzAuMTUyOCA4OS44MTM1IDY1LjYwNTMgODkuODEzNSA2MC40MjYzQzg5LjgxMzUgNTUuMjQ3MiA5MC43NzM1IDUwLjY0OTIgOTIuNjkzNSA0Ni42MzIzQzk0LjYxMzYgNDIuNjE1NCA5Ny4zOTI2IDM5LjQ4MjcgMTAxLjAzMSAzNy4xODM3QzEwNC42NjkgMzQuODg0NyAxMDguOTg5IDMzLjc0NzggMTEzLjk2NiAzMy43NDc4QzExNy40NzcgMzMuNzQ3OCAxMjAuNjYgMzQuNDMgMTIzLjU2NiAzNS44MTk1QzEyNi40NzEgMzcuMjA5IDEyOC42OTQgMzkuMTI5IDEzMC4yMzUgNDEuNjMwMVYxMEgxNDIuNDYzVjg1LjE4NDdIMTMxLjE0NUwxMzAuMzM2IDc3LjQwMzVDMTI4Ljg0NiA4MC4yMzMgMTI2LjU3MiA4Mi40NTYyIDEyMy41MTUgODQuMDczMUMxMjAuNDU4IDg1LjY5IDExNy4wMjIgODYuNDk4NCAxMTMuMjU4IDg2LjQ5ODRaTTExNS45ODcgNzUuMTgwM0MxMTguODkyIDc1LjE4MDMgMTIxLjM2OCA3NC41NDg3IDEyMy40NjUgNzMuMzEwOEMxMjUuNTYyIDcyLjA3MjggMTI3LjE3OCA3MC4yNzkxIDEyOC4zNjYgNjcuOTU0OUMxMjkuNTUzIDY1LjYzMDYgMTMwLjEzNCA2Mi45Nzc5IDEzMC4xMzQgNjAuMDIyMUMxMzAuMTM0IDU3LjA2NjIgMTI5LjU1MyA1NC4zMzc3IDEyOC4zNjYgNTIuMDg5M0MxMjcuMTc4IDQ5Ljg0MDggMTI1LjU2MiA0OC4wNDcxIDEyMy40NjUgNDYuNzMzNEMxMjEuMzY4IDQ1LjQxOTcgMTE4Ljg5MiA0NC43NjI4IDExNS45ODcgNDQuNzYyOEMxMTMuMDgxIDQ0Ljc2MjggMTEwLjcwNyA0NS40MTk3IDEwOC42MSA0Ni43MzM0QzEwNi41MTMgNDguMDQ3MSAxMDQuOTIxIDQ5Ljg0MDggMTAzLjgxIDUyLjEzOThDMTAyLjY5OCA1NC40Mzg4IDEwMi4xNDIgNTcuMDY2MiAxMDIuMTQyIDYwLjAyMjFDMTAyLjE0MiA2Mi45Nzc5IDEwMi42OTggNjUuNjA1MyAxMDMuODEgNjcuOTA0M0MxMDQuOTIxIDcwLjIwMzMgMTA2LjUxMyA3MS45NzE4IDEwOC42MSA3My4yNjAyQzExMC43MDcgNzQuNTQ4NyAxMTMuMTU3IDc1LjE4MDMgMTE1Ljk4NyA3NS4xODAzWiIgZmlsbD0iIzI4NTQ5OCIvPgo8cGF0aCBkPSJNMTcxLjU2OCA4Ni40OTkzQzE2Ni42NDEgODYuNDk5MyAxNjIuMjk2IDg1LjM2MjUgMTU4LjQ4MSA4My4xMTRDMTU0LjY2NiA4MC44NjU1IDE1MS42ODUgNzcuNzU4MSAxNDkuNTM4IDczLjgxN0MxNDcuMzkxIDY5Ljg3NTggMTQ2LjMwNCA2NS4zNTM2IDE0Ni4zMDQgNjAuMjI1MUMxNDYuMzA0IDU1LjA5NjYgMTQ3LjM0IDUwLjQ0ODEgMTQ5LjQzNyA0Ni40ODE3QzE1MS41MzQgNDIuNTE1MyAxNTQuNDY0IDM5LjM4MjYgMTU4LjIyOSAzNy4xMzQxQzE2MS45OTMgMzQuODg1NiAxNjYuMzEzIDMzLjc0ODggMTcxLjE2NCAzMy43NDg4QzE3Ni4wMTQgMzMuNzQ4OCAxODAuNTYyIDM0LjgwOTkgMTg0LjIgMzYuOTMyQzE4Ny44MzggMzkuMDU0MiAxOTAuNjQyIDQyLjAxIDE5Mi42MzggNDUuNzc0M0MxOTQuNjM0IDQ5LjUzODYgMTk1LjYxOSA1NC4wNjA4IDE5NS42MTkgNTkuMzE1NlY2My4wNTQ2TDE1Mi43NzIgNjMuMTU1N0wxNTIuOTc0IDU1LjI3MzRIMTgzLjM5MUMxODMuMzkxIDUxLjgzNzYgMTgyLjMwNSA0OS4wODM4IDE4MC4xMDcgNDYuOTg2OUMxNzcuOTA5IDQ0Ljg5MDEgMTc0Ljk3OCA0My44NTQyIDE3MS4yNjUgNDMuODU0MkMxNjguMzU5IDQzLjg1NDIgMTY1LjkzNCA0NC40NjA2IDE2My45MzggNDUuNjczMkMxNjEuOTQyIDQ2Ljg4NTkgMTYwLjQ1MiA0OC43MDQ5IDE1OS40NDEgNTEuMTMwMkMxNTguNDMxIDUzLjU1NTUgMTU3LjkyNSA1Ni41MTEzIDE1Ny45MjUgNjAuMDIzQzE1Ny45MjUgNjUuNDA0MiAxNTkuMDg4IDY5LjQ5NjkgMTYxLjQxMiA3Mi4yNTA2QzE2My43MzYgNzUuMDA0NCAxNjcuMTk3IDc2LjM5MzkgMTcxLjc3IDc2LjM5MzlDMTc1LjEzIDc2LjM5MzkgMTc3LjkwOSA3NS43NjIzIDE4MC4xMDcgNzQuNDczOEMxODIuMzA1IDczLjE4NTQgMTgzLjcyIDcxLjM2NjQgMTg0LjQwMiA2OS4wMTY5SDE5NS44MjFDMTk0LjczNSA3NC40NzM4IDE5Mi4wNTcgNzguNzQzNCAxODcuNzg3IDgxLjg1MDhDMTgzLjUxOCA4NC45NTgyIDE3OC4xMTEgODYuNDk5MyAxNzEuNTY4IDg2LjQ5OTNaIiBmaWxsPSIjMjg1NDk4Ii8+CjxwYXRoIGQ9Ik0yNzQuMzk3IDg2LjQ5OTNDMjY5LjQ3MSA4Ni40OTkzIDI2NS4xMjYgODUuMzYyNSAyNjEuMzExIDgzLjExNEMyNTcuNDk2IDgwLjg2NTUgMjU0LjUxNSA3Ny43NTgxIDI1Mi4zNjggNzMuODE3QzI1MC4yMiA2OS44NzU4IDI0OS4xMzQgNjUuMzUzNiAyNDkuMTM0IDYwLjIyNTFDMjQ5LjEzNCA1NS4wOTY2IDI1MC4xNyA1MC40NDgxIDI1Mi4yNjYgNDYuNDgxN0MyNTQuMzYzIDQyLjUxNTMgMjU3LjI5NCAzOS4zODI2IDI2MS4wNTggMzcuMTM0MUMyNjQuODIzIDM0Ljg4NTYgMjY5LjE0MyAzMy43NDg4IDI3My45OTMgMzMuNzQ4OEMyNzguODQ0IDMzLjc0ODggMjgzLjM5MSAzNC44MDk5IDI4Ny4wMjkgMzYuOTMyQzI5MC42NjcgMzkuMDU0MiAyOTMuNDcyIDQyLjAxIDI5NS40NjcgNDUuNzc0M0MyOTcuNDYzIDQ5LjUzODYgMjk4LjQ0OCA1NC4wNjA4IDI5OC40NDggNTkuMzE1NlY2My4wNTQ2TDI1NS42MDEgNjMuMTU1N0wyNTUuODAzIDU1LjI3MzRIMjg2LjIyMUMyODYuMjIxIDUxLjgzNzYgMjg1LjEzNSA0OS4wODM4IDI4Mi45MzcgNDYuOTg2OUMyODAuNzM5IDQ0Ljg5MDEgMjc3LjgwOCA0My44NTQyIDI3NC4wOTQgNDMuODU0MkMyNzEuMTg5IDQzLjg1NDIgMjY4Ljc2NCA0NC40NjA2IDI2Ni43NjggNDUuNjczMkMyNjQuNzcyIDQ2Ljg4NTkgMjYzLjI4MSA0OC43MDQ5IDI2Mi4yNzEgNTEuMTMwMkMyNjEuMjYgNTMuNTU1NSAyNjAuNzU1IDU2LjUxMTMgMjYwLjc1NSA2MC4wMjNDMjYwLjc1NSA2NS40MDQyIDI2MS45MTcgNjkuNDk2OSAyNjQuMjQxIDcyLjI1MDZDMjY2LjU2NiA3NS4wMDQ0IDI3MC4wMjcgNzYuMzkzOSAyNzQuNiA3Ni4zOTM5QzI3Ny45NiA3Ni4zOTM5IDI4MC43MzkgNzUuNzYyMyAyODIuOTM3IDc0LjQ3MzhDMjg1LjEzNSA3My4xODU0IDI4Ni41NDkgNzEuMzY2NCAyODcuMjMxIDY5LjAxNjlIMjk4LjY1MUMyOTcuNTY0IDc0LjQ3MzggMjk0Ljg4NiA3OC43NDM0IDI5MC42MTcgODEuODUwOEMyODYuMzQ3IDg0Ljk1ODIgMjgwLjk0MSA4Ni40OTkzIDI3NC4zOTcgODYuNDk5M1oiIGZpbGw9IiMyODU0OTgiLz4KPHBhdGggZD0iTTMxNC43MiA4NS4xODQ3SDMwMi40OTJWMTBIMzE0LjcyVjg1LjE4NDdaIiBmaWxsPSIjMjg1NDk4Ii8+CjxwYXRoIGQ9Ik0yMDcuMjg0IDMzLjMxOTJMMjA3LjQxIDMzLjQ5ODlMMjE4LjY1OCA0OS40NTAxTDIxOC42NjcgNDkuNDYxOEwyMTguNjc0IDQ5LjQ3MzVDMjIyLjMyMiA1NS40NzQ4IDIyMi4xMTMgNjIuNjM0OCAyMTguNjgxIDY4LjcwODlMMjE4LjY3MyA2OC43MjI1TDIxOC42NjQgNjguNzM2MkwyMDcuNDkgODUuNDYxOEwyMDcuMzY0IDg1LjY0OTNIMjA3LjEyNEMyMDMuMDQxIDg1Ljc0NjMgMTk5LjA1NCA4NS43NDYgMTk0Ljc3MSA4NS42MDA1TDE5NC4wMDcgODUuNTc1MUwxOTQuNDM2IDg0Ljk0MTNMMjA4Ljg1MiA2My42NjQ5QzIxMC44ODQgNjAuNTc1MyAyMTAuNzIyIDU2Ljg1NDggMjA4LjQyNyA1My45MjM3TDIwOC40MiA1My45MTQ5TDIwOC40MTQgNTMuOTA3MUwxOTQuMzY2IDMzLjk4NTJMMTkzLjg5NiAzMy4zMTkySDIwNy4yODRaIiBmaWxsPSIjMjg1NDk4IiBzdHJva2U9IiMyODU0OTgiIHN0cm9rZS13aWR0aD0iMC44NDUxMjEiLz4KPHBhdGggZD0iTTI1Mi4xMzQgMzMuMzE5MkwyNTEuNjg0IDMzLjk4MDNMMjM4LjA4OSA1My45MDEyTDIzOC4wODMgNTMuOTFMMjM4LjA3NyA1My45MTc4QzIzNS44NTQgNTYuODUxOCAyMzUuNjk2IDYwLjU4MTEgMjM3LjY2OCA2My42NzQ3TDI1MS42MTcgODQuOTQ3MUwyNTIuMDI4IDg1LjU3NDFMMjUxLjI3OCA4NS42MDA1QzI0Ny4xMzMgODUuNzQ2IDI0My4yNzQgODUuNzQ2MyAyMzkuMzIyIDg1LjY0OTNIMjM5LjA3OUwyMzguOTU0IDg1LjQ1NTlMMjI4LjE0IDY4LjczMDNMMjI4LjEzMSA2OC43MTc3TDIyOC4xMjUgNjguNzA0QzIyNC44MDQgNjIuNjMyNCAyMjQuNjAyIDU1LjQ3NzggMjI4LjEzIDQ5LjQ3OTRMMjI4LjEzOCA0OS40NjY3TDIyOC4xNDYgNDkuNDU1TDIzOS4wMzEgMzMuNTAzOEwyMzkuMTU3IDMzLjMxOTJIMjUyLjEzNFoiIGZpbGw9IiMyODU0OTgiIHN0cm9rZT0iIzI4NTQ5OCIgc3Ryb2tlLXdpZHRoPSIwLjg0NTEyMSIvPgo8cmVjdCB4PSIyMC4xNDExIiB5PSIxNi4zMzg0IiB3aWR0aD0iMTIuNjc2OCIgaGVpZ2h0PSIxMi42NzY4IiBmaWxsPSIjMjg1NDk4Ii8+Cjwvc3ZnPgo=";

const LOGO_SIG_SRC =logo
  
const V_TITLE_MAX = 200;
const V_TITLE_MIN = 120;

function measureText(text, fontStr) {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  ctx.font = fontStr;
  return ctx.measureText(text).width;
}

export default function CompanySignature() {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [mobileRaw, setMobileRaw] = useState("");
  const [copied, setCopied] = useState(false);
  const previewRef = useRef(null);

  const signatureHtml = useMemo(() => {
    const nm = name.trim() || "Your Name";
    const ti = title.trim() || "Designation";
    const em = email.trim() || "yourname@indexel.co.in";
    const mobileDigits = mobileRaw.replace(/\D/g, "");
    const mobile = mobileDigits ? "+91-" + mobileDigits : "+91-XXXXXXXXXX";

    let desigW;
    try {
      desigW = Math.min(
        V_TITLE_MAX,
        Math.max(V_TITLE_MIN, Math.round(measureText(ti, "12px Arial") + 20))
      );
    } catch {
      desigW = 160;
    }

    const formerly = "(Formerly, Indexel Engineering Pvt. Ltd.)";
    const verticals = "Electrical | Automation | Energy | Instrumentation | BESS";

    const line = (w, color = "#285498", thick = 1) =>
      `<tr><td style="padding:0 0 8px 0;"><table cellpadding="0" cellspacing="0" border="0"><tr>` +
      `<td height="${thick}" style="background:${color};height:${thick}px;max-height:${thick}px;width:${w}px;font-size:0;line-height:0;mso-line-height-rule:exactly;overflow:hidden;display:block;"></td>` +
      `</tr></table></td></tr>`;

    const cell = (txt, size = 12, color = "#374151", pad = "0 0 1px 0", extra = "") =>
      `<tr><td style="font-family:Arial,sans-serif;font-size:${size}px;color:${color};padding:${pad};${extra}">${txt}</td></tr>`;

    const wrap = (rows) =>
      `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:Arial,sans-serif;">${rows}</table>`;

    const logoBlock = (w, align = "left") => {
      const h = Math.round(w * 0.2593);
      const tdStyle = align === "center" ? "padding:6px 0;text-align:center;" : "padding:6px 0;";
      const imgStyle =
        align === "center"
          ? "display:inline-block;border:0;margin:0 auto;"
          : "display:block;border:0;margin:0;padding:0;";
      return `<tr><td style="${tdStyle}"><img src="${LOGO_SIG_SRC}" width="${w}" height="${h}" alt="indexel" style="width:${w}px;height:${h}px;${imgStyle}" /></td></tr>`;
    };

    const greet = cell("Best Regards,", 13, "#222222", "0 0 12px 0");
    const nameRow = cell(nm, 16, "#0D274A", "0 0 1px 0", "font-weight:bold;");
    const titleRow = cell(ti, 12, "#374151", "0 0 6px 0");
    const vertR = cell(verticals, 9, "#285498", "0", "letter-spacing:0px;");

    const contactFull =
      cell("<b>Indexel Engineering Limited</b>", 12, "#000000", "0 0 2px 0") +
      cell(formerly, 10, "#888888", "0 0 3px 0", "font-style:italic;") +
      cell("Mobile: " + mobile, 12, "#374151", "0 0 1px 0") +
      cell(
        `E-Mail: <a href="mailto:${em}" style="color:#374151;text-decoration:none;">${em}</a>`,
        12,
        "#374151",
        "0 0 1px 0"
      ) +
      cell(
        `Website: <a href="https://www.indexel.co.in" style="color:#374151;text-decoration:none;">www.indexel.co.in</a>`,
        12,
        "#374151",
        "0 0 4px 0"
      ) +
      cell("G1-12, IT Park, Road No. 4, IPIA,", 12, "#374151", "0 0 1px 0") +
      cell("Kota, Rajasthan &ndash; India 324005", 12, "#374151", "0 0 6px 0");

    const spacer = `<tr><td style="height:3px;font-size:0;line-height:0;"></td></tr>`;

    return wrap(
      greet + nameRow + titleRow + line(desigW) + contactFull + spacer + logoBlock(120, "left") + vertR
    );
  }, [name, title, email, mobileRaw]);

  // Plain-text fallback (used as the text/plain clipboard part, and for the
  // execCommand fallback path so something sensible always ends up copied)
  const signaturePlainText = useMemo(() => {
    const nm = name.trim() || "Your Name";
    const ti = title.trim() || "Designation";
    const em = email.trim() || "yourname@indexel.co.in";
    const mobileDigits = mobileRaw.replace(/\D/g, "");
    const mobile = mobileDigits ? "+91-" + mobileDigits : "+91-XXXXXXXXXX";
    return [
      "Best Regards,",
      nm,
      ti,
      "",
      "Indexel Engineering Limited",
      "(Formerly, Indexel Engineering Pvt. Ltd.)",
      `Mobile: ${mobile}`,
      `E-Mail: ${em}`,
      "Website: www.indexel.co.in",
      "G1-12, IT Park, Road No. 4, IPIA,",
      "Kota, Rajasthan – India 324005",
    ].join("\n");
  }, [name, title, email, mobileRaw]);

  const [copyError, setCopyError] = useState("");

  const handleMobileChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
    setMobileRaw(digitsOnly);
  };

  // Fallback used when the async Clipboard API is unavailable, blocked by
  // permissions, or not running in a secure context (https/localhost).
  // Selects the actual on-screen preview node (not a detached element,
  // which some browsers refuse to copy from) and runs execCommand("copy").
  const copyViaSelection = () => {
    const node = previewRef.current;
    if (!node) return false;
    const range = document.createRange();
    range.selectNodeContents(node);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    const ok = document.execCommand("copy");
    sel.removeAllRanges();
    return ok;
  };

  const copySignature = async () => {
    setCopyError("");

    // Path 1: modern async Clipboard API with a real ClipboardItem.
    // Requires a secure context (https or localhost) and a user-gesture
    // triggered call — both satisfied by a direct button onClick.
    if (typeof window !== "undefined" && window.isSecureContext && navigator.clipboard && window.ClipboardItem) {
      try {
        const htmlBlob = new Blob([signatureHtml], { type: "text/html" });
        const textBlob = new Blob([signaturePlainText], { type: "text/plain" });
        await navigator.clipboard.write([
          new window.ClipboardItem({ "text/html": htmlBlob, "text/plain": textBlob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
        return;
      } catch (err) {
        console.error("Clipboard API copy failed, falling back:", err);
      }
    }

    // Path 2: legacy selection + execCommand — works in more embedded /
    // non-https / older-browser contexts, and preserves rich formatting
    // because it copies the actual rendered DOM node.
    try {
      if (copyViaSelection()) {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
        return;
      }
    } catch (err) {
      console.error("execCommand copy failed, falling back:", err);
    }

    // Path 3: plain text as a last resort, so at least something is copied.
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(signaturePlainText);
        setCopyError("Copied as plain text — formatting/logo may be lost. Your browser blocked rich-text copy.");
        return;
      }
    } catch (err) {
      console.error("writeText fallback failed:", err);
    }

    setCopyError(
      "Copy failed. This usually means the page isn't served over HTTPS/localhost, or the browser blocked clipboard access. Select the preview above and copy it manually (Ctrl/Cmd+C)."
    );
  };

  return (
    <div style={{ fontFamily: "'DM Sans', Arial, sans-serif", background: COLORS.bg, minHeight: "100vh", color: COLORS.text }}>
      {/* Header */}
    

      {/* Main */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "350px 1fr",
          minHeight: "calc(100vh - 61px)",
        }}
        className="sig-main"
      >
        {/* Form panel */}
        <div
          style={{
            background: "#fff",
            borderRight: `1px solid ${COLORS.border}`,
            padding: "28px 24px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: COLORS.blue,
              marginBottom: 16,
              paddingBottom: 8,
              borderBottom: `1px solid ${COLORS.border}`,
            }}
          >
            Your Details
          </div>

          <Field label="Full Name">
            <TextInput
              placeholder="e.g. Divyansh Goenka"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field
            label={
              <>
                Designation{" "}
                <span style={{ fontWeight: 400, color: "#b0bac8" }}>— write as: Role – Dept.</span>
              </>
            }
          >
            <TextInput
              placeholder="e.g. Executive Engineer – EPC Projects"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div style={{ fontSize: 10, color: "#9aacbf", marginTop: 4, lineHeight: 1.5 }}>
              e.g. Sr. Engineer – Energy Automation &nbsp;&middot;&nbsp; Exec. Engineer – EPC Projects
            </div>
          </Field>

          <Field label="Email Address">
            <TextInput
              type="email"
              placeholder="name@indexel.co.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field label="Mobile Number">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: `1.5px solid ${COLORS.border}`,
                borderRadius: 6,
                background: "#f7f9fc",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  padding: "9px 10px 9px 12px",
                  fontSize: 13,
                  color: COLORS.muted,
                  borderRight: `1px solid ${COLORS.border}`,
                  whiteSpace: "nowrap",
                  userSelect: "none",
                }}
              >
                +91 –
              </span>
              <input
                type="tel"
                placeholder="XXXXXXXXXX"
                maxLength={10}
                value={mobileRaw}
                onChange={handleMobileChange}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: "9px 12px",
                  flex: 1,
                  outline: "none",
                  fontSize: 13,
                  color: COLORS.text,
                  width: "100%",
                }}
              />
            </div>
          </Field>

          <button
            onClick={copySignature}
            style={{
              width: "100%",
              padding: "10px 16px",
              border: "none",
              borderRadius: 6,
              background: copied ? "#0d9e6e" : COLORS.blue,
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
              marginTop: 4,
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {copied ? "✅ Copied!" : "📋 Copy Signature"}
          </button>

          {copyError && (
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                lineHeight: 1.5,
                color: "#a13d2e",
                background: "#fdecea",
                border: "1px solid #f3c6bf",
                borderRadius: 6,
                padding: "8px 10px",
              }}
            >
              {copyError}
            </div>
          )}

          <Instructions
            title="How to add in Outlook"
            steps={[
              <>Click <Code>Copy Signature</Code></>,
              <>Open Outlook → <Code>File</Code> → <Code>Options</Code></>,
              <>Go to <Code>Mail</Code> → <Code>Signatures</Code></>,
              <>Click <Code>New</Code>, give it a name</>,
              <>Paste with <Code>Ctrl + V</Code></>,
              <>Click <Code>OK</Code> to save</>,
            ]}
          />
          <Instructions
            title="How to add in Gmail"
            steps={[
              <>Click <Code>Copy Signature</Code></>,
              <>Open Gmail → <Code>Settings ⚙</Code> → <Code>See all settings</Code></>,
              <>Scroll to <Code>Signature</Code> → <Code>Create new</Code></>,
              <>Paste with <Code>Ctrl + V</Code></>,
              <>Scroll down → <Code>Save Changes</Code></>,
            ]}
          />
        </div>

        {/* Preview panel */}
        <div style={{ padding: "36px 40px", background: COLORS.bg, overflowY: "auto" }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: COLORS.muted,
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            Live Preview
            <span style={{ height: 1, background: COLORS.border, flex: 1, maxWidth: 200 }} />
          </div>

          <div
            style={{
              maxWidth: 620,
              background: "#fff",
              borderRadius: 10,
              boxShadow: "0 2px 16px rgba(40,84,152,0.10)",
              overflow: "hidden",
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div
              style={{
                background: "#f4f5f7",
                borderBottom: `1px solid ${COLORS.border}`,
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Dot color="#ff5f57" />
              <Dot color="#ffbd2e" />
              <Dot color="#28c840" />
              <span style={{ fontSize: 12, color: "#888", marginLeft: 8, fontFamily: "sans-serif" }}>
                New Message — Outlook
              </span>
            </div>
            <div style={{ padding: "12px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
              <EmailField label="To:" value="client@example.com" />
              <EmailField label="Sub:" value="Project Update — Q2 2025" />
            </div>
            <div style={{ padding: "20px 24px 28px" }}>
              <div
                style={{
                  fontFamily: "Arial, sans-serif",
                  fontSize: 13,
                  color: "#222",
                  lineHeight: 1.6,
                  marginBottom: 20,
                  paddingBottom: 16,
                  borderBottom: "1px solid #eee",
                }}
              >
                Dear Team,
                <br />
                <br />
                Please find the attached documents for your review.
                <br />
                Looking forward to your feedback.
              </div>
              <div ref={previewRef} dangerouslySetInnerHTML={{ __html: signatureHtml }} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sig-main { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: COLORS.muted, marginBottom: 5 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "9px 12px",
        border: `1.5px solid ${COLORS.border}`,
        borderRadius: 6,
        fontSize: 13,
        color: COLORS.text,
        background: "#f7f9fc",
        outline: "none",
        boxSizing: "border-box",
      }}
    />
  );
}

function Code({ children }) {
  return (
    <code
      style={{
        fontFamily: "'DM Mono', monospace",
        background: "#e2eaf7",
        padding: "1px 5px",
        borderRadius: 3,
        fontSize: 10,
        color: COLORS.blue,
      }}
    >
      {children}
    </code>
  );
}

function Instructions({ title, steps }) {
  return (
    <div
      style={{
        marginTop: 16,
        background: COLORS.bg,
        borderRadius: 8,
        padding: "14px 16px",
        fontSize: 12,
        color: COLORS.muted,
        lineHeight: 1.6,
      }}
    >
      <strong
        style={{
          color: COLORS.dark,
          display: "block",
          marginBottom: 6,
          fontSize: 11,
          letterSpacing: 0.5,
          textTransform: "uppercase",
        }}
      >
        {title}
      </strong>
      <ol style={{ paddingLeft: 16 }}>
        {steps.map((s, i) => (
          <li key={i} style={{ marginBottom: 3 }}>
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Dot({ color }) {
  return <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />;
}

function EmailField({ label, value }) {
  return (
    <div style={{ display: "flex", gap: 8, fontSize: 12, color: "#888", padding: "3px 0" }}>
      <span style={{ color: "#aaa", width: 32, flexShrink: 0 }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}