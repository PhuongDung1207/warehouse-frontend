const categories = [
  {
    code: "ELEC",
    name: "Electronics",
    quantity: "1,420 units",
    skus: "24 SKUs",
    value: "$450,200",
    location: "Tech Room A",
    status: "Active",
    manager: "Phan Thi Phuong Dung",
    updatedAgo: "2 hours ago"
  },
  {
    code: "FURN",
    name: "Furniture",
    quantity: "860 units",
    skus: "12 SKUs",
    value: "$318,450",
    location: "Storage Hall B",
    status: "Active",
    manager: "Nguyen Minh Quan",
    updatedAgo: "3 hours ago"
  },
  {
    code: "MED",
    name: "Medical Supplies",
    quantity: "2,180 units",
    skus: "37 SKUs",
    value: "$275,980",
    location: "Cold Room C",
    status: "Active",
    manager: "Le Thi Ha",
    updatedAgo: "5 hours ago"
  },
  {
    code: "PACK",
    name: "Packaging",
    quantity: "3,240 units",
    skus: "19 SKUs",
    value: "$126,400",
    location: "Packing Zone",
    status: "Active",
    manager: "Tran Van Khoa",
    updatedAgo: "8 hours ago"
  },
  {
    code: "SAFE",
    name: "Safety Gear",
    quantity: "640 units",
    skus: "9 SKUs",
    value: "$96,870",
    location: "Rack D-12",
    status: "Active",
    manager: "Vo Anh Thu",
    updatedAgo: "1 day ago"
  }
];

const pageSize = 5;
let currentPage = 1;
let filteredCategories = [...categories];

const searchInput = document.querySelector("#search-input");
const tableBody = document.querySelector("#category-table-body");
const pagination = document.querySelector("#pagination");
const resultsSummary = document.querySelector("#results-summary");
const auditList = document.querySelector("#audit-list");
const activeCount = document.querySelector("#active-count");
const totalCount = document.querySelector("#total-count");
const lockedCount = document.querySelector("#locked-count");
const openModalButton = document.querySelector("#open-category-modal");
const closeModalButton = document.querySelector("#close-category-modal");
const modalBackdrop = document.querySelector("#category-modal-backdrop");
const categoryForm = document.querySelector("#category-form");
const categoryCodeInput = document.querySelector("#category-code");
const categoryNameInput = document.querySelector("#category-name");
const formFeedback = document.querySelector("#form-feedback");

function formatCount(value) {
  return String(value).padStart(2, "0");
}

function getVisibleRows() {
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  return filteredCategories.slice(start, end);
}

function renderStats() {
  const active = categories.filter((category) => category.status === "Active").length;
  const locked = categories.filter((category) => category.status === "Locked").length;

  activeCount.textContent = formatCount(active);
  totalCount.textContent = formatCount(categories.length);
  lockedCount.textContent = formatCount(locked);
}

function renderTable() {
  const rows = getVisibleRows();

  if (rows.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6">No categories match your search.</td>
      </tr>
    `;
    resultsSummary.textContent = "Showing 0 of 0 categories";
    pagination.innerHTML = "";
    return;
  }

  tableBody.innerHTML = rows
    .map(
      (category) => `
        <tr>
          <td>
            <span class="category-name">${category.name}</span>
          </td>
          <td>
            <span class="quantity-main">${category.quantity}</span>
            <span class="quantity-sub">${category.skus}</span>
          </td>
          <td>
            <span class="value-main">${category.value}</span>
          </td>
          <td>
            <span class="location-pill">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" />
                <circle cx="12" cy="10" r="2" />
              </svg>
              ${category.location}
            </span>
          </td>
          <td>
            <span class="status-badge ${category.status === "Locked" ? "status-locked" : "status-active"}">
              ${category.status}
            </span>
          </td>
          <td>
            <button class="row-action" type="button">View</button>
          </td>
        </tr>
      `
    )
    .join("");

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, filteredCategories.length);
  resultsSummary.textContent = `Showing ${start} to ${end} of ${filteredCategories.length} categories`;

  renderPagination();
}

function renderPagination() {
  const totalPages = Math.ceil(filteredCategories.length / pageSize);

  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  pagination.innerHTML = Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    return `
      <button class="page-btn ${page === currentPage ? "active" : ""}" type="button" data-page="${page}">
        ${page}
      </button>
    `;
  }).join("");

  pagination.querySelectorAll(".page-btn").forEach((button) => {
    button.addEventListener("click", () => {
      currentPage = Number(button.dataset.page);
      renderTable();
    });
  });
}

function renderAudit() {
  auditList.innerHTML = filteredCategories
    .slice(0, 4)
    .map(
      (category) => `
        <article class="audit-card">
          <strong>${category.name} stock updated</strong>
          <span class="activity-meta">
            Managed by ${category.manager} | ${category.updatedAgo}
          </span>
        </article>
      `
    )
    .join("");
}

function filterCategories() {
  const keyword = searchInput.value.trim().toLowerCase();

  filteredCategories = categories.filter((category) => {
    return [category.code, category.name, category.location, category.status]
      .join(" ")
      .toLowerCase()
      .includes(keyword);
  });

  currentPage = 1;
  renderTable();
  renderAudit();
}

function openCategoryModal() {
  modalBackdrop.classList.remove("hidden");
  document.body.classList.add("modal-open");
  formFeedback.textContent = "";
  window.setTimeout(() => categoryCodeInput.focus(), 30);
}

function closeCategoryModal() {
  modalBackdrop.classList.add("hidden");
  document.body.classList.remove("modal-open");
  categoryForm.reset();
  formFeedback.textContent = "";
}

function handleAddCategory(event) {
  event.preventDefault();

  const code = categoryCodeInput.value.trim().toUpperCase();
  const name = categoryNameInput.value.trim();

  if (!code || !name) {
    formFeedback.textContent = "Please enter both category code and category name.";
    return;
  }

  const hasDuplicateCode = categories.some((category) => category.code === code);
  const hasDuplicateName = categories.some(
    (category) => category.name.toLowerCase() === name.toLowerCase()
  );

  if (hasDuplicateCode || hasDuplicateName) {
    formFeedback.textContent = "This category code or name already exists.";
    return;
  }

  categories.unshift({
    code,
    name,
    quantity: "0 units",
    skus: `${code} code`,
    value: "$0",
    location: `${code} Zone`,
    status: "Active",
    manager: "Nguyen Van A",
    updatedAgo: "just now"
  });

  searchInput.value = "";
  filteredCategories = [...categories];
  currentPage = 1;
  renderStats();
  renderTable();
  renderAudit();
  closeCategoryModal();
}

searchInput.addEventListener("input", filterCategories);
openModalButton.addEventListener("click", openCategoryModal);
closeModalButton.addEventListener("click", closeCategoryModal);
categoryForm.addEventListener("submit", handleAddCategory);
modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) {
    closeCategoryModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modalBackdrop.classList.contains("hidden")) {
    closeCategoryModal();
  }
});

renderStats();
renderTable();
renderAudit();
