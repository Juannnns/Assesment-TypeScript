# HelpDeskPro Design Guidelines

## Design Approach
**System**: Hybrid approach drawing from Linear's clean productivity aesthetic + Zendesk's helpdesk patterns
**Rationale**: This is a utility-focused, information-dense productivity tool requiring efficiency and clarity over visual flourish.

## Core Design Principles
1. **Data Density with Clarity**: Display maximum information without overwhelming users
2. **Status-First Design**: Visual status indicators dominate the interface
3. **Role-Based Interfaces**: Distinct layouts for client vs agent dashboards
4. **Action Accessibility**: Critical actions always visible, never hidden in menus

## Typography System
- **Primary Font**: Inter (Google Fonts) - excellent for data-heavy interfaces
- **Headings**: 
  - H1: text-3xl font-semibold (Dashboard titles)
  - H2: text-2xl font-semibold (Section headers)
  - H3: text-lg font-medium (Card titles, Ticket titles)
- **Body**: text-base font-normal for descriptions and content
- **Labels/Meta**: text-sm font-medium for status, timestamps, metadata
- **Captions**: text-xs for auxiliary information

## Layout System
**Spacing Primitives**: Use Tailwind units of 2, 3, 4, 6, 8, 12, 16
- Component padding: p-4 to p-6
- Section spacing: space-y-6 to space-y-8
- Card gaps: gap-4
- Page margins: px-4 md:px-6 lg:px-8

**Grid Patterns**:
- Dashboard containers: max-w-7xl mx-auto
- Ticket lists: Single column on mobile, remains single column on desktop for data density
- Stat cards: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 for metrics

## Component Library

### Navigation
**Top Navigation Bar**:
- Fixed header with height h-16
- Logo left, user profile/logout right
- Role indicator badge next to user name
- Clean horizontal layout with border-b

**Sidebar (Agent Dashboard)**:
- Fixed left sidebar w-64
- Ticket filters: All, Open, In Progress, Resolved, Closed
- Priority filters: High, Medium, Low
- Quick stats at top of sidebar
- Collapsible on mobile (hamburger menu)

### Card Component - Ticket Card
**Structure** (horizontal layout for list view):
- Left edge: 4px status indicator stripe (open/in-progress/resolved/closed)
- Main content area with p-4
- Top row: Ticket title (text-lg font-medium) + Priority badge (right-aligned)
- Second row: Ticket ID (text-sm text-muted) + Created date
- Third row: Status badge + Assigned agent (if applicable)
- Description preview: text-sm, truncated to 2 lines
- Bottom: View Details button (right-aligned)
- Hover state: Subtle elevation with shadow-md

### Badge Component
**Variants**:
- **Status badges**: pill-shaped, px-3 py-1, text-xs font-medium, rounded-full
  - Open: Distinct visual treatment
  - In Progress: Different treatment
  - Resolved: Another treatment
  - Closed: Final treatment
- **Priority badges**: rectangular with rounded corners, px-2 py-1, text-xs font-semibold
  - High: Bold visual presence
  - Medium: Moderate emphasis
  - Low: Subtle treatment

### Button Component
**Sizes**:
- Small: px-3 py-1.5 text-sm
- Medium: px-4 py-2 text-base
- Large: px-6 py-3 text-lg

**Variants**:
- Primary: High emphasis for main actions (Create Ticket, Submit Response)
- Secondary: Medium emphasis for alternate actions
- Outline: Low emphasis for tertiary actions
- Ghost: Minimal for in-card actions

### Form Elements
**Input Fields**:
- Height: h-10 for text inputs
- Padding: px-3 py-2
- Border: border with rounded-md
- Focus state: ring-2 treatment
- Label above input: text-sm font-medium mb-2

**Textareas**:
- Min height: min-h-32 for descriptions
- Same padding/border as inputs

**Select Dropdowns**:
- Match input height and styling
- Chevron icon on right

### Ticket Detail View
**Layout**:
- Two-column layout on desktop (lg:grid-cols-3)
- Left column (lg:col-span-2): Ticket content + comment thread
- Right column (lg:col-span-1): Ticket metadata sidebar
  - Status selector
  - Priority selector  
  - Assign to agent dropdown
  - Created date
  - Last updated
  - Action buttons stacked

**Comment Thread**:
- Each comment in a card with p-4
- Avatar + name + timestamp at top
- Comment text below
- Alternate visual treatment for client vs agent comments
- Reply form at bottom with h-24 textarea

### Dashboard Layouts

**Client Dashboard**:
- Page header with "My Tickets" + Create New Ticket button
- Stats row: grid-cols-3 showing Open, In Progress, Resolved counts
- Filter tabs: All / Open / In Progress / Resolved
- Ticket list with cards in space-y-3

**Agent Dashboard**:
- Left sidebar with filters
- Main content: max-w-6xl
- Top metrics bar: grid-cols-4 (Total, Unassigned, High Priority, Avg Response Time)
- Ticket table/list with enhanced density
- Bulk action toolbar when tickets selected

### Special Components

**Empty States**:
- Centered content with max-w-md mx-auto
- Icon at top (text-6xl)
- Heading: text-xl font-medium
- Description: text-sm
- Action button

**Loading States**:
- Skeleton screens matching card layouts
- Pulse animation for loading content

**Alert/Notification Banners**:
- Full-width at top of viewport
- px-4 py-3
- Icon + message + dismiss button
- Success/Error/Warning variants

## Page Structures

### Login Page
- Centered card: max-w-md mx-auto
- Logo at top
- Form with email/password
- Role not selected (determined from backend)
- "Login" button full width

### Create Ticket Page (Client)
- max-w-3xl mx-auto
- Form with:
  - Title input
  - Description textarea (min-h-48)
  - Priority selector
  - Submit button

### Ticket Management Interface (Agent)
- Sidebar + main content layout
- Table view option with sortable columns
- Card view option for visual scanning
- Quick status update dropdown in each row/card

## Spacing & Rhythm
- Page top padding: pt-8
- Section spacing: space-y-8
- Component internal spacing: p-6 for large cards, p-4 for compact cards
- Form field spacing: space-y-4
- Button groups: space-x-2

## Responsive Behavior
- Mobile (base): Single column, stacked layout, hamburger nav
- Tablet (md): Maintain single column for tickets, 2-column for stats
- Desktop (lg): Sidebar appears, multi-column stats, optimized density

## Icons
**Library**: Heroicons (outline for UI, solid for badges/status)
**Key Icons**:
- Ticket: ticket icon
- Comment: chat-bubble icon  
- Priority: flag or exclamation
- Status: check-circle, clock, x-circle
- User: user-circle
- Search: magnifying-glass
- Filter: funnel

## Accessibility
- All interactive elements have focus states with ring-2
- Form labels associated with inputs
- Status communicated via text + visual indicators
- Keyboard navigation for all actions
- ARIA labels for icon-only buttons

This design prioritizes efficiency, clarity, and rapid information scanning - essential for a productivity tool managing support tickets.