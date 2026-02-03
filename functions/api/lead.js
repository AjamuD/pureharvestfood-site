export async function onRequestPost(context) {
  try {
    const req = context.request;
    const body = await req.json();

    const token = body.turnstile;
    if (!token) return json({ error: "Missing Turnstile token" }, 400);

    const secret = context.env.TURNSTILE_SECRET_KEY;
    if (!secret) return json({ error: "Server missing TURNSTILE_SECRET_KEY" }, 500);

    const ip = req.headers.get("CF-Connecting-IP") || "";
    const formData = new FormData();
    formData.append("secret", secret);
    formData.append("response", token);
    if (ip) formData.append("remoteip", ip);

    const verifyResp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });
    const verify = await verifyResp.json();
    if (!verify.success) return json({ error: "Failed anti-spam check" }, 403);

    const resendKey = context.env.RESEND_API_KEY;
    const toEmail = context.env.TO_EMAIL || "pureharvest2022@gmail.com";
    const fromEmail = context.env.FROM_EMAIL; // e.g. "Pure Harvest <no-reply@pureharvestfood.com>"
    if (!resendKey) return json({ error: "Server missing RESEND_API_KEY" }, 500);
    if (!fromEmail) return json({ error: "Server missing FROM_EMAIL" }, 500);

    const subject = emailSubject(body);
    const html = emailHtml(body);

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
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

function emailSubject(body) {
  if (body.type === "export_quote") return "New Export Quote Request (Pure Harvest)";
  if (body.type === "contact") return "New Website Contact Message (Pure Harvest)";
  return "New Website Lead (Pure Harvest)";
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));
}

function row(label, value) {
  if (!value) return "";
  return `<tr><td style="padding:6px 10px;border:1px solid #eee;"><strong>${esc(label)}</strong></td><td style="padding:6px 10px;border:1px solid #eee;">${esc(value)}</td></tr>`;
}

function emailHtml(body) {
  const products = Array.isArray(body.products) ? body.products.join(", ") : "";
  return `
  <div style="font-family:Arial,sans-serif;max-width:720px;margin:0 auto;">
    <h2>New submission from pureharvestfood.com</h2>
    <p><strong>Type:</strong> ${esc(body.type || "unknown")}</p>
    <table style="border-collapse:collapse;width:100%;">
      ${row("Name/Company", body.name || body.company)}
      ${row("Contact person", body.contact)}
      ${row("Email", body.email)}
      ${row("Phone", body.phone)}
      ${row("Subject", body.subject)}
      ${row("Message", body.message)}
      ${row("Order type", body.order_type)}
      ${row("Origin city", body.origin_city)}
      ${row("Origin country", body.origin_country)}
      ${row("Destination city", body.destination_city)}
      ${row("Destination country", body.destination_country)}
      ${row("Pickup date", body.pickup_date)}
      ${row("Delivery date", body.delivery_date)}
      ${row("Pallet length (cm)", body.length)}
      ${row("Pallet width (cm)", body.width)}
      ${row("Pallet height (cm)", body.height)}
      ${row("Products", products)}
      ${row("Comments/Notes", body.comments)}
    </table>
    <p style="color:#666;margin-top:14px;">Sent by Cloudflare Pages Function.</p>
  </div>`;
}
