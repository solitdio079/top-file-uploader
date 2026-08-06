# Files and Folders: Canonical Layout Decisions

Use the two canonical reference boards in this folder for all folder and file
listing work. They replace the older, conflicting versions.

## Shared application shell

- **Desktop:** a persistent left sidebar, a top utility header, and the storage
  card at the bottom of the sidebar.
- **Mobile:** a compact top header and a fixed bottom navigation. Do not show a
  persistent sidebar on mobile.
- Keep the same navigation in both layouts: **My files**, **Shared**,
  **Recent**, and **Trash**.
- Reuse the existing TOP Upload logo, placeholder avatar, colours, button
  styles, and footer treatment from the account page.

## My folders page

- **Desktop:** show folder cards in a two-column grid.
- **Mobile:** show one horizontal folder row per folder.
- A folder item shows its icon, name, file count, updated date, and a three-dot
  actions button.
- The actions menu is: View files, Add files, Rename, Delete.

## Folder files page

- **Desktop:** show one table with Name, Size, Uploaded, and Actions columns.
- **Mobile:** show one stacked file row per file; keep the filename, size, date,
  and actions button together.
- Do not use a file-card grid on this page. It would make the desktop and
  mobile content patterns unnecessarily different.

## Canonical assets

- `my-folders-canonical-reference.png`
- `folder-files-canonical-reference.png`
