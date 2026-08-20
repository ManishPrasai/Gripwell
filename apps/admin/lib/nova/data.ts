/* ============================================================
   NOVA TYRES — Admin · sample data (ported from prototype data.js + data-ext.js)
   Loosely typed; wired to real APIs progressively.
   ============================================================ */

const stores = [
  { id: "spv", name: "Springvale", suburb: "Springvale", state: "VIC", status: "open", manager: "Daniel Mercer", mgrInit: "DM", mgrAv: "#076330", rating: 4.9, reviews: 842, today: 14, capacity: 88, bays: 6, staff: 9, phone: "03 9547 1100", revenue: 48200, opens: "7:00", closes: "18:00" },
  { id: "dnd", name: "Dandenong", suburb: "Dandenong", state: "VIC", status: "open", manager: "Sophie Kaur", mgrInit: "SK", mgrAv: "#2D6BE0", rating: 4.8, reviews: 511, today: 11, capacity: 72, bays: 5, staff: 7, phone: "03 9792 4420", revenue: 39100, opens: "7:30", closes: "17:30" },
  { id: "bay", name: "Bayswater", suburb: "Bayswater", state: "VIC", status: "open", manager: "Raj Thakur", mgrInit: "RT", mgrAv: "#0E9F57", rating: 4.9, reviews: 388, today: 9, capacity: 64, bays: 4, staff: 6, phone: "03 9729 8810", revenue: 31500, opens: "7:30", closes: "17:30" },
  { id: "alp", name: "Melbourne (Alphington)", suburb: "Alphington", state: "VIC", status: "open", manager: "Lauren Nguyen", mgrInit: "LN", mgrAv: "#E08600", rating: 4.7, reviews: 276, today: 8, capacity: 55, bays: 4, staff: 6, phone: "03 9482 0033", revenue: 27800, opens: "8:00", closes: "17:00" },
  { id: "sun", name: "Sunshine", suburb: "Sunshine", state: "VIC", status: "closed", manager: "Marco Vella", mgrInit: "MV", mgrAv: "#E5484D", rating: 4.8, reviews: 203, today: 0, capacity: 0, bays: 3, staff: 5, phone: "03 9311 6677", revenue: 19400, opens: "8:00", closes: "16:30" },
  { id: "sef", name: "Sefton (Sydney)", suburb: "Sefton", state: "NSW", status: "open", manager: "Priya Sharma", mgrInit: "PS", mgrAv: "#8B5CF6", rating: 4.9, reviews: 164, today: 7, capacity: 61, bays: 4, staff: 6, phone: "02 9644 2200", revenue: 24600, opens: "7:30", closes: "17:30" },
];

const staff = [
  { id: 1, name: "Daniel Mercer", role: "Store Manager", store: "Springvale", status: "online", email: "daniel.m@novatyres.au", init: "DM", av: "#076330", phone: "0412 884 220", since: "Mar 2019" },
  { id: 2, name: "Sophie Kaur", role: "Store Manager", store: "Dandenong", status: "online", email: "sophie.k@novatyres.au", init: "SK", av: "#2D6BE0", phone: "0413 552 109", since: "Aug 2020" },
  { id: 3, name: "Raj Thakur", role: "Store Manager", store: "Bayswater", status: "offline", email: "raj.t@novatyres.au", init: "RT", av: "#0E9F57", phone: "0414 220 781", since: "Jan 2021" },
  { id: 4, name: "Lauren Nguyen", role: "Store Manager", store: "Alphington", status: "online", email: "lauren.n@novatyres.au", init: "LN", av: "#E08600", phone: "0415 901 334", since: "Jun 2018" },
  { id: 5, name: "Marco Vella", role: "Store Manager", store: "Sunshine", status: "offline", email: "marco.v@novatyres.au", init: "MV", av: "#E5484D", phone: "0416 778 245", since: "Sep 2022" },
  { id: 6, name: "Priya Sharma", role: "Store Manager", store: "Sefton", status: "online", email: "priya.s@novatyres.au", init: "PS", av: "#8B5CF6", phone: "0417 330 668", since: "Feb 2023" },
  { id: 7, name: "Tom Baker", role: "Senior Mechanic", store: "Springvale", status: "online", email: "tom.b@novatyres.au", init: "TB", av: "#0EA5A5", phone: "0418 442 990", since: "May 2019" },
  { id: 8, name: "Aisha Rahman", role: "Mechanic", store: "Springvale", status: "online", email: "aisha.r@novatyres.au", init: "AR", av: "#D6336C", phone: "0419 117 552", since: "Nov 2021" },
  { id: 9, name: "Jack Whitfield", role: "Mechanic", store: "Dandenong", status: "offline", email: "jack.w@novatyres.au", init: "JW", av: "#7048E8", phone: "0420 663 118", since: "Jul 2022" },
  { id: 10, name: "Mia Costa", role: "Front Desk", store: "Bayswater", status: "online", email: "mia.c@novatyres.au", init: "MC", av: "#F76707", phone: "0421 884 003", since: "Mar 2023" },
  { id: 11, name: "Liam O'Brien", role: "Mechanic", store: "Sefton", status: "online", email: "liam.o@novatyres.au", init: "LO", av: "#2F9E44", phone: "0422 551 779", since: "Oct 2023" },
  { id: 12, name: "Grace Tan", role: "Front Desk", store: "Alphington", status: "offline", email: "grace.t@novatyres.au", init: "GT", av: "#1098AD", phone: "0423 220 994", since: "Apr 2024" },
];

