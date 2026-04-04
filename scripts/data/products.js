(function () {
  const app = (window.WarehouseApp = window.WarehouseApp || {});

  app.featuredProducts = [
    {
      id: "patek-philippe",
      name: "Patek Philippe",
      category: "Clock",
      art: "heritage-clock",
      price: "$12.4K",
      compareAt: "$13.2K",
      unitsRemaining: "22 units remaining",
      stockLabel: "In stock",
      stockTone: "info"
    },
    {
      id: "audemars-piguet",
      name: "Audemars Piguet",
      category: "Clock",
      art: "midnight-watch",
      price: "$14.8K",
      compareAt: "$15.6K",
      unitsRemaining: "30 units remaining",
      stockLabel: "Low stock",
      stockTone: "danger"
    },
    {
      id: "vacheron-constantin",
      name: "Vacheron Constantin",
      category: "Clock",
      art: "copper-watch",
      price: "$18.2K",
      compareAt: "$19.4K",
      unitsRemaining: "17 units remaining",
      stockLabel: "Healthy",
      stockTone: "neutral"
    }
  ];

  app.inventoryBatches = [
    {
      id: "batch-01",
      name: "Patek Philippe",
      subtitle: "Product management",
      category: "Clock",
      art: "heritage-clock",
      stockLabel: "In stock",
      stockTone: "info",
      updatedAt: "Oct 24, 2025"
    },
    {
      id: "batch-02",
      name: "Audemars Piguet",
      subtitle: "Product management",
      category: "Clock",
      art: "midnight-watch",
      stockLabel: "Low stock",
      stockTone: "danger",
      updatedAt: "Nov 25, 2025"
    },
    {
      id: "batch-03",
      name: "Vacheron Constantin",
      subtitle: "Product management",
      category: "Clock",
      art: "copper-watch",
      stockLabel: "Healthy",
      stockTone: "neutral",
      updatedAt: "Dec 03, 2025"
    },
    {
      id: "batch-04",
      name: "Jaeger-LeCoultre",
      subtitle: "Limited release",
      category: "Clock",
      art: "heritage-clock",
      stockLabel: "In stock",
      stockTone: "info",
      updatedAt: "Dec 12, 2025"
    },
    {
      id: "batch-05",
      name: "Cartier Santos",
      subtitle: "Luxury essentials",
      category: "Clock",
      art: "copper-watch",
      stockLabel: "Healthy",
      stockTone: "neutral",
      updatedAt: "Jan 07, 2026"
    },
    {
      id: "batch-06",
      name: "Rolex Oyster",
      subtitle: "Warehouse reserve",
      category: "Clock",
      art: "midnight-watch",
      stockLabel: "Low stock",
      stockTone: "danger",
      updatedAt: "Jan 19, 2026"
    }
  ];
})();
