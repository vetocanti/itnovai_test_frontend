document.addEventListener("DOMContentLoaded", function () {
  //Variables to store the cart, total amount of products, total pages and total amount of products in the cart
  let cart = [];
  let total = 0;
  let pages = 0;
  let total_amount = 0;
  let url = "https://itnovai-test-backend.onrender.com";
  //Function to render the products in the page
  function renderProducts(data) {
    total = data["total_amount"];
    pages = Math.ceil(total / data["limit"]);
    document.getElementById("products").innerHTML = data["records"]
      .map((product) => {
        return `
  <div class="card" style="width: 18rem;">
    <div class="card-body">
        <div class="discount-badge" style="position: absolute; top: 10px; right: 10px; background-color: red; color: white; padding: 5px; border-radius: 5px;">
        ${product.discount}%
      </div>
    <img src="${product.url_image}" class="card-img-top" alt="...">
      <h5 class="card-title">${product.name}</h5>
          <p class="card-text">Now: $ ${Number(
            product.price * (1 - product.discount / 100)
          ).toPrecision(4)}</p>
      <h6 class="card-subtitle mb-2 text-body-secondary"  style="text-decoration: line-through;">Before: $ ${
        product.price
      }</h6>
      <button  type="button" class="btn btn-success" data-id="${
        product.id
      }" style="margin:auto">Add</button>
    </div>
  </div>
            `;
      })
      .join("");
  }

  // Function to render the paginator
  function renderPaginator() {
    const paginator = document.getElementById("paginator");
    const afterButton = document.getElementById("after");
    paginator.innerHTML = ""; // Clear existing paginator items
    for (let page = 1; page <= pages; page++) {
      const pageItem = document.createElement("li");
      pageItem.id = `page-${page}`;
      pageItem.classList.add("page-item");
      pageItem.innerHTML = `<a class="page-link" href="#">${page}</a>`;
      paginator.appendChild(pageItem); // Append directly
    }
    paginator.appendChild(afterButton); // Ensure 'afterButton' is the last element
  }
  // Function to fetch the products from the API
  function fetchProducts(page = 0, limit = 10) {
    fetch(`${url}/products/?page=${page}&limit=${limit}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        renderProducts(data);
        renderPaginator();
      })
      .catch((error) => {
        console.error(error);
      });
  }
  // Function to fetch the products by category
  function fetchProductsByCategory(categoryId, page, limit) {
    if (categoryId == 0) {
      fetchProducts(page, limit);
      return;
    }
    fetch(`${url}/products_category/${categoryId}?page=${page}&limit=${limit}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        renderProducts(data);
        renderPaginator();
      })
      .catch((error) => {
        console.error(error);
      });
  }
  // Function to fetch the categories from the API
  function fetchCategory() {
    fetch(`${url}/categories/`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        renderCategories(data);
      });
  }
  // Function to fetch the products by name
  function fetchProductByName(name) {
    fetch(`${url}/products_name/${name}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        renderProducts(data);
        renderPaginator();
      });
  }
  // Function to render the categories in the page
  function renderCategories(data) {
    const selectCategory = document.getElementById("select-category");
    if (!selectCategory) {
      console.error("selectCategory element not found");
      return;
    }
    for (const element of data) {
      const category = element;
      const categoryItem = document.createElement("option");
      categoryItem.value = category.id;
      categoryItem.textContent = category.name;
      selectCategory.appendChild(categoryItem);
    }
  }
  // Initial fetch to load products

  fetchProducts();
  fetchCategory();

  //Event listener for paginator items
  document.getElementById("paginator").addEventListener("click", async (e) => {
    if (e.target.tagName === "A") {
      const page = e.target.textContent;
      const limit = document.getElementById("select-limit").value;
      fetchProducts(page, limit);
    }
  });

  // Event listener that add products in the cart and update the total amount
  document.getElementById("products").addEventListener("click", async (e) => {
    if (e.target.tagName === "BUTTON") {
      const productId = e.target.getAttribute("data-id");
      await fetch(`${url}/products_id/${productId}`)
        .then((response) => response.json())
        .then((product) => {
          let quantity = 1;
          let isRepeat = false;
          total_amount =
            total_amount +
            product.price * (1 - product.discount / 100).toPrecision(4);

          cart.forEach((product) => {
            if (product.id == productId) {
              quantity = quantity + 1;
              isRepeat = true;
              product.quantity = quantity;
            }
          });
          if (!isRepeat) {
            let newProduct = { ...product, quantity: quantity };
            cart.push(newProduct);
          }

          console.log(cart);
        })
        .catch((error) => {
          console.error(error);
        });
      document.getElementById("cart-items").innerHTML = "";
      document.getElementById("cart-items").innerHTML = cart
        .map((product) => {
          return `
<li class="list-group-item"><span style="font-weight: 600">${
            product.quantity
          }</span> ${product.name} <span> $ ${(
            product.quantity *
            product.price *
            (1 - product.discount / 100)
          ).toPrecision(4)} </span>  </li>
                `;
        })
        .join("");
    }
    console.log(total_amount);
    document.getElementById("cart-total").innerHTML = `
                  <li class="list-group-item">
                <span style="font-weight: 600">Total: $${total_amount.toPrecision(
                  4
                )}</span>
              </li>`;
  });
  // Event listener for the search button and fetch the products with the new search
  debugger;
  document
    .getElementById("search-button")
    .addEventListener("click", async () => {
      const search = document.getElementById("search-input").value;
      fetchProductByName(search);
    });
  // Event listeners for the select limit and fetch the products with the new limit
  document
    .getElementById("select-limit")
    .addEventListener("change", async (e) => {
      const limit = e.target.value;
      const page = 1; // Reset to the first page whenever limit changes
      fetchProducts(page, limit);
    });
  // Event listener for the select category and fetch the products with the new category
  document
    .getElementById("select-category")
    .addEventListener("change", async (e) => {
      const categoryId = e.target.value;
      const page = 1;
      const limit = document.getElementById("select-limit").value;
      fetchProductsByCategory(categoryId, page, limit);
    });

  // Event listeners for the cart modal
  document
    .getElementById("cart-button")
    .addEventListener("click", async (e) => {
      document.getElementById("cart-modal").style.display = "block";
    });
  // Event listener for the close cart button inside the modal
  document.getElementById("close-cart").addEventListener("click", async () => {
    document.getElementById("cart-modal").style.display = "none";
  });
  // Event listener for the pay cart button inside the modal
  document.getElementById("pay-cart").addEventListener("click", async () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      document.getElementById("cart-modal").style.display = "none";
    } else {
      alert("Payment successful");
      cart = [];
      total_amount = 0;
      document.getElementById("cart-items").innerHTML = "";
      document.getElementById("cart-total").innerHTML = "";
      document.getElementById("cart-modal").style.display = "none";
      window.location.reload();
    }
  });
});
