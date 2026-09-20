# TEMPEST LEADS — Developer Handoff

Prepared for Tempest Advertising · 18 September 2026

## 1. Purpose and delivery expectation

Develop an operational CRM for lead acquisition, client onboarding and nurture management. Use the included prototype as a starting point for interaction and styling, and the included original detailed requirements as the full product specification. Inspect and reuse suitable existing code before refactoring.

The deliverable must demonstrate both complete journeys:

1. Create company and contacts → create lead → research and connect → discovery meeting → brief → route decision → pitch/commercials → contract/PO → onboarding → active client.
2. Lead rejected or deferred → capture close data → lost/nurture → segmented reconnect → meeting → active opportunity.

Core relationship: **one company, many contacts, many opportunities, many interactions and nurture touches.** Do not implement a single flat lead table as the complete CRM model.

## 2. What is supplied, and its current status

The source folder contains `index.html`, `styles.css` and `app.js`. It is a plain HTML/CSS/JavaScript prototype without a framework, package manifest, backend, database or deployment configuration. It uses hash navigation, dynamically rendered views, browser localStorage for CRM data, and sessionStorage for the demo identity.

| Area | Current prototype | Required developer work |
| --- | --- | --- |
| Branding and shell | Tempest-styled sidebar, top bar, cards and tables | Validate against approved branding; complete responsive and accessible behavior |
| Login and reset | Demo identities and simulated reset screens | Real password verification, server sessions and expiring reset tokens |
| Permissions | Client-side role filtering and admin route checks | Server-side authorization on every API and record |
| Dashboard | Metrics calculated from fictional local records | Live queries, accurate dates, filters and actionable drill-downs |
| Companies and contacts | Separate sample records and basic creation | Complete fields, editing, permission checks, duplicate handling |
| Leads | Basic creation wizard, table, filters and Kanban display | Complete validation, pagination, sorting, bulk actions, drag/drop workflow rules |
| Activities, meetings, follow-ups | Basic local forms and history | Full schemas, consistent ownership, reminders, completion/reschedule flows |
| Lost and nurture | Basic local close/reconnect behavior | Mandatory close fields, segmentation, content/channel plans and history |
| Brief, pitch, commercials, contracts, onboarding | Navigation and detail tabs; most record actions are placeholders | Implement actual records, versions, approvals, branching and gates |
| Users and audit | Basic local creation, deactivation/reassignment, audit list | Full administration, immutable server audit and transactional reassignment |
| Reports, notifications, export | Basic metrics, notification panel and CSV export | Accurate scoped reports, notification jobs, complete exports and import previews |

Only JavaScript syntax was checked. Browser interaction testing, end-to-end testing, accessibility checks and responsive visual verification are outstanding. The prototype is a reference MVP, not a completed or production-secure application.

Known implementation issues to resolve during refactoring:

- Login currently finds an active account by email and does not verify its password.
- Dates and some audit times use fixed demo values. Replace them with real timestamps and timezone-aware calculations.
- The displayed known-client route is incorrect: it places Pitch after Active Client and omits Team Assignment. Implement the business routes in section 4 instead.
- Kanban cards display a draggable attribute but lack complete drag/drop transition handling.
- Some module buttons are inert or only display an integration message.
- Creating/editing leads needs step-level validation, retained values and explicit duplicate resolution.
- Filter rendering can interrupt input focus. Use controlled components or stable DOM updates.
- User reassignment must update related responsibilities and pending work consistently.
- A global FormData override supports prototype modal containers. Replace it with ordinary forms and a dedicated form controller.
- Split the large view/event file into modules. Remove obsolete NEXUS styles only after verifying the replacement.

## 3. Roles and permissions

**Super Admin:** all records, ownership assignment/reassignment, user administration, team performance, taxonomy/settings, audit, import/export and global reports.

**User / Owner:** assigned leads and associated company/contact records; create leads; manage permitted activities, meetings, follow-ups, briefs and lifecycle work; own performance and reports. No global users, system settings, audit or all-owner performance.

Default for the MVP: only Super Admin can assign/reassign another owner. Normal users create leads under their own ownership. Any later delegation permission must be explicit.

Enforce record scope on the server. Hiding navigation is insufficient. An Owner requesting an admin endpoint must receive an authorization error; an Owner must not retrieve another Owner's restricted record by changing its ID.

Deactivating an Owner requires a confirmation showing the number of affected leads. Reassign their leads to a selected active Owner, or to an active Super Admin by default. Apply the user status change, lead reassignment, pending work updates and audit entries in one transaction. Do not permanently delete lead history.

## 4. Workflow and non-negotiable rules

Common entry: Source → Company/contact/industry capture → Research/verification → Connect → Meeting/discovery → Brief.