const products = [
  { id: "p1", name: "Michelin Pilot Sport 5", cat: "Tyres", spec: "225/45R17 94Y", brand: "Michelin", price: 289, stock: 48, low: 12, status: "active", icon: "tyre" },
  { id: "p2", name: "Bridgestone Turanza 6", cat: "Tyres", spec: "205/55R16 91V", brand: "Bridgestone", price: 199, stock: 8, low: 12, status: "active", icon: "tyre" },
  { id: "p3", name: "Continental PremiumContact", cat: "Tyres", spec: "235/40R18 95Y", brand: "Continental", price: 265, stock: 31, low: 10, status: "active", icon: "tyre" },
  { id: "p4", name: "Pirelli P Zero", cat: "Tyres", spec: "245/40R19 98Y", brand: "Pirelli", price: 345, stock: 0, low: 8, status: "active", icon: "tyre" },
  { id: "p5", name: "Goodyear Eagle F1", cat: "Tyres", spec: "225/40R18 92Y", brand: "Goodyear", price: 279, stock: 22, low: 10, status: "active", icon: "tyre" },
  { id: "p6", name: "Dunlop SP Sport", cat: "Tyres", spec: "215/60R16 95H", brand: "Dunlop", price: 159, stock: 64, low: 15, status: "active", icon: "tyre" },
  { id: "p7", name: "Enkei RPF1 Alloy", cat: "Wheels", spec: "17x8 +35 5x114.3", brand: "Enkei", price: 420, stock: 16, low: 6, status: "active", icon: "wheel" },
  { id: "p8", name: "BBS CH-R Wheel", cat: "Wheels", spec: "18x8.5 +38", brand: "BBS", price: 690, stock: 4, low: 6, status: "active", icon: "wheel" },
  { id: "p9", name: "OZ Ultraleggera", cat: "Wheels", spec: "18x8 +40", brand: "OZ Racing", price: 540, stock: 9, low: 5, status: "draft", icon: "wheel" },
  { id: "p10", name: "Castrol EDGE 5W-30", cat: "Oils", spec: "5L Full Synthetic", brand: "Castrol", price: 62, stock: 120, low: 30, status: "active", icon: "oil" },
  { id: "p11", name: "Mobil 1 0W-40", cat: "Oils", spec: "5L Full Synthetic", brand: "Mobil", price: 78, stock: 18, low: 25, status: "active", icon: "oil" },
  { id: "p12", name: "Penrite 10 Tenths 10W-60", cat: "Oils", spec: "5L Racing", brand: "Penrite", price: 95, stock: 7, low: 20, status: "active", icon: "oil" },
  { id: "p13", name: "Bosch Oil Filter Kit", cat: "Parts", spec: "Universal fit", brand: "Bosch", price: 24, stock: 210, low: 40, status: "active", icon: "part" },
  { id: "p14", name: "Brembo Brake Pads", cat: "Parts", spec: "Front set", brand: "Brembo", price: 145, stock: 11, low: 15, status: "active", icon: "part" },
];

