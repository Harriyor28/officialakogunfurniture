import { describe, it, expect } from "vitest";
import {
  enquirySchema,
  loginSchema,
  registerSchema,
  contactSchema,
  portfolioProjectSchema,
  productSchema,
  quotationSchema,
  customerProjectSchema,
  staffUserSchema,
  settingsSchema,
  blogPostSchema,
  testimonialSchema,
} from "@/lib/validation";

const validEnquiry = {
  name: "Ada Obi",
  email: "ada@example.com",
  phone: "08012345678",
  preferredContact: "PHONE",
  serviceCategory: "Fitted Wardrobes",
  requirements: "I need a fitted wardrobe for a 3m x 2.5m bedroom wall with sliding doors.",
  privacyAccepted: true,
};

describe("enquirySchema", () => {
  it("accepts a minimal valid enquiry", () => {
    expect(enquirySchema.safeParse(validEnquiry).success).toBe(true);
  });

  it("rejects a missing privacy acceptance", () => {
    const result = enquirySchema.safeParse({ ...validEnquiry, privacyAccepted: false });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = enquirySchema.safeParse({ ...validEnquiry, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a too-short requirements message", () => {
    const result = enquirySchema.safeParse({ ...validEnquiry, requirements: "short" });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "password123" }).success).toBe(true);
  });

  it("rejects a missing password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "t@example.com",
      password: "password123",
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a short password", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "t@example.com",
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("contactSchema", () => {
  it("accepts a valid contact message", () => {
    const result = contactSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      message: "This is a long enough message for validation.",
      privacyAccepted: true,
    });
    expect(result.success).toBe(true);
  });
});

describe("portfolioProjectSchema", () => {
  const valid = {
    title: "Demo Project",
    slug: "demo-project",
    status: "COMPLETED",
    published: true,
    featured: false,
    images: [],
  };

  it("accepts a minimal project", () => {
    expect(portfolioProjectSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid slug", () => {
    const result = portfolioProjectSchema.safeParse({ ...valid, slug: "Invalid Slug!" });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown status", () => {
    const result = portfolioProjectSchema.safeParse({ ...valid, status: "BOGUS" });
    expect(result.success).toBe(false);
  });
});

describe("productSchema", () => {
  const valid = {
    name: "Test Product",
    slug: "test-product",
    availability: "MADE_TO_ORDER",
    published: true,
    featured: false,
    customisable: true,
    images: [],
  };

  it("accepts a minimal product", () => {
    expect(productSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an unknown availability", () => {
    const result = productSchema.safeParse({ ...valid, availability: "WHATEVER" });
    expect(result.success).toBe(false);
  });
});

describe("quotationSchema", () => {
  const valid = {
    enquiryId: "enq-1",
    status: "DRAFT",
    discount: "0",
    delivery: "0",
    items: [{ description: "Wardrobe carcass", quantity: 1, unitPrice: 150000 }],
  };

  it("accepts a quotation with one item", () => {
    expect(quotationSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a quotation with no items", () => {
    const result = quotationSchema.safeParse({ ...valid, items: [] });
    expect(result.success).toBe(false);
  });
});

describe("customerProjectSchema", () => {
  const valid = {
    title: "Fitted Wardrobe — Ada",
    customerEmail: "ada@example.com",
    status: "CONSULTATION",
    progressPercent: "10",
  };

  it("accepts a minimal customer project", () => {
    expect(customerProjectSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid customer email", () => {
    const result = customerProjectSchema.safeParse({ ...valid, customerEmail: "nope" });
    expect(result.success).toBe(false);
  });
});

describe("staffUserSchema", () => {
  const valid = {
    name: "Staff Member",
    email: "staff@example.com",
    role: "STAFF",
    password: "a-very-long-password",
    active: true,
  };

  it("accepts a valid staff user", () => {
    expect(staffUserSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an unknown role", () => {
    const result = staffUserSchema.safeParse({ ...valid, role: "BOSS" });
    expect(result.success).toBe(false);
  });

  it("rejects a short password", () => {
    const result = staffUserSchema.safeParse({ ...valid, password: "short" });
    expect(result.success).toBe(false);
  });
});

describe("settingsSchema", () => {
  it("applies defaults for missing fields", () => {
    const result = settingsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.businessName).toBe("Official Akogun Furniture");
      expect(result.data.contentIsDemo).toBe(false);
    }
  });
});

describe("blogPostSchema", () => {
  const valid = {
    title: "How to plan a wardrobe",
    slug: "how-to-plan-a-wardrobe",
    excerpt: "A short excerpt for the blog post listing.",
    content: "x".repeat(60),
    published: true,
  };

  it("accepts a valid post", () => {
    expect(blogPostSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a short excerpt", () => {
    const result = blogPostSchema.safeParse({ ...valid, excerpt: "short" });
    expect(result.success).toBe(false);
  });
});

describe("testimonialSchema", () => {
  it("accepts a valid testimonial", () => {
    const result = testimonialSchema.safeParse({
      authorName: "Happy Customer",
      content: "Absolutely brilliant craftsmanship and service.",
      rating: 5,
      approved: true,
      published: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a too-short review", () => {
    const result = testimonialSchema.safeParse({
      authorName: "X",
      content: "no",
      approved: false,
      published: false,
    });
    expect(result.success).toBe(false);
  });
});
