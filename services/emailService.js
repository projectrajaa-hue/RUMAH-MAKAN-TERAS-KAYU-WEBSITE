const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password',
  },
});

// Format currency to IDR
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Generate invoice HTML
const generateInvoiceHTML = (order, menuNames = {}) => {
  const itemsHtml = Object.entries(order.items)
    .map(([menuId, quantity]) => {
      const menuName = menuNames[menuId] || `Menu #${menuId}`;
      const price = order.items[menuId + '_price'] || 0;
      const subtotal = price * quantity;
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #ddd;">${menuName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(price)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(subtotal)}</td>
        </tr>
      `;
    })
    .join('');

  // Determine payment status message
  let paymentStatusHTML = '';
  if (order.status === 'completed') {
    paymentStatusHTML = `
      <div class="payment-status" style="background-color: #d4edda; border: 1px solid #28a745;">
        <p style="color: #155724;"><strong>✅ Pesanan Selesai!</strong></p>
        <p style="margin-top: 8px; font-size: 11px; color: #155724;">Pesanan Anda telah selesai disiapkan dan siap diambil atau dikirim. Terima kasih telah memesan!</p>
      </div>
    `;
  } else if (order.status === 'confirmed') {
    paymentStatusHTML = `
      <div class="payment-status" style="background-color: #d4edda; border: 1px solid #28a745;">
        <p style="color: #155724;"><strong>✅ Pembayaran Dikonfirmasi!</strong></p>
        <p style="margin-top: 8px; font-size: 11px; color: #155724;">Pesanan Anda telah dikonfirmasi dan sedang kami proses. Pesanan akan siap dalam beberapa saat.</p>
      </div>
    `;
  } else {
    paymentStatusHTML = `
      <div class="payment-status">
        <p><strong>⏳ Status Pembayaran:</strong> Menunggu konfirmasi pembayaran</p>
        <p style="margin-top: 8px; font-size: 11px;">Pesanan Anda akan diproses setelah pembayaran dikonfirmasi oleh admin.</p>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #333;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #fff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          border-bottom: 3px solid #8B6D47;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .header h1 {
          color: #8B6D47;
          margin: 0;
          font-size: 28px;
        }
        .header p {
          color: #666;
          margin: 5px 0 0 0;
        }
        .invoice-number {
          color: #666;
          font-size: 14px;
          margin-top: 10px;
        }
        .section {
          margin: 30px 0;
        }
        .section-title {
          font-weight: bold;
          color: #8B6D47;
          font-size: 16px;
          margin-bottom: 10px;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 8px;
        }
        .customer-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .info-item {
          margin-bottom: 10px;
        }
        .info-label {
          font-weight: bold;
          color: #666;
          font-size: 12px;
        }
        .info-value {
          color: #333;
          margin-top: 3px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th {
          background-color: #f5f5f5;
          padding: 12px;
          text-align: left;
          font-weight: bold;
          border-bottom: 2px solid #ddd;
        }
        .total-row {
          background-color: #f9f9f9;
        }
        .total-row td {
          padding: 15px 12px;
          border-top: 2px solid #ddd;
          font-weight: bold;
          text-align: right;
        }
        .total-amount {
          color: #8B6D47;
          font-size: 18px;
        }
        .payment-status {
          background-color: #fff3cd;
          border: 1px solid #ffc107;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .payment-status p {
          margin: 0;
          color: #856404;
        }
        .footer {
          border-top: 1px solid #ddd;
          padding-top: 20px;
          margin-top: 30px;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        .footer p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Invoice Pesanan</h1>
          <p>Terima kasih telah memesan di Rumah Makan Kami</p>
          <div class="invoice-number">Invoice #${order.id} | ${new Date(order.createdAt).toLocaleDateString('id-ID')}</div>
        </div>

        <div class="section">
          <div class="section-title">Informasi Pemesan</div>
          <div class="customer-info">
            <div>
              <div class="info-item">
                <div class="info-label">Nama</div>
                <div class="info-value">${order.customerName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${order.customerEmail || '-'}</div>
              </div>
            </div>
            <div>
              <div class="info-item">
                <div class="info-label">Nomor Telepon</div>
                <div class="info-value">${order.customerPhone}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Status Pesanan</div>
                <div class="info-value" style="color: #ff9800; font-weight: bold;">
                  ${order.status.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Alamat Pengiriman</div>
          <div class="info-value">${order.customerAddress}</div>
          ${order.notes ? `
            <div class="info-item" style="margin-top: 10px;">
              <div class="info-label">Catatan Tambahan</div>
              <div class="info-value">${order.notes}</div>
            </div>
          ` : ''}
        </div>

        <div class="section">
          <div class="section-title">Detail Pesanan</div>
          <table>
            <thead>
              <tr>
                <th>Menu</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Harga</th>
                <th style="text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr class="total-row">
                <td colspan="3">Total Pesanan</td>
                <td class="total-amount">${formatCurrency(order.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        ${paymentStatusHTML}

        <div class="section">
          <div class="section-title">Langkah Berikutnya</div>
          ${order.status === 'completed' ? `
            <ol style="margin: 0; padding-left: 20px;">
              <li>Pesanan siap diambil atau dikirim</li>
              <li>Silahkan datang atau kami akan segera mengantar</li>
              <li>Terima kasih telah memesan di kami</li>
              <li>Kami tunggu pesanan Anda berikutnya!</li>
            </ol>
          ` : order.status === 'confirmed' ? `
            <ol style="margin: 0; padding-left: 20px;">
              <li>Pesanan sedang kami proses</li>
              <li>Kami akan menghubungi Anda jika ada pertanyaan</li>
              <li>Pesanan akan siap dalam waktu yang telah ditentukan</li>
              <li>Pesanan siap diambil atau dikirim sesuai pilihan Anda</li>
            </ol>
          ` : `
            <ol style="margin: 0; padding-left: 20px;">
              <li>Upload bukti pembayaran melalui aplikasi</li>
              <li>Tunggu konfirmasi dari admin (biasanya 1-2 jam)</li>
              <li>Pesanan akan diproses dan disiapkan</li>
              <li>Pesanan siap diambil atau dikirim</li>
            </ol>
          `}
        </div>

        <div class="footer">
          <p><strong>Rumah Makan Kami</strong></p>
          <p>Terima kasih telah mempercayai kami untuk pesanan Anda</p>
          <p>Jika ada pertanyaan, hubungi kami melalui WhatsApp atau telepon</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send invoice email
const sendInvoice = async (order, menuData = []) => {
  try {
    if (!order.customerEmail) {
      console.warn(`Order #${order.id} does not have a valid email address`);
      return false;
    }

    // Create menu names map
    const menuNames = {};
    if (Array.isArray(menuData)) {
      menuData.forEach((menu) => {
        menuNames[menu.id] = menu.name;
      });
    }

    const invoiceHTML = generateInvoiceHTML(order, menuNames);

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@rumahmakan.com',
      to: order.customerEmail,
      subject: `Invoice Pesanan #${order.id} - Rumah Makan Kami`,
      html: invoiceHTML,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Invoice email sent to ${order.customerEmail}:`, info.response);
    return true;
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return false;
  }
};

module.exports = {
  sendInvoice,
  transporter,
};
