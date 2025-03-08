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

    // Create a new asset entry
    const assetEntry = await environment.createEntry('asset', {
      fields: {
        name: {
          'en-US': `Images for ${project.fields.name?.['en-US'] || 'Project'}`,
        },
        imagesCollection: {
          'en-US': [],
        },
      },
    })

    console.log(`Created asset entry with ID: ${assetEntry.sys.id}`)

    // Upload each image and add it to the asset's imagesCollection
    const imagesCollection = []

    for (const imageFile of imageFiles) {
      const filePath = path.join(IMAGES_DIR, imageFile)
      const fileBuffer = fs.readFileSync(filePath)
      const contentType = mime.lookup(filePath) || 'application/octet-stream'

      console.log(`Uploading ${imageFile}...`)

      // Upload the file to Contentful
      const uploadedAsset = await environment.createAsset({
        fields: {
          title: {
            'en-US': path.basename(imageFile, path.extname(imageFile)),
          },
          description: {
            'en-US': `Image for ${project.fields.name?.['en-US'] || 'Project'}`,
          },
          file: {
            'en-US': {
              contentType,
              fileName: imageFile,
              upload: `data:${contentType};base64,${fileBuffer.toString(
                'base64',
              )}`,
            },
          },
        },
      })

      // Process and publish the asset
      const processedAsset = await uploadedAsset.processForAllLocales()
      const publishedAsset = await processedAsset.publish()

      console.log(`Published asset: ${publishedAsset.sys.id}`)

      // Add the asset to the imagesCollection
      imagesCollection.push({
        sys: {
          type: 'Link',
          linkType: 'Asset',
          id: publishedAsset.sys.id,
        },
      })
    }

    // Update the asset entry with the imagesCollection
    assetEntry.fields.imagesCollection['en-US'] = imagesCollection
    const updatedAssetEntry = await assetEntry.update()
    const publishedAssetEntry = await updatedAssetEntry.publish()

    console.log(`Published asset entry: ${publishedAssetEntry.sys.id}`)

    // Update the project with the new asset
    const assetsCollection = project.fields.assetsCollection?.['en-US'] || []
    assetsCollection.push({
      sys: {
        type: 'Link',
        linkType: 'Entry',
        id: publishedAssetEntry.sys.id,
      },
    })

    project.fields.assetsCollection = {
      'en-US': assetsCollection,
    }

    const updatedProject = await project.update()
    const publishedProject = await updatedProject.publish()

    console.log(`Updated and published project: ${publishedProject.sys.id}`)
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
