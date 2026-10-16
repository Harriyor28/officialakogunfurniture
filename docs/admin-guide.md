# Admin Guide — Official Akogun Furniture

A practical guide for the team. Sign in at **`/admin`** with your staff account.

---

## 1. First-time setup

1. Sign in with the seeded admin account (or the account created for you).
2. Go to **Settings** and complete:
   - **Business details** — name, phone, WhatsApp number (international format, e.g. `2348012345678`), email, address, opening hours, social links, about-page text, footer note.
   - **How we work** — the process steps shown on the About page and homepage. Edit the titles and descriptions, then **Save process steps**.
   - **Homepage copy** — the hero headline/supporting line and the call-to-action text.
3. While the site still contains seeded demo work, keep the **demo-content banner ON**. Turn it off (Settings → uncheck) as soon as real content is live.

> Environment variables for phone/WhatsApp/email override whatever is saved here — ask your developer if the fields will not stick.

---

## 2. Roles & permissions

| Role | Can do |
| ---- | ------ |
| **Super admin** | Everything, including managing users |
| **Admin** | Everything except user management |
| **Project manager** | Portfolio, enquiries, quotations, customer projects, content, audit log |
| **Staff** | Enquiries and customer-project updates |

Users are managed under **Users** (Super Admin only). Deactivating a user immediately revokes their sessions.

---

## 3. Enquiries (quote requests & contact messages)

New submissions from the website appear under **Enquiries** with status **New**.

**Daily workflow:**
1. Open the enquiry — check the requirements, dimensions, budget range, and any attachments.
2. Set a status:
   - **Under Review** — you are assessing it.
   - **Awaiting More Information** — you need details from the customer (use **Reply by email** to ask).
   - **Quotation Prepared / Sent** — set automatically when you prepare/send a quotation.
   - **Approved / Declined / Converted / Closed** — final states.
3. Add **internal notes** (never shown to the customer) and, if useful, assign the enquiry to a team member.
4. Use **Reply by email** for customer-facing messages. The system only reports *sent* when the email provider confirms delivery; otherwise it tells you plainly so you can copy the message manually.

---

## 4. Quotations

From an enquiry, click **Prepare quotation**, or use **Quotations → New quotation**.

1. Select the enquiry.
2. Add line items — description, quantity, unit price (whole naira). Totals are calculated for you.
3. Optionally add a discount and delivery fee, notes, terms, and a *valid until* date.
4. **Create quotation** (saves as **Draft** — nothing is sent yet).

**Sending:**
- Click **Email quotation to customer** — it is only marked **Sent** when the provider confirms. If email is not configured, download the **PDF** and send it yourself.
- The customer can approve/decline from their portal, or you can record the decision manually (**Mark approved / Mark declined**).

**Converting to a project:**
- Once approved, use **Convert to customer project**. The customer must already have a registered account with the enquiry's email address (they can register at `/register`). This creates a tracked project with a reference like `AKP-2026-0004`, moves the quotation to **Converted**, and emails the customer.

---

## 5. Customer projects (tracking portal)

Under **Customer Projects** you see every project customers track in their portal.

**Updating progress:**
1. Open the project.
2. Under **Progress updates**, write what happened (e.g. "Materials delivered to the workshop").
3. Optionally set the **stage reached** — this advances the progress bar automatically.
4. Tick **Visible to the customer** to publish it (they also receive an email). Untick to keep it internal.

**Milestones:**
- Add milestones with due dates (e.g. "Design sign-off", "Delivery"). Change their status (Pending / In progress / Done) as work proceeds. Untick *visible* to hide one from the customer.

**Stage guide** (each stage sets the progress bar automatically):

| Stage | Progress |
| ----- | -------- |
| Enquiry Received | 5% |
| Consultation | 10% |
| Measurement & Design | 20% |
| Quotation Pending | 30% |
| Awaiting Customer Approval | 35% |
| Awaiting Deposit | 40% |
| Materials Preparation | 50% |
| Production | 65% |
| Finishing & Quality Inspection | 80% |
| Ready for Delivery | 90% |
| Installation | 95% |
| Completed / After-Sales | 100% |

**Internal notes** and the customer's account email are visible only to staff.

---

## 6. Portfolio & catalogue

**Portfolio (Projects):** showcase completed and in-progress work. Upload gallery images (max 8 MB each: JPG, PNG, WebP, AVIF, SVG), write a description, materials, dimensions. Only tick **Published** when you are happy for it to appear publicly; **Featured** pins it to the homepage. Location is stored only when the customer permits publication.

**Catalogue (Furniture):** products with availability (In Stock / Made to Order / Currently Unavailable / Ask Us), optional price range, lead time, materials, colours, and a **Customisable** flag. **Never enter a price you are not sure about** — leave the price fields blank to show "price on request".

Both are hidden from the public site until **Published** is ticked.

---

## 7. Content

- **Testimonials** — only add reviews real customers gave you. A testimonial must be both **Approved** (authenticity verified) and **Published** to appear on the site.
- **Blog** — write posts in plain text with blank lines between paragraphs. A safe subset of Markdown is supported: `# ## ###` headings, `- ` bullets, `1. ` numbered lists, `**bold**`, `*italic*`, `` `code` ``, and `[links](https://…)`. Posts stay drafts until **Published**.

---

## 8. Audit log

**Audit log** (available to roles with permission) records who changed what: quotation status changes, project updates, user changes, settings edits, and more. Entries are append-only.

---

## 9. Email behaviour

- If no email provider is configured, every email attempt is recorded in the notification log as **SKIPPED** — the UI will tell you plainly; nothing is ever falsely marked as sent.
- Common pattern when delivery fails: copy the text from the screen and send it manually (e.g. from your own mail app or WhatsApp).

---

## 10. Troubleshooting

| Symptom | What to check |
| ------- | ------------- |
| "No customer account with this email" when converting a quotation | The customer must register first at `/register` with the same email used in the enquiry. |
| Email says skipped/failed | `RESEND_API_KEY` / `EMAIL_FROM` not set, or the provider rejected the message. Check Settings and your Resend dashboard. |
| Image upload rejected | Max 8 MB, JPG/PNG/WebP/AVIF/SVG only. |
| A staff member cannot see a menu item | Their role lacks that permission — see the role table above. |
| Progress bar did not move | Set the **stage** on the update, or edit the project and set Stage + Progress % directly. |
