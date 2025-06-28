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
  <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.6; padding: 20px;">
    <h2 style="color: #1e40af;">Здраво ${name},</h2>

    <p>Твојата нарачка е успешно примена! 🎉</p>
    
    <p>⬇️ <strong>Резиме на нарачката:</strong></p>

    <ul style="list-style-type: disc; padding-left: 20px; margin-bottom: 20px;">
      ${productList}
    </ul>

    <p style="font-size: 18px; font-weight: bold; color: #111;">
      Вкупна сума: ${total} ден
    </p>

    <p>Ќе те контактираме наскоро за потврда и испорака.</p>

    <hr style="margin: 24px 0; border: none; border-top: 1px solid #ccc;" />

    <p style="color: #555;">
      Поздрав,<br />
      <strong>Тимот на Спортска Опрема</strong>
    </p>

    <p style="font-size: 12px; color: #999; margin-top: 20px;">
      Ова е автоматска порака – ве молиме не одговарајте.
    </p>
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
