import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY); // ✅ Must be in your .env file

export async function sendConfirmationEmail({ name, email, cart }) {
  const productList = cart
    .map(
      (item) =>
        `<li><strong>${item.name}</strong> – ${item.sizes
          .map((s) => `${s.size} (${s.quantity})`)
          .join(", ")}</li>`
    )
    .join("");

  const total = cart.reduce(
    (sum, item) =>
      sum + item.sizes.reduce((s, sz) => s + sz.quantity * item.price, 0),
    0
  );

  const html = `
    <div>
      <p>Здраво ${name},</p>
      <p>Твојата нарачка е успешно примена. Еве го резимето:</p>
      <ul>${productList}</ul>
      <p><strong>Вкупна сума:</strong> ${total} ден</p>
      <p>Ќе те контактираме наскоро за потврда и испорака.</p>
      <p>Тимот на Спортска Опрема</p>
      <p>-Ова е автоматска порака, ве молиме не одговарајте.</p>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM, // 
      to: email,
      subject: "Потврда за нарачка – Спортска Опрема",
      html,
    });

    return data;
  } catch (err) {
    console.error("Failed to send confirmation email:", err);
    throw err;
  }
}
