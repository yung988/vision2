const contentful = require('contentful-management')
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

// Definice projektů a jejich detailů
const projects = [
  {
    name: 'Babypool pro Redbull',
    industry: 'Event Photography',
    body: {
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          data: {},
          content: [
            {
              nodeType: 'text',
              value: 'Fotografická dokumentace Redbull eventu s bazénem.',
              marks: [],
              data: {},
            },
          ],
        },
      ],
    },
    services: ['Event Photography', 'Commercial Photography'],
    stack: ['Sony A7III', 'Adobe Lightroom', 'Adobe Photoshop'],
  },
  {
    name: "Carlo's Finnest",
    industry: 'Product Photography',
    body: {
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          data: {},
          content: [
            {
              nodeType: 'text',
              value: "Produktová fotografie pro Carlo's Finnest.",
              marks: [],
              data: {},
            },
          ],
        },
      ],
    },
    services: ['Product Photography', 'Commercial Photography'],
    stack: ['Sony A7III', 'Adobe Lightroom', 'Adobe Photoshop'],
  },
  {
    name: 'Drinks',
    industry: 'Product Photography',
    body: {
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          data: {},
          content: [
            {
              nodeType: 'text',
              value: 'Produktová fotografie nápojů a koktejlů.',
              marks: [],
              data: {},
            },
          ],
        },
      ],
    },
    services: ['Product Photography', 'Beverage Photography'],
    stack: ['Sony A7III', 'Adobe Lightroom', 'Adobe Photoshop'],
  },
  {
    name: 'Fausto Fillipa',
    industry: 'Fashion Photography',
    body: {
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          data: {},
          content: [
            {
              nodeType: 'text',
              value: 'Módní fotografie pro značku Fausto Fillipa.',
              marks: [],
              data: {},
            },
          ],
        },
      ],
    },
    services: ['Fashion Photography', 'Commercial Photography'],
    stack: ['Sony A7III', 'Adobe Lightroom', 'Adobe Photoshop'],
  },
  {
    name: 'Hugo Toxxx-Bday',
    industry: 'Event Photography',
    body: {
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          data: {},
          content: [
            {
              nodeType: 'text',
              value:
                'Fotografická dokumentace narozeninové oslavy Hugo Toxxxe.',
              marks: [],
              data: {},
            },
          ],
        },
      ],
    },
    services: ['Event Photography', 'Music Photography'],
    stack: ['Sony A7III', 'Adobe Lightroom', 'Adobe Photoshop'],
  },
  {
    name: 'Night Cruisin',
    industry: 'Automotive Photography',
    body: {
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          data: {},
          content: [
            {
              nodeType: 'text',
              value: 'Noční automobilová fotografie.',
              marks: [],
              data: {},
            },
          ],
        },
      ],
    },
    services: ['Automotive Photography', 'Night Photography'],
    stack: ['Sony A7III', 'Adobe Lightroom', 'Adobe Photoshop'],
  },
  {
    name: 'Natálie',
    industry: 'Portrait Photography',
    body: {
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          data: {},
          content: [
            {
              nodeType: 'text',
              value: 'Portrétní focení Natálie.',
              marks: [],
              data: {},
            },
          ],
        },
      ],
    },
    services: ['Portrait Photography'],
    stack: ['Sony A7III', 'Adobe Lightroom', 'Adobe Photoshop'],
  },
  {
    name: 'Portrét',
    industry: 'Portrait Photography',
    body: {
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          data: {},
          content: [
            {
              nodeType: 'text',
              value: 'Umělecké portrétní fotografie.',
              marks: [],
              data: {},
            },
          ],
        },
      ],
    },
    services: ['Portrait Photography', 'Art Photography'],
    stack: ['Sony A7III', 'Adobe Lightroom', 'Adobe Photoshop'],
  },
  {
    name: 'Prsteny',
    industry: 'Product Photography',
    body: {
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          data: {},
          content: [
            {
              nodeType: 'text',
              value: 'Produktová fotografie prstenů a šperků.',
              marks: [],
              data: {},
            },
          ],
        },
      ],
    },
    services: ['Product Photography', 'Jewelry Photography'],
    stack: ['Sony A7III', 'Adobe Lightroom', 'Adobe Photoshop'],
  },
  {
    name: 'Sára',
    industry: 'Portrait Photography',
    body: {
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          data: {},
          content: [
            {
              nodeType: 'text',
              value: 'Portrétní focení Sáry.',
              marks: [],
              data: {},
            },
          ],
        },
      ],
    },
    services: ['Portrait Photography'],
    stack: ['Sony A7III', 'Adobe Lightroom', 'Adobe Photoshop'],
  },
  {
    name: 'Winery',
    industry: 'Commercial Photography',
    body: {
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          data: {},
          content: [
            {
              nodeType: 'text',
              value: 'Komerční fotografie pro vinařství.',
              marks: [],
              data: {},
            },
          ],
        },
      ],
    },
    services: ['Commercial Photography', 'Product Photography'],
    stack: ['Sony A7III', 'Adobe Lightroom', 'Adobe Photoshop'],
  },
  {
    name: 'Yeezuz2020-Bday',
    industry: 'Event Photography',
    body: {
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          data: {},
          content: [
            {
              nodeType: 'text',
              value: 'Fotografická dokumentace narozeninové oslavy.',
              marks: [],
              data: {},
            },
          ],
        },
      ],
    },
    services: ['Event Photography'],
    stack: ['Sony A7III', 'Adobe Lightroom', 'Adobe Photoshop'],
  },
  {
    name: 'Zarážka do dvěří v imaginárním domě France Kafky',
    industry: 'Art Photography',
    body: {
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          data: {},
          content: [
            {
              nodeType: 'text',
              value:
                'Umělecká fotografická série inspirovaná dílem France Kafky.',
              marks: [],
              data: {},
            },
          ],
        },
      ],
    },
    services: ['Art Photography', 'Conceptual Photography'],
    stack: ['Sony A7III', 'Adobe Lightroom', 'Adobe Photoshop'],
  },
  {
    name: 'Zdeňka',
    industry: 'Portrait Photography',
    body: {
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          data: {},
          content: [
            {
              nodeType: 'text',
              value: 'Portrétní focení Zdeňky.',
              marks: [],
              data: {},
            },
          ],
        },
      ],
    },
    services: ['Portrait Photography'],
    stack: ['Sony A7III', 'Adobe Lightroom', 'Adobe Photoshop'],
  },
  {
    name: 'Šperky z kamene',
    industry: 'Product Photography',
    body: {
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          data: {},
          content: [
            {
              nodeType: 'text',
              value: 'Produktová fotografie šperků z kamene.',
              marks: [],
              data: {},
            },
          ],
        },
      ],
    },
    services: ['Product Photography', 'Jewelry Photography'],
    stack: ['Sony A7III', 'Adobe Lightroom', 'Adobe Photoshop'],
  },
  {
    name: 'blue night',
    industry: 'Art Photography',
    body: {
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          data: {},
          content: [
            {
              nodeType: 'text',
              value: 'Umělecká noční fotografická série.',
              marks: [],
              data: {},
            },
          ],
        },
      ],
    },
    services: ['Art Photography', 'Night Photography'],
    stack: ['Sony A7III', 'Adobe Lightroom', 'Adobe Photoshop'],
  },
]

