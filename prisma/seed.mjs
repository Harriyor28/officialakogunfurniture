import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { readFileSync, existsSync } from "node:fs";
import { PrismaClient } from "../lib/generated/prisma/client.js";
import { randomBytes, scryptSync } from "node:crypto";

// Load .env (the CLI config does this too, but the seed may be run directly).
if (!process.env.DATABASE_URL && existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}

const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  { slug: "wardrobes", name: "Wardrobes", description: "Fitted and freestanding wardrobes tailored to your space.", image: "/demo/wardrobe-1.svg" },
  { slug: "kitchen-cabinets", name: "Kitchen Cabinets", description: "Durable, elegant kitchen cabinetry and storage.", image: "/demo/kitchen-1.svg" },
  { slug: "bedroom-furniture", name: "Bedroom Furniture", description: "Beds, bedside units, dressers and bedroom sets.", image: "/demo/bedroom-1.svg" },
  { slug: "living-room-furniture", name: "Living Room Furniture", description: "TV units, shelving, consoles and lounge pieces.", image: "/demo/living-1.svg" },
  { slug: "office-furniture", name: "Office Furniture", description: "Desks, cabinets and fittings for modern offices.", image: "/demo/office-1.svg" },
  { slug: "school-furniture", name: "School Furniture", description: "Classroom desks, storage and institutional fittings.", image: "/demo/school-1.svg" },
  { slug: "doors-and-fittings", name: "Doors and Wooden Fittings", description: "Doors, frames and architectural woodwork.", image: "/demo/doors-1.svg" },
  { slug: "custom-furniture", name: "Custom Furniture", description: "One-off pieces designed around your brief.", image: "/demo/custom-1.svg" },
];

const SERVICES = [
  { slug: "custom-furniture", name: "Custom Furniture", order: 1, icon: "hammer", image: "/demo/custom-1.svg", description: "Bespoke furniture built to your exact measurements, style and budget — from single statement pieces to complete room packages." },
  { slug: "wardrobes-and-kitchen-cabinets", name: "Wardrobes and Kitchen Cabinets", order: 2, icon: "cabinet", image: "/demo/wardrobe-2.svg", description: "Fitted wardrobes and kitchen cabinetry designed for daily use, with quality hardware and finishes that last." },
  { slug: "interior-woodwork", name: "Interior Woodwork", order: 3, icon: "ruler", image: "/demo/detail-1.svg", description: "Wall panelling, ceilings, built-in storage and architectural woodwork that completes an interior." },
  { slug: "office-and-school-furniture", name: "Office and School Furniture", order: 4, icon: "desk", image: "/demo/office-1.svg", description: "Durable, functional furniture for offices, classrooms and institutional spaces — supplied and installed." },
  { slug: "furniture-repairs", name: "Furniture Repairs", order: 5, icon: "wrench", image: "/demo/workshop-1.svg", description: "Repair, refinishing and restoration of existing furniture to extend its life and restore its look." },
  { slug: "interior-design-and-installation", name: "Interior Design and Installation", order: 6, icon: "palette", image: "/demo/living-1.svg", description: "Design guidance, space planning, material selection and professional installation for a complete result." },
  { slug: "furniture-sales", name: "Furniture Sales", order: 7, icon: "tag", image: "/demo/bedroom-1.svg", description: "Select finished pieces available to order, with customisation options where you need them." },
  { slug: "doors-and-wooden-fittings", name: "Doors and Wooden Fittings", order: 8, icon: "door", image: "/demo/doors-1.svg", description: "Interior doors, frames and wooden fittings crafted and installed to fit your openings precisely." },
];

