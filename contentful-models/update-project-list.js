const contentful = require('contentful-management')
const fs = require('fs')
const path = require('path')

// Load environment variables
const envContent = fs.readFileSync(
  path.join(__dirname, '../.env.local'),
  'utf8',
)
const spaceIdMatch = envContent.match(
  /NEXT_PUBLIC_CONTENTFUL_SPACE_ID=([^\s]+)/,
)
const spaceId = spaceIdMatch ? spaceIdMatch[1] : null

if (!spaceId) {
  console.error('Space ID not found in .env.local file')
  process.exit(1)
}

// Get management token
const tokenMatch = envContent.match(/CONTENTFUL_MANAGEMENT_TOKEN=([^\s]+)/)
const managementToken = tokenMatch ? tokenMatch[1] : null

if (!managementToken) {
  console.error('Management token not found in .env.local file')
  process.exit(1)
}

// Initialize client
const client = contentful.createClient({
  accessToken: managementToken,
})

async function updateProjectList() {
  try {
    const space = await client.getSpace(spaceId)
    const environment = await space.getEnvironment('master')

    // Get all projects
    console.log('Fetching all projects...')
    const projects = await environment.getEntries({
      content_type: 'project',
    })

    console.log(`Found ${projects.items.length} projects`)

    // Create or update project list
    console.log('Creating/updating project list...')

    // First check if project list exists
    const projectLists = await environment.getEntries({
      content_type: 'projectList',
    })

    let projectList

    if (projectLists.items.length > 0) {
      // Update existing project list
      projectList = projectLists.items[0]
      console.log(
        `Updating existing project list with ID: ${projectList.sys.id}`,
      )
    } else {
      // Create new project list
      projectList = await environment.createEntry('projectList', {
        fields: {},
      })
      console.log(`Created new project list with ID: ${projectList.sys.id}`)
    }

    // Update project list with all projects
    projectList.fields.listCollection = {
      'en-US': projects.items.map((project) => ({
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: project.sys.id,
        },
      })),
    }

    // Save and publish
    projectList = await projectList.update()
    projectList = await projectList.publish()

    console.log(
      `Project list updated and published with ID: ${projectList.sys.id}`,
    )
    console.log(`Contains ${projects.items.length} projects`)

    // Update the GraphQL query with the correct ID
    const graphqlPath = path.join(
      __dirname,
      '../contentful/queries/home.graphql',
    )
    let graphqlContent = fs.readFileSync(graphqlPath, 'utf8')

    // Replace the project list ID in the query
    graphqlContent = graphqlContent.replace(
      /projectList\(id: "[^"]+"/,
      `projectList(id: "${projectList.sys.id}"`,
    )

    fs.writeFileSync(graphqlPath, graphqlContent)
    console.log(
      `Updated GraphQL query with project list ID: ${projectList.sys.id}`,
    )

    console.log('Done!')
  } catch (error) {
    console.error('Error updating project list:', error)
  }
}

updateProjectList()
