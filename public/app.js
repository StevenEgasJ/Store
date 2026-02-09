const statusText = document.getElementById("status");
const form = document.getElementById("search-form");
const valueInput = document.getElementById("search-value");
const result = document.getElementById("search-result");

const formatMoney = (value) => value.toFixed(2);

const renderResult = (product, iva, totalWithIva, rate) => {
  const ratePercent = Math.round(rate * 100);
  result.innerHTML = `
    <article class="product single">
      <div>
        <h2>${product.nombre}</h2>
        <p class="price">Price: $${formatMoney(product.precio)}</p>
        <p class="meta">Category: ${product.categoria || "-"}</p>
        <p class="meta">Stock: ${product.stock ?? "-"}</p>
        <p class="meta">Discount: ${product.descuento ?? 0}</p>
      </div>
      <div class="actions">
        <div class="iva-card">
          <p class="iva">IVA (${ratePercent}%): $${formatMoney(iva)}</p>
          <p class="total">Total + IVA: $${formatMoney(totalWithIva)}</p>
        </div>
      </div>
    </article>
  `;
};

const clearResult = () => {
  result.innerHTML = "";
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusText.textContent = "Searching...";
  clearResult();

  try {
    const value = valueInput.value.trim();
    const idResponse = await fetch(`/api/products/${encodeURIComponent(value)}`);
    let payload = await idResponse.json();

    if (!idResponse.ok) {
      const nameResponse = await fetch(
        `/api/products/search?name=${encodeURIComponent(value)}`
      );
      payload = await nameResponse.json();

      if (!nameResponse.ok) {
        statusText.textContent = payload.error || "Product not found.";
        return;
      }
    }

    renderResult(payload.product, payload.iva, payload.totalWithIva, payload.rate);
    statusText.textContent = "Ready.";
  } catch (error) {
    console.error(error);
    statusText.textContent = "Server error.";
  }
});