// Demonstration portfolio records — clearly labelled, easy to replace.
const DEMO_PROJECTS = [
  {
    slug: "demo-fitted-wardrobe",
    title: "Demo — Fitted Floor-to-Ceiling Wardrobe",
    categoryId: "wardrobes",
    status: "COMPLETED",
    featured: true,
    summary: "A three-door fitted wardrobe with full-height hanging, shelving and soft-close hardware. Demonstration record.",
    description:
      "This demonstration project shows how a completed portfolio entry appears on the website. Replace it with a genuine project: add real photographs, materials, dimensions and the story behind the build.",
    inspiration: "Clean lines, warm wood tone and concealed storage for a calm bedroom interior.",
    materials: "Demo materials: engineered board with veneer finish, soft-close hinges, metal handles.",
    dimensions: "Demo dimensions: 2400mm W × 2400mm H × 600mm D",
    location: "",
    images: ["/demo/wardrobe-1.svg", "/demo/wardrobe-2.svg", "/demo/detail-1.svg"],
  },
  {
    slug: "demo-kitchen-cabinetry",
    title: "Demo — Modern Kitchen Cabinetry",
    categoryId: "kitchen-cabinets",
    status: "COMPLETED",
    featured: true,
    summary: "L-shaped kitchen cabinetry with tall pantry housing and durable worktop-ready carcasses. Demonstration record.",
    description:
      "A demonstration portfolio entry for kitchen cabinetry. Replace with a genuine completed kitchen, including photographs of the installation and a description of the client's brief.",
    inspiration: "Practical layout, generous storage and a warm finish that ages well.",
    materials: "Demo materials: moisture-resistant board, soft-close drawers, aluminium handles.",
    dimensions: "Demo dimensions: project-specific",
    location: "",
    images: ["/demo/kitchen-1.svg", "/demo/detail-1.svg"],
  },
  {
    slug: "demo-office-desk-run",
    title: "Demo — Office Desk Run & Storage",
    categoryId: "office-furniture",
    status: "IN_PROGRESS",
    featured: true,
    summary: "A four-seat desk run with shared storage and cable management. Demonstration record, currently marked in progress.",
    description:
      "Demonstration of an in-progress project entry. Only information approved for public display should ever appear here — never customer names, addresses or costs.",
    inspiration: "Efficient shared workspace with a consistent finish across every station.",
    materials: "Demo materials: laminate worktops, painted storage carcasses.",
    dimensions: "Demo dimensions: 3200mm W × 600mm D",
    location: "",
    images: ["/demo/office-1.svg"],
  },
  {
    slug: "demo-bedroom-set",
    title: "Demo — Bedroom Set with Bed Frame & Side Units",
    categoryId: "bedroom-furniture",
    status: "AVAILABLE_CUSTOM",
    featured: false,
    summary: "Bed frame with matching bedside units, available as a custom order in your choice of finish. Demonstration record.",
    description:
      "Shows how a product-style portfolio entry can be marked Available for Custom Order so visitors know they can order a similar piece.",
    inspiration: "A coordinated bedroom set with soft edges and a warm timber tone.",
    materials: "Demo materials: solid timber accents, veneered panels.",
    dimensions: "Demo dimensions: configurable",
    location: "",
    images: ["/demo/bedroom-1.svg"],
  },
];

const DEMO_PRODUCTS = [
  {
    slug: "demo bedside-unit",
    name: "Demo — Two-Drawer Bedside Unit",
    categoryId: "bedroom-furniture",
    summary: "Compact bedside unit with two soft-close drawers. Demonstration catalogue entry.",
    description: "A demonstration catalogue product. Prices are only shown when genuinely supplied — this entry deliberately has no price.",
    dimensions: "450mm W × 400mm D × 500mm H",
    materials: "Demo: veneered board, metal handles",
    colours: "Demo: walnut, oak, white",
    availability: "MADE_TO_ORDER",
    leadTime: "",
    featured: true,
    images: ["/demo/bedroom-1.svg"],
  },
  {
    slug: "demo-tv-console",
    name: "Demo — Low TV Console",
    categoryId: "living-room-furniture",
    summary: "Low-profile media console with closed storage and open shelf. Demonstration catalogue entry.",
    description: "Shows catalogue layout: images, dimensions, materials and enquiry actions without invented pricing.",
    dimensions: "1600mm W × 400mm D × 450mm H",
    materials: "Demo: painted MDF, timber top",
    colours: "Demo: charcoal, natural oak",
    availability: "ASK",
    leadTime: "",
    featured: false,
    images: ["/demo/living-1.svg"],
  },
].map((p) => ({ ...p, slug: p.slug.replace(" ", "-") }));

