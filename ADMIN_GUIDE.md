# Beopardy Stats Admin Guide

This guide covers the data entry workflow for managing players, episodes, and game results.

## Getting Started

### Accessing the Admin Panel

1. Navigate to `/admin/login`
2. Sign in with your admin credentials
3. You'll be redirected to the admin dashboard

### Dashboard Overview

The admin dashboard provides:
- Quick stats (total players, episodes, appearances)
- Quick action buttons to add players or episodes
- Recent activity overview

## Managing Players

### Adding a New Player

1. Click **"Add Player"** from the dashboard or navigate to `/admin/players/new`
2. Fill in the required fields:
   - **Name** (required): The player's display name
   - **Image URL** (optional): A URL to the player's profile image
3. Click **"Create Player"** to save

The player's URL slug is automatically generated from their name.

### Editing a Player

1. Go to **Admin > Players** to see all players
2. Click the **Edit** button next to the player you want to modify
3. Update the name or image URL
4. Click **"Update Player"** to save changes

### Deleting a Player

1. Go to the player's edit page
2. Click the **"Delete Player"** button
3. Confirm the deletion in the dialog

**Warning:** Deleting a player will also delete all their episode appearances.

## Managing Episodes

### Adding a New Episode

1. Click **"Add Episode"** from the dashboard or navigate to `/admin/episodes/new`
2. Fill in the required fields:
   - **Title** (required): Episode title
   - **Season** (required): Season number
   - **Episode Number** (required): Episode number within the season
   - **Air Date** (required): When the episode aired
3. Optional fields:
   - **YouTube URL**: Link to the episode on YouTube
   - **Thumbnail URL**: Episode thumbnail image
   - **Description**: Brief description of the episode
4. Click **"Create Episode"** to save

### Editing an Episode

1. Go to **Admin > Episodes** to see all episodes
2. Click the **Edit** button next to the episode
3. Update any fields as needed
4. Click **"Update Episode"** to save

### Deleting an Episode

1. Go to the episode's edit page
2. Click the **"Delete Episode"** button
3. Confirm the deletion

**Warning:** Deleting an episode will also delete all associated results.

## Recording Episode Results

This is the primary data entry task after each episode airs.

### Step-by-Step Process

1. **Navigate to Results Entry**
   - Go to **Admin > Episodes**
   - Find the episode and click **"Add Results"**

2. **Select Participants**
   - Choose all players who appeared in the episode
   - Use the dropdown to add each player

3. **Enter Player Statistics** for each participant:
   - **Points Scored**: Final score at the end of the game
   - **Questions Seen**: Total questions the player could have answered
   - **Questions Correct**: Number of correct responses
   - **Placement**: Final ranking (1st, 2nd, 3rd, etc.)
   - **Is Winner**: Check if this player won the episode
   - **Final Wager** (optional): Amount wagered in Final Beopardy
   - **Final Correct** (optional): Whether they got Final Beopardy right

4. **Important Rules**
   - Only ONE player can be marked as winner per episode
   - All placements should be unique
   - Points can be negative (if a player ends in the negative)

5. **Save Results**
   - Review all entries for accuracy
   - Click **"Save Results"** to submit

### Tips for Accurate Data Entry

- Watch the episode while entering data if possible
- Double-check point totals against the final scores shown
- Note: Questions seen/correct may need to be estimated if not explicitly shown
- Final Beopardy statistics are optional but helpful for detailed analysis

## Data Validation

The system enforces these rules:

### Players
- Name is required and must be unique
- Slug is auto-generated (lowercase, hyphenated)

### Episodes
- Title, season, episode number, and air date are required
- Season/episode number combination must be unique

### Results
- Episode and player IDs must exist
- Points scored is required
- Only one winner per episode
- Placements must be valid (1 or greater)

## Best Practices

1. **Add players first** before recording episode results
2. **Enter data soon after episodes air** while details are fresh
3. **Use consistent naming** for players (e.g., "Shayne Topp" not "Shayne")
4. **Include YouTube links** when available for episode references
5. **Review the public pages** after data entry to verify accuracy

## Troubleshooting

### "Player already exists" error
- The name or slug conflicts with an existing player
- Check for variations in spelling or punctuation

### "Episode already exists" error
- An episode with the same season/episode number exists
- Verify you're entering a new episode

### Results not saving
- Ensure all required fields are filled
- Check that only one player is marked as winner
- Verify no duplicate placements

### Changes not appearing on public pages
- Pages are cached for performance
- Changes should appear within 30 minutes
- For immediate updates, trigger a revalidation via deployment

## Support

If you encounter issues not covered here, check:
- Browser console for error messages
- Network tab for failed API calls
- Database logs in Supabase dashboard