const bookings = [
  { ref: "NV-2841", customer: "James Whitlock", vehicle: "2021 Toyota RAV4", service: "Log Book Service", mech: "Tom Baker", mInit: "TB", mAv: "#0EA5A5", store: "Springvale", status: "pending", time: "Today · 9:00", price: 320 },
  { ref: "NV-2842", customer: "Olivia Bennett", vehicle: "2019 Mazda 3", service: "Free Pre-RWC Check", mech: "Aisha Rahman", mInit: "AR", mAv: "#D6336C", store: "Springvale", status: "pending", time: "Today · 10:30", price: 0 },
  { ref: "NV-2839", customer: "Mohammed Ali", vehicle: "2022 Ford Ranger", service: "Yearly Service", mech: "Tom Baker", mInit: "TB", mAv: "#0EA5A5", store: "Springvale", status: "progress", time: "Today · 8:15", price: 420 },
  { ref: "NV-2840", customer: "Chloe Davies", vehicle: "2020 VW Golf", service: "Brake Replacement", mech: "Jack Whitfield", mInit: "JW", mAv: "#7048E8", store: "Dandenong", status: "progress", time: "Today · 8:45", price: 540 },
  { ref: "NV-2835", customer: "Ethan Park", vehicle: "2018 Subaru WRX", service: "Ultimate Service", mech: "Raj Thakur", mInit: "RT", mAv: "#0E9F57", store: "Bayswater", status: "ready", time: "Today · 7:30", price: 680 },
  { ref: "NV-2836", customer: "Isabella Romano", vehicle: "2023 Tesla Model 3", service: "Tyre Fit + Balance", mech: "Liam O'Brien", mInit: "LO", mAv: "#2F9E44", store: "Sefton", status: "ready", time: "Today · 9:20", price: 240 },
  { ref: "NV-2830", customer: "Noah Fisher", vehicle: "2017 Hyundai i30", service: "3 Year Service", mech: "Aisha Rahman", mInit: "AR", mAv: "#D6336C", store: "Springvale", status: "done", time: "Yesterday · 16:10", price: 390 },
  { ref: "NV-2831", customer: "Grace Holloway", vehicle: "2021 Kia Sportage", service: "Log Book Service", mech: "Jack Whitfield", mInit: "JW", mAv: "#7048E8", store: "Dandenong", status: "done", time: "Yesterday · 15:00", price: 320 },
];

const reviews = [
  { author: "Daniel M.", init: "DM", av: "#FF6817", store: "Springvale", rating: 5, time: "2 days ago", text: "Same-day log book service, warranty stamp and all — no upsell. These guys are honest and fast.", reply: "Thanks Daniel — really glad we could get you back on the road same day. See you next service!", verified: true },
  { author: "Sophie K.", init: "SK", av: "#2D6BE0", store: "Dandenong", rating: 5, time: "1 week ago", text: "Free pre-RWC check saved me a fortune. Genuinely helpful crew who explained everything clearly.", reply: "", verified: true },
  { author: "Raj T.", init: "RT", av: "#0E9F57", store: "Bayswater", rating: 5, time: "3 days ago", text: "Ultimate Service and it drives like new. Call-back within the hour as promised.", reply: "Appreciate the kind words Raj! Enjoy the smooth ride.", verified: true },
  { author: "Lauren N.", init: "LN", av: "#E08600", store: "Alphington", rating: 4, time: "5 days ago", text: "Friendly, fast, fair priced. Dropped before work, ready by lunch. Only wish parking was easier.", reply: "", verified: true },
  { author: "Marco V.", init: "MV", av: "#E5484D", store: "Sunshine", rating: 5, time: "1 week ago", text: "Sorted my brakes same day and were clear about costs upfront. No surprises on the invoice.", reply: "", verified: false },
  { author: "Priya S.", init: "PS", av: "#8B5CF6", store: "Sefton", rating: 3, time: "4 days ago", text: "Good work but I waited a little longer than the quoted time. Staff were apologetic though.", reply: "", verified: true },
];

