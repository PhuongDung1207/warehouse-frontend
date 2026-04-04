(function () {
  const app = (window.SupplierDirectory = window.SupplierDirectory || {});

  app.suppliers = [
    {
      organization: "Nexus Logistics",
      segment: "Global Freight & Distribution",
      contact: "Sarah Jenkins",
      role: "Key Account Manager",
      status: "In Transit",
      nextDelivery: "Oct 24, 2023",
      eta: "Arriving 08:00 AM",
      initials: "NX",
      flagged: false
    },
    {
      organization: "Apex Freight",
      segment: "Premium Air Transport",
      contact: "Marcus Thorne",
      role: "Dispatch Coordinator",
      status: "Pending",
      nextDelivery: "Oct 26, 2023",
      eta: "Loading 02:15 PM",
      initials: "AF",
      flagged: false
    },
    {
      organization: "Swift Valley Farm",
      segment: "Organic Raw Materials",
      contact: "Elena Rodriguez",
      role: "Operations Director",
      status: "Delayed",
      nextDelivery: "Oct 22, 2023",
      eta: "Needs review",
      initials: "SV",
      flagged: true
    },
    {
      organization: "Continental Spices",
      segment: "Imported Seasonings",
      contact: "David Chen",
      role: "Import Specialist",
      status: "Processing",
      nextDelivery: "Oct 29, 2023",
      eta: "41 crates",
      initials: "CS",
      flagged: false
    },
    {
      organization: "Polar Fresh Chain",
      segment: "Cold-Chain Distribution",
      contact: "Olivia Hart",
      role: "Cold-Storage Supervisor",
      status: "In Transit",
      nextDelivery: "Oct 28, 2023",
      eta: "Dock 04 reserved",
      initials: "PF",
      flagged: false
    },
    {
      organization: "Meridian Packaging",
      segment: "Custom Box Manufacturing",
      contact: "Liam Foster",
      role: "Procurement Lead",
      status: "Pending",
      nextDelivery: "Oct 31, 2023",
      eta: "Awaiting label proof",
      initials: "MP",
      flagged: false
    },
    {
      organization: "Harborline Produce",
      segment: "Regional Fresh Goods",
      contact: "Priya Nair",
      role: "Vendor Success Manager",
      status: "Delayed",
      nextDelivery: "Oct 23, 2023",
      eta: "Customs follow-up",
      initials: "HP",
      flagged: true
    },
    {
      organization: "Atlas Industrial",
      segment: "Heavy Equipment Supply",
      contact: "Benjamin Cole",
      role: "Contract Manager",
      status: "Processing",
      nextDelivery: "Nov 02, 2023",
      eta: "Compliance check",
      initials: "AI",
      flagged: false
    },
    {
      organization: "GreenMile Organics",
      segment: "Sustainable Produce",
      contact: "Sofia Nguyen",
      role: "Regional Planner",
      status: "In Transit",
      nextDelivery: "Nov 04, 2023",
      eta: "ETA 06:45 AM",
      initials: "GO",
      flagged: false
    },
    {
      organization: "NorthPeak Medical",
      segment: "Sterile Supply Network",
      contact: "Daniel Brooks",
      role: "Supply Specialist",
      status: "Pending",
      nextDelivery: "Nov 06, 2023",
      eta: "Awaiting QA seal",
      initials: "NM",
      flagged: false
    },
    {
      organization: "BlueRiver Dairy",
      segment: "Temperature-Controlled Goods",
      contact: "Grace Kim",
      role: "Fulfillment Partner",
      status: "Delayed",
      nextDelivery: "Nov 01, 2023",
      eta: "Temperature audit",
      initials: "BD",
      flagged: true
    },
    {
      organization: "TerraNova Metals",
      segment: "Industrial Components",
      contact: "Ahmed Rafiq",
      role: "Transport Coordinator",
      status: "Delayed",
      nextDelivery: "Nov 08, 2023",
      eta: "Vehicle reassigned",
      initials: "TM",
      flagged: true
    }
  ];
})();
