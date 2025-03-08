require('dotenv').config({ path: '.env.local' })
const { createClient } = require('contentful-management')

// Configuration
const SPACE_ID = process.env.NEXT_CONTENTFUL_SPACE_ID
const ENVIRONMENT_ID = 'master'
const ACCESS_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN

// Initialize the Contentful Management client
const client = createClient({
  accessToken: ACCESS_TOKEN,
})

async function listProjects() {
  try {
    console.log('Fetching projects from Contentful...')

    // Get the space and environment
    const space = await client.getSpace(SPACE_ID)
    const environment = await space.getEnvironment(ENVIRONMENT_ID)

    // Get all entries of content type 'project'
    const entries = await environment.getEntries({
      content_type: 'project',
    })

    if (entries.items.length === 0) {
      console.log('No projects found in Contentful')
      return
    }

    console.log(`Found ${entries.items.length} projects:`)
    console.log('-----------------------------------')

    // Display each project with its ID and name
    entries.items.forEach((entry, index) => {
      const name = entry.fields.name?.['en-US'] || 'Unnamed Project'
      const industry = entry.fields.industry?.['en-US'] || 'N/A'
      const hasAssets = entry.fields.assetsCollection?.['en-US']?.length > 0

      console.log(`${index + 1}. ID: ${entry.sys.id}`)
      console.log(`   Name: ${name}`)
      console.log(`   Industry: ${industry}`)
      console.log(`   Has Images: ${hasAssets ? 'Yes' : 'No'}`)
      console.log('-----------------------------------')
    })

    console.log('\nTo upload images to a project, run:')
    console.log('node scripts/upload-images.js PROJECT_ID')
    console.log(
      '\nReplace PROJECT_ID with the ID of the project you want to add images to.',
    )
  } catch (error) {
    console.error('Error fetching projects:', error)
    process.exit(1)
  }
}

listProjects()
