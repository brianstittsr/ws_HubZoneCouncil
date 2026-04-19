# Non-Working Buttons & Broken Links Analysis
**Analysis Date:** December 18, 2025

---

## Summary

| Category | Count |
|----------|-------|
| **Placeholder Links (#)** | 2 |
| **Missing Pages (404)** | 18 |
| **Non-Functional SSO** | 1 |
| **Placeholder Phone Number** | 2 |
| **External Links (Generic)** | 3 |

---

## 1. Placeholder Links (href="#")

These buttons/links have `href="#"` which does nothing when clicked:

| Location | Button Text | File |
|----------|-------------|------|
| Contact Page | "Book a Call" | `app/(marketing)/contact/page.tsx:264` |
| About Page | Mail icon button (team member) | `app/(marketing)/about/page.tsx:232` |

---

## 2. Missing Pages (Will Show 404)

These pages are linked in the navbar/footer but **do not exist**:

### Services Pages (Missing)
| Link | Referenced In |
|------|---------------|
| `/twinedge` | Navbar, Footer |
| `/twinedge/process` | Navbar |
| `/twinedge/supply-chain` | Navbar |
| `/twinedge/maintenance` | Navbar |
| `/intelledge` | Navbar, Footer |
| `/intelledge/command` | Navbar |
| `/intelledge/analytics` | Navbar |
| `/intelledge/ask` | Navbar |
| `/v-edge/lean` | Navbar |
| `/v-edge/automation` | Navbar |
| `/v-edge/digital` | Navbar |
| `/v-edge/workforce` | Navbar |
| `/services/supplier-readiness` | Footer |

### Resource Pages (Missing)
| Link | Referenced In |
|------|---------------|
| `/case-studies` | Navbar, Footer |
| `/resources` | Navbar |
| `/resources/blog` | Footer |
| `/resources/guides` | Footer |
| `/resources/webinars` | Footer |
| `/events` | Navbar, Footer |
| `/faq` | Navbar, Footer |
| `/news` | Footer |

### Other Missing Pages
| Link | Referenced In |
|------|---------------|
| `/careers` | Footer |
| `/affiliates` (marketing) | Footer |
| `/cookies` | Footer |

---

## 3. Non-Functional Authentication Buttons

### Microsoft SSO Button
| Location | Issue | File |
|----------|-------|------|
| Sign In Page | "Sign in with Microsoft" button redirects to `/api/auth/microsoft` but there's no route handler at that path (only callback exists) | `app/sign-in/page.tsx:254` |

**Note:** The callback handler exists at `/api/auth/microsoft/callback/route.ts` but the initial OAuth redirect endpoint `/api/auth/microsoft` is missing.

---

## 4. Placeholder Contact Information

These use fake/placeholder phone numbers:

| Location | Value | File |
|----------|-------|------|
| CTA Section | `tel:+1-555-123-4567` | `components/marketing/cta-section.tsx:36` |
| Footer | `(555) 123-4567` | `components/shared/footer.tsx:135` |

---

## 5. Generic External Social Links

These link to generic social media homepages, not actual company profiles:

| Location | Link | File |
|----------|------|------|
| Footer | `https://linkedin.com` | `components/shared/footer.tsx:64` |
| Footer | `https://twitter.com` | `components/shared/footer.tsx:67` |
| Footer | `https://youtube.com` | `components/shared/footer.tsx:70` |

---

## 6. Buttons That Are Correctly Disabled (Not Bugs)

These buttons are intentionally disabled based on form state - **NOT bugs**:

- Sign In/Sign Up submit buttons (disabled while loading)
- Form submit buttons (disabled until required fields filled)
- Booking flow buttons (disabled until selection made)
- AI tool buttons (disabled while processing)

---

## Priority Fix List

### 🔴 Critical (Breaks User Flow)
1. **Microsoft SSO** - Add `/api/auth/microsoft/route.ts` to initiate OAuth flow
2. **Book a Call button** - Link to actual booking page or Calendly

### 🟠 High Priority (Bad UX - 404 Errors)
3. Create `/twinedge` page
4. Create `/intelledge` page  
5. Create `/case-studies` page
6. Create `/resources` page
7. Create `/events` page
8. Create `/faq` page

### 🟡 Medium Priority (Missing Content)
9. Create remaining V-Edge sub-pages (`/lean`, `/automation`, `/digital`, `/workforce`)
10. Create TwinEDGE sub-pages
11. Create IntellEDGE sub-pages
12. Create `/careers` page
13. Create `/news` page
14. Create `/cookies` page
15. Create resource sub-pages (`/blog`, `/guides`, `/webinars`)

### 🟢 Low Priority (Polish)
16. Update social media links to actual company profiles
17. Update phone number to real number
18. Fix team member email buttons on About page

---

## Quick Fix Commands

### Create placeholder pages for missing routes:

```bash
# Services
mkdir -p app/(marketing)/twinedge && echo 'export default function Page() { return <div>TwinEDGE - Coming Soon</div> }' > app/(marketing)/twinedge/page.tsx
mkdir -p app/(marketing)/intelledge && echo 'export default function Page() { return <div>IntellEDGE - Coming Soon</div> }' > app/(marketing)/intelledge/page.tsx

# Resources
mkdir -p app/(marketing)/case-studies && echo 'export default function Page() { return <div>Case Studies - Coming Soon</div> }' > app/(marketing)/case-studies/page.tsx
mkdir -p app/(marketing)/resources && echo 'export default function Page() { return <div>Resources - Coming Soon</div> }' > app/(marketing)/resources/page.tsx
mkdir -p app/(marketing)/events && echo 'export default function Page() { return <div>Events - Coming Soon</div> }' > app/(marketing)/events/page.tsx
mkdir -p app/(marketing)/faq && echo 'export default function Page() { return <div>FAQ - Coming Soon</div> }' > app/(marketing)/faq/page.tsx
```

---

## Files to Modify

| File | Changes Needed |
|------|----------------|
| `app/(marketing)/contact/page.tsx` | Change `href="#"` to actual booking link |
| `app/(marketing)/about/page.tsx` | Add actual email links for team members |
| `app/sign-in/page.tsx` | Either implement Microsoft SSO or remove button |
| `components/shared/footer.tsx` | Update social links, phone number |
| `components/marketing/cta-section.tsx` | Update phone number |

---

*Generated by /analyst workflow*
