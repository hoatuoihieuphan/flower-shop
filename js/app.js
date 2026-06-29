
async function loadComponent(id, file) {

    const element = document.getElementById(id);

    if (!element) {
        console.warn(`Không tìm thấy phần tử #${id}`);
        return;
    }

    try {

        const response = await fetch(file);

        if (!response.ok) {
            throw new Error(`Không thể load ${file}`);
        }

        const html = await response.text();

        element.innerHTML = html;

    } catch (err) {

        console.error(err);

    }
}

window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".navbar-wrap");

    if (window.scrollY > 50) {
        navbar.classList.add("sticky");
        document.body.classList.add("sticky-active");
    } else {
        navbar.classList.remove("sticky");
        document.body.classList.remove("sticky-active");
    }
});

let products = [];
let originalProducts = [];
let currentPage = 1;
const perPage = 20;
const weights = {
    danhmuc: 5,
    chu_de: 4,
    thiet_ke: 3,
    hoa_tuoi: 3,
    loai: 2
};
function hasCommonValue(arr1, arr2) {

    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;

    return arr1.some(a =>
        arr2.some(b =>
            normalizeText(a) === normalizeText(b)
        )
    );

}
function getMatchCount(arr1, arr2) {

    if (!Array.isArray(arr1) || !Array.isArray(arr2))
        return 0;

    const set2 = new Set(arr2.map(normalizeText));

    return arr1.filter(item =>
        set2.has(normalizeText(item))
    ).length;

}
function getRelatedProducts(products, product, limit = 4) {

    return products

        .filter(item => item.id !== product.id)

        .map(item => {

            let score = 0;

            for (const field in weights) {

                score +=
                    getMatchCount(item[field], product[field]) *
                    weights[field];

            }

            return {
                ...item,
                score
            };

        })

        .filter(item => item.score > 0)

        .sort((a, b) => {

            // Điểm liên quan
            if (b.score !== a.score)
                return b.score - a.score;

            // Bán chạy
            if (b.numsold !== a.numsold)
                return b.numsold - a.numsold;

            // Random
            return Math.random() - 0.5;

        })

        .slice(0, limit);

}
async function loadProductDetail() {

    const container = document.getElementById("product-detail");

    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));

    const response = await fetch("data/flowers.json");
    const data = await response.json();

    const product = data.products.find(p => p.id === id);

    if (!product) {
        container.innerHTML = "<h2>Không tìm thấy sản phẩm.</h2>";
        return;
    }

    // sản phẩm liên quan
    const similarItems = getRelatedProducts(data.products, product);

    container.innerHTML = `
    <div class="container py-4">

        <div class="row">

            <!-- LEFT -->
            <div class="col-lg-6">

                <div class="border rounded-3 p-2 bg-white text-center">

                    <img src="${product.image}"
                        class="img-fluid"
                        style="max-height:450px;object-fit:contain;">

                </div>

            </div>

        <!-- RIGHT -->
        <div class="col-lg-6">

            <div class="bg-white border rounded-3 p-4">

                <h2 class="fw-bold mb-3">
                    ${product.name}
                </h2>

                <div class="mb-3">
                    <span class="h4 text-danger fw-bold">
                        ${product.price.toLocaleString("vi-VN")} VNĐ
                    </span>
                </div>

                <hr>

                <table class="table">

                    <tr>
                        <th>Danh mục</th>
                        <td>${product.danhmuc}</td>
                    </tr>

                    <tr>
                        <th>Hoa tươi</th>
                        <td>${product.hoa_tuoi}</td>
                    </tr>

                    <tr>
                        <th>Thiết kế</th>
                        <td>${product.thiet_ke || "Đang cập nhật"}</td>
                    </tr>

                    <tr>
                        <th>Đã bán</th>
                        <td>${product.numsold}</td>
                    </tr>

                </table>

                <hr>

                <h6 class="fw-bold">🏪 Mua tại cửa hàng</h6>

                <div class="mb-2">
                    📍 Hoa Tươi Hiếu Phan, Phường An Phú, TP.HCM
                    <a href="https://maps.app.goo.gl/NAfjMLhGhckMgjkW6"
                       target="_blank">
                       Bản đồ
                    </a>
                </div>

                <div class="d-flex gap-2">

                    <a href="https://www.facebook.com/Hoatuoitranflower"
                       class="btn btn-primary btn-sm"
                       target="_blank">
                       Facebook
                    </a>

                    <a href="https://zalo.me/0972378857"
                       class="btn btn-info btn-sm text-white"
                       target="_blank">
                       Zalo
                    </a>

                </div>

            </div>

        </div>

    </div>

</div>

<div class="container py-4">

    <div class="bg-white border rounded-3 p-3">

        <h5 class="fw-bold mb-3">
            Sản phẩm liên quan
        </h5>

        <div class="row g-3">

            ${similarItems.map(item=>`

            <div class="col-md-3 col-sm-6">

                <div class="card h-100">

                    <a href="detail.html?id=${item.id}">
                        <img src="${item.image}"
                             class="card-img-top"
                             style="height:180px;object-fit:cover;">
                    </a>

                    <div class="card-body text-center">

                        <a href="detail.html?id=${item.id}"
                           class="text-dark text-decoration-none">

                            ${item.name}

                        </a>

                        <div class="text-danger fw-bold mt-2">

                            ${item.price.toLocaleString("vi-VN")} VNĐ

                        </div>

                    </div>

                </div>

            </div>

            `).join("")}

        </div>

    </div>

</div>
`;

}
function renderProducts(){

    const productList = document.getElementById("product-list");
    
    if (!productList) return;
    
    let html = "";

    const start = (currentPage - 1) * perPage;

    const end = start + perPage;


    const currentProducts = products.slice(start,end);



    currentProducts.forEach(item=>{


        const price = item.price.toLocaleString("vi-VN");


        html += `
        <div class="col">

            <div class="card border-0 shadow-none p-0">

                <a class="text-center text-decoration-none text-dark" href="detail.html?id=${item.id}">
                    <img class="card-img-top w-75 mx-auto"
                    src="${item.image}">
                </a>


                <div class="card-body text-center p-2">

                    <h6>
                        ${item.name}
                    </h6>


                    <p class="text-danger fw-bold">
                        ${price} VNĐ
                    </p>

                </div>

            </div>

        </div>
        `;


    });


    productList.innerHTML = html;

}
function renderPagination(){

    const pagination = document.getElementById("pagination");

    if (!pagination) return;

    const totalPages = Math.ceil(products.length / perPage);

    let html = "";

    const range = 2;


    // Previous
    html += `
    <li class="page-item ${currentPage == 1 ? 'disabled' : ''}">
        <button class="page-link" onclick="changePage(${currentPage - 1})">
            &laquo;
        </button>
    </li>
    `;


    // Tính khoảng trang
    let start = Math.max(1, currentPage - range);
    let end = Math.min(totalPages, currentPage + range);



    // Trang đầu
    if(start > 1){

        html += `
        <li class="page-item">
            <button class="page-link" onclick="changePage(1)">
                1
            </button>
        </li>
        `;


        if(start > 2){

            html += `
            <li class="page-item disabled">
                <span class="page-link">...</span>
            </li>
            `;

        }

    }



    // Các trang giữa
    for(let i = start; i <= end; i++){

        html += `
        <li class="page-item ${currentPage == i ? 'active' : ''}">
            <button class="page-link"
            onclick="changePage(${i})">
                ${i}
            </button>
        </li>
        `;

    }



    // Trang cuối

    if(end < totalPages){

        if(end < totalPages - 1){

            html += `
            <li class="page-item disabled">
                <span class="page-link">...</span>
            </li>
            `;

        }


        html += `
        <li class="page-item">
            <button class="page-link"
            onclick="changePage(${totalPages})">
                ${totalPages}
            </button>
        </li>
        `;

    }



    // Next

    html += `
    <li class="page-item ${currentPage == totalPages ? 'disabled' : ''}">
        <button class="page-link"
        onclick="changePage(${currentPage + 1})">
            &raquo;
        </button>
    </li>
    `;


    pagination.innerHTML = html;

}
function changePage(page){

    const totalPages = Math.ceil(products.length / perPage);


    if(page < 1 || page > totalPages)
        return;


    currentPage = page;


    renderProducts();

    renderPagination();


    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

}
function normalizeText(str) {
    return (str || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
        .trim();
}
function sortProducts(type) {

    switch (type) {

        case "":
            // Trở về thứ tự mặc định
            products = [...originalProducts];
            break;

        case "price-asc":
            products.sort((a, b) => a.price - b.price);
            break;

        case "price-desc":
            products.sort((a, b) => b.price - a.price);
            break;

        case "name-asc":
            products.sort((a, b) => a.name.localeCompare(b.name, "vi"));
            break;

        case "name-desc":
            products.sort((a, b) => b.name.localeCompare(a.name, "vi"));
            break;

        case "sold-desc":
            products.sort((a, b) => b.numsold - a.numsold);
            break;

        case "newest":
            // Nếu id tăng theo thời gian tạo
            products.sort((a, b) => b.id - a.id);
            break;
    }

    currentPage = 1;

    renderProducts();
    renderPagination();
}
function containsKeyword(arr, keyword) {

    return (arr || []).some(item =>
        normalizeText(item).includes(keyword)
    );

}
async function loadProducts() {

    try {

        const response = await fetch("data/flowers.json");

        const data = await response.json();

        products = data.products;
        originalProducts = [...products];

        const params = new URLSearchParams(window.location.search);

        const title = params.get("title");

        const name = params.get("name");

        if (title && !name) {

            switch (title) {

            case "Hoa Tang Lễ":
                products = products.filter(p => p.danhmuc.includes(title));
                originalProducts = [...products];

                break;

            }
        }

        if (title && name) {

            switch (title) {

            case "Hoa sinh nhật":
                products = products.filter(p => p.loai.includes(name));
                originalProducts = [...products];

                break;

            case "Hoa khai trương":
                products = products.filter(p => p.loai.includes(name));
                originalProducts = [...products];

                break;

            case "Lan hồ điệp":
                products = products.filter(p => p.loai.includes(name));
                originalProducts = [...products];

                break;

            case "Hoa tang lễ":
                products = products.filter(p => p.danhmuc.includes(title));
                originalProducts = [...products];

                break;

            case "Chủ đề":
                products = products.filter(p => p.chu_de.includes(name));
                originalProducts = [...products];

                break;

            case "Thiết kế":
                products = products.filter(p => p.thiet_ke.includes(name));
                originalProducts = [...products];

                break;
            case "Hoa tươi":
                products = products.filter(p => p.hoa_tuoi.includes(name))
                originalProducts = [...products];

                break;
            }
        }

        const keyword = params.get("search");

        if (keyword) {

            const search = normalizeText(keyword);

            products = products.filter(product =>

                normalizeText(product.name).includes(search) ||

                containsKeyword(product.danhmuc, search) ||

                containsKeyword(product.hoa_tuoi, search) ||

                containsKeyword(product.thiet_ke, search) ||

                containsKeyword(product.chu_de, search) ||

                containsKeyword(product.loai, search)

            );

            originalProducts = [...products];

        }
        renderProducts();

        renderPagination();

    } catch(err) {
        console.log(err);

    }

}
async function loadNavbarMenu() {

    const response = await fetch("data/navbar.json");
    const data = await response.json();

    data.forEach(group => {

        const menuId = group.group + "-menu";
        const menuEl = document.getElementById(menuId);
        if (group.group === "hoa-tang-le") {

            const link = document.getElementById("hoa-tang-le-link");

            link.href = `index.html?title=${encodeURIComponent(group.title)}`;

        }

        if (!menuEl) return;

        
        menuEl.innerHTML = group.items.map(item => `
            <li>
                <a class="dropdown-item" href="index.html?title=${encodeURIComponent(group.title)}&name=${encodeURIComponent(item.name)}">
                    ${item.name}
                </a>
            </li>
        `).join("");

    });

}
async function init() {

    await loadComponent("header", "components/header.html");

    await loadComponent("navbar", "components/navbar.html");
    
    await loadNavbarMenu();

    // Nếu là trang chủ
    if(document.getElementById("content")){
        await loadComponent("content","components/content.html");
        await loadProducts();
    }

    // Nếu là trang chi tiết
    if(document.getElementById("product-detail")){
        await loadProductDetail();
    };

    await loadComponent("footer", "components/footer.html");

    await loadProducts();
    
    const sortSelect = document.getElementById("sort-select");

    if(sortSelect){

        sortSelect.addEventListener("change",function(){

            sortProducts(this.value);

        });

    }
}

init();

