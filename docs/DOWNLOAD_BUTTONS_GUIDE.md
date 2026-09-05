# Download Buttons Implementation

## Overview
Added download functionality to the WorkDetail page allowing viewers to download photos and videos from Google Drive.

## Components Created

### 1. DownloadButton Component
**Location:** `src/components/ui/DownloadButton.jsx`

**Props:**
- `label` - Button text (default: "Download Photos")
- `driveLink` - Google Drive folder/file link
- `variant` - Button style: "primary", "secondary", or "restricted"
- `icon` - Icon type: "download", "video", or "folder"

**Variants:**
- **primary** - Blue accent button for public downloads
- **secondary** - Subtle surface button
- **restricted** - Gradient button for client-only access

## Data Structure Updates

### content.js
Added `driveLinks` object to wedding case study:

```javascript
driveLinks: {
  albumGallery: 'REPLACE_WITH_ALBUM_FOLDER_LINK', // Public access
  video: 'REPLACE_WITH_VIDEO_FOLDER_LINK', // Public access
  allFiles: 'REPLACE_WITH_ALL_FILES_LINK', // Restricted - client only
}
```

## Implementation in WorkDetail Page

### 3 Download Buttons Added:

1. **Download Video Button**
   - Located after the video player
   - Uses `project.driveLinks.video`
   - Public access link
   - Icon: video camera

2. **Download Album Photos Button**
   - Located after the Album Gallery section
   - Uses `project.driveLinks.albumGallery`
   - Public access link
   - Icon: download arrow

3. **Download All Files Button**
   - Located in a special "Client Access" section
   - Uses `project.driveLinks.allFiles`
   - Restricted access (client only)
   - Gradient styled for prominence
   - Icon: folder

## How to Set Up Google Drive Links

### For Public Access (Album & Video):
1. Create a Google Drive folder
2. Upload all photos/videos
3. Right-click folder → Share
4. Change to "Anyone with the link can view"
5. Copy the sharing link
6. Paste into `content.js` in the `driveLinks` object

### For Restricted Access (All Files):
1. Create a Google Drive folder
2. Upload all event content
3. Right-click folder → Share
4. Add only the client's email address
5. Set permission to "Viewer"
6. Copy the sharing link
7. Paste into `content.js` as `allFiles`

## Example Link Format

```
https://drive.google.com/drive/folders/1ABC123_FOLDER_ID_HERE
```

## Usage Example

In `content.js`:
```javascript
{
  id: 1,
  slug: 'siddhita-kanad-wedding',
  // ... other fields
  driveLinks: {
    albumGallery: 'https://drive.google.com/drive/folders/1ABC123...',
    video: 'https://drive.google.com/drive/folders/1DEF456...',
    allFiles: 'https://drive.google.com/drive/folders/1GHI789...',
  },
}
```

## Styling Features

- Smooth hover animations
- Shadow elevation on hover
- Responsive button sizing
- Icon + text layout
- Disabled state when no link provided
- Opens links in new tab

## Notes

- Buttons are conditionally rendered based on `driveLinks` availability
- All downloads open in a new browser tab
- Restricted link still requires Google Drive authentication
- Public links are accessible to anyone with the URL
