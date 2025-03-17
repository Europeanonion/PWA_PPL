# Ultimate Push-Pull-Legs Workout Tracker

A Progressive Web App (PWA) for tracking your progress through the Push-Pull-Legs workout program.

## Features

- Track workouts across multiple phases and weeks
- Save your progress locally (works offline)
- View exercise details and substitutions
- Mobile-friendly design
- Installable as a PWA on supported devices

## Deployment Options

### Option 1: Run from Root Directory (Recommended)

This option moves all files to the root directory for easier access with Live Server or any web server.

1. Run the move-to-root.sh script:
   ```bash
   chmod +x move-to-root.sh
   ./move-to-root.sh
   ```

2. When prompted, choose whether to clean up duplicate files:
   - Selecting "y" will remove the ppl-workout directory after creating a backup
   - Selecting "n" will keep both copies (not recommended due to potential confusion)

3. Access the app:
   - If using Python's built-in server: `python -m http.server 8080`
   - If using Live Server in VSCode: Right-click on index.html and select "Open with Live Server"

### Option 2: Run from ppl-workout Directory

This option keeps all files in the ppl-workout directory.

1. Navigate to the ppl-workout directory:
   ```bash
   cd ppl-workout
   ```

2. Start a web server:
   ```bash
   python -m http.server 8080
   ```

3. Access the app at http://localhost:8080

## File Structure

```
/
├── index.html              # Main HTML file
├── manifest.json           # PWA manifest
├── service-worker.js       # Service worker for offline functionality
├── direct-load.js          # Ensures workout data loads properly
├── assets/                 # Static assets
│   ├── css/                # Stylesheets
│   ├── js/                 # JavaScript files
│   └── icons/              # App icons
└── dev/                    # Development files
    └── exercise-data/      # JSON files containing workout data
```

## Scripts

- `move-to-root.sh`: Moves all files from ppl-workout/ to the root directory
- `cleanup-duplicates.sh`: Removes duplicate files after moving to root

## Troubleshooting

### Data Not Loading

If workout data isn't loading properly:

1. Check the browser console for errors
2. Verify that the exercise data files exist in the correct location
3. Try clearing your browser cache
4. Ensure the direct-load.js script is included in index.html

### PWA Not Installing

If the app doesn't show an install prompt:

1. Make sure you're using a supported browser (Chrome, Edge, etc.)
2. Visit the site at least twice
3. Interact with the site for at least 30 seconds
4. Check that all PWA requirements are met (HTTPS, valid manifest, etc.)

## Development

For development, it's recommended to:

1. Make changes in the ppl-workout directory
2. Test changes locally
3. When ready to deploy, use the move-to-root.sh script
4. Run cleanup-duplicates.sh to remove duplicates

## License

This project is licensed under the MIT License - see the LICENSE file for details.