/* =========================================
   DATABASE.JS (Poori site ka data)
   ========================================= */

// 1. Categories ka Data (Pop-ups ke liye)
const allCategoryData = {
  "men-sheet": {
    title: "Men Footwear",
    items: [
      {
        name: "Casual Shoes",
        img: "images/sub-cat/subcat-casual.jpeg",
        url: "products.html?category=men-casual",
      },
      {
        name: "Sports Shoes",
        img: "images/sub-cat/subcat-sportsshoe.jpeg",
        url: "products.html?category=men-sports",
      },
    ],
  },
  "women-sheet": {
    title: "Women Footwear",
    items: [
      {
        name: "Sandals",
        img: "images/sub-cat/women-sandals.jpeg",
        url: "products.html?category=women-sandals",
      },
      {
        name: "Heels",
        img: "images/sub-cat/women-heels.jpeg",
        url: "products.html?category=women-heels",
      },
    ],
  },

  "boys-sheet": {
    title: "Boys Footwear",
    items: [
      {
        name: "sandals",
        img: "images/sub-cat/subcat-sandals.jpeg",
        url: "products.html?category=women-sandals",
      },
      {
        name: "formal",
        img: "images/sub-cat/subcat-formal.jpeg",
        url: "products.html?category=women-heels",
      },
    ],
  },
  "girl-sheet": {
    title: "Girls Footwear",
    items: [
      {
        name: "Sandals",
        img: "images/sub-cat/women-sandals.jpeg",
        url: "products.html?category=women-sandals",
      },
      {
        name: "Heels",
        img: "images/sub-cat/women-heels.jpeg",
        url: "products.html?category=women-heels",
      },
    ],
  },
};

// 2. Products ka Poora Database (Main)
const productsDatabase = {
  // Men
  "men-casual": {
    title: "Men's Casual Shoes",
    count: "2 Styles",
    products: [
      {
        id: "lib-01",
        brand: "Liberty",
        name: "Synthetic Upper Casual",
        price: "₹1,585.00",
        img: "images/plp-shoe-1.jpeg",
        moq: "10",
      },
      {
        id: "bata-02",
        brand: "Bata",
        name: "Daily Wear Loafers",
        price: "₹999.50",
        img: "images/plp-shoe-2.jpeg",
        moq: "12",
      },
    ],
  },
  "men-sports": {
    title: "Men's Sports Shoes",
    count: "1 Style",
    products: [
      {
        id: "puma-01",
        brand: "Puma",
        name: "Nitro Runner",
        price: "₹3,200.00",
        img: "images/cartimg-puma.jpg",
        moq: "5",
      },
    ],
  },

  // Women
  "women-sandals": {
    title: "Women's Sandals",
    count: "1 Style",
    products: [
      {
        id: "cat-01",
        brand: "Catwalk",
        name: "Golden Strap Sandals",
        price: "₹1,200.00",
        img: "images/sub-cat/women-sandals.jpeg",
        moq: "10",
      },
    ],
  },
  "women-heels": {
    title: "Women's Heels",
    count: "1 Style",
    products: [
      {
        id: "metro-01",
        brand: "Metro",
        name: "Red Stilettos",
        price: "₹2,500.00",
        img: "images/sub-cat/women-heels.jpeg",
        moq: "5",
      },
    ],
  },

  // Default (Agar category na mile)
  default: { title: "Products", count: "0 Styles", products: [] },
};
