const contentful = require('contentful-management')
const fs = require('fs')
const path = require('path')
const mime = require('mime-types')

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

// Inicializace klienta
const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
})

// Funkce pro nahrání obrázku do Contentful
async function uploadImage(environment, filePath, fileName) {
  try {
    console.log(`Uploading image: ${fileName}`)

    // Zjištění MIME typu souboru
    const contentType = mime.lookup(filePath) || 'image/jpeg'

    // Vytvoření asset
    const asset = await environment.createAsset({
      fields: {
        title: {
          'en-US': fileName,
        },
        description: {
          'en-US': `Image from ${path.basename(path.dirname(filePath))}`,
        },
        file: {
          'en-US': {
            contentType: contentType,
            fileName: fileName,
          },
        },
      },
    })

    // Nahrání souboru
    const fileBuffer = fs.readFileSync(filePath)
    await asset.fields.file['en-US'].upload(fileBuffer)

    // Publikování asset
    await asset.processForAllLocales()
    const processedAsset = await asset.publish()

    console.log(`Image uploaded with ID: ${processedAsset.sys.id}`)
    return processedAsset
  } catch (error) {
    console.error(`Error uploading image ${fileName}:`, error.message)
    return null
  }
}

// Funkce pro vytvoření projektu v Contentful
async function createProject(environment, projectName, images) {
  try {
    console.log(`Creating project: ${projectName}`)

    // Vytvoření asset collection
    const assetCollection = await environment.createEntry('asset', {
      fields: {
        imagesCollection: {
          'en-US': images.map((image) => ({
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: image.sys.id,
            },
          })),
        },
      },
    })
    await assetCollection.publish()

    // Vytvoření projektu
    const project = await environment.createEntry('project', {
      fields: {
        name: {
          'en-US': projectName,
        },
        industry: {
          'en-US': 'Photography',
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
                    value: `Project ${projectName} by Studio Vision.`,
                    marks: [],
                    data: {},
                  },
                ],
              },
            ],
          },
        },
        testimonial: {
          'en-US': `Great work on ${projectName}!`,
        },
        assetsCollection: {
          'en-US': [
            {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: assetCollection.sys.id,
              },
            },
          ],
        },
        services: {
          'en-US': ['Photography', 'Art Direction'],
        },
        stack: {
          'en-US': ['Camera', 'Lighting', 'Post-processing'],
        },
        link: {
          'en-US': 'https://studiovision.com',
        },
      },
    })
    await project.publish()

    console.log(`Project created with ID: ${project.sys.id}`)
    return project
  } catch (error) {
    console.error(`Error creating project ${projectName}:`, error.message)
    return null
  }
}

// Funkce pro vytvoření seznamu projektů
async function createProjectList(environment, projects) {
  try {
    console.log('Creating project list')

    // Vytvoření seznamu projektů
    const projectList = await environment.createEntry('projectList', {
      fields: {
        listCollection: {
          'en-US': projects.map((project) => ({
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: project.sys.id,
            },
          })),
        },
      },
    })
    await projectList.publish()

    console.log(`Project list created with ID: ${projectList.sys.id}`)
    return projectList
  } catch (error) {
    console.error('Error creating project list:', error.message)
    return null
  }
}

// Hlavní funkce
async function uploadImagesAndCreateProjects() {
  try {
    const space = await client.getSpace(spaceId)
    const environment = await space.getEnvironment('master')

    // Získání seznamu složek s projekty
    const projectsDir = path.join(__dirname, '../public/images')
    const projectFolders = fs
      .readdirSync(projectsDir)
      .filter(
        (folder) =>
          fs.statSync(path.join(projectsDir, folder)).isDirectory() &&
          !folder.startsWith('.'),
      )

    console.log(`Found ${projectFolders.length} project folders`)

    const createdProjects = []

    // Zpracování každé složky s projektem
    for (const projectFolder of projectFolders) {
      const projectPath = path.join(projectsDir, projectFolder)
      const imageFiles = fs
        .readdirSync(projectPath)
        .filter(
          (file) =>
            !file.startsWith('.') &&
            (file.endsWith('.jpg') ||
              file.endsWith('.jpeg') ||
              file.endsWith('.png')),
        )

      console.log(
        `Processing project ${projectFolder} with ${imageFiles.length} images`,
      )

      // Nahrání obrázků
      const uploadedImages = []
      for (const imageFile of imageFiles) {
        const imagePath = path.join(projectPath, imageFile)
        const uploadedImage = await uploadImage(
          environment,
          imagePath,
          imageFile,
        )
        if (uploadedImage) {
          uploadedImages.push(uploadedImage)
        }
      }

      // Vytvoření projektu
      if (uploadedImages.length > 0) {
        const project = await createProject(
          environment,
          projectFolder,
          uploadedImages,
        )
        if (project) {
          createdProjects.push(project)
        }
      }
    }

    // Vytvoření seznamu projektů
    if (createdProjects.length > 0) {
      const projectList = await createProjectList(environment, createdProjects)

      console.log('\nAll done!')
      console.log(`Created ${createdProjects.length} projects`)
      console.log(`Project list ID: ${projectList.sys.id}`)
      console.log('\nPlease update your GraphQL queries with this ID:')
      console.log(`projectList: "${projectList.sys.id}"`)
    } else {
      console.log('No projects were created')
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
}

// Spuštění skriptu
uploadImagesAndCreateProjects()