function scryptHash(password) {
  // Seed uses the same scrypt format as lib/password.ts.
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });
  return `scrypt$16384$8$1$${salt}$${derived.toString("hex")}`;
}

async function main() {
  console.log("Seeding database at", url);

  // --- Categories ---
  for (const category of CATEGORIES) {
    await prisma.furnitureCategory.upsert({
      where: { slug: category.slug },
      create: { ...category, order: CATEGORIES.indexOf(category) },
      update: { name: category.name, description: category.description, image: category.image, order: CATEGORIES.indexOf(category) },
    });
  }
  const categories = await prisma.furnitureCategory.findMany();
  const catId = (slug) => categories.find((c) => c.slug === slug)?.id ?? null;

  // --- Services ---
  for (const service of SERVICES) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      create: { ...service, categoryId: catId(service.slug === "custom-furniture" ? "custom-furniture" : null) },
      update: { name: service.name, description: service.description, order: service.order, image: service.image, icon: service.icon },
    });
  }

  // --- Demo portfolio projects ---
  for (const [index, project] of DEMO_PROJECTS.entries()) {
    const images = project.images.map((url, i) => ({ url, alt: `${project.title} — demonstration image ${i + 1}`, order: i }));
    const data = {
      title: project.title,
      categoryId: catId(project.categoryId),
      summary: project.summary,
      description: project.description,
      inspiration: project.inspiration,
      materials: project.materials,
      dimensions: project.dimensions,
      location: project.location,
      status: project.status,
      featured: project.featured,
      published: true,
      coverImage: images[0]?.url ?? null,
      seoDescription: project.summary,
      updatedAt: new Date(),
    };
    await prisma.project.upsert({
      where: { slug: project.slug },
      create: {
        slug: project.slug,
        ...data,
        images: { create: images },
        completedAt: project.status === "COMPLETED" ? new Date() : null,
      },
      update: {
        ...data,
        images: { deleteMany: {}, create: images },
      },
    });
    void index;
  }

  // --- Demo products ---
  for (const product of DEMO_PRODUCTS) {
    const images = product.images.map((url, i) => ({ url, alt: `${product.name} — demonstration image ${i + 1}`, order: i }));
    const data = {
      name: product.name,
      categoryId: catId(product.categoryId),
      summary: product.summary,
      description: product.description,
      dimensions: product.dimensions,
      materials: product.materials,
      colours: product.colours,
      availability: product.availability,
      leadTime: product.leadTime,
      featured: product.featured,
      published: true,
      updatedAt: new Date(),
    };
    await prisma.product.upsert({
      where: { slug: product.slug },
      create: { slug: product.slug, ...data, images: { create: images } },
      update: { ...data, images: { deleteMany: {}, create: images } },
    });
  }

  // --- Demo blog post ---
  await prisma.blogPost.upsert({
    where: { slug: "demo-how-to-plan-a-fitted-wardrobe" },
    create: {
      slug: "demo-how-to-plan-a-fitted-wardrobe",
      title: "Demo — How to Plan a Fitted Wardrobe",
      excerpt:
        "A demonstration article showing how furniture guides will look on the blog. Replace with genuine advice from the workshop.",
      content:
        "# Demo article\n\nThis is demonstration content for the OFFICIAL AKOGUN FURNITURE blog.\n\nA real article might cover:\n\n- Measuring your alcove accurately\n- Choosing internal layouts (hanging, shelving, drawers)\n- Selecting finishes and hardware\n- Planning for lighting and skirting\n\nReplace this post with genuine, helpful content written for your customers.",
      published: true,
      publishedAt: new Date(),
      authorName: "Official Akogun Furniture",
      coverImage: "/demo/wardrobe-2.svg",
      seoDescription: "Demonstration blog article for the furniture inspiration section.",
    },
    update: {},
  });

  // --- Settings ---
  await prisma.siteSetting.upsert({
    where: { key: "business" },
    create: {
      key: "business",
      value: JSON.stringify({
        businessName: "Official Akogun Furniture",
        tagline: "Bespoke furniture, interior woodwork and custom design.",
        phone: "",
        whatsapp: "",
        email: "",
        address: "",
        hours: "",
        facebook: "",
        instagram: "",
        twitter: "",
        aboutBody:
          "OFFICIAL AKOGUN FURNITURE designs and builds bespoke furniture, cabinetry and interior woodwork.\n\nThis about section is editable from the administrator dashboard — replace it with the genuine story of the business, the workshop and the team.",
        footerNote: "",
        contentIsDemo: true,
      }),
    },
    update: {},
  });

  // --- Admin user ---
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@akogunfurniture.local").toLowerCase();
  let adminPassword = process.env.ADMIN_PASSWORD || "";
  let generated = false;
  if (!adminPassword) {
    adminPassword = randomBytes(9).toString("base64url");
    generated = true;
  }
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: scryptHash(adminPassword),
        name: "Administrator",
        role: "SUPER_ADMIN",
        active: true,
      },
    });
    console.log(`Created administrator ${adminEmail}`);
    if (generated) {
      console.log("");
      console.log("  Generated admin password (shown once — change it after first login):");
      console.log(`  ${adminPassword}`);
      console.log("");
    }
  } else {
    console.log(`Administrator ${adminEmail} already exists — password unchanged.`);
  }

  // A demo customer account so the tracking portal can be explored.
  const demoEmail = "customer@demo.local";
  const existingDemo = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!existingDemo) {
    const demoUser = await prisma.user.create({
      data: {
        email: demoEmail,
        passwordHash: scryptHash("DemoCustomer123!"),
        name: "Demo Customer",
        role: "CUSTOMER",
        active: true,
      },
    });
    const demoEnquiry = await prisma.enquiry.create({
      data: {
        reference: `AKQ-${new Date().getFullYear()}-0001`,
        name: "Demo Customer",
        email: demoEmail,
        phone: "08000000000",
        preferredContact: "EMAIL",
        serviceCategory: "Custom Furniture",
        title: "Demo fitted wardrobe enquiry",
        requirements: "Demonstration enquiry used to show the quotation and project tracking workflow.",
        privacyAccepted: true,
        status: "CONVERTED",
      },
    });
    const demoProject = await prisma.customerProject.create({
      data: {
        reference: `AKP-${new Date().getFullYear()}-0001`,
        title: "Demo — Fitted Wardrobe Project",
        customerUserId: demoUser.id,
        categoryId: catId("wardrobes"),
        enquiryId: demoEnquiry.id,
        status: "PRODUCTION",
        summary: "Demonstration project so you can preview the customer tracking portal.",
        specifications: "Demo specifications: three-door fitted wardrobe, full-height hanging and shelving.",
        startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        expectedEndDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
        progressPercent: 65,
        nextMilestone: "Finishing and quality inspection",
        milestones: {
          create: [
            { name: "Consultation", status: "DONE", order: 0, visible: true },
            { name: "Measurement & design", status: "DONE", order: 1, visible: true },
            { name: "Production", status: "IN_PROGRESS", order: 2, visible: true },
            { name: "Finishing & quality inspection", status: "PENDING", order: 3, visible: true },
            { name: "Delivery & installation", status: "PENDING", order: 4, visible: true },
          ],
        },
        updates: {
          create: [
            {
              title: "Production started",
              description: "Carcass panels have been cut and edge-banded; assembly begins this week.",
              stage: "PRODUCTION",
              visibleToCustomer: true,
            },
            {
              title: "Design approved",
              description: "Internal layout and finish confirmed with the customer.",
              stage: "MEASUREMENT_DESIGN",
              visibleToCustomer: true,
            },
          ],
        },
      },
    });
    console.log(`Created demo customer ${demoEmail} (password: DemoCustomer123!) and project ${demoProject.reference}`);
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma["\$disc" + "onnect"]();
  });
