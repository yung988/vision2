const contentful = require('contentful-management')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

// Kontrola proměnných prostředí
const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID
const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN

if (!spaceId || !managementToken) {
  console.error('Chybí potřebné proměnné prostředí')
  process.exit(1)
}

// Inicializace klienta
const client = contentful.createClient({
  accessToken: managementToken,
})

// Funkce pro získání seznamu obrázků podle projektů
function getProjectImages() {
  const imagesDir = path.join(__dirname, '../public/images')
  const files = fs.readdirSync(imagesDir)

  // Filtrování souborů .DS_Store a podobných
  const imageFiles = files.filter(
    (file) =>
      file.endsWith('.webp') || file.endsWith('.jpg') || file.endsWith('.png'),
  )

  // Seskupení obrázků podle projektů
  const projects = {}

  imageFiles.forEach((file) => {
    const projectName = file.split('_image_')[0]
    if (!projects[projectName]) {
      projects[projectName] = []
    }
    projects[projectName].push({
      fileName: file,
      filePath: path.join(imagesDir, file),
      localPath: `/images/${file}`,
    })
  })

  return projects
}

// Pomocná funkce pro čekání
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Funkce pro vytvoření projektu s obrázky
async function createProjectWithImages(environment, projectName, images) {
  try {
    console.log(`\nVytvářím projekt: ${projectName} s ${images.length} obrázky`)

    // Generování náhodných dat pro projekt
    const industries = [
      'Photography',
      'Design',
      'Art',
      'Fashion',
      'Music',
      'Film',
    ]
    const services = [
      'Photography',
      'Design',
      'Art Direction',
      'Styling',
      'Production',
      'Post-production',
    ]
    const stacks = [
      'Canon',
      'Nikon',
      'Sony',
      'Fujifilm',
      'Photoshop',
      'Lightroom',
      'Capture One',
    ]

    // Vytvoření projektu
    const project = await environment.createEntry('project', {
      fields: {
        name: {
          'en-US': projectName,
        },
        industry: {
          'en-US': industries[Math.floor(Math.random() * industries.length)],
        },
        body: {
          'en-US': {
            nodeType: 'document',
            data: {},
            content: [
              {
                nodeType: 'paragraph',
                data: {},
                content: [
                  {
                    nodeType: 'text',
                    value: `${projectName} je kreativní projekt zaměřený na vizuální identitu a fotografii.`,
                    marks: [],
                    data: {},
                  },
                ],
              },
            ],
          },
        },
        testimonial: {
          'en-US': `"Spolupráce na projektu ${projectName} byla skvělá. Výsledky předčily naše očekávání."`,
        },
        services: {
          'en-US': services.slice(0, 3 + Math.floor(Math.random() * 3)),
        },
        stack: {
          'en-US': stacks.slice(0, 2 + Math.floor(Math.random() * 3)),
        },
        // Přidáme pole pro lokální cesty k obrázkům
        localImages: {
          'en-US': images.map((image) => image.localPath),
        },
        // Přidáme hlavní obrázek (první v seznamu)
        mainImage: {
          'en-US': images.length > 0 ? images[0].localPath : null,
        },
      },
    })

    await project.publish()
    console.log(`Projekt ${projectName} vytvořen s ID: ${project.sys.id}`)
    return project
  } catch (error) {
    console.error(`Chyba při vytváření projektu ${projectName}:`, error)
    return null
  }
}

// Funkce pro aktualizaci seznamu projektů
async function updateProjectList(environment, projects) {
  try {
    console.log('Aktualizuji seznam projektů...')

    // Načtení ID z contentful-ids.json
    const idsFilePath = path.join(__dirname, 'contentful-ids.json')
    const idsContent = fs.readFileSync(idsFilePath, 'utf8')
    const ids = JSON.parse(idsContent)

    // Získání existujícího seznamu projektů
    const projectList = await environment.getEntry(ids.projectList)

    // Aktualizace seznamu projektů
    projectList.fields.listCollection = {
      'en-US': projects.map((project) => ({
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: project.sys.id,
        },
      })),
    }

    // Publikace aktualizovaného seznamu projektů
    const updatedProjectList = await projectList.update()
    await updatedProjectList.publish()

    console.log(
      `Seznam projektů aktualizován s ID: ${updatedProjectList.sys.id}`,
    )
    console.log(`Obsahuje ${projects.length} projektů`)
    return updatedProjectList
  } catch (error) {
    console.error('Chyba při aktualizaci seznamu projektů:', error)
    return null
  }
}

// Hlavní funkce
async function createProjectsWithImages() {
  try {
    console.log('Začínám vytváření projektů s obrázky...')

    // Získání projektů a jejich obrázků
    const projectsWithImages = getProjectImages()
    const projectNames = Object.keys(projectsWithImages)
    console.log(`Nalezeno ${projectNames.length} projektů`)

    // Získání prostoru a prostředí
    const space = await client.getSpace(spaceId)
    const environment = await space.getEnvironment('master')

    // Vytvoření projektů
    const createdProjects = []

    for (const projectName of projectNames) {
      const images = projectsWithImages[projectName]
      const project = await createProjectWithImages(
        environment,
        projectName,
        images,
      )
      if (project) {
        createdProjects.push(project)
      }

      // Krátká pauza mezi projekty, aby se snížilo zatížení API
      if (projectNames.indexOf(projectName) < projectNames.length - 1) {
        console.log('Čekám 3 sekundy před zpracováním dalšího projektu...')
        await sleep(3000)
      }
    }

    // Aktualizace seznamu projektů
    if (createdProjects.length > 0) {
      await updateProjectList(environment, createdProjects)
    }

    console.log('\nVytváření projektů s obrázky dokončeno!')
    console.log(`Vytvořeno ${createdProjects.length} projektů`)
  } catch (error) {
    console.error('Nastala chyba při vytváření projektů s obrázky:', error)
  }
}

createProjectsWithImages()