// Funkce pro vytvoření projektu
async function createProject(environment, projectData) {
  try {
    console.log(`Creating project: ${projectData.name}`)

    const entry = await environment.createEntry('project', {
      fields: {
        name: {
          'en-US': projectData.name,
        },
        industry: {
          'en-US': projectData.industry,
        },
        body: {
          'en-US': projectData.body,
        },
        services: {
          'en-US': projectData.services,
        },
        stack: {
          'en-US': projectData.stack,
        },
      },
    })

    await entry.publish()
    console.log(`Project ${projectData.name} created successfully`)
    return entry
  } catch (error) {
    console.error(`Error creating project ${projectData.name}:`, error.message)
    return null
  }
}

// Funkce pro vytvoření seznamu projektů
async function createProjectList(environment, createdProjects) {
  try {
    console.log('Creating project list...')

    const projectList = await environment.createEntry('projectList', {
      fields: {
        listCollection: {
          'en-US': createdProjects.map((project) => ({
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
    console.log('Project list created successfully')
    return projectList
  } catch (error) {
    console.error('Error creating project list:', error.message)
    return null
  }
}

// Hlavní funkce
async function createProjects() {
  try {
    console.log('Starting project creation...')

    const space = await client.getSpace(spaceId)
    const environment = await space.getEnvironment('master')

    const createdProjects = []
    for (const project of projects) {
      const createdProject = await createProject(environment, project)
      if (createdProject) {
        createdProjects.push(createdProject)
      }
    }

    if (createdProjects.length > 0) {
      await createProjectList(environment, createdProjects)
      console.log(`\nVytvořeno ${createdProjects.length} projektů`)

      console.log('\nID projektů:')
      createdProjects.forEach((project) => {
        console.log(`${project.fields.name['en-US']}: ${project.sys.id}`)
      })
    }

    console.log('\nVšechny projekty byly úspěšně vytvořeny!')
  } catch (error) {
    console.error('Error:', error.message)
    console.error(error.stack)
  }
}

// Spuštění skriptu
createProjects()