const pagesBase = [
  { id: 1, title: "Servicing", url: "/servicing", status: "published", edited: "2 days ago", by: "Daniel Mercer", views: "4.2k", icon: "page", seo: 82 },
  { id: 2, title: "Tyres Catalogue", url: "/tyres", status: "published", edited: "5 days ago", by: "Sophie Kaur", views: "9.8k", icon: "tyre", seo: 90 },
  { id: 3, title: "Wheels", url: "/wheels", status: "published", edited: "1 week ago", by: "Raj Thakur", views: "3.1k", icon: "wheel", seo: 76 },
  { id: 4, title: "Service Packages", url: "/packages", status: "draft", edited: "3 hours ago", by: "Lauren Nguyen", views: "—", icon: "package", seo: 64 },
  { id: 5, title: "Contact", url: "/contact", status: "published", edited: "2 weeks ago", by: "Priya Sharma", views: "5.6k", icon: "mail", seo: 88 },
  { id: 6, title: "Winter Tyre Sale 2026", url: "/promo/winter", status: "draft", edited: "Just now", by: "You", views: "—", icon: "tag", seo: 61 },
  { id: 7, title: "About Nova Tyres", url: "/about", status: "published", edited: "1 month ago", by: "Daniel Mercer", views: "2.0k", icon: "info", seo: 79 },
];
const pages = pagesBase.map(p => ({
  ...p,
  metaTitle: p.title + " | Nova Tyres",
  metaDesc: "Nova Tyres — " + p.title.toLowerCase() + " across Melbourne & Sydney. Qualified mechanics, quality parts, warranty-safe servicing.",
  kw: p.title.toLowerCase(),
}));

const orders = [
  { ref: "#10490", customer: "Liam Turner", items: "4× Michelin Pilot Sport 5 (225/45R17)", total: 1156, source: "order", status: "pending", store: "Springvale", date: "Jun 6", email: "liam.t@gmail.com" },
  { ref: "#10489", customer: "Emma Wilson", items: "2× Bridgestone Turanza 6 (205/55R16)", total: 398, source: "order", status: "processing", store: "Dandenong", date: "Jun 5", email: "emma.w@gmail.com" },
  { ref: "#10486", customer: "Oliver Chen", items: "Enkei RPF1 ×4 (17×8 +35)", total: 1680, source: "order", status: "processing", store: "Bayswater", date: "Jun 4", email: "oliver.c@gmail.com" },
  { ref: "#10484", customer: "Marcus Lee", items: "Goodyear Eagle F1 ×2 (225/40R18)", total: 558, source: "order", status: "dispatched", store: "Dandenong", date: "Jun 3", email: "marcus.l@gmail.com" },
  { ref: "#10482", customer: "Harper Wells", items: "Castrol EDGE 5W-30 ×2 + Bosch Filter", total: 148, source: "order", status: "pending", store: "Springvale", date: "Jun 2", email: "harper.w@gmail.com" },
  { ref: "#10480", customer: "Priya Naidu", items: "BBS CH-R Wheel ×4", total: 2760, source: "order", status: "dispatched", store: "Sefton", date: "Jun 1", email: "priya.n@gmail.com" },
  { ref: "#10478", customer: "Ethan Park", items: "Pirelli P Zero ×2 (245/40R19)", total: 690, source: "order", status: "cancelled", store: "Bayswater", date: "May 31", email: "ethan.p@gmail.com" },
  { ref: "#10487", customer: "James Whitlock", items: "4× Michelin Pilot Sport 5", total: 1156, source: "sale", status: "paid", store: "Springvale", date: "Jun 5", email: "james.w@gmail.com" },
  { ref: "#10485", customer: "Sophia Brown", items: "2× Continental PremiumContact 6", total: 530, source: "sale", status: "paid", store: "Sefton", date: "Jun 4", email: "sophia.b@gmail.com" },
  { ref: "#10483", customer: "Isabella Romano", items: "4× tyre fit + balance", total: 960, source: "sale", status: "paid", store: "Dandenong", date: "Jun 3", email: "isabella.r@gmail.com" },
  { ref: "#10481", customer: "Olivia Bennett", items: "2× Bridgestone Turanza 6 + fit kit", total: 478, source: "sale", status: "paid", store: "Springvale", date: "Jun 2", email: "olivia.b@gmail.com" },
  { ref: "#10479", customer: "Noah Fisher", items: "Dunlop SP Sport ×4 (215/60R16)", total: 636, source: "sale", status: "paid", store: "Springvale", date: "Jun 1", email: "noah.f@gmail.com" },
  { ref: "#10477", customer: "Chloe Davies", items: "Brembo Brake Pads (front set)", total: 145, source: "sale", status: "refunded", store: "Dandenong", date: "May 31", email: "chloe.d@gmail.com" },
  { ref: "#10475", customer: "Grace Holloway", items: "Enkei RPF1 ×4 + fitting kit", total: 1780, source: "sale", status: "paid", store: "Dandenong", date: "May 30", email: "grace.h@gmail.com" },
];

