const form = document.getElementById("product-form");
const statusText = document.getElementById("status");
const totalValue = document.getElementById("total-value");
const ivaValue = document.getElementById("iva-value");

const collectProducts = () => {
  const products = [];
  for (let i = 1; i <= 5; i += 1) {
    const name = document.getElementById(`name-${i}`).value.trim();
    const price = Number.parseFloat(
      document.getElementById(`price-${i}`).value
    );
    products.push({ name, price });
  }
  return products;
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusText.textContent = "Calculating IVA...";

  try {
    const products = collectProducts();
    const response = await fetch("/api/iva", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ products }),
    });

    const payload = await response.json();
    if (!response.ok) {
      statusText.textContent = payload.error || "Error calculating IVA.";
      return;
    }

    totalValue.textContent = payload.total.toFixed(2);
    ivaValue.textContent = payload.iva.toFixed(2);
    statusText.textContent = "Done.";
  } catch (error) {
    console.error(error);
    statusText.textContent = "Server error.";
  }
});
