require('dotenv').config({ path: '.env.local' })
const { createClient } = require('contentful-management')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Configuration
const SPACE_ID = process.env.NEXT_CONTENTFUL_SPACE_ID
const ENVIRONMENT_ID = 'master'
const ACCESS_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN

// Initialize the Contentful Management client
const client = createClient({
  accessToken: ACCESS_TOKEN,
})

async function uploadImagesForAllProjects() {
  try {
    console.log('Starting to upload images for all projects...')

    // Get the space and environment
    const space = await client.getSpace(SPACE_ID)
    const environment = await space.getEnvironment(ENVIRONMENT_ID)

    // Get all projects
    const entries = await environment.getEntries({ content_type: 'project' })

    console.log(`Found ${entries.items.length} projects`)

    // Create images directory if it doesn't exist
    const imagesDir = path.join(__dirname, 'images')
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true })
    }

    // Process each project
    for (const project of entries.items) {
      const projectId = project.sys.id
      const projectName = project.fields.name?.['en-US']

      if (!projectName) {
        console.log(`Skipping project with ID ${projectId} - no name found`)
        continue
      }

      console.log(`\n--- Processing project: ${projectName} (${projectId}) ---`)

      // Check if the project already has sample images
      if (project.fields.assetsCollection?.['en-US']?.length > 0) {
        console.log(`Project ${projectName} already has assets, skipping...`)
        continue
      }

      // Copy sample images to the images directory
      console.log('Copying sample images...')
      try {
        // Clean the images directory first
        fs.readdirSync(imagesDir).forEach((file) => {
          fs.unlinkSync(path.join(imagesDir, file))
        })

        // Copy sample images
        fs.copyFileSync(
          path.join(__dirname, '..', 'public', 'android-chrome-192x192.png'),
          path.join(imagesDir, 'sample-image-1.png'),
        )
        fs.copyFileSync(
          path.join(__dirname, '..', 'public', 'android-chrome-512x512.png'),
          path.join(imagesDir, 'sample-image-2.png'),
        )

        // Run the upload-images.js script for this project
        console.log(`Running upload script for project ${projectName}...`)
        execSync(
          `node ${path.join(__dirname, 'upload-images.js')} ${projectId}`,
          {
            stdio: 'inherit',
          },
        )

        console.log(`Successfully uploaded images for project ${projectName}`)
      } catch (error) {
        console.error(`Error processing project ${projectName}:`, error.message)
      }
    }

    console.log('\nFinished processing all projects!')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

uploadImagesForAllProjects()
