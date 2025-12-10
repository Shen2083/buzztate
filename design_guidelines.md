# Buzztate Design Guidelines

## Design Approach
**Utility-Focused Design System** - This is a translation tool prioritizing clarity, workflow efficiency, and readability in dark mode. The design emphasizes functional hierarchy with strategic use of vibrant accents to guide user actions.

## Core Design Elements

### Color Palette
- **Background**: bg-gray-900 (primary dark surface)
- **Surface**: bg-gray-800 (cards, elevated elements)
- **Borders**: border-gray-700 (subtle separation)
- **Accent**: #FACC15 yellow (primary actions, highlights)
- **Text Primary**: text-gray-100 (main content)
- **Text Secondary**: text-gray-400 (labels, metadata)
- **Text Muted**: text-gray-500 (reality check, helper text)

### Typography
- **Primary Font**: System font stack (-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)
- **App Title**: text-3xl/text-4xl, font-bold with yellow accent
- **Section Headers**: text-xl/text-2xl, font-semibold, text-gray-100
- **Input Labels**: text-sm, font-medium, text-gray-300
- **Translated Text**: text-lg, font-bold, text-gray-100
- **Language Names**: text-base, font-semibold, text-yellow-400
- **Reality Check**: text-sm, text-gray-500, italic
- **Body/Interface**: text-base, text-gray-300

### Layout System
- **Container**: max-w-4xl mx-auto for focused workflow
- **Spacing Units**: Consistent use of p-4, p-6, p-8 for padding; gap-4, gap-6 for element spacing
- **Section Spacing**: space-y-6 between major sections, space-y-4 within sections
- **Card Grid**: grid grid-cols-1 md:grid-cols-2 gap-4 for results

### Component Library

#### Input Text Area
- Large, prominent textarea (min-h-[200px])
- bg-gray-800 with border-gray-700
- Rounded corners (rounded-lg)
- Focus state: ring-2 ring-yellow-400
- Placeholder text in gray-500

#### Dropdown Menu (Translation Style)
- Full-width select element
- bg-gray-800, border-gray-700
- Rounded (rounded-lg), padding p-3
- Focus: ring-2 ring-yellow-400
- Options with clear hover states (bg-gray-700)

#### Multi-Select Interface (Languages)
- Custom checkbox grid layout
- Each language as a checkbox with label
- Selected state: bg-yellow-400/10, border-yellow-400, text-yellow-400
- Unselected: bg-gray-800, border-gray-700, text-gray-300
- Grid: grid grid-cols-2 md:grid-cols-3 gap-3
- Each item: p-3, rounded-lg, border-2, cursor-pointer

#### "Buzztate It" Button
- Large, prominent CTA button
- bg-yellow-400 (accent color), text-gray-900
- Font: font-bold, text-lg
- Padding: px-8 py-4
- Rounded: rounded-lg
- Full width on mobile, auto width centered on desktop
- Hover: bg-yellow-300
- Disabled state: opacity-50, cursor-not-allowed

#### Result Cards
- bg-gray-800 surface with border-gray-700
- Rounded corners (rounded-lg)
- Padding: p-6
- Shadow: subtle elevation
- Structure per card:
  - Language name header (text-yellow-400, font-semibold)
  - Translated text (text-lg, font-bold, text-gray-100, mb-4)
  - Reality check section (border-t border-gray-700, pt-3, mt-3)
    - Label: "Reality Check:" (text-xs, uppercase, text-gray-500)
    - Back-translation text (text-sm, italic, text-gray-500)
  - Copy button (absolute top-right or bottom-right)

#### Copy Button
- Icon-only button using lucide-react Copy icon
- bg-gray-700, hover:bg-gray-600
- Text/Icon: text-gray-300
- Size: p-2, rounded
- Transition on copy success (checkmark icon swap)

### Animations
- Minimal, functional animations only
- Focus rings: smooth transition
- Button hover: subtle scale or background color transition
- Copy button success: icon swap with 200ms ease
- Results appearance: simple fade-in (opacity transition)

### Page Layout Structure
1. **Header Section** (py-8)
   - App title "Buzztate" with yellow accent styling
   - Tagline/description (optional, text-gray-400)

2. **Input Section** (space-y-6)
   - Text area with label
   - Style dropdown with label
   - Language multi-select with label
   - Buzztate button

3. **Results Section** (mt-12, pt-8, border-t border-gray-800)
   - Conditional rendering (only show when results exist)
   - Results header
   - Card grid layout

### Accessibility
- All interactive elements keyboard accessible
- Focus indicators visible (yellow ring)
- Proper ARIA labels for screen readers
- Color contrast ratios meet WCAG AA standards
- Form labels explicitly associated with inputs

### Responsive Behavior
- Mobile-first approach
- Stack elements vertically on mobile
- Multi-column grid for results on tablet/desktop
- Container max-width maintains readability
- Touch-friendly tap targets (min 44px)

## Images
No hero images or decorative imagery required. This is a utility-focused translation tool where the interface itself is the experience.