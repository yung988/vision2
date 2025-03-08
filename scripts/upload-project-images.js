require('dotenv').config({ path: '.env.local' })
const { createClient } = require('contentful-management')
const fs = require('fs')
const path = require('path')
const mime = require('mime-types')

// Configuration
const SPACE_ID = process.env.NEXT_CONTENTFUL_SPACE_ID
const ENVIRONMENT_ID = 'master'
const ACCESS_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images')

// Initialize the Contentful Management client
const client = createClient({
  accessToken: ACCESS_TOKEN,
})

async function uploadProjectImages() {
  try {
    console.log('Starting to upload project images from public/images/')

    // Get the space and environment
    const space = await client.getSpace(SPACE_ID)
    const environment = await space.getEnvironment(ENVIRONMENT_ID)

    // Get all projects
    const entries = await environment.getEntries({ content_type: 'project' })
    console.log(`Found ${entries.items.length} projects`)

    // Read all images from the images directory
    const imageFiles = fs.readdirSync(IMAGES_DIR).filter((file) => {
      const ext = path.extname(file).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)
    })

    if (imageFiles.length === 0) {
      console.error(`No image files found in ${IMAGES_DIR}`)
      process.exit(1)
    }

    console.log(`Found ${imageFiles.length} images`)

    // Group images by project name
    const projectImages = {}
    imageFiles.forEach((file) => {
      // Extract project name from file name (e.g., "blue night_image_065.webp" -> "blue night")
      const projectName = file.split('_image_')[0]
      if (!projectImages[projectName]) {
        projectImages[projectName] = []
      }
      projectImages[projectName].push(file)
    })

    console.log(
      `Grouped images for ${Object.keys(projectImages).length} projects`,
    )

    // Process each project
    for (const [projectName, images] of Object.entries(projectImages)) {
      console.log(
        `\nProcessing project: ${projectName} (${images.length} images)`,
      )

      // Find the project by name
      const project = entries.items.find(
        (entry) => entry.fields.name?.['en-US'] === projectName,
      )

      if (!project) {
        console.log(`Project "${projectName}" not found, skipping`)
        continue
      }

      console.log(`Found project with ID: ${project.sys.id}`)

      // Upload images for this project
      const uploadedAssetLinks = []

      for (const imageFile of images) {
        const filePath = path.join(IMAGES_DIR, imageFile)
        const fileBuffer = fs.readFileSync(filePath)
        const contentType = mime.lookup(filePath) || 'application/octet-stream'
        const fileName = path.basename(imageFile)

        console.log(`Uploading ${imageFile}...`)

        try {
          // Create the asset
          let asset = await environment.createAssetFromFiles({
            fields: {
              title: {
                'en-US': path.basename(imageFile, path.extname(imageFile)),
              },
              description: {
                'en-US': `Image for ${projectName}`,
              },
              file: {
                'en-US': {
                  contentType,
                  fileName,
                  file: fileBuffer,
                },
              },
            },
          })

          // Process and publish the asset
          asset = await asset.processForAllLocales()
          asset = await asset.publish()

          console.log(`Published asset: ${asset.sys.id}`)

          // Add the asset to the collection
          uploadedAssetLinks.push({
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: asset.sys.id,
            },
          })
        } catch (error) {
          console.error(`Error uploading ${imageFile}:`, error.message)
        }
      }

      if (uploadedAssetLinks.length === 0) {
        console.log(
          `No images were successfully uploaded for project "${projectName}", skipping`,
        )
        continue
      }

      // Create an asset entry to hold the images
      console.log('Creating asset entry...')
      let assetEntry = await environment.createEntry('asset', {
        fields: {
          imagesCollection: {
            'en-US': uploadedAssetLinks,
          },
        },
      })

      // Publish the asset entry
      assetEntry = await assetEntry.publish()
      console.log(`Published asset entry with ID: ${assetEntry.sys.id}`)

      // Update the project with the new asset entry
      const assetsCollection = project.fields.assetsCollection?.['en-US'] || []

      // Add the asset entry to the project's assetsCollection
      assetsCollection.push({
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: assetEntry.sys.id,
        },
      })

      project.fields.assetsCollection = {
        'en-US': assetsCollection,
      }

      // Update and publish the project
      let updatedProject = await project.update()
      updatedProject = await updatedProject.publish()

      console.log(`Updated and published project: ${updatedProject.sys.id}`)
      console.log(
        `Added ${uploadedAssetLinks.length} images to project "${projectName}" successfully!`,
      )
    }

    console.log('\nFinished processing all projects!')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

uploadProjectImages()
