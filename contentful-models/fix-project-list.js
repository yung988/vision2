const contentful = require('contentful-management')
const fs = require('fs')
const path = require('path')

// Načtení proměnných prostředí
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

// Získání management tokenu
const tokenMatch = envContent.match(/CONTENTFUL_MANAGEMENT_TOKEN=([^\s]+)/)
const managementToken = tokenMatch ? tokenMatch[1] : null

if (!managementToken) {
  console.error('Management token not found in .env.local file')
  process.exit(1)
}

// Inicializace klienta
const client = contentful.createClient({
  accessToken: managementToken,
})

async function fixProjectList() {
  try {
    const space = await client.getSpace(spaceId)
    const environment = await space.getEnvironment('master')

    // Získání všech publikovaných projektů
    console.log('Získávání publikovaných projektů...')
    const projects = await environment.getEntries({
      content_type: 'project',
      'sys.publishedAt[exists]': true,
    })

    console.log(`Nalezeno ${projects.items.length} publikovaných projektů`)

    // Získání project listu
    console.log('Získávání project listu...')
    let projectList
    try {
      projectList = await environment.getEntry('01IyifdnF9szHBFuCRtUnH')
      console.log(`Project list nalezen s ID: ${projectList.sys.id}`)
    } catch (error) {
      console.error('Project list nenalezen, vytvářím nový...')
      projectList = await environment.createEntry('projectList', {
        fields: {},
      })
      console.log(`Vytvořen nový project list s ID: ${projectList.sys.id}`)
    }

    // Aktualizace project listu pouze s publikovanými projekty
    projectList.fields.listCollection = {
      'en-US': projects.items.map((project) => ({
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: project.sys.id,
        },
      })),
    }

    // Uložení a publikování
    projectList = await projectList.update()
    projectList = await projectList.publish()

    console.log(
      `Project list aktualizován a publikován s ID: ${projectList.sys.id}`,
    )
    console.log(`Obsahuje ${projects.items.length} projektů`)

    // Aktualizace GraphQL dotazu se správným ID
    const graphqlPath = path.join(
      __dirname,
      '../contentful/queries/home.graphql',
    )
    let graphqlContent = fs.readFileSync(graphqlPath, 'utf8')

    // Nahrazení ID project listu v dotazu
    graphqlContent = graphqlContent.replace(
      /projectList\(id: "[^"]+"/,
      `projectList(id: "${projectList.sys.id}"`,
    )

    fs.writeFileSync(graphqlPath, graphqlContent)
    console.log(
      `Aktualizován GraphQL dotaz s ID project listu: ${projectList.sys.id}`,
    )

    console.log('Hotovo!')
  } catch (error) {
    console.error('Chyba při opravě project listu:', error)
  }
}

fixProjectList()