const activity = [
  { type: "booking", who: "Olivia Bennett", what: "booked a Free Pre-RWC Check", store: "Springvale", time: "4 min ago" },
  { type: "review", who: "Daniel M.", what: "left a 5★ review", store: "Springvale", time: "22 min ago" },
  { type: "stock", who: "System", what: "flagged Pirelli P Zero as out of stock", store: "Warehouse", time: "1 hr ago" },
  { type: "order", who: "James Whitlock", what: "paid order #10482 ($1,156)", store: "Springvale", time: "1 hr ago" },
  { type: "staff", who: "Aisha Rahman", what: "clocked in", store: "Springvale", time: "2 hr ago" },
  { type: "content", who: "Lauren Nguyen", what: "saved a draft of Service Packages", store: "Website", time: "3 hr ago" },
  { type: "booking", who: "Ethan Park", what: "completed Ultimate Service", store: "Bayswater", time: "4 hr ago" },
];

const notifications = [
  { type: "review", title: "2 new customer messages", body: "James W. & Olivia B. at Springvale.", time: "2 min ago", unread: true },
  { type: "stock", title: "Pirelli P Zero out of stock", body: "Reorder needed across 2 stores.", time: "1 hr ago", unread: true },
  { type: "booking", title: "3 new call-back requests", body: "Springvale & Dandenong waiting.", time: "2 hr ago", unread: true },
  { type: "review", title: "New 3★ review at Sefton", body: "Priya S. mentioned wait time.", time: "4 hr ago", unread: true },
  { type: "order", title: "Order #10478 refunded", body: "Dandenong · $365 processed.", time: "Yesterday", unread: false },
  { type: "staff", title: "Marco Vella is offline", body: "Sunshine store marked closed.", time: "Yesterday", unread: false },
];

const revenue7 = [
  { d: "Mon", a: 62, b: 38 }, { d: "Tue", a: 71, b: 44 }, { d: "Wed", a: 58, b: 35 },
  { d: "Thu", a: 80, b: 52 }, { d: "Fri", a: 92, b: 61 }, { d: "Sat", a: 99, b: 70 }, { d: "Sun", a: 47, b: 28 },
];

/* ---------- Messaging / chat (data-ext) ---------- */
const conversations = [
  { id: "c1", customer: "James Whitlock", init: "JW", av: "#076330", store: "Springvale", status: "open", unread: 2, time: "2m", agent: "Daniel Mercer", topic: "Log book service quote",
    messages: [
      { from: "customer", text: "Hi, how much for a log book service on a 2021 RAV4?", time: "9:02" },
      { from: "store", text: "Morning James! A log book service for the RAV4 is $320 incl. parts and a warranty stamp.", time: "9:05", agent: "Daniel Mercer" },
      { from: "customer", text: "Great. Can you fit me in this Friday?", time: "9:18" },
      { from: "customer", text: "Also do you do a free safety check with it?", time: "9:19" },
    ] },
  { id: "c2", customer: "Olivia Bennett", init: "OB", av: "#2D6BE0", store: "Springvale", status: "open", unread: 1, time: "20m", agent: null, topic: "Pre-RWC availability",
    messages: [ { from: "customer", text: "Do I need to book for the free pre-RWC check or can I just drop in?", time: "8:40" } ] },
  { id: "c3", customer: "Raj Thakur", init: "RT", av: "#0E9F57", store: "Bayswater", status: "open", unread: 0, time: "1h", agent: "Raj Thakur", topic: "Ultimate service follow-up",
    messages: [
      { from: "customer", text: "Car feels great after the Ultimate Service, thank you!", time: "Yesterday" },
      { from: "store", text: "So glad to hear it! Give us a shout if anything comes up.", time: "Yesterday", agent: "Raj Thakur" },
      { from: "customer", text: "Will do. When's my next service due?", time: "8:10" },
    ] },
  { id: "c4", customer: "Isabella Romano", init: "IR", av: "#8B5CF6", store: "Sefton", status: "open", unread: 1, time: "2h", agent: "Priya Sharma", topic: "Tesla tyre fitting",
    messages: [
      { from: "store", text: "Hi Isabella, your 4 tyres have arrived and are ready to fit.", time: "7:30", agent: "Priya Sharma" },
      { from: "customer", text: "Perfect — I'll come by at 2pm today.", time: "7:55" },
    ] },
  { id: "c5", customer: "Chloe Davies", init: "CD", av: "#E08600", store: "Dandenong", status: "closed", unread: 0, time: "1d", agent: "Sophie Kaur", topic: "Brake replacement",
    messages: [
      { from: "customer", text: "My brakes are squeaking, can you take a look?", time: "Wed" },
      { from: "store", text: "Of course — brought you in Thursday and replaced the front pads. All sorted!", time: "Thu", agent: "Sophie Kaur" },
      { from: "customer", text: "Thanks team, much quieter now.", time: "Thu" },
    ] },
  { id: "c6", customer: "Noah Fisher", init: "NF", av: "#D6336C", store: "Springvale", status: "open", unread: 0, time: "1d", agent: "Daniel Mercer", topic: "Service reminder",
    messages: [
      { from: "store", text: "Hi Noah, your i30 is due for its 3-year service. Want us to book you in?", time: "Yesterday", agent: "Daniel Mercer" },
      { from: "customer", text: "Yes please, next week works.", time: "Yesterday" },
      { from: "store", text: "Booked for Tuesday 10am. See you then!", time: "Yesterday", agent: "Daniel Mercer" },
    ] },
];