After the brief, ask: **Is the client or industry already known?** Save the answer, actor, timestamp and decision note.

| Route | Required sequence |
| --- | --- |
| Known / existing | Brief → Scope Confirmation → Commercials → Contract / PO → Team Assignment → Pitch → Onboarding → Active Client |
| New / unknown | Brief → Understand Client + Industry → Team Assignment → Pitch → Commercials → Contract / PO → Onboarding → Active Client |

Stages alone cannot express this process. Store the selected route and required milestone completion separately. A visual pipeline may summarize progress, while the workflow service determines permissible transitions.

- Every open lead requires an active Owner, current stage, next action and follow-up date. Surface missing information in the attention queue.
- Every stage change requires a reason/comment. Store previous stage, new stage, actor and timestamp in stage history, activity timeline and audit.
- Backward movement must preserve all prior records and versions.
- A rejected/deferred lead remains in the system. Capture reason, date, stage lost, Owner, source and relevant contact channels; allow movement to nurture.
- Lost reasons: Budget, Timing, No requirement, Creative/pitch, Competitor, Existing agency, Internal decision, No response, Other.
- Nurture categories: Later, No Response, Lost / Not Interested, Future Opportunity. Store tags, reason, buying stage, service interest, communication status, last touch and reconnect date.
- Reconnect creates a logged interaction and a dated next action; it can return a lead to connection, meeting or brief as appropriate.
- Completing a follow-up requires outcome, notes, next action and next follow-up date. Keep the completed record and create the next pending record.
- Completing a meeting requires notes and outcome. Record the interaction and schedule the next action.
- Incomplete briefs enter Awaiting clarification. Do not silently permit progression; require the appropriate confirmation and record it.
- Pitch revisions and commercial quotations retain previous versions. Never overwrite historical versions.
- Onboarding requires the accepted commercial and contract/PO gate. Mandatory document, setup, governance and kick-off checks must pass before completion.
- Active Client is set only after required onboarding gates pass, including any required pitch approval for the selected route.

## 5. Screen inventory and behavior

| Screen | Main requirements |
| --- | --- |
| Login / Forgot Password | Email, password, show/hide, remember me, loading/error/invalid states; token-based reset flow |
| Super Admin Dashboard | 12 requested KPI categories; pipeline counts/value/percentage/aging; overdue and missing-action queue; today's follow-ups; owners, sources and industries |
| Owner Dashboard | Own pipeline and lifecycle work; today's actions first; overdue follow-ups and upcoming meetings |
| Leads & Pipeline | Table/Kanban; company/contact/channel/ID search; requested filters; selection, bulk actions, sorting, pagination, column visibility and export |
| Company Master | Company ID; name/brand, industry/sub-industry, city/geography, website, existing agency, marketing, requirement, source, Owner, status, reconnect and timestamps |
| Contact Master | Contact ID and company link; name, designation, department, phone, WhatsApp, email, LinkedIn, decision-maker, communication status, Owner and notes |
| Lead Detail | Company header; ownership/stage/status/priority; contact quick actions; Overview, Contacts, Timeline, Meetings, Follow-ups, Brief, Pitch, Commercials, Contract/PO, Onboarding, Nurture, Documents tabs |
| Activities | Channel/type, attempt, outcome, notes, actor/date/time, next action and next follow-up; chronological record timeline |
| Meetings | Schedule/edit/reschedule/cancel/complete/no-show; participants, location/link, agenda, notes and follow-up |
| Follow-ups | Today/upcoming/overdue/completed/rescheduled; contact quick actions, completion and rescheduling |
| Nurture | Tags/segments, buying stage, content/channel plan, scheduled touches, reconnect and communication preferences |
| Brief | Full structured brief, completeness, clarification and known/new route decision |
| Team Assignment | Account, Strategy, Creative, Design, Copy, Media/Digital, Production, Presentation Owner; assignee, assigned by/date, due date/status |
| Pitch | Full pitch fields; development/review/presentation/revision/approval/rejection; version history |
| Commercials | Scope, deliverables, amount/currency, payment terms, timeline, validity, exclusions; prepared/approved by; versioned negotiation |
| Contract / PO | Documents, scope, payment terms, approval/signature/PO tracking and lifecycle gate |
| Onboarding | Commercial handover, project code/folder/timeline/team, assets/inputs, governance and kick-off checklist |
| Active Clients | Linked client master, contacts, scope, commercials, contracts, team/project, interactions and documents |
| Reports | Acquisition, pipeline, conversion, Owner/source/industry, lost reasons, nurture, follow-up discipline, aging and monthly trend; own-data scope for Owners |
| Notifications | Unread badge; All/Unread/Follow-ups/Meetings/Assignments/System; due, overdue, reschedule, assignment and lifecycle events |
| Users / Team / Settings / Audit | Admin-only user lifecycle, objective performance, controlled taxonomies/configuration and major change history |
| Search / Import / Export | Grouped cross-entity search; import mapping/validation/duplicate preview/confirmation; permission-scoped exports |

