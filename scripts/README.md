# Contentful Image Upload Scripts

These scripts help you upload images to your Contentful projects.

## Prerequisites

Make sure you have the following environment variables in your `.env.local` file:

```
NEXT_CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_MANAGEMENT_TOKEN=your_management_token
```

## List Projects

To list all your projects in Contentful, run:

```bash
node scripts/list-projects.js
```

This will display a list of all your projects with their IDs, names, industries, and whether they already have images.

## Upload Images to a Project

1. Place your images in the `scripts/images` directory
2. Run the upload script with the project ID:

```bash
node scripts/upload-images.js PROJECT_ID
```

Replace `PROJECT_ID` with the ID of the project you want to add images to (from the list-projects.js output).

For example:

```bash
node scripts/upload-images.js 6ygUfXx65DWRcy7opyeYU1
```

The script will:

1. Upload all images in the `scripts/images` directory to Contentful
2. Create a new asset entry with all the uploaded images
3. Associate the asset entry with the specified project
4. Clean up the images directory after successful upload

## Supported Image Formats

The script supports the following image formats:

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

## Troubleshooting

If you encounter any issues, check:

1. That your environment variables are correctly set
2. That you have the correct project ID
3. That your images are in the correct directory and format
