const statusText = document.getElementById("status");
const form = document.getElementById("search-form");
const nameInput = document.getElementById("search-name");
const result = document.getElementById("search-result");
const modal = document.getElementById("iva-modal");
const modalProduct = document.getElementById("modal-product");
const modalPrice = document.getElementById("modal-price");
const modalIva = document.getElementById("modal-iva");
const modalTotal = document.getElementById("modal-total");

const formatMoney = (value) => value.toFixed(2);

const renderResult = (product) => {
  result.innerHTML = `
    <article class="product single">
      <div>
        <h2>${product.name}</h2>
        <p class="price">Price: $${formatMoney(product.price)}</p>
      </div>
      <div class="actions">
        <button type="button" data-id="${product._id}">View IVA</button>
      </div>
    </article>
  `;
};

const openModal = () => {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
};

const closeModal = () => {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
};

modal.addEventListener("click", (event) => {
  if (event.target.dataset.close === "true") {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("open")) {
    closeModal();
  }
});

const clearResult = () => {
  result.innerHTML = "";
};

result.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) {
    return;
  }

  const productId = button.dataset.id;
  modalProduct.textContent = "Loading...";
  modalPrice.textContent = "-";
  modalIva.textContent = "-";
  modalTotal.textContent = "-";
  openModal();

  try {
    const response = await fetch(`/api/products/${productId}/iva`);
    const payload = await response.json();
    if (!response.ok) {
      modalProduct.textContent = payload.error || "Error calculating IVA.";
      return;
    }

    const ratePercent = Math.round(payload.rate * 100);
    modalProduct.textContent = `${payload.name} (IVA ${ratePercent}%)`;
    modalPrice.textContent = `$${formatMoney(payload.price)}`;
    modalIva.textContent = `$${formatMoney(payload.iva)}`;
    modalTotal.textContent = `$${formatMoney(payload.totalWithIva)}`;
  } catch (error) {
    console.error(error);
    modalProduct.textContent = "Server error.";
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusText.textContent = "Searching...";
  clearResult();

  try {
    const name = nameInput.value.trim();
    const response = await fetch(`/api/products/search?name=${encodeURIComponent(name)}`);
    const payload = await response.json();

    if (!response.ok) {
      statusText.textContent = payload.error || "Product not found.";
      return;
    }

    renderResult(payload.product);
    statusText.textContent = "Ready.";
  } catch (error) {
    console.error(error);
    statusText.textContent = "Server error.";
  }
});
