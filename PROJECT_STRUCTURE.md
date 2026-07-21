# Project Structure

This project is a modular GitHub profile repository. It is designed to maintain individual, independent animations and components that compile or render into a dynamic GitHub profile README.

## Folders Overview

- **`assets/`**
  The main directory for storing static and dynamic visual assets used in the GitHub profile.

- **`assets/animations/`**
  Contains independent animation projects (e.g., SVGs, CSS-based animations, or generation scripts). Every animation is kept modular and independent to prevent conflicts and ensure easy updates.

- **`assets/icons/`**
  Stores all static icons (e.g., social media icons, tech stack badges, and custom graphics) used across the profile README.

- **`scripts/`**
  Contains the core automation and generation scripts. These scripts might be written in Python, Node.js, or Bash to fetch dynamic data (like recent blog posts, GitHub stats, etc.) and generate the final README content or output SVGs.

- **`output/`**
  The designated directory for generated artifacts. When the scripts run, the resulting dynamic SVGs or compiled components are saved here before being referenced in the README.

- **`.github/workflows/`**
  Contains GitHub Actions workflows. These workflows are responsible for automating tasks such as running the scripts on a schedule (cron jobs) to keep the profile dynamically updated (e.g., fetching new GitHub activity, updating WakaTime stats, or rendering new animations) and committing the changes back to the repository.
