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

async function setupContentful() {
  try {
    console.log('Začínám nastavení Contentful...')

    // Získání prostoru a prostředí
    const space = await client.getSpace(spaceId)
    const environment = await space.getEnvironment('master')

    // Vytvoření Studio Vision záznamu
    console.log('Vytvářím Studio Vision záznam...')
    const studioVision = await environment.createEntry('studioVision', {
      fields: {
        principles: {
          'en-US': [
            'Creative Excellence',
            'User-Centered Design',
            'Technical Innovation',
            'Strategic Thinking',
            'Collaborative Approach',
          ],
        },
        about: {
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
                    value:
                      'Studio Vision je kreativní studio zaměřené na tvorbu webových a mobilních aplikací.',
                    marks: [],
                    data: {},
                  },
                ],
              },
            ],
          },
        },
        phoneNumber: {
          'en-US': '+420 123 456 789',
        },
        email: {
          'en-US': 'hello@studiovision.com',
        },
      },
    })
    await studioVision.publish()
    console.log(`Studio Vision záznam vytvořen s ID: ${studioVision.sys.id}`)

    // Vytvoření odkazů pro patičku
    console.log('Vytvářím odkazy pro patičku...')
    const links = []
    const linkData = [
      { text: 'Instagram', url: 'https://instagram.com/studiovision' },
      { text: 'Twitter', url: 'https://twitter.com/studiovision' },
      { text: 'LinkedIn', url: 'https://linkedin.com/company/studiovision' },
      { text: 'GitHub', url: 'https://github.com/studiovision' },
      { text: 'Dribbble', url: 'https://dribbble.com/studiovision' },
      { text: 'Behance', url: 'https://behance.net/studiovision' },
    ]

    for (const data of linkData) {
      const link = await environment.createEntry('link', {
        fields: {
          text: { 'en-US': data.text },
          url: { 'en-US': data.url },
        },
      })
      await link.publish()
      links.push(link)
      console.log(`Odkaz "${data.text}" vytvořen s ID: ${link.sys.id}`)
    }

    // Vytvoření patičky
    console.log('Vytvářím patičku...')
    const footer = await environment.createEntry('footer', {
      fields: {
        linksCollection: {
          'en-US': links.map((link) => ({
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: link.sys.id,
            },
          })),
        },
      },
    })
    await footer.publish()
    console.log(`Patička vytvořena s ID: ${footer.sys.id}`)

    // Vytvoření kontaktu
    console.log('Vytvářím kontakt...')
    const contact = await environment.createEntry('contact', {
      fields: {
        form: { 'en-US': 'contact-form' },
        description: {
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
                    value: 'Kontaktujte nás pro více informací.',
                    marks: [],
                    data: {},
                  },
                ],
              },
            ],
          },
        },
        thankYouMessage: {
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
                    value: 'Děkujeme za váš zájem. Brzy se vám ozveme.',
                    marks: [],
                    data: {},
                  },
                ],
              },
            ],
          },
        },
      },
    })
    await contact.publish()
    console.log(`Kontakt vytvořen s ID: ${contact.sys.id}`)

    // Vytvoření projektu
    console.log('Vytvářím ukázkový projekt...')
    const project = await environment.createEntry('project', {
      fields: {
        name: { 'en-US': 'Ukázkový projekt' },
        industry: { 'en-US': 'Web Development' },
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
                    value: 'Popis ukázkového projektu.',
                    marks: [],
                    data: {},
                  },
                ],
              },
            ],
          },
        },
        services: { 'en-US': ['Design', 'Development', 'Consulting'] },
        stack: { 'en-US': ['React', 'Next.js', 'Contentful'] },
      },
    })
    await project.publish()
    console.log(`Projekt vytvořen s ID: ${project.sys.id}`)

    // Vytvoření seznamu projektů
    console.log('Vytvářím seznam projektů...')
    const projectList = await environment.createEntry('projectList', {
      fields: {
        listCollection: {
          'en-US': [
            {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: project.sys.id,
              },
            },
          ],
        },
      },
    })
    await projectList.publish()
    console.log(`Seznam projektů vytvořen s ID: ${projectList.sys.id}`)

    // Aktualizace GraphQL dotazů
    console.log('Aktualizuji GraphQL dotazy...')
    const ids = {
      studioVision: studioVision.sys.id,
      footer: footer.sys.id,
      contact: contact.sys.id,
      projectList: projectList.sys.id,
    }

    updateGraphQLQueries(ids)

    console.log('\nNastavení Contentful dokončeno!')
    console.log('Použijte následující ID ve vašich GraphQL dotazech:')
    console.log(`studioVision: "${ids.studioVision}"`)
    console.log(`footer: "${ids.footer}"`)
    console.log(`contact: "${ids.contact}"`)
    console.log(`projectList: "${ids.projectList}"`)
  } catch (error) {
    console.error('Nastala chyba při nastavení Contentful:', error)
  }
}

function updateGraphQLQueries(ids) {
  try {
    const graphqlFilePath = path.join(
      __dirname,
      '../contentful/queries/home.graphql',
    )
    let content = fs.readFileSync(graphqlFilePath, 'utf8')

    // Aktualizace ID v dotazech
    content = content.replace(
      /studioVision\(id: "[^"]+"/g,
      `studioVision(id: "${ids.studioVision}"`,
    )
    content = content.replace(
      /footer\(id: "[^"]+"/g,
      `footer(id: "${ids.footer}"`,
    )
    content = content.replace(
      /contact\(id: "[^"]+"/g,
      `contact(id: "${ids.contact}"`,
    )
    content = content.replace(
      /projectList\(id: "[^"]+"/g,
      `projectList(id: "${ids.projectList}"`,
    )

    fs.writeFileSync(graphqlFilePath, content)
    console.log('GraphQL dotazy byly aktualizovány s novými ID')

    // Aktualizace contentful-ids.json
    const idsFilePath = path.join(__dirname, 'contentful-ids.json')
    fs.writeFileSync(idsFilePath, JSON.stringify(ids, null, 2))
    console.log('Soubor contentful-ids.json byl aktualizován')
  } catch (error) {
    console.error('Nastala chyba při aktualizaci GraphQL dotazů:', error)
  }
}

setupContentful()
