(function () {
  const app = (window.WarehouseApp = window.WarehouseApp || {});

  app.navigationItems = [
    {
      label: "Dashboard",
      active: false,
      href: "/pages/dashboard/dashboard.html",
      icon: '<path d="M4 12.5 12 5l8 7.5M6.5 10.5V19h11v-8.5" />'
    },
    {
      label: "Stock In",
      active: false,
      href: "/pages/inventory/stock_in.html",
      icon: '<path d="M4 7.5h16M4 12h16M4 16.5h11M6 5v14" />'
    },
    {
      label: "Stock Out",
      active: false,
      href: "/pages/inventory/stock_out.html",
      icon: '<path d="M20 7.5H4M20 12H4M20 16.5H9M18 5v14" />'
    },
    {
      label: "Storage",
      active: false,
      href: "/pages/inventory/inventory.html",
      icon: '<path d="M5 8h14v11H5zM8 8V5h8v3" />'
    },
    {
      label: "Suppliers",
      active: false,
      href: "/pages/inventory/inventory.html",
      icon: '<path d="M6 9.5h12M8 6.5h8M9 13.5h6M5 4h14v16H5z" />'
    },
    {
      label: "Products",
      active: true,
      href: "/pages/inventory/inventory.html",
      icon: '<path d="M5 7h14v10H5zM9 11.5h6" />'
    },
    {
      label: "Categories",
      active: false,
      href: "/pages/inventory/inventory.html",
      icon: '<path d="M7 8.5h10M7 12h10M7 15.5h6M4.5 5h15v14h-15z" />'
    },
    {
      label: "Reports",
      active: false,
      href: "/pages/reports/reports.html",
      icon: '<path d="M6 5h12v14H6zM9 9h6M9 13h6" />'
    },
    {
      label: "Users",
      active: false,
      href: "/pages/settings/team.html",
      icon: '<path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-6 6a6 6 0 0 1 12 0" />'
    },
    {
      label: "Settings",
      active: false,
      href: "/pages/settings/team.html",
      icon:
        '<path d="M12 3v3M12 18v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M3 12h3M18 12h3M4.9 19.1 7 17M17 7l2.1-2.1" /><circle cx="12" cy="12" r="3.5" />'
    }
  ];

  app.currentUser = {
    initial: "N",
    name: "Nguyen Van A",
    role: "Admin"
  };
})();
