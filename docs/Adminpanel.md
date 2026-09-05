Perfect. That's the best way to do it.

We'll write this as if it's a real engineering specification handed to a team of senior software engineers. Every future decision should be derivable from this document.

---

# **EKDRISHTI CMS & ADMIN PANEL**

## **Master Software Requirements Specification (SRS)**

**Version:** 1.0

**Document Type:** Software Requirements Specification + Architecture Guide + Development Handbook

**Project:** EkDrishti Digital Marketing Agency Website CMS

**Website:** [https://www.ekdrishti.com](https://www.ekdrishti.com)

---

# PART 1

---

# 1. Executive Summary

## 1.1 Purpose

The purpose of this project is to transform the existing EkDrishti website from a largely developer-managed application into a production-grade, modular Content Management System (CMS) specifically designed for the operational workflow of a digital marketing agency.

The finished system should allow non-technical administrators to manage the entire website—including case studies, portfolio content, images, galleries, SEO metadata, contact inquiries, and future content types—without requiring source code changes or redeployments for routine content updates.

This is **not** intended to be a generic admin dashboard. It should be architected as a custom CMS tailored to EkDrishti's current and future business requirements.

The architecture must prioritize long-term maintainability, scalability, and developer experience while remaining simple enough for daily administrative use.

---

# 1.2 Primary Objectives

The system shall satisfy the following high-level objectives:

* Provide complete control over all Case Studies.
* Eliminate hardcoded content wherever possible.
* Allow administrators to create pages without developer intervention.
* Support dynamic modular sections.
* Optimize every uploaded media asset automatically.
* Maintain clean AWS S3 storage.
* Preserve frontend performance.
* Be highly scalable.
* Be maintainable by future developers.
* Avoid unnecessary architectural complexity.

---

# 1.3 Long-Term Vision

The architecture should be designed with the assumption that EkDrishti will continue expanding over several years.

Future additions may include:

* Blog CMS
* Team Management
* Career Portal
* Client Portal
* Service Pages
* Testimonials
* Lead Management
* CRM Integration
* Newsletter System
* AI-assisted content generation
* Analytics Dashboard
* User Roles
* Workflow Approval
* Multi-language support

The system should be capable of supporting these additions with minimal architectural changes.

---

# 2. Core Philosophy

Every engineering decision must satisfy these principles.

---

## Principle 1

### Simplicity Over Complexity

Do not introduce complex abstractions when a simple implementation solves the problem effectively.

Avoid unnecessary design patterns.

Avoid excessive nesting.

Avoid "clever" code.

Readable code is better than impressive code.

---

## Principle 2

### Modular Architecture

Every feature should exist independently.

Example:

Gallery

should not depend on

Video

Video

should not depend on

Hero

Each module should be reusable.

---

## Principle 3

### Reusability

Never duplicate logic.

If similar functionality already exists, reuse or extend it.

Shared utilities should remain centralized.

---

## Principle 4

### Configuration Over Hardcoding

Anything likely to change in the future should be configurable rather than hardcoded.

Examples:

Good:

```
Hero Section

↓

Database

↓

Render
```

Bad:

```
Hero Text

↓

Hardcoded React Component
```

---

## Principle 5

### Schema Driven Rendering

The frontend should not know individual page structures.

Instead it should render based on data.

Example

```
Sections

↓

Loop

↓

Render Component
```

instead of

```
if page == case

render Hero

render Gallery

render Video

render CTA
```

---

## Principle 6

### Developer Experience

Future developers should understand the project quickly.

The project should feel organized.

Every file should have a purpose.

Every folder should have a reason.

---

# 3. Mandatory First Rule

## NO CODING BEFORE AUDIT

This is the most important rule.

Before writing a single line of implementation code:

The entire repository must be inspected.

No assumptions are allowed.

The audit determines the implementation.

Never implement based on guesses.

---

# 4. Repository Audit

The first deliverable of this project is NOT code.

It is knowledge.

The AI Agent must scan and understand the repository.

The audit should include:

---

## Frontend

Determine:

Framework

Version

Folder structure

Routing

Components

Pages

State management

Shared utilities

Animations

Theme

Image rendering

SEO implementation

Forms

Validation

API communication

Current bottlenecks

---

## Backend

Determine:

Framework

Controllers

Services

Database

ORM

Authentication

Uploads

Middleware

Validation

Caching

Environment configuration

Logging

Error handling

---

## Database

Identify

Collections

Relationships

Indexes

Naming conventions

Constraints

Performance concerns

Future scalability

---

## AWS

Determine

Bucket Structure

Upload Flow

Deletion Flow

Compression

CDN

Image formats

Existing optimization

---

## Admin

Determine

Current implementation

Authentication

Permissions

Existing CRUD

Dashboard

Reusable Components

---

## Contact System

Inspect

Current implementation

Frontend

Backend

Email Provider

Resend configuration

SMTP

Validation

Spam protection

Reason for failure

---

# 5. Audit Deliverables

After the audit the AI must produce a report containing

## Architecture Summary

Explain

Current architecture

Data flow

Folder structure

Major modules

External services

---

## Strengths

List

What is already well implemented

Reusable components

Clean architecture

Useful utilities

---

## Weaknesses

List

Duplicate logic

Poor abstractions

Technical debt

Scalability issues

Performance issues

Dead code

Unused dependencies

---

## Risks

Explain

Potential migration risks

Breaking changes

Refactoring risks

Database risks

Deployment risks

---

## Implementation Recommendation

State

Which features can be implemented directly

Which require refactoring

Which require architecture changes

Which should be postponed

---

## Final Recommendation

The audit should conclude with a recommended roadmap.

Only after approval may implementation begin.

---

# 6. Development Standards

The following standards apply to the entire project.

These rules override personal coding preferences.

---

## Clean Code

Write readable code.

Avoid deeply nested logic.

Avoid magic numbers.

Avoid meaningless variable names.

Prefer descriptive naming.

---

## Maintainability

Optimize for future maintenance rather than short-term development speed.

---

## Scalability

Every new feature should be capable of future expansion.

Avoid one-off implementations.

---

## Performance

Avoid unnecessary re-renders.

Avoid unnecessary API requests.

Avoid unnecessary database queries.

Lazy load where appropriate.

Optimize images.

Optimize bundles.

---

## Reliability

Every feature should fail gracefully.

Never crash the application due to malformed data.

---

# 7. Anti-Hallucination Rules (Critical)

The AI agent **must never fabricate project details**.

If something is not verified from the repository, it must not be presented as fact.

### Never invent:

* Files
* Directories
* Components
* APIs
* Database tables
* Collections
* Environment variables
* S3 bucket structure
* Authentication flow
* Routes
* Deployment configuration
* Existing utilities
* Third-party services

If an implementation depends on a missing or unknown detail, the agent must explicitly state:

> "Unable to verify this from the current codebase. This should be confirmed before implementation."

No assumptions are permitted.

---

# 8. Change Management Rules

Before modifying any existing file:

1. Explain why the file needs to change.
2. List other files that depend on it.
3. Describe any potential side effects.
4. Prefer extending existing functionality rather than rewriting it.
5. Keep changes as localized as possible.
6. Preserve backward compatibility unless a redesign is explicitly approved.

Every significant architectural change should be justified in terms of maintainability, scalability, or correctness.

---

# 9. Project Memory (Mandatory)

A living documentation file named **`PROJECT_MEMORY.md`** must be maintained throughout the project.

It is the single source of truth for future development.

It must be updated **after every completed phase**.

It should include:

* Current architecture overview
* Folder structure
* Database schema summary
* API inventory
* Component hierarchy
* Shared utilities
* AWS S3 folder structure
* Image processing pipeline
* Dynamic section architecture
* Contact system architecture
* Admin panel modules
* Environment variables (names only, never secrets)
* Third-party integrations
* Coding conventions
* Important design decisions
* Known issues
* Technical debt
* Completed milestones
* Pending work
* Future enhancement ideas

The goal is that future contributors can begin by reading `PROJECT_MEMORY.md` instead of re-auditing the repository.

---

# END OF PART 1

**Part 2** will cover:

* Complete CMS Architecture
* Database Design
* Dynamic Section Builder
* Section Schema
* Toggle System
* Drag-and-Drop Ordering
* Live Preview Architecture
* Component Design
* API Design for Case Studies

This is where the actual CMS architecture begins, and it will be significantly more detailed than Part 1.


# EKDRISHTI CMS & ADMIN PANEL

## Master Software Requirements Specification (SRS)

**Version:** 1.0

**Project:** EkDrishti Digital Marketing Agency Website CMS

**Website:** [https://www.ekdrishti.com](https://www.ekdrishti.com)

---

# PART 2

# CMS ARCHITECTURE & DYNAMIC CONTENT ENGINE

---

# 10. CMS Philosophy

The CMS is the heart of the website.

The objective is to completely separate **content** from **presentation**.

The frontend should only be responsible for rendering.

The Admin Panel should only be responsible for managing content.

The Backend should only be responsible for storing, validating and serving content.

This separation of concerns ensures:

* Scalability
* Easy maintenance
* Easy redesign
* Better debugging
* Better testing
* Future extensibility

---

# 11. High-Level Architecture

The complete architecture should follow this flow.

```text
                Administrator

                      │

                      ▼

              Admin Panel (React)

                      │

            Authenticated API Calls

                      │

                      ▼

             Backend API (Node.js)

                      │

      ┌───────────────┴───────────────┐

      ▼                               ▼

 MongoDB / Database              AWS S3 Storage

      │                               │

      └───────────────┬───────────────┘

                      ▼

            Public Website (React)

                      │

               Visitor sees content
```

The website itself should **never contain hardcoded project data**.

---

# 12. CMS Design Goals

The CMS must satisfy the following requirements.

### Flexibility

Every case study should be unique.

No assumptions should exist about page structure.

---

### Extensibility

New section types should be addable without redesigning the database.

---

### Maintainability

Adding a feature should not require editing dozens of files.

---

### Predictability

Every Case Study should follow the same internal data structure.

---

### Stability

The CMS should tolerate incomplete data gracefully.

Example

If Gallery is disabled

↓

Website still renders perfectly.

---

# 13. Case Study Data Model

Every Case Study should be treated as an independent entity.

Example attributes:

```
Case Study

ID

Title

Slug

Category

Client

Industry

Short Description

Status

Featured

Created At

Updated At

SEO

Sections[]

Analytics

Media
```

The important part is **Sections[]**

Everything else is metadata.

---

# 14. The Section Engine

The website must not have fixed layouts.

Instead every page consists of an ordered array of sections.

Example

```
Case Study

Sections

↓

Hero

↓

Overview

↓

Grid

↓

Gallery

↓

Video

↓

Testimonials

↓

CTA
```

The frontend simply loops over this array.

It should never contain page-specific rendering logic.

---

# 15. Why Sections Instead of Hardcoded Pages?

Traditional approach

```
ProjectPage.jsx

↓

Hero

↓

Overview

↓

Grid

↓

Gallery

↓

Video

↓

CTA
```

Problem

Every change requires code.

Instead

```
Database

↓

Sections

↓

Frontend Renderer

↓

Done
```

This is significantly more scalable.

---

# 16. Generic Section Structure

Every section should follow a consistent schema.

Every section contains:

```
Section

ID

Type

Enabled

Order

Title

Content

Settings

Metadata
```

This consistency makes the renderer extremely simple.

---

# 17. Supported Initial Section Types

The CMS should initially support:

### Hero

---

### Rich Text

---

### Project Overview

---

### Services

---

### Process

---

### 5 Image Grid

---

### Gallery

---

### Video

---

### Statistics

---

### Timeline

---

### Testimonials

---

### FAQ

---

### CTA

---

### Quote

---

### Results

---

### Awards

---

### Client Feedback

---

### Custom Section

---

Future section types should require minimal backend changes.

---

# 18. Toggle System

Every section must contain

```
Enabled

true

or

false
```

Example

```
Hero

Enabled

✓

Gallery

Enabled

✕

Video

Enabled

✓
```

Frontend

```
Hero

↓

Video
```

Gallery disappears completely.

No spacing.

No placeholder.

No layout shift.

---

# 19. Section Ordering

Every section stores its own order.

Example

```
Hero

1

Gallery

2

Video

3

CTA

4
```

Frontend sorts by order.

Nothing is hardcoded.

---

# 20. Drag & Drop

Admin should simply drag sections.

Example

```
Hero

↓

Gallery

↓

Video

↓

Testimonials
```

Administrator drags

Testimonials

to second position.

Saved order

```
Hero

Testimonials

Gallery

Video
```

Frontend instantly reflects new arrangement.

---

# 21. Section Builder

One of the most important features.

Instead of

```
Add Hero

Add Gallery

Add Video
```

The admin should have

```
Add Section
```

Click

↓

Select Type

↓

Configure

↓

Done

This makes the CMS future-proof.

---

# 22. Custom Sections

A Case Study should never be limited by predefined sections.

Administrator should be able to create entirely new layouts.

Examples

Large Image + Text

Three Column Grid

Image Left Text Right

Image Right Text Left

Split Layout

Feature Cards

Comparison Table

Callout Banner

Client Logos

Custom HTML (optional and sanitized)

The architecture should support adding these without redesigning the CMS.

---

# 23. Section Isolation

Every section must function independently.

Gallery should never depend on Video.

Video should never depend on Hero.

Hero should never depend on CTA.

Independent modules reduce bugs.

---

# 24. Live Preview Philosophy

The preview inside Admin should be the exact same component used on the public website whenever feasible.

Avoid duplicate rendering logic.

Example

```
Website

Hero.jsx
```

Admin Preview

```
Hero.jsx
```

Same component.

Different data source.

---

# 25. WYSIWYG Editing

Changes should be immediately visible.

Administrator edits

↓

Title

↓

Preview updates.

Administrator uploads image

↓

Preview updates.

Administrator pastes YouTube URL

↓

Preview updates.

No save-refresh cycle should be required for previewing.

---

# 26. Hero Section Requirements

Editable fields include:

* Main Heading
* Sub Heading
* Description
* Background Image
* Foreground Image
* Client Name
* Industry
* CTA Button
* CTA Link
* Tags
* Theme Variant
* Visibility
* Animation Settings (optional)

Nothing should be hardcoded.

---

# 27. Rich Text Section

Replace plain textareas with a proper rich text editor.

Support

* Bold
* Italic
* Underline
* Lists
* Links
* Headings
* Tables
* Images
* Quotes
* Code Blocks (optional)

Store clean, sanitized output.

---

# 28. Five Image Grid

The custom five-image layout is a core branding element.

Structure:

```
Horizontal Image 1

Horizontal Image 2

Vertical Image 1

Vertical Image 2

Vertical Image 3
```

Requirements:

* Upload
* Replace
* Remove
* Preview
* Drag to replace
* Validation
* Alt Text
* Image Order Locking

The preview should exactly match the frontend.

---

# 29. Gallery Section

Support

* Unlimited images
* Drag reorder
* Delete
* Replace
* Bulk upload
* Captions
* Alt text
* Lazy loading compatibility
* Preview

Future support

* Masonry Layout
* Lightbox
* Video items

---

# 30. Video Section

Administrator pastes a YouTube URL.

System automatically:

* Validates URL
* Converts to embed format
* Generates preview
* Stores normalized URL

If disabled, the section is omitted from rendering.

---

# 31. Reusable Renderer

The frontend should contain one central renderer.

Conceptually:

```
Loop through sections

↓

Determine section type

↓

Render corresponding component

↓

Continue
```

Avoid page-specific rendering logic scattered throughout the application.

---

# 32. Error Tolerance

If one section contains invalid data:

* Skip that section if safe to do so.
* Log the issue.
* Continue rendering the remaining sections.

A single malformed section must not break the entire page.

---

# 33. Validation Rules

Each section type should define its own validation requirements.

Examples:

* Hero requires a title.
* Video requires a valid YouTube URL.
* Image Grid requires exactly five mapped images.
* Gallery requires at least one image if enabled.

Validation should occur both client-side and server-side.

---

# 34. Versioning (Recommended)

Consider storing lightweight revision history for case studies.

Benefits:

* Recover accidental edits.
* Compare changes.
* Roll back if needed.

Even if full version control is deferred, design the data model so it can support revisions later without major restructuring.

---

# 35. Acceptance Criteria for the CMS

The CMS architecture is considered complete when:

* Every case study is data-driven.
* No project content is hardcoded.
* Sections are modular.
* Sections can be enabled/disabled.
* Sections can be reordered.
* New section types can be introduced with minimal architectural changes.
* Live previews accurately reflect frontend output.
* Rendering remains stable even when sections are missing or disabled.
* The frontend acts as a generic renderer rather than a collection of page-specific templates.

---

# END OF PART 2

**Part 3** will cover the **Media Management System**, including:

* Complete AWS S3 architecture
* Image compression pipeline
* WebP/AVIF conversion
* File naming conventions
* Folder hierarchy
* Image replacement and deletion
* Metadata management
* Upload lifecycle
* CDN/cache considerations
* Admin media library
* Performance optimization
* Security for uploads
* Acceptance criteria for the media subsystem

This will be one of the most detailed sections because it's central to your CMS workflow.

### EKDRISHTI CMS & ADMIN PANEL

### Master Software Requirements Specification (SRS)

Version: 1.0

Project: EkDrishti Digital Marketing Agency Website CMS

Website: [https://www.ekdrishti.com](https://www.ekdrishti.com)

### PART 3

### MEDIA MANAGEMENT SYSTEM, AWS S3 ARCHITECTURE & IMAGE PIPELINE

### 36. Media System Philosophy

The media system is one of the most critical components of the CMS.

Every image uploaded through the Admin Panel must automatically become a production-ready web asset without requiring any manual optimization from the administrator.

The administrator should only think about content, not file sizes, formats, compression settings, or storage structure.

The system must guarantee:

* Consistent image quality

* Fast website loading

* Clean AWS S3 organization

* Predictable file naming

* Easy debugging

* Easy replacement

* Easy deletion

* No orphaned files

* Future scalability

### 37. High-Level Upload Flow

Every upload must follow this exact lifecycle.

```
Admin Selects File
        │
        ▼
Client-side Validation
        │
        ▼
Temporary Preview
        │
        ▼
Upload Request to Backend
        │
        ▼
Server-side Validation
        │
        ▼
Image Processing Pipeline
        │
        ├─ Remove metadata
        ├─ Auto rotate
        ├─ Resize if needed
        ├─ Compress
        ├─ Convert to production format
        └─ Generate thumbnail (optional)
        │
        ▼
Upload to AWS S3
        │
        ▼
Save Metadata in Database
        │
        ▼
Return Final Asset URL
        │
        ▼
Update Live Preview
```

At no point should the original unoptimized file be served to website visitors.

### 38. Supported Upload Types

Initially support:

### Images

* JPG

* JPEG

* PNG

* WebP

* AVIF (optional if already used)

### Future Support

* SVG (sanitized only)

* MP4

* WebM

* PDF

* GIF (discouraged for performance reasons)

Unsupported file types must be rejected immediately.

### 39. Client-Side Validation

Before uploading, validate:

* File type

* File size

* Image dimensions

* Corrupted files

Example limits:

* Max file size: 20 MB

* Min dimensions: 400x400

* Max dimensions: 8000x8000

The goal is to avoid unnecessary uploads of invalid assets.

### 40. Server-Side Validation

Client validation is not sufficient.

The backend must independently verify:

* MIME type

* Actual file signature

* File size

* Image integrity

* Processing compatibility

Never trust client-provided metadata.

### 41. Production Image Format

The website is already using a production format (to be confirmed during audit).

The pipeline must convert every uploaded image to that format.

### Preferred

* WebP

### Future Consideration

* AVIF for high-performance browsers

The original upload should not be used for frontend rendering.

### 42. Compression Strategy

The objective is to achieve the best balance between visual quality and file size.

Recommended approach:

* Quality target: 75–85

* Preserve sharpness

* Remove unnecessary metadata

* Strip EXIF data

* Optimize chroma subsampling

Compression settings should be centralized in a single configuration file so they can be adjusted globally later.

### 43. Automatic Rotation

Many images uploaded from phones contain orientation metadata.

The pipeline must automatically rotate images to the correct orientation and then remove the orientation metadata to prevent browser inconsistencies.

### 44. Resizing Rules

Images should only be resized when they exceed the maximum useful dimensions for the website.

Example strategy:

* Hero images: max 2400px wide

* Grid images: max 1600px wide

* Gallery images: max 1800px wide

* Thumbnails: 400px wide

Do not upscale smaller images.

### 45. Thumbnail Generation

For gallery views and admin previews, generate lightweight thumbnails.

Example:

* Original optimized image

* Thumbnail version

This improves admin panel performance and reduces bandwidth usage.

### 46. AWS S3 Bucket Structure

The bucket must remain clean and predictable.

Recommended structure:

```
ekdrishti/
└── case-studies/
    └── project-slug/
        ├── hero/
        ├── image-grid/
        ├── gallery/
        ├── seo/
        ├── thumbnails/
        └── temp/ (optional)
```

Example:

```
ekdrishti/
└── case-studies/
    └── tata-power/
        ├── hero/
        │   └── hero.webp
        ├── image-grid/
        │   ├── horizontal-1.webp
        │   ├── horizontal-2.webp
        │   ├── vertical-1.webp
        │   ├── vertical-2.webp
        │   └── vertical-3.webp
        ├── gallery/
        │   ├── gallery-01.webp
        │   ├── gallery-02.webp
        │   └── gallery-03.webp
        ├── seo/
        │   └── og-image.webp
        └── thumbnails/
            ├── gallery-01-thumb.webp
            └── gallery-02-thumb.webp
```

This structure makes debugging and manual inspection extremely easy.

### 47. File Naming Conventions

File names must be deterministic.

### Good

* hero.webp

* horizontal-1.webp

* gallery-01.webp

* og-image.webp

### Bad

* IMG_9382.webp

* final-final-v2.webp

* screenshot (1).png

Deterministic naming prevents duplicate assets and simplifies replacement logic.

### 48. Image Mapping Rules

Each upload field must automatically know its destination.

Example mappings:

| Field             | S3 Path                      |
| ----------------- | ---------------------------- |
| Hero Image        | hero/hero.webp               |
| Grid Horizontal 1 | image-grid/horizontal-1.webp |
| Grid Vertical 2   | image-grid/vertical-2.webp   |
| Gallery Image     | gallery/gallery-XX.webp      |
| OG Image          | seo/og-image.webp            |

The administrator should never manually choose storage paths.

### 49. Temporary Uploads

During editing, uploads should be stored temporarily until the case study is saved.

Flow:

```
Upload
→ temp/
→ Preview
→ Save Case
→ Move to final location
```

This prevents orphaned files when an admin abandons an editing session.

### 50. Image Replacement

Replacing an image must perform these steps atomically:

1. Upload new processed image.

2. Verify successful upload.

3. Delete old S3 object.

4. Update database metadata.

5. Return new URL.

6. Refresh preview.

Never delete the old file before the new one is confirmed uploaded.

### 51. Image Deletion

Deleting an image should:

* Remove the S3 object

* Remove thumbnail(s)

* Remove database metadata

* Update section data

* Update preview state

If deletion fails, the database should not enter an inconsistent state.

### 52. Case Study Deletion

Deleting a case study should trigger a cleanup job that removes:

* Entire S3 folder

* All thumbnails

* All metadata records

* Any temporary uploads associated with the case

No unused assets should remain in storage.

### 53. Media Metadata Model

Each media asset should store:

* ID

* Case Study ID

* Section ID

* Field Name

* Original Filename

* S3 Key

* Public URL

* Thumbnail URL

* Width

* Height

* File Size

* MIME Type

* Alt Text

* Caption

* Display Order

* Uploaded By

* Uploaded At

This metadata enables future features such as media search and analytics.

### 54. Alt Text Requirements

Alt text is mandatory for all public-facing images.

Rules:

* Must be editable in the admin panel.

* Should default to a sensible generated value.

* Should be included in frontend rendering.

* Should be stored with the media metadata.

This improves accessibility and SEO.

### 55. Admin Media Library

The admin panel should include a dedicated media management area.

Features:

* View all assets

* Search by filename

* Filter by case study

* Filter by section

* Sort by upload date

* View dimensions

* View file size

* Copy public URL

* Replace asset

* Delete asset

This becomes increasingly important as the site grows.

### 56. Upload Security

The upload system must protect against malicious files.

Requirements:

* Verify MIME type

* Verify file signature

* Reject executable files

* Sanitize SVGs if supported

* Limit file size

* Rate limit uploads

* Require authentication

* Log upload activity

Never rely solely on file extensions.

### 57. Performance Considerations

The media system should minimize bandwidth usage.

### Frontend

* Lazy load gallery images

* Use responsive image sizes

* Use modern formats

* Avoid loading full-size images in thumbnails

### Admin Panel

* Use thumbnails for previews

* Load full image only on demand

* Paginate large galleries

### 58. CDN & Cache Strategy

If CloudFront or another CDN is used, design the system so cache invalidation is possible when assets are replaced.

Asset URLs should be stable, but replacement should trigger cache refresh where necessary.

### 59. Logging & Monitoring

Log:

* Upload started

* Upload completed

* Processing failed

* S3 upload failed

* Deletion failed

* Replacement completed

Logs should include:

* User ID

* Case Study ID

* File name

* Timestamp

* Error details

This is essential for debugging production issues.

### 60. Future Enhancements

The architecture should support:

* AVIF generation

* Multiple responsive sizes

* AI-generated alt text

* Image cropping

* Focus point selection

* Watermarking

* Bulk optimization of legacy assets

* Duplicate image detection

* Storage usage analytics

Design the current system so these can be added later without major refactoring.

### 61. Acceptance Criteria

The media subsystem is considered complete when:

* Every upload is automatically optimized.

* The production format is generated automatically.

* S3 folders remain clean and deterministic.

* Replacing images safely removes old assets.

* Deleting a case removes all associated media.

* Metadata is stored for every asset.

* Admin previews are fast and accurate.

* No orphaned files remain after failed or abandoned edits.

* Uploads are secure and validated.

* Frontend performance remains optimized.

### END OF PART 3

Part 4 will cover the Admin Panel architecture, including:

* Authentication & authorization

* Dashboard structure

* Navigation system

* Case Study editor UI

* Section management interface

* Drag-and-drop implementation strategy

* Live preview integration

* Contact form management dashboard

* Analytics & insights

* Activity logs

* User experience standards

* Error handling

* Autosave & draft system

* Revision history

* Acceptance criteria for the admin subsystem


# EKDRISHTI CMS & ADMIN PANEL

## Master Software Requirements Specification (SRS)

**Version:** 1.0

**Project:** EkDrishti Digital Marketing Agency Website CMS

**Website:** [https://www.ekdrishti.com](https://www.ekdrishti.com)

---

# PART 4

# ADMIN PANEL ARCHITECTURE, DASHBOARD & USER EXPERIENCE

---

# 62. Admin Panel Philosophy

The Admin Panel is the operational control center of the entire EkDrishti website.

It should not feel like a collection of forms.

It should feel like a professional CMS similar to:

* Webflow
* Shopify Admin
* Payload CMS
* Sanity
* Strapi
* Notion
* WordPress Gutenberg (only in terms of usability)

The administrator should be able to manage the entire website without touching code.

The UI should prioritize:

* Simplicity
* Speed
* Discoverability
* Consistency
* Accessibility
* Predictability

---

# 63. Core Design Principles

The Admin Panel should follow these principles.

### Rule 1

Everything should be within three clicks.

---

### Rule 2

Every important action should provide immediate visual feedback.

---

### Rule 3

Never surprise the administrator.

Every destructive action should require confirmation.

---

### Rule 4

The interface should guide users rather than relying on documentation.

---

### Rule 5

Avoid modal overload.

Prefer side panels or inline editing where appropriate.

---

# 64. Authentication

The admin panel must be protected.

Requirements:

* Secure login
* Session management
* Authentication middleware
* Protected routes
* Automatic logout on expired sessions
* Secure password storage
* Environment-based secrets

Future support:

* Two-factor authentication
* OAuth
* Multiple administrators

---

# 65. Authorization

Design the architecture to support roles, even if only one role exists initially.

Future roles:

* Super Admin
* Administrator
* Content Manager
* Editor
* Viewer

Permissions should be extensible.

---

# 66. Admin Dashboard

The dashboard is the landing page after login.

It should provide an immediate overview of website activity.

Widgets may include:

## Website

* Total Case Studies
* Published
* Drafts
* Archived

---

## Contact Forms

* Today's Leads
* Weekly Leads
* Monthly Leads
* Unread
* Pending Replies

---

## Media

* Total Images
* Storage Used
* Recent Uploads

---

## Activity

* Recently Edited Case Studies
* Recently Published Projects
* Recent Upload Failures

---

## System

* Backend Status
* Database Status
* Email Status
* AWS Status

These widgets should update dynamically.

---

# 67. Navigation Structure

The sidebar should remain clean and organized.

Suggested navigation:

```text
Dashboard

Case Studies

Media Library

Contact Forms

SEO

Users (Future)

Settings

Logs

Project Memory

System Health
```

Avoid deep nested menus.

---

# 68. Case Study Listing

The Case Studies page should support:

* Search
* Sort
* Filter
* Pagination
* Status badges
* Featured badge
* Last modified
* Created date
* Duplicate
* Delete
* Publish
* Archive

Bulk actions should be supported.

---

# 69. Case Study Editor

The editor is the most important screen in the CMS.

The layout should prioritize productivity.

Recommended layout:

```text
--------------------------------------------

Title

Slug

Category

Status

SEO

--------------------------------------------

Sections

--------------------------------------------

Preview

--------------------------------------------
```

The editor should minimize scrolling where possible.

---

# 70. Autosave

The editor should automatically save progress.

Requirements:

* Detect unsaved changes
* Save periodically
* Display save status

Example:

Saving...

↓

Saved

↓

All changes saved

Never lose work due to accidental refreshes.

---

# 71. Draft System

Every Case Study should support:

Draft

↓

Review

↓

Published

↓

Archived

Drafts should never appear on the public website.

---

# 72. Publishing Workflow

Publishing should perform validation.

Example checks:

* Missing title
* Missing slug
* Missing hero image
* Invalid SEO
* Broken YouTube links
* Missing required sections

If validation fails, explain the problem clearly.

---

# 73. Duplicate Case Study

One-click duplication.

Useful when creating similar projects.

Duplicate should include:

* Sections
* Images (references)
* SEO
* Metadata

Slug must be regenerated.

---

# 74. Section Management UI

The editor should display sections visually.

Example:

```text
Hero

Overview

Gallery

Video

Testimonials

CTA
```

Each section should include:

* Toggle
* Edit
* Delete
* Duplicate
* Move Up
* Move Down

Or preferably drag-and-drop.

---

# 75. Add Section Experience

Administrator clicks:

Add Section

↓

Section Library opens.

Choose:

Hero

↓

Gallery

↓

Video

↓

Quote

↓

Timeline

↓

Custom

↓

Create

This makes the CMS scalable.

---

# 76. Live Preview Panel

The preview should update immediately after edits.

Requirements:

* Responsive preview
* Exact frontend rendering
* Toggle desktop/mobile view
* Preview hidden sections
* Preview drafts

No page refresh should be required.

---

# 77. Unsaved Changes Protection

If the administrator attempts to leave the page with unsaved changes:

Display confirmation.

Prevent accidental data loss.

---

# 78. Rich Text Editing

Replace plain textareas.

Support:

* Headings
* Paragraphs
* Lists
* Links
* Tables
* Images
* Quotes

Store clean, sanitized content.

---

# 79. Image Upload Experience

Administrator should be able to:

* Drag & Drop
* Browse
* Replace
* Remove
* Crop (future)
* Preview
* Reorder

Display upload progress.

Display processing progress.

Display success/failure.

---

# 80. Five Image Grid Editor

Instead of uploading blindly,

display the actual layout.

Example:

```
-----------------------

 Horizontal 1

-----------------------

 Horizontal 2

-----------------------

Vertical 1

Vertical 2

Vertical 3

-----------------------
```

Each placeholder should show:

* Existing image
* Replace button
* Remove button

---

# 81. Gallery Manager

Features:

* Multiple upload
* Bulk delete
* Drag reorder
* Captions
* Alt text
* Preview

Future:

* Video support

---

# 82. YouTube Manager

Administrator pastes URL.

System automatically:

* Validates
* Converts
* Embeds
* Previews

Invalid URLs should produce friendly errors.

---

# 83. Contact Form Management

Every submission must be stored.

Administrator can:

View

↓

Search

↓

Reply

↓

Mark Read

↓

Delete

↓

Archive

This transforms the contact form into a lightweight CRM.

---

# 84. Contact Details Screen

Display:

* Name
* Email
* Phone
* Company
* Subject
* Message
* Submission Time
* IP (optional)
* Browser (optional)
* Status

Support notes for future internal use.

---

# 85. Email Analytics

Dashboard should display:

Total submissions

↓

Today's

↓

Weekly

↓

Monthly

↓

Read

↓

Unread

↓

Replied

↓

Pending

↓

Delivery failures

Graphs may be added later.

---

# 86. Activity Log

Maintain an audit trail.

Examples:

Admin logged in.

Case Study created.

Gallery updated.

Image replaced.

Contact deleted.

SEO updated.

Publish completed.

Each entry should contain:

User

Timestamp

Action

Affected resource

Outcome

---

# 87. Notifications

Display friendly notifications.

Examples:

Case Study Saved.

↓

Gallery Updated.

↓

Upload Failed.

↓

SEO Updated.

↓

Email Sent.

Never leave administrators guessing.

---

# 88. Error Handling

Errors should be understandable.

Bad:

Unknown Error

Good:

Unable to upload image because AWS credentials are invalid.

Provide actionable feedback.

---

# 89. Loading States

Every asynchronous operation should display progress.

Examples:

Loading...

Uploading...

Compressing...

Publishing...

Deleting...

Avoid blank screens.

---

# 90. Empty States

If no Case Studies exist,

show:

Create your first Case Study.

If no Contact Forms exist,

show:

No submissions yet.

Avoid empty white pages.

---

# 91. Accessibility

The Admin Panel should support:

* Keyboard navigation
* Proper focus management
* Accessible labels
* Contrast compliance
* Screen reader compatibility where practical

---

# 92. Responsive Design

Primary target:

Desktop

Secondary target:

Tablet

Mobile editing is optional but should remain functional for emergency use.

---

# 93. Settings Page

Future configuration options:

Website settings

↓

SEO defaults

↓

SMTP

↓

AWS

↓

API Keys

↓

Analytics

↓

Brand settings

Never hardcode configurable values.

---

# 94. System Health Dashboard

Display:

Database

↓

AWS S3

↓

Email Service

↓

Backend API

↓

Storage Usage

↓

Version

↓

Environment

Useful for debugging deployments.

---

# 95. Project Memory Viewer

Inside the Admin Panel (or internal developer tools), include access to `PROJECT_MEMORY.md` or an equivalent documentation interface so developers can quickly reference:

* Architecture
* APIs
* Folder structure
* Decisions
* Known issues

This reinforces the documentation-first approach.

---

# 96. Acceptance Criteria

The Admin Panel is considered complete when:

* Administrators can manage the entire website without editing code.
* All major actions provide immediate feedback.
* Live preview reflects the public website accurately.
* Drafts and publishing workflows are reliable.
* Contact submissions are fully manageable.
* Media uploads are intuitive and performant.
* The interface is organized, predictable, and easy to learn.
* Error handling is informative.
* Activity logging is available.
* The architecture supports future expansion without major redesign.

---

# END OF PART 4

**Part 5** will cover:

* Contact Form Investigation & Nodemailer Migration
* Email Architecture
* Backend API Design
* Database Collections
* Analytics Engine
* SEO System
* Security Standards
* Performance Optimization
* Logging
* Monitoring
* Testing Strategy
* Production Deployment
* Rollback Procedures
* Disaster Recovery
* Definition of Done

This next part ties together the backend infrastructure and operational requirements that support the CMS.


# EKDRISHTI CMS & ADMIN PANEL

## Master Software Requirements Specification (SRS)

**Version:** 1.0

**Project:** EkDrishti Digital Marketing Agency Website CMS

**Website:** [https://www.ekdrishti.com](https://www.ekdrishti.com)

---

# PART 5A

# BACKEND ARCHITECTURE, CONTACT SYSTEM & EMAIL INFRASTRUCTURE

---

# 97. Backend Philosophy

The Backend is the **single source of truth** for the entire CMS.

The frontend should never contain business logic.

Instead:

```text
Frontend
    │
User Interaction
    │
API Request
    │
Backend
    │
Business Logic
    │
Database
```

The backend exists to guarantee:

* Data integrity
* Security
* Validation
* Performance
* Maintainability
* Scalability
* Predictable APIs

Every request must be validated before reaching the database.

No direct database access should ever originate from the frontend.

---

# 98. Backend Responsibilities

The backend is responsible for:

## Content Management

* Case Studies
* Sections
* Images
* SEO
* Categories
* Tags

---

## Media Management

* Upload validation
* Image optimization
* AWS uploads
* Image deletion
* Thumbnail generation
* Metadata storage

---

## Contact System

* Store submissions
* Send emails
* Spam protection
* Status management
* Admin replies

---

## Authentication

* Login
* Session validation
* Route protection
* Permission checks

---

## System

* Logging
* Monitoring
* Validation
* Error handling
* Health checks

The backend should never become a collection of unrelated endpoints.

It must remain modular.

---

# 99. Recommended Backend Folder Structure

The project should follow feature-based organization instead of placing everything by file type.

Example:

```text
src/

│
├── app/
│
├── config/
│
├── common/
│
│     ├── middleware
│     ├── exceptions
│     ├── filters
│     ├── guards
│     ├── decorators
│     ├── validators
│     ├── interceptors
│     ├── utils
│
├── modules/
│
│     ├── auth/
│     ├── users/
│     ├── case-studies/
│     ├── sections/
│     ├── uploads/
│     ├── media/
│     ├── seo/
│     ├── contacts/
│     ├── analytics/
│     ├── dashboard/
│     ├── settings/
│     ├── logs/
│
├── database/
│
├── jobs/
│
├── providers/
│
├── integrations/
│
└── main
```

Benefits:

* Easier navigation
* Independent modules
* Easier testing
* Easier future migration

---

# 100. Feature Module Standard

Every module should follow a predictable internal structure.

Example:

```text
contacts/

controller

service

repository

dto

schemas

validators

interfaces

constants

types

tests
```

Every module should be self-contained.

A future developer should understand the entire Contact module without opening unrelated folders.

---

# 101. Controller Responsibilities

Controllers should remain extremely thin.

Controllers should NEVER contain:

* business logic
* database logic
* upload logic
* email logic

Controllers only:

* receive requests
* validate DTOs
* call services
* return responses

Example flow

```text
POST

↓

Controller

↓

Validation

↓

Service

↓

Repository

↓

Database
```

Controllers should feel almost "empty."

---

# 102. Service Responsibilities

The Service layer contains business rules.

Examples:

Create Case Study

Validate uniqueness

Generate slug

Process images

Save database

Return response

Every workflow belongs here.

---

# 103. Repository Responsibilities

Repositories isolate database access.

Instead of:

```text
Controller

↓

Mongo Query
```

Use

```text
Controller

↓

Service

↓

Repository

↓

MongoDB
```

Advantages

* Easier testing
* Easier migration
* Centralized queries
* Better maintainability

---

# 104. Dependency Direction

Dependencies should always point inward.

Example

```text
Controller

↓

Service

↓

Repository

↓

Database
```

Never:

```text
Repository

↓

Controller
```

or

```text
Database

↓

Business Logic
```

Circular dependencies should be avoided entirely.

---

# 105. Request Lifecycle

Every API request should follow the same lifecycle.

```text
Client Request

↓

Authentication

↓

Authorization

↓

Rate Limiting

↓

DTO Validation

↓

Business Validation

↓

Business Logic

↓

Database

↓

Logging

↓

Response Formatting

↓

Client Response
```

Consistency reduces bugs dramatically.

---

# 106. Validation Philosophy

Validation happens in multiple layers.

Client validation improves UX.

Backend validation guarantees correctness.

Database constraints provide final protection.

Never rely on only one layer.

---

# 107. Types of Validation

Validation should include:

Required fields

Length

Allowed characters

Email format

Phone format

Slug uniqueness

Image size

YouTube URLs

File MIME

Business rules

Permission checks

Duplicate detection

Cross-field validation

Every validation rule should produce human-readable errors.

---

# 108. Response Standardization

Every API response should follow a consistent format.

Successful response

```json
{
  "success": true,
  "message": "Case Study created successfully.",
  "data": {},
  "meta": {}
}
```

Failed response

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": []
}
```

Avoid inconsistent response shapes.

---

# 109. Error Philosophy

Errors are part of the application.

They should never expose:

* stack traces
* internal paths
* database structure
* environment variables
* secrets

Instead return meaningful explanations.

Example

Bad

```
MongoServerError
```

Good

```
A Case Study with this slug already exists.
```

---

# 110. HTTP Status Standards

Use status codes consistently.

200

Success

201

Created

204

Deleted

400

Validation

401

Unauthorized

403

Forbidden

404

Not Found

409

Conflict

422

Business validation

429

Too Many Requests

500

Unexpected Server Error

Never return 200 for failed operations.

---

# 111. Contact System Philosophy

The Contact Form is far more than a simple email sender.

It is the beginning of a potential client relationship.

Every submission is valuable.

Therefore the system should behave like a lightweight CRM.

Nothing should be lost.

Nothing should depend solely on successful email delivery.

---

# 112. Contact Submission Lifecycle

Every submission follows this workflow.

```text
Visitor

↓

Submit Form

↓

Validate

↓

Store Database

↓

Queue Email

↓

Send Confirmation

↓

Notify Admin

↓

Create Activity Log

↓

Appear in Dashboard

↓

Track Status
```

Database storage must happen before email sending.

---

# 113. Database First Principle

Many websites make this mistake:

```text
Form

↓

Email

↓

Done
```

If email fails,

everything is lost.

Instead:

```text
Form

↓

Database

↓

Email Queue

↓

Retry

↓

Delivered
```

The database is always the primary record.

Emails are secondary.

---

# 114. Contact Status Model

Each inquiry should move through stages.

Example:

```text
New

↓

Unread

↓

Read

↓

Assigned

↓

In Progress

↓

Awaiting Client

↓

Resolved

↓

Archived
```

The dashboard should clearly visualize these statuses.

---

# 115. Contact Collection Schema

Each submission should include:

```text
ID

Full Name

Email

Phone

Company

Website

Subject

Message

Inquiry Type

Budget Range

Preferred Contact

Status

Priority

Tags

Assigned User

Source

Landing Page

Referrer

UTM Parameters

IP Address (optional)

Browser (optional)

Created At

Updated At

Read At

Replied At

Archived At
```

This schema supports future CRM integration without redesign.

---

# 116. Lead Source Tracking

Every submission should capture acquisition context where available.

Examples:

Organic Search

Direct

Referral

LinkedIn

Instagram

Google Ads

Meta Ads

Email Campaign

WhatsApp

Unknown

Future dashboards can then answer:

* Which channel produces the highest-quality leads?
* Which campaigns convert?
* Which landing pages perform best?

---

# 117. UTM Capture

If present, automatically store:

```text
utm_source

utm_medium

utm_campaign

utm_term

utm_content
```

This allows marketing attribution directly within the CMS.

---

# 118. Spam Protection Strategy

Spam prevention should be layered.

Never rely on a single technique.

Recommended defenses:

* Honeypot fields
* Server-side validation
* Rate limiting
* Minimum submission interval
* Duplicate detection
* CAPTCHA (optional/configurable)
* Disposable email detection (future)
* IP reputation (future)

False positives should be minimized.

---

# 119. Duplicate Submission Detection

Prevent accidental repeated submissions.

Example logic:

* Same email
* Same message
* Within a configurable time window

Instead of silently rejecting, return a friendly response indicating that the inquiry has already been received.

---

# 120. Contact Attachments (Future)

Design the architecture to support optional file uploads such as:

* Requirement documents
* PDFs
* Brand guidelines
* Images
* Wireframes

Attachments should follow the same media pipeline, validation, and storage rules defined in Part 3, without requiring architectural changes.

---

# 121. Email Architecture Philosophy

The email system must be independent of the contact system.

The Contact module should request:

> "Send this email."

It should never care whether the provider is:

* Resend
* Nodemailer
* SMTP
* Amazon SES
* SendGrid
* Postmark

This abstraction allows providers to change with minimal code changes.

---

# 122. Email Provider Abstraction

Introduce a dedicated Email Service interface.

```text
Contact Service

↓

Email Service

↓

Provider Adapter

↓

SMTP / Resend / SES
```

Changing providers should require modifying only the adapter, not business logic.

---

# 123. Email Queue Strategy

Never send emails synchronously during the HTTP request if avoidable.

Preferred flow:

```text
Store Submission

↓

Commit Database

↓

Create Email Job

↓

Worker Processes Queue

↓

Retry on Failure

↓

Mark Delivered
```

This improves response time and reliability.

---

# 124. Retry Policy

Transient email failures should be retried automatically.

Example strategy:

* Attempt 1: Immediate
* Attempt 2: 1 minute
* Attempt 3: 5 minutes
* Attempt 4: 15 minutes
* Final Failure: Logged for manual review

Retries should stop for permanent errors such as invalid recipient addresses.

---

# 125. Acceptance Criteria (Backend & Contact System)

This subsystem is considered complete when:

* Every request follows a standardized lifecycle.
* Business logic is isolated from controllers.
* Database access is centralized.
* Contact submissions are never lost.
* Email failures do not lose lead data.
* Spam protection is layered.
* Lead attribution is stored.
* Status workflows support future CRM features.
* Email providers are replaceable without major refactoring.
* All APIs return consistent responses.
* Validation is enforced on every layer.
* Logging exists for every critical backend operation.

---

### **END OF PART 5A**

**Part 5B** will continue with the deepest technical section of the specification:

* Complete REST API Specification
* Every CMS Endpoint
* Database Collections & Relationships
* MongoDB Schema Design
* Indexing Strategy
* Slug Generation
* Transactions
* Draft & Revision Architecture
* Soft Deletes
* Search Engine
* Pagination Standards
* Bulk Operations
* Data Migration Strategy
* Future Multi-language Support

This is where the CMS backend becomes a true enterprise-grade content platform.

Excellent. This is the section that defines the **actual data platform** of the CMS. While Parts 2–4 defined *how the CMS behaves*, Part **5B** defines *how the backend stores, exposes, validates, and manages that data*.

---

# EKDRISHTI CMS & ADMIN PANEL

## Master Software Requirements Specification (SRS)

**Version:** 1.0

**Project:** EkDrishti Digital Marketing Agency Website CMS

---

# PART 5B

# REST API DESIGN, DATABASE ARCHITECTURE & DATA MANAGEMENT

---

# 126. API Philosophy

The API is the communication contract between the frontend and backend.

The frontend should never need to know:

* Database implementation
* Collection structure
* Internal IDs
* Storage providers
* Authentication internals

Instead, every interaction must occur through well-defined endpoints.

The API should be:

* Predictable
* RESTful
* Versionable
* Backward compatible
* Self-documenting
* Secure
* Consistent

---

# 127. API Versioning Strategy

Every endpoint should be versioned from day one.

Example:

```text
/api/v1/
```

Future:

```text
/api/v2/
```

instead of

```text
/api/
```

This allows future improvements without breaking existing clients.

Major breaking changes should always create a new API version.

Minor improvements should remain inside the same version.

---

# 128. REST Design Principles

Resources should be nouns.

Good

```text
/case-studies
/users
/media
/contacts
/settings
```

Bad

```text
/createCaseStudy
/deleteProject
/uploadImageNow
```

HTTP methods define the action.

GET

Retrieve

POST

Create

PUT

Replace

PATCH

Update

DELETE

Remove

---

# 129. API Folder Organization

The API should mirror the feature modules.

```text
/api/v1

auth

case-studies

sections

media

contacts

seo

analytics

dashboard

settings

logs

users
```

A developer should immediately locate an endpoint by its feature.

---

# 130. Standard CRUD Endpoints

Every resource should expose a predictable interface.

Example:

```text
GET     /case-studies

GET     /case-studies/:id

POST    /case-studies

PATCH   /case-studies/:id

DELETE  /case-studies/:id
```

Consistency reduces frontend complexity.

---

# 131. Resource Naming

Use plural resource names.

Preferred:

```text
case-studies

contacts

users

sections
```

Avoid singular and inconsistent naming.

---

# 132. Query Parameter Standards

Collections should support:

```text
?page=

?limit=

?sort=

?order=

?search=

?status=

?category=

?featured=

?published=
```

Every collection endpoint should implement these consistently where applicable.

---

# 133. Pagination Philosophy

Never return unlimited datasets.

Preferred defaults:

```text
Default page size:
20

Maximum:
100
```

Large datasets should always be paginated.

Response:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 458,
    "pages": 23
  }
}
```

---

# 134. Filtering Strategy

Filtering should happen server-side.

Examples:

```text
Status

Category

Featured

Created Date

Updated Date

Industry

Tags
```

Never load thousands of records just to filter them on the frontend.

---

# 135. Search Standards

Search should support:

Title

Slug

Client

Industry

Tags

Description

Future:

Full-text search

Fuzzy search

Weighted ranking

Autocomplete

Design database indexes to support these enhancements.

---

# 136. Bulk Operations

Administrators frequently work with multiple records.

Support operations like:

Bulk Publish

Bulk Archive

Bulk Delete

Bulk Restore

Bulk Tag

Bulk Category Change

Bulk Export

Bulk operations should be transactional where possible.

---

# 137. Batch Processing

Large operations should execute asynchronously.

Example:

Delete 300 Case Studies

↓

Queue Job

↓

Progress

↓

Completed

Never block HTTP requests for long-running tasks.

---

# 138. API Documentation

Every endpoint should include documentation.

Minimum:

Purpose

Authentication

Request Body

Response

Validation

Errors

Permissions

Examples

OpenAPI / Swagger is recommended.

---

# 139. Authentication Endpoints

Minimum endpoints:

```text
POST /auth/login

POST /auth/logout

POST /auth/refresh

GET /auth/me
```

Future:

Password Reset

2FA

Magic Links

OAuth

---

# 140. Case Study API

Operations should include:

Create

Read

Update

Delete

Publish

Archive

Duplicate

Restore

Preview

Reorder

Export

Import

Each operation should validate business rules before execution.

---

# 141. Section API

Endpoints should support:

Create Section

Delete Section

Update Section

Duplicate Section

Move Section

Toggle Section

Validate Section

Preview Section

Each section remains independent.

---

# 142. Media API

Support:

Upload

Replace

Delete

Reorder

Update Metadata

Generate Thumbnail

Fetch Asset

Bulk Upload

Bulk Delete

Future:

Image Crop

AI Alt Text

Focus Point

---

# 143. Contact API

Support:

Create Submission

View Submission

Update Status

Assign User

Archive

Delete

Reply

Export

Tag

Search

This enables CRM evolution.

---

# 144. Settings API

Configuration should never require code changes.

Editable settings include:

Brand Name

Logo

SEO Defaults

SMTP

Analytics

Social Links

Footer

Company Information

Feature Toggles

Maintenance Mode

---

# 145. Dashboard API

Dashboard should aggregate data efficiently.

Avoid:

15 API requests.

Prefer:

Single dashboard endpoint returning all required metrics.

---

# 146. Database Philosophy

The database is the permanent memory of the CMS.

It should prioritize:

Integrity

Consistency

Performance

Scalability

Auditability

Predictability

The schema should evolve without requiring complete redesigns.

---

# 147. Collection Strategy

Recommended collections:

```text
users

caseStudies

sections

media

contacts

categories

tags

settings

seo

activityLogs

emailQueue

revisions

sessions
```

Future:

blogPosts

testimonials

careers

newsletter

clients

roles

permissions

---

# 148. Case Study Document

Each Case Study stores metadata only.

Example fields:

```text
_id

title

slug

client

industry

category

status

featured

seoId

sectionIds

tags

analytics

createdBy

updatedBy

publishedAt

createdAt

updatedAt
```

Sections should not be deeply embedded if they are expected to grow significantly or be reused.

---

# 149. Section Document

Every section should be independent.

```text
_id

caseStudyId

type

order

enabled

title

content

settings

metadata

createdAt

updatedAt
```

This supports efficient reordering and future reuse.

---

# 150. Media Document

Each uploaded asset should maintain rich metadata.

```text
_id

sectionId

caseStudyId

s3Key

publicUrl

thumbnailUrl

mimeType

width

height

size

caption

altText

displayOrder

uploadedBy

createdAt
```

This enables search, replacement, and analytics.

---

# 151. Contact Document

Every inquiry should become a structured business record.

Store:

Identity

Communication

Source

Lifecycle

Assignment

Activity

Analytics

Timestamps

No contact should exist only as an email.

---

# 152. Settings Document

Settings should be grouped logically.

Example:

General

SEO

Email

Branding

Analytics

Social Media

Feature Flags

Avoid one enormous configuration object.

---

# 153. Activity Log Collection

Every significant action should generate an immutable log.

Store:

Actor

Action

Entity

Entity ID

Previous State (optional)

New State (optional)

Timestamp

IP

Browser

Result

Logs should never be editable.

---

# 154. Revision Collection

Every publishable document should support revisions.

Store:

Revision Number

Snapshot

Author

Timestamp

Change Summary

Restore Token

This enables rollback without affecting live content.

---

# 155. Soft Delete Strategy

Avoid permanent deletion for business data.

Instead:

```text
deletedAt

deletedBy

restoreUntil
```

A scheduled cleanup job may permanently remove expired soft-deleted records.

---

# 156. Slug Generation

Slugs must be:

Readable

Lowercase

Hyphenated

Unique

Stable

Example:

```text
Solar Installation Project

↓

solar-installation-project
```

If duplicate:

```text
solar-installation-project-2
```

Never expose database IDs in URLs.

---

# 157. Transactions

Operations affecting multiple collections should execute atomically.

Example:

Create Case Study

↓

Save Case

↓

Save Sections

↓

Save Media

↓

Save SEO

↓

Commit

If any step fails:

Rollback everything.

Partial writes should never occur.

---

# 158. Database Index Strategy

Indexes should exist for:

Slug

Status

Created Date

Updated Date

Category

Tags

Featured

Client

Industry

Contact Status

Email

Activity Timestamp

Indexes should be reviewed periodically based on actual query patterns.

---

# 159. Data Integrity Rules

Every relationship should be validated.

Examples:

Media must reference an existing Case Study.

Sections must belong to a valid Case Study.

SEO entries must have a valid owner.

Contacts cannot reference deleted assignments.

Never allow orphaned records.

---

# 160. Acceptance Criteria

The API and database architecture are complete when:

* Every endpoint follows REST conventions.
* Versioning is established.
* Responses are standardized.
* Pagination, filtering, and search are consistent.
* Bulk operations are supported.
* Database collections are modular.
* Relationships preserve integrity.
* Transactions prevent partial writes.
* Slugs remain unique and stable.
* Revision history supports rollback.
* Soft deletes protect business data.
* Indexes optimize common queries.
* The architecture supports future modules without major schema redesign.

---

## **END OF PART 5B**

**Part 5C** will cover one of the most critical production areas:

* Enterprise SEO Engine
* Dynamic Metadata System
* Open Graph & Social Cards
* JSON-LD Structured Data
* Sitemap Generation
* Robots Management
* Analytics Architecture
* Dashboard KPIs
* Security Architecture (Authentication, Authorization, OWASP, Rate Limiting, CSP, XSS, CSRF, Injection Prevention)
* Secrets Management
* Compliance & Audit Standards

This section transforms the CMS from a content manager into a secure, production-grade digital platform.
# EKDRISHTI CMS & ADMIN PANEL

## Master Software Requirements Specification (SRS)

**Version:** 1.0

**Project:** EkDrishti Digital Marketing Agency Website CMS

---

# PART 5C-1

# ENTERPRISE SEO ARCHITECTURE & SEARCH OPTIMIZATION ENGINE

---

# 161. SEO Philosophy

Search Engine Optimization is not a collection of meta tags.

It is an architecture.

Every page generated by the CMS should be discoverable, indexable, shareable, accessible and semantically correct.

SEO should be integrated into the CMS from the beginning rather than added later.

The system should automatically generate high-quality technical SEO while allowing administrators complete control over content-specific optimization.

Goals:

* Maximum crawlability
* Fast indexing
* Excellent Core Web Vitals
* Rich search results
* Clean information architecture
* Easy administration
* Minimal manual work

---

# 162. SEO Design Principles

The SEO engine must satisfy these principles.

### Automation First

Generate everything automatically where possible.

---

### Administrator Override

Every automatically generated value should be overridable.

---

### Consistency

Every page should follow identical SEO standards.

---

### Future Compatibility

The architecture should support new search engine requirements without redesign.

---

### Separation of Concerns

SEO data should never be mixed with presentation logic.

---

# 163. SEO Ownership Model

Every public entity should own its own SEO document.

Example:

```text
Case Study
      │
      ▼
 SEO Document
```

Future entities:

* Blog
* Service
* Team Member
* Career
* Landing Page
* Category
* Tag

Each maintains independent SEO configuration.

---

# 164. SEO Data Structure

Every SEO record should support:

```text
Title

Meta Description

Slug

Canonical URL

Robots Directive

OpenGraph Title

OpenGraph Description

OpenGraph Image

Twitter Title

Twitter Description

Twitter Image

Keywords (optional)

Structured Data

NoIndex

NoFollow

Priority

Change Frequency

Last Modified

Language

Alternate Languages (Future)
```

This structure should remain reusable across all content types.

---

# 165. Metadata Generation Strategy

The CMS should intelligently generate metadata when administrators leave fields blank.

Example:

Page Title

↓

Case Study Title

↓

Company Name

↓

Industry

Result:

```
Solar Installation Case Study | EkDrishti
```

Likewise:

Meta Description

↓

Short Description

↓

Trim

↓

Optimize Length

↓

Store

Automation reduces editorial effort.

---

# 166. SEO Validation

Validation rules should include:

Title length

Recommended:

50–60 characters

Description:

120–160 characters

Slug length

Duplicate slugs

Missing OG image

Invalid canonical URL

Missing headings

Missing alt text

Missing structured data (recommended)

The CMS should display warnings rather than silently publishing poor SEO.

---

# 167. SEO Health Score

Every page should receive an automatically calculated SEO score.

Example:

```text
Overall SEO Score

92 / 100
```

Factors:

* Title
* Description
* H1
* Image alt text
* Canonical
* OG image
* Structured Data
* URL quality
* Internal links (future)
* Performance metrics (future)

This score should guide editors rather than replace expertise.

---

# 168. Slug Management

Slugs should be:

* Human readable
* Stable
* Lowercase
* Hyphenated
* Unique

Changing an existing published slug should trigger a warning because it may affect search rankings.

The CMS should optionally generate redirects for changed URLs.

---

# 169. Canonical URL Strategy

Every public page should expose a canonical URL.

Purpose:

* Prevent duplicate content
* Consolidate ranking signals
* Improve indexing consistency

Canonical URLs should be automatically generated but editable.

---

# 170. Robots Meta Management

Administrators should control indexing.

Supported directives:

```text
index

noindex

follow

nofollow

nosnippet

noarchive

max-image-preview

max-snippet

max-video-preview
```

Most pages should default to:

```text
index,follow
```

---

# 171. Open Graph Architecture

Every page should support social sharing.

Required fields:

OG Title

OG Description

OG Image

OG URL

OG Type

OG Site Name

Preview generation should exist inside the admin panel.

---

# 172. Twitter Card Support

Support:

Summary

Summary Large Image

Recommended fields:

Title

Description

Image

Card Type

Creator (optional)

Site (optional)

---

# 173. Open Graph Image Pipeline

If administrators do not upload a custom OG image:

The CMS should automatically use:

Hero Image

↓

Fallback Brand Image

↓

Default Site Image

This guarantees attractive social previews.

---

# 174. Structured Data Philosophy

Structured Data should become a first-class feature.

Never require administrators to manually write JSON-LD.

Instead:

CMS Data

↓

Schema Generator

↓

JSON-LD

↓

Frontend

Automatic generation reduces mistakes.

---

# 175. Supported Schema Types

Initially support:

Organization

WebSite

WebPage

BreadcrumbList

Article (Future)

BlogPosting (Future)

LocalBusiness (Future)

Service (Future)

Person (Future)

FAQ

VideoObject

ImageObject

Project

Future schema types should require minimal implementation effort.

---

# 176. Sitemap Generation

The sitemap must never be manually maintained.

Generation should be automatic.

Include:

Published Case Studies

Published Pages

Future Blog Posts

Services

Categories

Tags

Exclude:

Drafts

Archived Pages

Private Content

Deleted Records

---

# 177. Sitemap Update Strategy

Whenever:

Case Study Published

↓

Update Sitemap

Case Study Deleted

↓

Update Sitemap

Slug Changed

↓

Update Sitemap

Generation should be incremental where practical.

---

# 178. Robots.txt Management

The CMS should generate robots.txt dynamically.

Production:

Allow crawling.

Development:

Disallow crawling.

Maintenance Mode:

Configurable.

Administrators should be able to add custom directives safely.

---

# 179. Internal Linking Strategy

Future support should include:

Related Case Studies

Related Services

Category Links

Tag Links

Breadcrumbs

Suggested Reading

The architecture should already anticipate these relationships.

---

# 180. SEO Acceptance Criteria

The SEO subsystem is complete when:

* Every public page has configurable metadata.
* Default metadata is generated intelligently.
* Open Graph and Twitter Cards are supported.
* JSON-LD is generated automatically.
* Canonical URLs are implemented.
* Robots directives are configurable.
* XML sitemaps are generated automatically.
* Robots.txt is manageable.
* SEO health scoring assists editors.
* Slug management supports redirects.
* Future schema types can be added without redesign.

---

## END OF PART 5C-1

**Part 5C-2** will cover:

* Enterprise Analytics Architecture
* Business Intelligence Engine
* Dashboard KPI System
* Event Tracking
* Lead Attribution
* Conversion Funnels
* Content Performance
* Media Analytics
* Admin Productivity Metrics
* Reporting & Data Export
* Future AI Insights

This section transforms the CMS from a content manager into a measurable business platform.

# EKDRISHTI CMS & ADMIN PANEL

## Master Software Requirements Specification (SRS)

**Version:** 1.0

**Project:** EkDrishti Digital Marketing Agency Website CMS

---

# PART 5C-2

# ANALYTICS ARCHITECTURE, BUSINESS INTELLIGENCE & REPORTING ENGINE

---

# 181. Analytics Philosophy

Analytics should answer business questions, not merely collect numbers.

The CMS should evolve from a content management platform into a business intelligence platform that enables administrators to understand:

* What content performs best
* Where leads originate
* How visitors interact with the website
* Which case studies generate inquiries
* How administrators use the CMS
* Where operational bottlenecks exist

Analytics should be actionable, not just informational.

---

# 182. Analytics Design Principles

The analytics subsystem must follow these principles:

### Business First

Every metric should support a business decision.

---

### Privacy Conscious

Collect only the data necessary for operational insights.

Avoid unnecessary personally identifiable information (PII).

---

### Modular

Every analytics category should function independently.

Example:

```text
Website Analytics

Lead Analytics

Media Analytics

Admin Analytics
```

One subsystem failing must not affect the others.

---

### Extensible

Future integrations such as Google Analytics 4, Meta Pixel, Microsoft Clarity, or custom event pipelines should be added without redesigning the database.

---

# 183. Analytics Architecture

The system should follow a layered architecture.

```text
Visitor

↓

Frontend Event

↓

Backend Event API

↓

Analytics Service

↓

Database

↓

Dashboard

↓

Reports
```

The frontend should never write analytics directly into the database.

---

# 184. Analytics Categories

The CMS should organize analytics into the following domains:

```text
Website

Content

Case Studies

SEO

Media

Contact Forms

Users

Admin Activity

System Performance

Storage Usage
```

Each category should have independent services and dashboards.

---

# 185. Dashboard Philosophy

The dashboard is not decoration.

It is the operational cockpit of the organization.

Administrators should understand website health within seconds.

Dashboard widgets should answer:

* Is the website healthy?
* Are leads increasing?
* Which projects perform best?
* Are uploads failing?
* Are emails being delivered?
* Are there any system issues?

---

# 186. Executive Dashboard KPIs

The landing dashboard should display:

### Website

* Total Visitors (future integration)
* Published Case Studies
* Draft Case Studies
* Archived Projects

---

### Leads

* Today
* Yesterday
* Last 7 Days
* Last 30 Days
* Total

---

### Content

* Recently Updated Projects
* Recently Published
* Most Viewed

---

### Media

* Storage Used
* Images Uploaded
* Upload Failures
* Largest Assets

---

### System

* Backend Status
* Database Status
* Email Status
* Storage Health

---

# 187. Website Analytics

Track high-level website metrics.

Future integrations may provide:

* Page Views
* Unique Visitors
* Returning Visitors
* Bounce Rate
* Session Duration
* Geographic Distribution
* Device Categories
* Browser Distribution
* Traffic Sources

The CMS should remain analytics-provider agnostic.

---

# 188. Case Study Performance

Every Case Study should expose its own performance dashboard.

Metrics include:

* Views
* Contact Form Conversions
* Average Time on Page
* Scroll Depth (future)
* Entry Sources
* Exit Rate
* Social Shares (future)

This allows the agency to evaluate portfolio effectiveness.

---

# 189. Lead Attribution

Every contact submission should be attributable.

Capture where available:

```text
Landing Page

Referrer

UTM Source

UTM Medium

UTM Campaign

UTM Term

UTM Content

First Visit

Latest Visit
```

This enables marketing ROI calculations.

---

# 190. Conversion Funnel

The CMS should visualize the visitor journey.

Example:

```text
Visitor

↓

Case Study

↓

CTA Click

↓

Contact Form

↓

Submission

↓

Qualified Lead
```

Future CRM integrations can extend this into sales pipelines.

---

# 191. Content Analytics

Track editorial activity.

Metrics include:

* New Case Studies
* Updated Projects
* Published This Month
* Draft Count
* Archived Count
* Average Publishing Time
* Revision Count

These metrics help measure content production.

---

# 192. SEO Analytics

Combine internal SEO data with future external integrations.

Display:

* Pages Missing Meta Titles
* Pages Missing Descriptions
* Missing Alt Text
* Duplicate Slugs
* Missing Canonicals
* Low SEO Scores
* Structured Data Errors

The objective is proactive optimization.

---

# 193. Media Analytics

The media subsystem should expose operational insights.

Metrics include:

* Total Images
* Total Storage
* Average File Size
* Largest Files
* Most Used Images
* Unused Assets (future)
* Upload Failures
* Optimization Savings

Administrators should understand storage consumption at a glance.

---

# 194. Storage Utilization

Display storage usage by category.

Example:

```text
Hero Images

Gallery Images

SEO Images

Thumbnails

Temporary Uploads
```

This supports capacity planning.

---

# 195. Upload Performance

Monitor the upload pipeline.

Track:

* Upload Success Rate
* Compression Time
* Processing Time
* S3 Upload Time
* Failure Rate
* Average File Size
* Queue Length

Performance regressions should become immediately visible.

---

# 196. Contact Analytics

Provide operational metrics.

Examples:

* Total Inquiries
* New Today
* Read
* Unread
* Assigned
* Resolved
* Archived
* Average Response Time
* Average Resolution Time

These metrics support customer service quality.

---

# 197. Lead Quality Metrics

Future CRM integrations should support scoring.

Potential indicators:

* Company Present
* Budget Provided
* Business Email
* Project Size
* Referral Source
* Repeat Contact

The architecture should support calculated lead scores without changing the schema.

---

# 198. Administrator Productivity

Track internal CMS activity.

Examples:

* Logins
* Pages Created
* Pages Updated
* Upload Count
* Publishing Activity
* Average Editing Session
* Most Active Administrator

These insights help operational planning.

---

# 199. Activity Timeline

Provide a unified chronological activity feed.

Example:

```text
09:05

Project Published

↓

09:12

Gallery Updated

↓

09:26

Lead Received

↓

09:41

SEO Updated

↓

10:04

Image Uploaded
```

Administrators should understand system activity without navigating multiple screens.

---

# 200. Scheduled Reports

The CMS should support report generation.

Examples:

Daily Summary

Weekly Leads

Monthly Performance

Storage Report

SEO Report

Publishing Report

Reports should be exportable in future releases.

---

# 201. Export System

Administrators should export analytical data.

Supported formats:

* CSV
* Excel
* PDF (future)

Export operations should respect user permissions.

---

# 202. Custom Date Ranges

All analytical dashboards should support:

Today

Yesterday

Last 7 Days

Last 30 Days

This Month

Last Month

This Year

Custom Range

Consistency improves usability.

---

# 203. Dashboard Performance

Dashboards must remain responsive.

Guidelines:

* Aggregate expensive queries.
* Cache frequently requested metrics.
* Avoid recalculating historical statistics on every request.
* Use asynchronous refreshes for non-critical widgets.

---

# 204. Event Tracking Architecture

Every important event should have a standardized format.

Example fields:

```text
Event Name

Category

Timestamp

User

Resource

Metadata

Source

Environment
```

This standardized event model simplifies future integrations.

---

# 205. Alerting & Thresholds

Administrators should receive alerts for unusual conditions.

Examples:

* Upload failure spike
* Email delivery failures
* Storage nearing limit
* High error rates
* Database connectivity issues

Alerts should prioritize operational reliability over noise.

---

# 206. Future AI Insights

The analytics architecture should anticipate AI-assisted reporting.

Examples:

* Recommend underperforming pages.
* Identify outdated case studies.
* Suggest SEO improvements.
* Detect unusual traffic patterns.
* Recommend image optimizations.
* Highlight content gaps.

The underlying event model should be rich enough to support these capabilities without redesign.

---

# 207. Analytics Acceptance Criteria

The analytics subsystem is considered complete when:

* Dashboard metrics are meaningful and actionable.
* Lead attribution is captured where available.
* Case Study performance is measurable.
* Media usage is monitored.
* Contact workflows are quantifiable.
* Administrator activity is auditable.
* Reports support business decisions.
* Performance remains fast through aggregation and caching.
* The architecture supports future third-party analytics providers.
* AI-assisted insights can be introduced without restructuring the analytics model.

---

## END OF PART 5C-2

**Part 5C-3** will complete Part 5C with the largest and most security-critical section of the specification:

* Enterprise Security Architecture
* Authentication & Authorization
* Role-Based Access Control (RBAC)
* Session Management
* Password Security
* JWT & Refresh Token Strategy
* OWASP Top 10 Mitigations
* XSS, CSRF & Injection Prevention
* Rate Limiting
* CORS & Content Security Policy
* Secure File Uploads
* Secrets Management
* Audit Logging
* Compliance
* Security Incident Response
* Security Acceptance Criteria

This will define the production security standards for the entire EkDrishti CMS.

# EKDRISHTI CMS & ADMIN PANEL

## Master Software Requirements Specification (SRS)

**Version:** 1.0

**Project:** EkDrishti Digital Marketing Agency Website CMS

---

# PART 5C-3

# ENTERPRISE SECURITY ARCHITECTURE, AUTHENTICATION & COMPLIANCE

---

# 208. Security Philosophy

Security is not a feature.

It is a property of the entire system.

Every module, endpoint, database operation, file upload, API request, and administrative action must be designed with security as a primary concern.

The CMS should assume that:

* Every request can be malicious.
* Every uploaded file can be dangerous.
* Every input can be manipulated.
* Every API endpoint will eventually be probed.
* Every public service will receive automated attacks.

The architecture must therefore follow **Zero Trust** principles.

---

# 209. Security Design Principles

Every engineering decision should satisfy the following principles.

### Default Deny

Everything is forbidden unless explicitly allowed.

---

### Least Privilege

Users should receive only the permissions required for their responsibilities.

---

### Defense in Depth

Never rely on a single security mechanism.

Multiple independent layers should protect every critical operation.

---

### Secure by Default

The safest behavior should require no administrator configuration.

---

### Auditability

Every sensitive action should be traceable.

---

### Fail Securely

When failures occur, security should not degrade.

---

# 210. Zero Trust Architecture

Every request follows the same security pipeline.

```text
Internet

↓

HTTPS

↓

Reverse Proxy

↓

Rate Limiter

↓

Authentication

↓

Authorization

↓

Validation

↓

Business Rules

↓

Database
```

Never assume an authenticated request is automatically authorized.

---

# 211. Authentication Philosophy

Authentication answers:

> Who is this user?

It should never answer:

> What is this user allowed to do?

Those are separate concerns.

---

# 212. Authentication Requirements

The CMS should support:

* Secure login
* Logout
* Session expiration
* Session renewal
* Password verification
* Account status validation
* Refresh tokens
* Remember me (optional)
* Device tracking (future)

Every authentication event should be logged.

---

# 213. Password Security

Passwords must never be:

* Logged
* Cached
* Stored in plaintext
* Returned by APIs
* Embedded in frontend code

Passwords should always be hashed using a modern adaptive algorithm such as Argon2 or bcrypt with an appropriate work factor.

---

# 214. Password Policy

Minimum recommendations:

Minimum Length

12 characters

Encourage:

* Uppercase
* Lowercase
* Numbers
* Symbols

Reject:

Common passwords

Dictionary passwords

Previously compromised passwords (future)

Administrators should receive password strength guidance rather than confusing error messages.

---

# 215. Session Management

Sessions should be centrally managed.

Requirements:

* Secure expiration
* Revocation
* Automatic logout
* Session rotation
* Idle timeout
* Absolute timeout

Future support:

View active sessions

Terminate other devices

---

# 216. JWT Strategy

If JWT authentication is used:

Access Token

* Short lifetime

Refresh Token

* Longer lifetime

Never issue extremely long-lived access tokens.

Refresh tokens should be revocable independently.

---

# 217. Token Storage

Browser applications should avoid insecure token storage.

Preferred approach:

* HttpOnly cookies for refresh tokens
* Secure cookies
* SameSite protection

Avoid exposing long-lived credentials to JavaScript whenever practical.

---

# 218. Logout Behaviour

Logout should invalidate:

* Refresh token
* Server session
* Cached authentication state

A logged-out session should never remain reusable.

---

# 219. Authorization Philosophy

Authentication identifies the user.

Authorization determines what actions they may perform.

Every protected endpoint must verify both.

---

# 220. Role-Based Access Control (RBAC)

The architecture should support future expansion.

Initial role:

Administrator

Future roles:

Super Admin

Content Manager

Editor

SEO Manager

Marketing

Viewer

Developer

Permissions should be data-driven rather than hardcoded.

---

# 221. Permission Model

Permissions should be granular.

Examples:

```text
caseStudy.create

caseStudy.edit

caseStudy.publish

caseStudy.delete

media.upload

media.delete

contacts.read

contacts.reply

settings.update

users.manage
```

Roles become collections of permissions.

---

# 222. Route Protection

Every protected endpoint should declare required permissions.

Example:

```text
PATCH /case-studies/:id

↓

Requires

caseStudy.edit
```

Never rely solely on frontend route hiding.

---

# 223. Input Validation

Every external input must be validated.

Sources include:

* Forms
* Query parameters
* Headers
* Cookies
* Uploads
* JSON bodies
* URL parameters

Never trust client data.

---

# 224. Output Encoding

Data displayed in the frontend should be encoded appropriately.

Especially:

Rich Text

Comments

Contact Messages

Administrator Notes

Rendering untrusted HTML without sanitization should never occur.

---

# 225. Cross-Site Scripting (XSS)

The system should defend against:

Stored XSS

Reflected XSS

DOM-based XSS

Strategies:

* Output encoding
* HTML sanitization
* CSP
* Avoid dangerous HTML rendering
* Rich text sanitization

---

# 226. Cross-Site Request Forgery (CSRF)

If cookie-based authentication is used:

Protect state-changing requests with:

* CSRF tokens
* SameSite cookies
* Origin validation

GET requests should never modify server state.

---

# 227. Injection Prevention

Validate every database operation.

Prevent:

Mongo Injection

NoSQL Injection

Command Injection

Template Injection

Header Injection

Email Header Injection

Parameterized operations and validation should be the default.

---

# 228. File Upload Security

Every upload should undergo multiple validation stages.

Validate:

* MIME type
* File signature
* Maximum size
* Extension
* Processing compatibility

Reject:

Executables

Scripts

Unsupported archives

Corrupted files

SVG files should be sanitized before public use.

---

# 229. Rate Limiting

Protect public endpoints.

Examples:

Login

Contact Form

Upload

Password Reset

API Authentication

Limits should be configurable.

Repeated abuse should result in temporary blocking rather than permanent denial.

---

# 230. Brute Force Protection

Authentication endpoints should detect repeated failures.

Example strategy:

5 failed attempts

↓

Temporary lock

↓

Exponential backoff

↓

Manual review (future)

This reduces credential stuffing attacks.

---

# 231. CORS Policy

Cross-Origin Resource Sharing should explicitly define trusted origins.

Never use unrestricted origins in production.

Development and production environments should maintain separate configurations.

---

# 232. Content Security Policy (CSP)

Define a restrictive CSP.

Only explicitly approved domains should be allowed for:

Scripts

Images

Fonts

Frames

Media

Connections

This significantly reduces XSS risk.

---

# 233. HTTP Security Headers

The application should enable security headers including:

* Strict-Transport-Security
* X-Content-Type-Options
* Referrer-Policy
* Permissions-Policy
* X-Frame-Options (or CSP frame controls)

These should be configured globally.

---

# 234. HTTPS Enforcement

All production traffic must use HTTPS.

HTTP requests should automatically redirect to HTTPS.

Secure cookies should only be transmitted over encrypted connections.

---

# 235. Secrets Management

Secrets should never exist in:

* Git repositories
* Client bundles
* Documentation
* Logs
* Screenshots

Secrets include:

Database credentials

JWT secrets

AWS credentials

SMTP credentials

API keys

Production values should be managed through environment variables or a dedicated secrets manager.

---

# 236. Environment Separation

Maintain independent environments.

Development

Testing

Staging

Production

No environment should share production credentials.

---

# 237. Audit Logging

Sensitive actions should create immutable audit logs.

Examples:

Login

Logout

Password change

Publishing

Deletion

Permission changes

Settings updates

Media deletion

Audit logs should include:

Actor

Timestamp

Action

Resource

Result

---

# 238. Security Monitoring

Monitor unusual behavior.

Examples:

Repeated login failures

Large upload spikes

Unexpected API traffic

Permission denials

Repeated validation failures

Storage anomalies

Future integrations may forward alerts to external monitoring systems.

---

# 239. Backup Security

Backups should:

Be encrypted where appropriate.

Be stored separately from production systems.

Be regularly tested.

Access should be restricted.

An untested backup should not be considered a valid recovery strategy.

---

# 240. Dependency Security

Third-party packages introduce risk.

Establish a process for:

* Dependency review
* Vulnerability scanning
* Version updates
* License review
* Removal of unused packages

Security updates should be prioritized.

---

# 241. Security Incident Response

Prepare documented procedures for:

Credential compromise

Database breach

Upload abuse

Spam attacks

Service outage

Lost backups

Administrator account compromise

Every incident should follow:

Detect

↓

Contain

↓

Investigate

↓

Recover

↓

Review

↓

Improve

---

# 242. Compliance Considerations

The architecture should support future compliance efforts.

Examples:

Privacy regulations

Cookie consent

Data export

Data deletion requests

Audit history

Consent tracking

Although not all requirements may apply immediately, the data model should not prevent future compliance.

---

# 243. Security Testing

Security should be continuously verified.

Testing should include:

* Authentication testing
* Authorization testing
* Upload testing
* Input validation testing
* Dependency scanning
* Manual penetration testing
* Automated security scanning

Security is a continuous process, not a one-time milestone.

---

# 244. Security Acceptance Criteria

The security subsystem is considered complete when:

* Every request is authenticated where required.
* Authorization is enforced independently.
* Passwords are securely hashed.
* Sessions can be revoked.
* RBAC supports future expansion.
* OWASP Top 10 risks are systematically mitigated.
* Inputs are validated and outputs are safely rendered.
* File uploads are securely processed.
* Rate limiting protects public endpoints.
* Secrets never appear in source control or client code.
* Audit logs record sensitive operations.
* Security headers and HTTPS are enforced.
* Backup and recovery procedures are documented and testable.
* Security monitoring detects abnormal activity.
* The architecture can evolve with future compliance requirements.

---

# END OF PART 5C-3

**Part 5D** will move from security into production operations and engineering excellence, covering:

* Performance Engineering
* Backend Optimization
* Database Performance
* Caching Strategy (Redis-ready)
* Queue Architecture
* Logging Standards
* Monitoring & Observability
* Health Checks
* Error Recovery
* Testing Strategy (Unit, Integration, E2E)
* CI/CD Standards
* Code Quality Gates

This section will define how the EkDrishti CMS remains fast, observable, maintainable, and production-ready as it scales.

# EKDRISHTI CMS & ADMIN PANEL

## Master Software Requirements Specification (SRS)

**Version:** 1.0

**Project:** EkDrishti Digital Marketing Agency Website CMS

---

# PART 5D-1

# PERFORMANCE ENGINEERING, SCALABILITY & SYSTEM OPTIMIZATION

---

# 245. Performance Philosophy

Performance is a core functional requirement of the CMS.

A visually appealing interface is of limited value if the system is slow, inconsistent, or unreliable under real-world conditions.

Performance engineering should be integrated into every layer of the application:

* Frontend
* API
* Database
* Storage
* Network
* Infrastructure

Performance should be measured continuously rather than assumed.

---

# 246. Performance Objectives

The CMS should strive to meet the following targets under normal operating conditions.

## Administrative Interface

* Initial Dashboard Load < 2 seconds
* Navigation < 500 ms
* Search Results < 300 ms
* Form Save < 2 seconds
* Image Upload Feedback < 300 ms

---

## Public Website

* Largest Contentful Paint (LCP) < 2.5 seconds
* Interaction to Next Paint (INP) < 200 ms
* Cumulative Layout Shift (CLS) < 0.1
* First Contentful Paint (FCP) < 1.8 seconds

These targets should be monitored throughout development.

---

# 247. Scalability Philosophy

The CMS should be designed for growth.

Growth may occur in:

* Number of Case Studies
* Uploaded Images
* Contact Submissions
* Administrators
* Website Traffic
* Future Modules

Architectural decisions should avoid assumptions that the dataset will always remain small.

---

# 248. Horizontal vs Vertical Scalability

The application should support both approaches.

### Vertical Scaling

Increase server resources:

* CPU
* RAM
* Storage

Suitable for early growth.

---

### Horizontal Scaling

Multiple application instances behind a load balancer.

The application should remain stateless wherever possible to simplify horizontal scaling.

---

# 249. Stateless Backend Design

Application servers should not store user state in memory.

Instead:

```text
Browser
   │
Request
   │
API Instance
   │
Shared Database
   │
Shared Storage
```

Benefits:

* Easier deployment
* Auto-scaling compatibility
* Improved resilience
* Simplified failover

---

# 250. Database Performance Philosophy

Database optimization begins with schema design.

Avoid compensating for poor schemas through excessive hardware.

The database should be optimized through:

* Proper indexing
* Efficient queries
* Pagination
* Projection
* Aggregation optimization
* Transaction discipline

---

# 251. Query Optimization

Every query should request only the data required.

Avoid patterns such as:

```text
SELECT *

Equivalent:

Return Entire Document
```

Instead:

Return only required fields.

Projection reduces:

* Bandwidth
* Serialization cost
* Memory usage

---

# 252. Pagination Standards

Every potentially large collection must implement pagination.

Examples:

Case Studies

Media Library

Activity Logs

Contacts

Users

Revisions

No endpoint should attempt to return thousands of records in a single response.

---

# 253. Lazy Loading

Large datasets should load incrementally.

Examples:

Media Library

Activity Feed

Contact History

Revision Timeline

Infinite scrolling or progressive pagination should be preferred where appropriate.

---

# 254. Image Delivery Strategy

Images account for the majority of transferred bytes.

The media pipeline should include:

* Responsive image generation
* WebP/AVIF where supported
* Original preservation
* Lazy loading
* CDN caching
* Compression
* Metadata optimization

The architecture defined in Part 3 should remain the single source of truth for image processing.

---

# 255. CDN Strategy

Static assets should be distributed through a Content Delivery Network.

Examples:

Images

Icons

Fonts

Static JavaScript

CSS

Benefits:

* Reduced latency
* Geographic optimization
* Lower server load
* Better caching

---

# 256. Browser Caching

Resources should expose appropriate cache headers.

Recommended categories:

Static Assets

Long-lived cache

Images

Long-lived cache with versioning

API Responses

Short-lived or no cache depending on sensitivity

HTML

Validated frequently

Versioned assets prevent stale content.

---

# 257. API Performance

API endpoints should minimize:

* Query count
* Payload size
* Serialization overhead
* Nested requests

Avoid API designs that require the frontend to perform numerous sequential requests to render a single screen.

---

# 258. Dashboard Optimization

The Dashboard is the most frequently accessed administrative page.

Optimization strategies include:

* Aggregated queries
* Cached metrics
* Parallel API execution
* Deferred loading for non-critical widgets

Critical operational data should appear first.

---

# 259. Search Optimization

Search operations should prioritize indexed fields.

Future enhancements may include:

* Full-text indexes
* Weighted search
* Fuzzy matching
* Autocomplete
* Synonym support

The initial architecture should not prevent these improvements.

---

# 260. Background Processing

Time-consuming operations should execute asynchronously.

Examples:

Image optimization

Bulk uploads

Bulk deletions

Email sending

Report generation

Revision cleanup

These jobs should not block user interactions.

---

# 261. Queue Architecture

Introduce a generalized job queue abstraction.

```text
User Action

↓

Job Queue

↓

Worker

↓

Result

↓

Notification
```

Future implementations may use Redis-backed queues without requiring application redesign.

---

# 262. Queue Categories

Separate queues by responsibility.

Examples:

Email Queue

Image Queue

Analytics Queue

Export Queue

Maintenance Queue

Isolation prevents one workload from blocking another.

---

# 263. Cache Philosophy

Caching should accelerate repeated work without becoming the source of truth.

The database remains authoritative.

Caches may be safely rebuilt.

---

# 264. Cache Layers

Potential cache layers include:

Application Cache

API Response Cache

Database Query Cache

CDN Cache

Browser Cache

Each layer should have clearly defined responsibilities and expiration policies.

---

# 265. Cache Invalidation

When content changes:

```text
Update Case Study

↓

Invalidate Related Cache

↓

Serve Fresh Content
```

Stale content should be minimized while avoiding unnecessary cache purges.

---

# 266. Memory Management

The backend should avoid:

* Loading unnecessary collections into memory
* Long-lived object retention
* Unbounded caches
* Memory leaks

Memory usage should remain predictable under sustained load.

---

# 267. Resource Limits

Define configurable limits for:

Maximum Upload Size

Concurrent Uploads

Maximum Search Results

Bulk Operation Size

API Request Size

Timeout Duration

Limits protect both performance and stability.

---

# 268. Database Connection Pooling

Connection pools should be configured appropriately.

Goals:

* Avoid excessive connection creation
* Prevent pool exhaustion
* Optimize throughput

Pool sizes should reflect deployment environment capacity.

---

# 269. Compression

Responses should support compression where appropriate.

Examples:

JSON

JavaScript

CSS

SVG

Binary media already optimized should not be recompressed unnecessarily.

---

# 270. Asset Versioning

Static assets should include version identifiers.

Example:

```text
logo.png?v=3
```

or hashed filenames.

Versioning ensures reliable cache invalidation after deployments.

---

# 271. Scheduled Maintenance Jobs

Periodic background tasks should include:

Revision cleanup

Temporary file cleanup

Expired session removal

Soft-delete expiration

Log archival

Analytics aggregation

Maintenance should occur during low-traffic periods where practical.

---

# 272. Performance Monitoring

Key performance indicators should include:

* Average API latency
* Slowest endpoints
* Database query duration
* Upload duration
* Email queue time
* Cache hit ratio
* Worker throughput

Performance regressions should be detectable early.

---

# 273. Capacity Planning

Administrators should monitor:

Storage growth

Database growth

Monthly uploads

Lead volume

Traffic trends

These metrics support infrastructure planning before resource exhaustion occurs.

---

# 274. Scalability Readiness

The architecture should allow future adoption of:

* Redis
* Dedicated Queue Workers
* Object Storage Expansion
* CDN Providers
* Search Engines (Elasticsearch/OpenSearch)
* Distributed Caching
* Multiple Application Instances

None of these improvements should require fundamental application redesign.

---

# 275. Performance Acceptance Criteria

The performance subsystem is considered complete when:

* APIs consistently return within acceptable response times.
* Large datasets are paginated.
* Images are optimized before delivery.
* Static assets are cacheable.
* Expensive operations execute asynchronously.
* Queue architecture supports future scaling.
* Caching improves performance without compromising consistency.
* Background maintenance preserves long-term system health.
* Capacity metrics support infrastructure planning.
* The architecture remains scalable for future growth.

---

## END OF PART 5D-1

**Part 5D-2** will complete the operational engineering standards with:

* Logging Architecture
* Observability
* Error Handling Standards
* Health Checks
* Monitoring & Alerting
* Testing Strategy (Unit, Integration, End-to-End, UAT)
* Code Quality Standards
* CI/CD Pipeline
* Release Management
* Deployment Verification
* Production Readiness Checklist

This section will define how the EkDrishti CMS is operated, monitored, tested, and maintained as a production-grade software system.

# EKDRISHTI CMS & ADMIN PANEL

## Master Software Requirements Specification (SRS)

**Version:** 1.0

**Project:** EkDrishti Digital Marketing Agency Website CMS

---

# PART 5D-2

# LOGGING, OBSERVABILITY, TESTING, CI/CD & OPERATIONAL EXCELLENCE

---

# 276. Operational Philosophy

Developing software is only half of engineering.

Operating software in production is equally important.

A production-ready CMS must enable administrators and developers to answer questions such as:

* What failed?
* When did it fail?
* Why did it fail?
* Who performed the action?
* Can the issue be reproduced?
* Can it be rolled back safely?

Every production system should be observable, measurable, and diagnosable.

---

# 277. Observability Philosophy

Observability extends beyond logging.

The platform should expose three complementary signals:

```text
Logs

↓

Metrics

↓

Traces (Future)
```

Together, these provide complete visibility into system behavior.

---

# 278. Logging Objectives

Logging should support:

* Debugging
* Monitoring
* Security investigations
* Performance analysis
* Compliance
* Business analytics
* Disaster recovery

Logs are operational records—not debugging leftovers.

---

# 279. Logging Categories

The system should classify logs into independent streams.

```text
Application Logs

API Logs

Authentication Logs

Activity Logs

Security Logs

Database Logs

Upload Logs

Email Logs

System Logs
```

Each category should have a defined retention policy.

---

# 280. Structured Logging

Avoid free-form log messages.

Preferred structure:

```text
Timestamp

Severity

Module

Action

User

Resource

Request ID

Result

Duration

Metadata
```

Structured logs simplify searching and automated analysis.

---

# 281. Log Severity Levels

Every log entry should use standardized levels.

```text
TRACE

DEBUG

INFO

WARN

ERROR

FATAL
```

Severity definitions should be documented and consistently applied.

---

# 282. Request Correlation

Every incoming request should receive a unique Request ID.

Example lifecycle:

```text
Request

↓

Request ID Assigned

↓

Controller

↓

Service

↓

Database

↓

Response
```

This identifier allows developers to trace a request across multiple log entries.

---

# 283. API Request Logging

Each API request should record:

* Method
* Route
* Status Code
* Processing Time
* User (if authenticated)
* IP Address
* Request ID

Sensitive request bodies should never be logged.

---

# 284. Error Logging

Every unexpected error should record:

* Timestamp
* Stack Trace (internal only)
* Module
* Request ID
* User
* Environment
* Severity

Stack traces must never be returned to clients.

---

# 285. Authentication Logging

Authentication events should include:

* Successful Login
* Failed Login
* Logout
* Password Change
* Token Refresh
* Account Lock
* Session Expiration

These logs are critical for security auditing.

---

# 286. Activity Logging

Administrator actions should generate immutable activity logs.

Examples:

* Case Study Created
* Published
* Archived
* Deleted
* Media Uploaded
* Settings Updated
* Contact Status Changed

Each event should record the acting user and timestamp.

---

# 287. Media Pipeline Logging

The upload subsystem should log:

* Upload Started
* Validation Passed
* Compression Completed
* Thumbnail Generated
* S3 Upload Successful
* Upload Failed
* Asset Deleted

These logs simplify troubleshooting storage issues.

---

# 288. Email Logging

Track the email lifecycle.

```text
Queued

↓

Processing

↓

Sent

↓

Delivered (Future)

↓

Failed

↓

Retried
```

Logs should distinguish between temporary and permanent failures.

---

# 289. Database Logging

Monitor database operations including:

* Slow Queries
* Failed Transactions
* Connection Failures
* Migration Events
* Index Creation
* Backup Operations

Only operational metadata should be logged—not sensitive content.

---

# 290. Log Retention

Retention policies should vary by category.

Example:

Application Logs

90 Days

Authentication Logs

180 Days

Audit Logs

1–3 Years

Error Logs

180 Days

Retention should balance operational needs and storage costs.

---

# 291. Health Check Architecture

Health checks should provide machine-readable status.

Suggested endpoint:

```text
GET /health
```

Response categories:

* API
* Database
* Storage
* Email Service
* Queue
* Cache (Future)

---

# 292. Health States

Each subsystem should report:

```text
Healthy

Degraded

Unhealthy
```

Partial failures should not automatically mark the entire application as unavailable.

---

# 293. Monitoring Metrics

Track operational metrics including:

* CPU Usage
* Memory Usage
* Disk Utilization
* API Latency
* Database Latency
* Queue Length
* Upload Throughput
* Email Success Rate
* Error Rate

Dashboards should visualize historical trends.

---

# 294. Alerting Strategy

Alerts should prioritize operational relevance.

Examples:

Critical

* Database offline
* API unavailable
* Storage inaccessible

Warning

* Storage >80%
* Error spike
* Queue backlog
* Email failures

Informational

* Deployment completed
* Backup successful

Avoid excessive alert noise.

---

# 295. Error Recovery Philosophy

Unexpected failures should be handled gracefully.

Requirements:

* Fail safely
* Preserve data integrity
* Provide actionable error messages
* Record diagnostic information
* Recover automatically where appropriate

---

# 296. Graceful Degradation

If a non-essential service fails:

Example:

Analytics unavailable

↓

CMS editing continues.

Email temporarily unavailable

↓

Lead stored in database.

The platform should remain usable whenever possible.

---

# 297. Testing Philosophy

Testing demonstrates confidence—not perfection.

Testing should validate:

* Functional correctness
* Business rules
* Security
* Performance
* Reliability

Testing should begin during development rather than after completion.

---

# 298. Testing Pyramid

Recommended distribution:

```text
          E2E
         /   \
   Integration
      /     \
     Unit Tests
```

Most tests should exist at the unit level.

---

# 299. Unit Testing

Each module should independently test:

* Services
* Validators
* Utilities
* Business Rules
* Helpers

Unit tests should avoid external dependencies.

---

# 300. Integration Testing

Integration tests verify communication between components.

Examples:

Controller → Service

Service → Database

Media → Storage

Email → Queue

Authentication → Authorization

---

# 301. End-to-End Testing

Critical user journeys should be automated.

Examples:

Administrator Login

↓

Create Case Study

↓

Upload Images

↓

Publish

↓

View Website

↓

Submit Contact Form

↓

Receive Notification

These tests validate complete workflows.

---

# 302. Regression Testing

Every bug fix should include a regression test when practical.

Previously resolved defects should not reappear unnoticed.

---

# 303. User Acceptance Testing (UAT)

Before production release, validate:

* Business workflows
* Content editing
* Uploads
* Contact forms
* SEO settings
* Dashboard metrics
* Authentication
* Permission boundaries

UAT should reflect real administrative tasks.

---

# 304. Performance Testing

Evaluate:

* Concurrent users
* Upload throughput
* Large datasets
* Search performance
* Dashboard responsiveness

Testing should identify bottlenecks before deployment.

---

# 305. Security Testing

Regularly verify:

* Authentication
* Authorization
* File uploads
* Input validation
* Session management
* Dependency vulnerabilities

Security testing complements, but does not replace, secure design.

---

# 306. Code Quality Standards

The codebase should prioritize:

* Readability
* Consistency
* Simplicity
* Modularity
* Documentation

Code should optimize for long-term maintainability over cleverness.

---

# 307. Static Analysis

Automated checks should detect:

* Unused variables
* Dead code
* Type inconsistencies
* Formatting issues
* Potential defects

Developers should address warnings before merging changes.

---

# 308. Code Review Process

Every significant change should undergo peer review.

Review should consider:

* Architecture
* Security
* Performance
* Maintainability
* Testing
* Documentation

Approval should not rely solely on successful builds.

---

# 309. Continuous Integration (CI)

Every change should automatically trigger:

* Dependency installation
* Build
* Linting
* Unit tests
* Integration tests (where feasible)

Changes that fail validation should not be merged into the main branch.

---

# 310. Continuous Deployment (CD)

Production deployment should follow a controlled pipeline.

Example:

```text
Commit

↓

CI Validation

↓

Staging Deployment

↓

Verification

↓

Production Deployment

↓

Health Check

↓

Completion
```

Rollback procedures should be defined before deployment.

---

# 311. Release Management

Every release should include:

* Version Number
* Release Date
* Changelog
* Migration Notes
* Rollback Plan
* Known Limitations

Release documentation improves operational reliability.

---

# 312. Production Verification Checklist

After deployment, verify:

* Website accessibility
* API availability
* Database connectivity
* Authentication
* Image uploads
* Contact forms
* Email delivery
* Dashboard metrics
* SEO metadata
* Logging
* Health endpoint

No deployment should be considered complete until these checks pass.

---

# 313. Operational Documentation

Maintain documentation for:

* System architecture
* Deployment procedures
* Environment variables
* Recovery processes
* Backup procedures
* Monitoring setup
* API reference
* Developer onboarding

Documentation should evolve alongside the software.

---

# 314. Operational Acceptance Criteria

The operational subsystem is considered complete when:

* Logs provide meaningful diagnostic information.
* Health endpoints accurately reflect subsystem status.
* Monitoring surfaces actionable metrics.
* Alerts distinguish between critical and informational events.
* Error handling preserves data integrity.
* Automated tests cover critical functionality.
* CI/CD pipelines validate code before deployment.
* Releases are documented and reversible.
* Production deployments include verification steps.
* Operational documentation supports long-term maintenance.

---

## **END OF PART 5D-2**

### **Part 5E (Final Part)** will conclude the EkDrishti CMS Master SRS with:

* Disaster Recovery & Business Continuity
* Backup & Restore Strategy
* Infrastructure & Deployment Standards
* Environment Management
* Maintenance & Upgrade Policy
* Technical Debt Management
* Future Roadmap & Extensibility
* AI Readiness
* Multi-Tenant Readiness
* Internationalization (i18n)
* Long-Term Engineering Principles
* Final Definition of Done
* Production Readiness Matrix
* Master Acceptance Criteria
* Final Conclusion

This final section will serve as the engineering governance document that defines what "production-ready" means for the EkDrishti CMS over its entire lifecycle.
# EKDRISHTI CMS & ADMIN PANEL

## Master Software Requirements Specification (SRS)

**Version:** 1.0

**Project:** EkDrishti Digital Marketing Agency Website CMS

---

# PART 5E (FINAL)

# DISASTER RECOVERY, DEPLOYMENT STANDARDS, FUTURE ARCHITECTURE & ENGINEERING GOVERNANCE

---

# 315. Production Philosophy

The completion of development is not the completion of the software.

The true lifecycle of the CMS begins after production deployment.

This specification therefore defines not only how the CMS should be built, but also how it should be operated, maintained, expanded, monitored, recovered, and evolved over the coming years.

The architecture should prioritize:

* Reliability
* Maintainability
* Extensibility
* Recoverability
* Operational Excellence

---

# 316. Business Continuity Philosophy

The CMS should continue providing essential functionality despite failures.

Possible failures include:

* Database outage
* Email provider outage
* S3 service disruption
* API server restart
* Network interruption
* Administrator mistakes

Critical business data should never depend on a single external service.

---

# 317. Disaster Recovery Objectives

The recovery strategy should define measurable objectives.

### Recovery Time Objective (RTO)

Maximum acceptable downtime before service restoration.

Recommended target:

```text
Critical Services:
< 1 Hour

Non-Critical Services:
< 4 Hours
```

---

### Recovery Point Objective (RPO)

Maximum acceptable data loss.

Recommended target:

```text
Contacts:
0–5 Minutes

Content:
< 15 Minutes

Media:
Near Zero
```

These objectives should guide backup frequency and recovery planning.

---

# 318. Backup Strategy

Backups should include all critical assets.

Categories:

* MongoDB Database
* Uploaded Media (S3)
* Environment Configuration
* Application Releases
* Infrastructure Configuration
* Activity Logs (where appropriate)

No single backup should be considered sufficient.

---

# 319. Database Backup Policy

Recommended schedule:

Incremental Backup

Every 6 Hours

Full Backup

Daily

Long-Term Archive

Weekly

Monthly

Backups should be verified regularly through restoration testing.

---

# 320. Media Backup Strategy

Although AWS S3 provides durability, accidental deletion remains possible.

Implement:

* Versioning
* Lifecycle Policies
* Cross-region replication (future)
* Periodic backup verification

Media should never exist only in a single logical version.

---

# 321. Configuration Backup

Critical configuration includes:

* Environment Variables
* SMTP Configuration
* Analytics Keys
* Feature Flags
* Branding Assets
* DNS Configuration

Configuration should be documented and reproducible.

---

# 322. Restore Procedures

Every backup must have a documented restoration process.

Examples:

Restore Database

Restore Media

Restore Environment

Restore Application Version

Restore Individual Record (future)

Backups without tested restoration procedures provide false confidence.

---

# 323. Rollback Strategy

Every production deployment should support rollback.

Example workflow:

```text
Deploy

↓

Health Check

↓

Validation

↓

Problem Detected

↓

Automatic or Manual Rollback

↓

Previous Stable Version
```

Rollback should preserve database integrity whenever possible.

---

# 324. Infrastructure Standards

Production infrastructure should separate responsibilities.

Recommended logical architecture:

```text
Internet
    │
CDN
    │
Frontend
    │
API
    │
Database
    │
AWS S3
```

Each component should remain independently replaceable.

---

# 325. Environment Strategy

Maintain separate environments.

Development

Testing

Staging

Production

Rules:

* Independent databases
* Independent storage
* Independent credentials
* Independent environment variables

Production data should never be copied into development without sanitization.

---

# 326. Environment Variables

Sensitive configuration should be externalized.

Examples:

```text
DATABASE_URL

JWT_SECRET

REFRESH_SECRET

AWS_ACCESS_KEY

AWS_SECRET_KEY

AWS_REGION

AWS_BUCKET

RESEND_API_KEY

SMTP_HOST

SMTP_PORT

SMTP_USERNAME

SMTP_PASSWORD

GOOGLE_ANALYTICS_ID
```

The application should fail fast when mandatory configuration is missing.

---

# 327. Infrastructure as Documentation

Infrastructure decisions should be documented alongside the application.

Include:

* Network topology
* Deployment workflow
* DNS records
* Domain ownership
* SSL certificate management
* Cloud services
* Storage architecture

Future developers should not reconstruct infrastructure through guesswork.

---

# 328. Maintenance Philosophy

Software requires continuous maintenance.

Maintenance includes:

* Security updates
* Dependency upgrades
* Performance optimization
* Content improvements
* Infrastructure updates
* Documentation revisions

Maintenance is part of the product lifecycle.

---

# 329. Dependency Management

Dependencies should be reviewed regularly.

Process:

* Remove unused packages.
* Review security advisories.
* Upgrade supported versions.
* Test compatibility.
* Document breaking changes.

Avoid unnecessary package proliferation.

---

# 330. Database Migration Policy

Schema evolution should be controlled.

Every migration should include:

Purpose

Version

Rollback Plan

Data Validation

Execution Time

Verification Steps

Migrations should be reproducible and reversible.

---

# 331. Feature Flag Strategy

Future features should be deployable without immediate public release.

Feature flags enable:

* Gradual rollout
* Internal testing
* Emergency disablement
* A/B experimentation (future)

Feature behavior should remain predictable.

---

# 332. Technical Debt Management

Technical debt should be visible rather than ignored.

Track:

Known Limitations

Deferred Improvements

Architecture Decisions

Performance Concerns

Legacy Components

Each item should include:

Priority

Impact

Proposed Resolution

Owner

---

# 333. Future Module Readiness

The CMS architecture should support future additions such as:

* Blog CMS
* Career Portal
* Testimonials
* Newsletter
* Client Portal
* Team Members
* Services
* Events
* Knowledge Base
* Documentation

Adding modules should not require restructuring existing architecture.

---

# 334. AI Readiness

Future AI capabilities may include:

Automatic SEO suggestions

Alt-text generation

Content summarization

Case Study drafting

Grammar assistance

Tag recommendations

Duplicate detection

Semantic search

The current architecture should expose structured data suitable for AI-assisted workflows.

---

# 335. Internationalization (i18n)

Although the initial implementation is English-only, the CMS should anticipate multilingual support.

Future capabilities:

* Multiple languages
* Localized URLs
* Language-specific SEO
* Translated media metadata
* Independent publication workflows

Text should remain separate from presentation logic to facilitate localization.

---

# 336. Multi-Tenant Readiness

While EkDrishti currently operates a single website, architectural decisions should not prevent future multi-tenant support.

Potential future separation:

* Organizations
* Domains
* Branding
* Content
* Media
* Users
* Analytics

No current implementation is required, but avoid assumptions that permanently enforce single-tenancy.

---

# 337. Documentation Standards

Documentation should exist for:

* Architecture
* APIs
* Deployment
* Database
* Environment Variables
* Security
* Operational Procedures
* Administrator Guide
* Developer Guide

Documentation should be version-controlled alongside the application.

---

# 338. Knowledge Transfer

The project should remain maintainable regardless of the original developers.

Knowledge transfer should include:

* System walkthrough
* Deployment demonstration
* CMS usage guide
* Troubleshooting procedures
* Common operational tasks

The objective is organizational continuity rather than individual dependency.

---

# 339. Engineering Principles

All future development should follow these principles:

* Simplicity over unnecessary complexity
* Consistency over cleverness
* Readability over brevity
* Automation over repetitive manual work
* Composition over duplication
* Security by default
* Performance as a requirement
* Documentation as part of development

These principles should guide future architectural decisions.

---

# 340. Definition of Done

A feature is considered complete only when:

* Functional requirements are implemented.
* Business rules are validated.
* Security requirements are satisfied.
* Performance targets are met.
* Error handling is implemented.
* Logging is included.
* Documentation is updated.
* Tests pass.
* Accessibility requirements are considered.
* Code review is completed.
* Deployment verification succeeds.

Implementation alone does not constitute completion.

---

# 341. Production Readiness Checklist

Before public deployment, verify:

### Infrastructure

* HTTPS enabled
* DNS configured
* SSL valid
* Environment variables verified
* Database reachable
* Storage operational

---

### Application

* Authentication functional
* Authorization enforced
* Upload pipeline verified
* Contact workflow tested
* SEO generation verified
* Error handling validated

---

### Operations

* Backups configured
* Monitoring active
* Health endpoint operational
* Alerts configured
* Logging functional

---

### Performance

* Core Web Vitals acceptable
* API latency acceptable
* Database indexes verified
* Image optimization confirmed

---

### Security

* Secrets protected
* Rate limiting enabled
* Security headers configured
* Dependency audit completed
* Audit logging verified

---

# 342. Long-Term Vision

The EkDrishti CMS should evolve beyond a traditional content management system.

Future objectives include:

* AI-assisted content creation
* Integrated CRM capabilities
* Marketing automation
* Advanced analytics
* Workflow automation
* Collaboration features
* Headless CMS capabilities
* Public API ecosystem
* Plugin architecture
* Enterprise integrations

The architecture defined throughout this specification intentionally prepares for these possibilities.

---

# 343. Master Acceptance Criteria

The CMS is considered production-ready only when all of the following are true:

### Functional

* Every module operates according to specification.
* CRUD operations are complete and validated.
* Content publishing is reliable.
* Media management functions correctly.
* Contact management preserves all submissions.

---

### Technical

* APIs follow REST standards.
* Database integrity is maintained.
* Transactions prevent partial writes.
* Background processing handles long-running tasks.
* Performance targets are consistently achieved.

---

### Security

* Authentication and authorization are enforced.
* Sensitive data is protected.
* Uploads are securely validated.
* Audit logging is active.
* OWASP risks are mitigated.

---

### Operational

* Monitoring is operational.
* Health checks are accurate.
* Backups are tested.
* Recovery procedures are documented.
* CI/CD pipelines are functioning.

---

### Quality

* Documentation is complete.
* Testing covers critical workflows.
* Code quality standards are met.
* Accessibility considerations are addressed.
* Production verification succeeds.

---

# 344. Final Conclusion

This Software Requirements Specification defines the complete engineering blueprint for the **EkDrishti CMS & Admin Panel**.

Rather than describing only user-facing features, it establishes the architectural, operational, security, performance, and governance standards required to build and maintain a professional production system.

When implemented according to this specification, the platform will provide:

* A modular and extensible CMS architecture.
* Secure authentication and administrative workflows.
* Enterprise-grade media management with AWS S3 integration.
* Comprehensive SEO capabilities.
* Reliable contact and lead management.
* Scalable REST APIs.
* Structured analytics and reporting.
* Robust monitoring, logging, and operational visibility.
* Disaster recovery and long-term maintainability.
* A foundation for future AI, CRM, multilingual, and headless CMS capabilities.

This document is intended to serve as the authoritative engineering reference throughout the lifecycle of the EkDrishti platform, ensuring that future enhancements remain consistent with the architectural vision established from the outset.

---

# END OF PART 5E

## END OF MASTER SRS

**Final Document Statistics**

* **Sections:** 344
* **Parts:** 5 (subdivided into 10 implementation chapters)
* **Coverage:** Frontend Architecture, CMS Design, UX/UI Standards, Media Pipeline, Backend Architecture, REST APIs, Database Design, SEO Engine, Analytics, Security, Performance, Observability, Testing, CI/CD, Deployment, Disaster Recovery, Governance, and Future Extensibility.

### One recommendation before you start implementation

After reading all five parts, there's one thing I'd add if the goal is to build something that rivals commercial CMS platforms: a dedicated **Part 6 – Engineering Playbook**.

Unlike the SRS, it would be implementation-focused and include:

* Complete MongoDB schemas with every field
* DTOs and validation rules for every endpoint
* Full API contracts (request/response examples)
* State diagrams for every workflow
* Sequence diagrams
* Folder-by-folder implementation guide
* RBAC permission matrix
* Component dependency map
* Database indexes and query plans
* Caching matrix
* Error catalog
* Coding standards
* Git branching strategy
* Release workflow
* Sprint implementation roadmap
* Production deployment runbooks

That would function as the **developer handbook** for building the CMS exactly as specified, removing ambiguity during implementation. Given the depth of the SRS you've assembled, it would be the natural companion document.
