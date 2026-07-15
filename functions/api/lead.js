export async function onRequestPost(context) {
  try {
    const req = context.request;

    // Accept either JSON or HTML form POST
    const contentType = (req.headers.get("content-type") || "").toLowerCase();
    let data = {};
    if (contentType.includes("application/json")) {
      data = await req.json();
    } else {
      const fd = await req.formData();
      for (const [k, v] of fd.entries()) data[k] = v;
    }

    // Turnstile token comes from widget as "cf-turnstile-response"
    const token = data["cf-turnstile-response"] || data.turnstile;
    if (!token) return json({ error: "Missing Turnstile token" }, 400);

    const secret = context.env.TURNSTILE_SECRET_KEY;
    if (!secret) return json({ error: "Server missing TURNSTILE_SECRET_KEY" }, 500);

    const ip = req.headers.get("CF-Connecting-IP") || "";
    const verifyForm = new FormData();
    verifyForm.append("secret", secret);
    verifyForm.append("response", token);
    if (ip) verifyForm.append("remoteip", ip);

    const verifyResp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: verifyForm,
    });
    const verify = await verifyResp.json();
    if (!verify.success) return json({ error: "Failed anti-spam check" }, 403);

    // Email via Resend
    const resendKey = context.env.RESEND_API_KEY;
    const toEmail = context.env.TO_EMAIL || "pureharvest2022@gmail.com";
    const fromEmail = context.env.FROM_EMAIL; // e.g. "Pure Harvest <no-reply@pureharvestfood.com>"

    if (!resendKey) return json({ error: "Server missing RESEND_API_KEY" }, 500);
    if (!fromEmail) return json({ error: "Server missing FROM_EMAIL" }, 500);

    const subject = emailSubject(data);
    const html = emailHtml(data);

    const sendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject,
        html,
      }),
    });

    if (!sendResp.ok) {
      const t = await sendResp.text();
      return json({ error: "Email send failed", detail: t.slice(0, 500) }, 502);
    }

    return json({ ok: true }, 200);
  } catch (err) {
    return json({ error: err?.message || "Server error" }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function emailSubject(d) {
  const t = String(d.type || "").toLowerCase();
  if (t.includes("contact")) return "New Website Contact Message (Pure Harvest)";
  if (t.includes("retailer") || t.includes("quote")) return "New Retailer / Quote Request (Pure Harvest)";
  return "New Website Submission (Pure Harvest)";
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));
}

function rows(d) {
  const skip = new Set(["cf-turnstile-response","turnstile"]);
  let out = "";
  for (const k of Object.keys(d)) {
    if (skip.has(k)) continue;
    const v = d[k];
    if (v === undefined || v === null || String(v).trim() === "") continue;
    out += `<tr><td style="padding:6px 10px;border:1px solid #eee;"><strong>${esc(k)}</strong></td><td style="padding:6px 10px;border:1px solid #eee;">${esc(v)}</td></tr>`;
  }
  return out || `<tr><td style="padding:6px 10px;border:1px solid #eee;" colspan="2">No fields found</td></tr>`;
}

function emailHtml(d) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:720px;margin:0 auto;">
    <h2>New submission from pureharvestfood.com</h2>
    <p><strong>Type:</strong> ${esc(d.type || "unknown")}</p>
    <table style="border-collapse:collapse;width:100%;">
      ${rows(d)}
    </table>
    <p style="color:#666;margin-top:14px;">Sent by Cloudflare Pages Function.</p>
  </div>`;
}
