# TOP Upload Design Guide

## Typography

Use **Inter** throughout the interface. If Inter is unavailable, use Arial
followed by the browser's default sans-serif font.

| Purpose | Size | Weight | Line height |
| --- | ---: | ---: | ---: |
| Main page title | 40px | 700 | 48px |
| Authentication title | 32px | 700 | 40px |
| Section heading | 24px | 700 | 32px |
| Card heading | 18px | 600 | 26px |
| Normal body text | 16px | 400 | 24px |
| Button text | 16px | 600 | 24px |
| Input label | 14px | 600 | 20px |
| Supporting text | 14px | 400 | 20px |
| Small metadata | 12px | 400 | 16px |

Keep the interface to three font weights:

- `400` for ordinary text
- `600` for labels, navigation items, and buttons
- `700` for headings

## Main colors

| Role | Color | Hex |
| --- | --- | --- |
| Primary action | Indigo | `#5B5CE2` |
| Primary hover | Dark indigo | `#4849C7` |
| Primary light background | Lavender | `#ECECFF` |
| Main text | Deep navy | `#172033` |
| Secondary text | Slate | `#667085` |
| Page background | Warm off-white | `#F7F7F4` |
| Card background | White | `#FFFFFF` |
| Border | Light gray | `#E4E7EC` |
| Disabled background | Pale gray | `#F2F4F7` |

## Feedback colors

| State | Text or icon | Light background |
| --- | --- | --- |
| Success | `#14804A` | `#DDF6E8` |
| Error | `#D92D20` | `#FEE4E2` |
| Warning | `#B54708` | `#FEF0C7` |
| Information | `#175CD3` | `#EAF2FF` |

## Folder accent colors

Use these colors lightly for folder icons rather than large backgrounds:

- Purple: `#7778F2`
- Blue: `#3B82F6`
- Green: `#45C89A`
- Yellow: `#F4C95D`

## Color usage

- Use `#172033` for headings and important content.
- Use `#667085` for descriptions, dates, and file sizes.
- Use `#5B5CE2` for primary buttons, active navigation, and focused inputs.
- Use `#FFFFFF` for cards and form surfaces.
- Use `#F7F7F4` behind the entire page.
- Use `#E4E7EC` for borders and table separators.
- Avoid using light gray for essential text because it can be difficult to read.

## Spacing

Use an 8px spacing system:

| Token | Size | Suggested use |
| --- | ---: | --- |
| Extra small | 8px | Icon gaps and closely related elements |
| Small | 16px | Input padding and compact component gaps |
| Medium | 24px | Gaps between cards and form fields |
| Large | 32px | Section padding |
| Extra large | 40px | Major content separation |
| Page | 48px | Desktop page padding |

Using multiples of 8px keeps the interface visually consistent and makes the
responsive layout easier to manage.