/* ---------- Roles & permissions ---------- */
const permAreas: [string, string, string][] = [
  ["stores", "Stores", "store"], ["bookings", "Bookings", "calendar"], ["messages", "Messages", "chat"],
  ["inventory", "Inventory", "box"], ["staff", "Staff", "users"], ["reviews", "Reviews", "star"],
  ["website", "Website & SEO", "globe"], ["finance", "Orders & Finance", "dollar"], ["roles", "Roles & Access", "shield"],
];
const roles = [
  { id: "r1", name: "Super Admin", desc: "Full control across every store and setting.", color: "#076330", scope: "all", members: 1, locked: true, perms: { stores: 2, bookings: 2, messages: 2, inventory: 2, staff: 2, reviews: 2, website: 2, finance: 2, roles: 2 } },
  { id: "r2", name: "Store Manager", desc: "Runs the day-to-day for a single store.", color: "#2D6BE0", scope: "store", members: 6, locked: true, perms: { stores: 1, bookings: 2, messages: 2, inventory: 2, staff: 2, reviews: 2, website: 1, finance: 1, roles: 0 } },
  { id: "r3", name: "Senior Mechanic", desc: "Leads the workshop floor and job queue.", color: "#0EA5A5", scope: "store", members: 4, locked: false, perms: { stores: 0, bookings: 2, messages: 1, inventory: 2, staff: 1, reviews: 0, website: 0, finance: 0, roles: 0 } },
  { id: "r4", name: "Mechanic", desc: "Works assigned service jobs.", color: "#7048E8", scope: "store", members: 5, locked: false, perms: { stores: 0, bookings: 2, messages: 0, inventory: 1, staff: 0, reviews: 0, website: 0, finance: 0, roles: 0 } },
  { id: "r5", name: "Front Desk", desc: "Greets customers, books jobs, answers chat.", color: "#F76707", scope: "store", members: 3, locked: false, perms: { stores: 0, bookings: 2, messages: 2, inventory: 0, staff: 0, reviews: 1, website: 0, finance: 0, roles: 0 } },
  { id: "r6", name: "Marketing", desc: "Manages the website, blog, SEO and reviews.", color: "#D6336C", scope: "all", members: 2, locked: false, perms: { stores: 0, bookings: 0, messages: 0, inventory: 1, staff: 0, reviews: 2, website: 2, finance: 0, roles: 0 } },
];

const blogs = [
  { id: "b1", title: "How often should you really service your car?", slug: "/blog/car-service-frequency", author: "Lauren Nguyen", date: "Jun 2", status: "published", reads: "3.4k", seo: 86, kw: "car service frequency" },
  { id: "b2", title: "Winter tyres vs all-seasons: what's right for you?", slug: "/blog/winter-vs-all-season", author: "Priya Sharma", date: "May 28", status: "published", reads: "5.1k", seo: 92, kw: "winter tyres australia" },
  { id: "b3", title: "5 dashboard warning lights you shouldn't ignore", slug: "/blog/warning-lights", author: "Daniel Mercer", date: "Jun 4", status: "draft", reads: "—", seo: 58, kw: "dashboard warning lights" },
  { id: "b4", title: "Pre-RWC checklist: pass first time", slug: "/blog/pre-rwc-checklist", author: "Sophie Kaur", date: "May 20", status: "published", reads: "2.2k", seo: 74, kw: "roadworthy certificate checklist" },
];