The original specification contains the full field and status lists for each screen. Implement those lists rather than limiting fields to the prototype.

## 6. Architecture recommendation

Preserve approved UI patterns, suitable CSS tokens and useful interaction logic. Refactor into a frontend application with clear feature modules; the original PPT proposes React/Next.js and PostgreSQL. Final framework selection can follow the developer's existing stack.

Suggested feature boundaries: auth, shell/navigation, dashboard, companies, contacts, leads/workflow, activities, meetings, follow-ups, nurture, briefs/team, pitches, commercials, contracts, onboarding/clients, notifications, reports, administration, import/export.

Keep views separate from data access. Use an API client, domain validation and a server workflow service. All mutations should return the updated record, allowed next actions and validation errors. Use database transactions for changes that affect multiple entities.

Replace localStorage with a shared database for CRM records. Browser storage may retain display preferences. Authentication must use secure server-managed sessions or an established identity provider; hashed passwords, expiring reset tokens and server-side authorization are required.

Use background jobs for reminders and scheduled nurture touches. In-app notifications work in the initial MVP; email/WhatsApp dispatch can be simulated behind an integration adapter until services are configured. The product must clearly show queued/simulated/sent/failed states.

## 7. Data model

Use stable IDs, foreign keys, created/updated timestamps, and actor references. Money should use a decimal amount or integer minor units with currency. Store timestamps consistently and display them in the configured business timezone (initial default: Asia/Kolkata).

| Entity | Relationship and essential fields |
| --- | --- |
| User | Role, active status, name/email/employee ID, department/location; owns many leads |
| Company | Industry/source links, geography, website, agency and intelligence; many contacts and leads |
| Contact | Company FK, designation/department, all available channels, decision-maker, communication preferences, Owner |
| Lead | Company/contact/Owner FKs, stage/status/route/priority, opportunity value, next action/follow-up, source/tags |
| LeadStageHistory | Lead FK, previous/new stage, actor, timestamp, reason |
| Activity | Lead/company/contact FKs, type/channel, attempt, outcome, notes, next action/date, actor |
| Meeting | Lead/contact FKs, schedule/status/participants/location, agenda, completion outcome/notes |
| FollowUp | Lead/contact/Owner FKs, action/due time/status; completion outcome, notes and successor link |
| NurtureRecord | Lead/contact FKs, category/reason/tags, buying stage, service/channel/content plan, reconnect |
| Brief | Lead FK, all brief fields, completeness/status and route decision |
| TeamAssignment | Lead/user FKs, responsibility, assigned by/date, due date/status |
| Pitch / PitchVersion | Lead/brief/Owner links; pitch status; immutable content revisions |
| Commercial / CommercialVersion | Lead link; versioned scope/amount/terms/status and approvals |
| Contract | Lead/commercial links, PO/signature/status, dates, scope/terms/document links |
| Onboarding / ChecklistItem | Lead/project links, required checklist items, completion actors/timestamps |
| Document | Parent record link, filename/type/storage key/version/uploaded by; access rules |
| Notification | Recipient, type, related record, unread/read time, dispatch state |
| AuditLog | Actor/action/record/timestamp and previous/new values |
| Tag / Industry / LeadSource | Admin-controlled master values; explicit association tables where needed |

Do not infer contact consent from lead stage. Do not infer historical activity ownership from the current lead Owner; retain the actual actor and historical assignee.

## 8. API contract outline

| API group | Required operations |
| --- | --- |
| `/auth` | Login/logout/session; request reset; verify token; set password |
| `/companies`, `/contacts`, `/leads` | Scoped list/search/detail/create/update; company contacts and lead associations |
| `/leads/:id/transitions` | Validate and apply stage/route/status changes with reason and history |
| `/leads/:id/assignment` | Authorized reassignment with audit and pending-work updates |
| `/activities` | Create/list interactions and timelines |
| `/meetings` | Schedule/update/reschedule/cancel/complete with mandatory completion fields |
| `/follow-ups` | Schedule/list/reschedule/complete and atomically create next action |
| `/nurture` | Segment/update/schedule touch/reconnect |
| `/briefs`, `/team-assignments`, `/pitches` | Brief validation/routing, team work and versioned pitch lifecycle |
| `/commercials`, `/contracts`, `/onboarding` | Version/approve commercial, verify contract gate, complete mandatory checklist |
| `/users`, `/settings`, `/audit` | Admin-only management; transactional deactivation/reassignment |
| `/dashboard`, `/reports`, `/search` | Permission-scoped aggregate queries and grouped results |
| `/notifications` | List/read state and notification event delivery |
| `/imports`, `/exports`, `/documents` | Validate preview/mapping/confirm; scoped export; secure document access |

