require('dotenv').config({ path: '.env.local' })
const { createClient } = require('contentful-management')
const fs = require('fs')
const path = require('path')
const mime = require('mime-types')

// Configuration
const SPACE_ID = process.env.NEXT_CONTENTFUL_SPACE_ID
const ENVIRONMENT_ID = 'master'
const ACCESS_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN
const PROJECT_ID = process.argv[2] // Pass project ID as command line argument
const IMAGES_DIR = path.join(__dirname, 'images')

if (!PROJECT_ID) {
  console.error('Please provide a project ID as a command line argument')
  console.log('Usage: node scripts/upload-images.js PROJECT_ID')
  process.exit(1)
}

// Initialize the Contentful Management client
const client = createClient({
  accessToken: ACCESS_TOKEN,
})

async function uploadImages() {
  try {
    console.log(`Uploading images for project ${PROJECT_ID}...`)

    // Get the space and environment
    const space = await client.getSpace(SPACE_ID)
    const environment = await space.getEnvironment(ENVIRONMENT_ID)

    // Get the project entry
    let project
    try {
      project = await environment.getEntry(PROJECT_ID)
      console.log(`Found project: ${project.fields.name?.['en-US']}`)
    } catch (error) {
      console.error(`Project with ID ${PROJECT_ID} not found`)
      process.exit(1)
    }

    // Read all images from the images directory
    const imageFiles = fs.readdirSync(IMAGES_DIR).filter((file) => {
      const ext = path.extname(file).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)
    })

    if (imageFiles.length === 0) {
      console.error(`No image files found in ${IMAGES_DIR}`)
      console.log('Please add your images to the scripts/images directory')
      process.exit(1)
    }

    console.log(`Found ${imageFiles.length} images to upload`)

    // Upload each image as a Contentful asset
    const uploadedAssetLinks = []

    for (const imageFile of imageFiles) {
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
              'en-US': `Image for ${
                project.fields.name?.['en-US'] || 'Project'
              }`,
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
      console.error('No images were successfully uploaded')
      process.exit(1)
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
    console.log('Images uploaded and associated with the project successfully!')

    // Clean up the images directory
    console.log('Cleaning up...')
    for (const imageFile of imageFiles) {
      fs.unlinkSync(path.join(IMAGES_DIR, imageFile))
    }

    console.log('Done!')
  } catch (error) {
    console.error('Error uploading images:', error)
    process.exit(1)
  }
}

uploadImages()