const sectionTypes: Record<string, { name: string; icon: string; desc: string }> = {
  hero: { name: "Hero banner", icon: "image", desc: "Full-width headline + call to action" },
  services: { name: "Service cards", icon: "wrench", desc: "Grid of services offered" },
  tiers: { name: "Pricing tiers", icon: "layers", desc: "Selectable service levels" },
  why: { name: "Why choose us", icon: "shield", desc: "Trust points & guarantees" },
  brands: { name: "Brand logos", icon: "tag", desc: "Brands you stock & service" },
  reviews: { name: "Reviews", icon: "star", desc: "Google reviews carousel" },
  booking: { name: "Booking form", icon: "calendar", desc: "Call-back request form" },
  locations: { name: "Locations", icon: "pin", desc: "Find-a-store map & list" },
  text: { name: "Text block", icon: "file", desc: "Rich text content" },
  gallery: { name: "Image gallery", icon: "image", desc: "Photo grid" },
  faq: { name: "FAQ", icon: "info", desc: "Common questions" },
  cta: { name: "CTA banner", icon: "zap", desc: "Highlighted call to action" },
};
const pageSections: Record<number, { id: string; type: string; visible: boolean }[]> = {
  1: [
    { id: "s1", type: "hero", visible: true }, { id: "s2", type: "services", visible: true },
    { id: "s3", type: "tiers", visible: true }, { id: "s4", type: "why", visible: true },
    { id: "s5", type: "brands", visible: true }, { id: "s6", type: "reviews", visible: true },
    { id: "s7", type: "booking", visible: true }, { id: "s8", type: "locations", visible: false },
  ],
};

const calls = [
  { id: "k1", customer: "Harper Wells", phone: "0412 556 030", init: "HW", av: "#076330", store: "Springvale", kind: "enquiry", topic: "Price for 4 new tyres", time: "Today · 9:42", duration: "4m", quoted: 1156, outcome: "thinking", handledBy: "Daniel Mercer", note: "Asked about Michelin Pilot Sport 5 for a Golf GTI. Quoted $289 ea fitted. Said he'd compare and call back." },
  { id: "k2", customer: "Marcus Lee", phone: "0413 220 884", init: "ML", av: "#2D6BE0", store: "Springvale", kind: "booking", topic: "Log book service", time: "Today · 9:10", duration: "6m", vehicle: "2021 Toyota RAV4", service: "Log Book Service", price: 320, when: "Fri · 9:00", outcome: "booked", handledBy: "Daniel Mercer", note: "Booked in for Friday morning. Wants warranty stamp." },
  { id: "k3", customer: "Tina Alvarez", phone: "0414 905 117", init: "TA", av: "#D6336C", store: "Dandenong", kind: "enquiry", topic: "Roadworthy cost", time: "Today · 8:55", duration: "3m", quoted: 180, outcome: "declined", handledBy: "Sophie Kaur", note: "Wanted a roadworthy only. Quoted $180. Said it was more than expected." },
  { id: "k4", customer: "Owen Brooks", phone: "0415 663 422", init: "OB", av: "#0E9F57", store: "Bayswater", kind: "booking", topic: "Brake replacement", time: "Today · 8:30", duration: "8m", vehicle: "2019 Mazda CX-5", service: "Brake Replacement", price: 540, when: "Today · 14:00", outcome: "booked", handledBy: "Raj Thakur", note: "Front pads grinding. Squeezed in this afternoon." },
  { id: "k5", customer: "Unknown caller", phone: "0416 770 201", init: "?", av: "#8A8F96", store: "Springvale", kind: "missed", topic: "Missed call", time: "Today · 8:12", duration: "—", outcome: "callback", handledBy: "—", note: "Missed call, no voicemail. Needs a call-back." },
  { id: "k6", customer: "Priya Naidu", phone: "0417 118 990", init: "PN", av: "#E08600", store: "Sefton", kind: "enquiry", topic: "Wheel alignment price", time: "Yesterday · 16:40", duration: "2m", quoted: 89, outcome: "will-book", handledBy: "Priya Sharma", note: "Quoted $89 alignment. Will book in next week." },
];

export const NOVA = {
  stores, staff, products, bookings, reviews, pages, orders, activity, notifications, revenue7,
  conversations, permAreas, roles, blogs, sectionTypes, pageSections, calls,
};

export type NovaData = typeof NOVA;
export default NOVA;