Use structured field errors, pagination, concurrency protection for edits, and idempotency for import/transition/completion operations where retries could duplicate work. Never trust Owner, role or approval values supplied by the browser without checking permissions.

## 9. UX and validation standards

Corporate desktop-first workspace inspired by Tempest ICE: https://tempestice.com/login.php. That reference was not accessible during prototype creation; obtain approved brand assets or review the reference with the product owner before finalizing colors/logo/typography.

Maintain consistent buttons, status badges, form sections, readable compact tables and strong hierarchy. Use drawers for quick actions and dedicated pages for complex records. Tables need sticky headers, search, sort, filters, pagination, columns and bulk selection. On mobile, prioritize actions/follow-ups and use cards or a drawer rather than simply shrinking tables.

Each major page needs loading, empty, validation, error/retry and success states. Saves must explain the result and next action. No inert buttons or placeholder-only record actions in the accepted delivery.

Add keyboard access, visible focus, labels, readable contrast, modal focus management and responsive checks. Confirm deactivation, reassignment, lost closure and other consequential actions with an explanation of their effect.

Duplicate detection should normalize company name, website/domain and available phone/email values. Show potential matches and let the user open the existing company, add a contact to it, or explicitly create a separate company. Record the decision; never silently merge companies or create duplicate opportunities.

## 10. Development sequence

1. Inventory the supplied prototype; agree approved branding and schemas; extract reusable shell/components.
2. Implement real authentication, server role checks, entity persistence and migrations.
3. Complete company/contact masters and five-step lead creation, duplicates and ownership.
4. Implement activities, meeting completion, follow-ups/reminders, history and action dashboards.
5. Implement workflow service, lost/nurture/reconnect and known/new route branching.
6. Complete briefs, team assignment, versioned pitch/commercials, contract gate and onboarding.
7. Complete reports, administration, notifications, import/export and document integration.
8. Verify both end-to-end journeys, roles, validations and desktop/mobile behavior; deploy a review environment and resolve defects before sign-off.

## 11. Acceptance checklist

- [ ] Super Admin and Owner login to the correct dashboard; disabled accounts cannot sign in.
- [ ] Password verification and reset tokens work; no production credentials or plaintext passwords are exposed.
- [ ] Unauthorized routes, API calls and record-ID requests fail for Owners.
- [ ] Create a company with at least two contacts and an owned lead with next action/date.
- [ ] Duplicate preview supports the three specified resolution choices.
- [ ] Edit and bulk actions respect permissions and log the actor, reason and change.
- [ ] Stage changes and permitted Kanban moves create history; forbidden moves explain the missing gate.
- [ ] Meeting completion requires notes/outcome and appears in the activity timeline.
- [ ] Follow-up completion preserves its record and creates the next scheduled action; overdue calculations use real time.
- [ ] Lost closure requires the specified close data, preserves history and supports nurture.
- [ ] Nurture records retain tags/communication status and reconnect into an opportunity.
- [ ] Known/existing leads follow commercials-first routing; new/unknown leads follow pitch-first routing.
- [ ] Incomplete briefs cannot silently progress.
- [ ] Pitch and quotation revisions retain earlier versions and approval history.
- [ ] Contract/PO requirements block premature onboarding.
- [ ] Mandatory onboarding checklist blocks premature Active Client status.
- [ ] User deactivation displays affected lead count and reassigns transactionally without losing history.
- [ ] Dashboard numbers reconcile with permission-scoped lists and reports.
- [ ] Notification read state and scheduled reminder behavior work.
- [ ] Import mapping validates and previews duplicates/invalid rows before confirmation.
- [ ] Exports include only permitted data and honor current filters.
- [ ] Every route has working actions and meaningful loading/empty/error/success states.
- [ ] Core flows work on desktop, tablet and mobile with no blocking console/runtime errors.
- [ ] Persistence survives reload and works across authorized users/devices through the shared backend.

## 12. Inputs and decisions still needed

The specification mentions a “Client Acquisition & Onboarding – Detailed Flow” document. It was not available in the inspected project; the supplied detailed written request is the current process reference. Reconcile any additional flow document before workflow sign-off.

Confirm approved brand assets, the organization's timezone, document retention/storage policy, which commercial approvals require management, and whether any Owners may delegate ownership. These decisions should refine configuration rather than delay the basic data and workflow implementation.

Optional future integrations must not prevent the required MVP journeys. Clearly distinguish simulated notification integrations from actual delivery. Do not mark placeholder screens or client-side demo permissions as completed production functionality.
