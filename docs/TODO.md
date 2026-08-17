# TODO

## Features

- Startup
    - Should open on the first time the user opens the program and subsequently after each update
    - Should offer some common settings and allow account integration at the beginning
    - Very streamlined and explained well
- Home
    - Contains a hub where some important information is readily available, such as upload queue status, upload limits, upload karma, etc.
- Settings
    - Application settings, and the store custom tag and implications
- Upload
    - Upload one or more posts to e621 in sequence
    - Allows relationships to be created and/or edited upon upload, displayed in the UI
    - Tagging can be done on multiple posts at once
    - Custom tags and aliases can be made, and will be substituted upon upload (setting may allow implications to be resolved on a keyboard shortcut)
    - Descriptions for posts can be synchronized
    - Sources can be specified for multiple posts at once, same thing for characters, artists, etc
    - Warns against bad practices (such as daizy-chaining posts instead of shallow relationships)

- Queue
    - The queue is where posts and other actions are placed before being acted upon
    - As per site recommendations, 1000ms (1s) delays will be enforced for uploads
    - The queue is keen on errors, and be set to fail out, skip, or try again in settings
    - Responds to upload limits and pauses itself if limits are exceeded

- Browse
    - Lets you browse e621 posts using your custom tags, implications, and better logic
    - UI will be better than the default e621 so that the experience is better.
    - Comments and other post interactions will be enabled when browsing.

## UI

- Startup Page for first open
- Home page for working, doubles as a hub and shows some upload history
- Settings page, contains application settings and informtion for connecting to E621 account
- Upload page, fairly complex, needs to meet the features for it