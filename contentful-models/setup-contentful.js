const contentful = require('contentful-management')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

// Kontrola proměnných prostředí
const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID
const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN
const customAppId = '430rG3gk3MTyJwwh2tqbJa' // Vaše custom app ID

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

    // Získání space
    const space = await client.getSpace(spaceId)
    console.log(`Připojeno k space: ${space.name}`)

    // Získání environment
    const environment = await space.getEnvironment('master')
    console.log('Připojeno k environment: master')

    // Vytvoření content types
    await createContentTypes(environment)

    // Vytvoření základních entit
    await createBasicEntries(environment)

    console.log('Nastavení Contentful dokončeno!')
  } catch (error) {
    console.error('Chyba při nastavení Contentful:', error)
  }
}

async function createContentTypes(environment) {
  console.log('Vytvářím content types...')

  try {
    // Kontrola, zda content types již existují
    const contentTypes = await environment.getContentTypes()
    const existingTypes = contentTypes.items.map((type) => type.sys.id)

    // Definice content types
    const typesToCreate = [
      {
        id: 'studioVision',
        name: 'Studio Vision',
        description: 'Main information about Studio Vision',
        fields: [
          {
            id: 'principles',
            name: 'Principles',
            type: 'Array',
            items: { type: 'Symbol' },
          },
          {
            id: 'about',
            name: 'About',
            type: 'RichText',
          },
          {
            id: 'phoneNumber',
            name: 'Phone Number',
            type: 'Symbol',
          },
          {
            id: 'email',
            name: 'Email',
            type: 'Symbol',
          },
        ],
      },
      {
        id: 'link',
        name: 'Link',
        description: 'A link with text and URL',
        fields: [
          {
            id: 'text',
            name: 'Text',
            type: 'Symbol',
            required: true,
          },
          {
            id: 'url',
            name: 'URL',
            type: 'Symbol',
            required: true,
          },
        ],
      },
      {
        id: 'footer',
        name: 'Footer',
        description: 'Footer information',
        fields: [
          {
            id: 'linksCollection',
            name: 'Links Collection',
            type: 'Array',
            items: {
              type: 'Link',
              linkType: 'Entry',
              validations: [{ linkContentType: ['link'] }],
            },
          },
        ],
      },
      {
        id: 'faq',
        name: 'FAQ',
        description: 'Frequently Asked Question',
        fields: [
          {
            id: 'title',
            name: 'Title',
            type: 'Symbol',
            required: true,
          },
          {
            id: 'content',
            name: 'Content',
            type: 'RichText',
            required: true,
          },
        ],
      },
      {
        id: 'contact',
        name: 'Contact',
        description: 'Contact information and form',
        fields: [
          {
            id: 'description',
            name: 'Description',
            type: 'RichText',
          },
          {
            id: 'form',
            name: 'Form',
            type: 'Symbol',
          },
          {
            id: 'faqsCollection',
            name: 'FAQs Collection',
            type: 'Array',
            items: {
              type: 'Link',
              linkType: 'Entry',
              validations: [{ linkContentType: ['faq'] }],
            },
          },
          {
            id: 'thankYouMessage',
            name: 'Thank You Message',
            type: 'RichText',
          },
        ],
      },
      {
        id: 'asset',
        name: 'Asset',
        description: 'An asset with images',
        fields: [
          {
            id: 'imagesCollection',
            name: 'Images Collection',
            type: 'Array',
            items: {
              type: 'Link',
              linkType: 'Asset',
            },
          },
        ],
      },
      {
        id: 'project',
        name: 'Project',
        description: 'A project',
        fields: [
          {
            id: 'name',
            name: 'Name',
            type: 'Symbol',
            required: true,
          },
          {
            id: 'industry',
            name: 'Industry',
            type: 'Symbol',
          },
          {
            id: 'body',
            name: 'Body',
            type: 'RichText',
          },
          {
            id: 'testimonial',
            name: 'Testimonial',
            type: 'Symbol',
          },
          {
            id: 'assetsCollection',
            name: 'Assets Collection',
            type: 'Array',
            items: {
              type: 'Link',
              linkType: 'Entry',
              validations: [{ linkContentType: ['asset'] }],
            },
          },
          {
            id: 'services',
            name: 'Services',
            type: 'Array',
            items: { type: 'Symbol' },
          },
          {
            id: 'stack',
            name: 'Stack',
            type: 'Array',
            items: { type: 'Symbol' },
          },
          {
            id: 'link',
            name: 'Link',
            type: 'Symbol',
          },
        ],
      },
      {
        id: 'projectList',
        name: 'Project List',
        description: 'List of projects',
        fields: [
          {
            id: 'listCollection',
            name: 'List Collection',
            type: 'Array',
            items: {
              type: 'Link',
              linkType: 'Entry',
              validations: [{ linkContentType: ['project'] }],
            },
          },
        ],
      },
    ]

    // Vytvoření content types, které ještě neexistují
    for (const typeConfig of typesToCreate) {
      if (!existingTypes.includes(typeConfig.id)) {
        console.log(`Vytvářím content type: ${typeConfig.name}`)

        const contentType = await environment.createContentType({
          sys: { id: typeConfig.id },
          name: typeConfig.name,
          description: typeConfig.description,
          displayField: typeConfig.fields[0].id,
          fields: typeConfig.fields.map((field) => ({
            id: field.id,
            name: field.name,
            type: field.type,
            required: field.required || false,
            localized: false,
            ...(field.items && { items: field.items }),
          })),
        })

        await contentType.publish()
        console.log(`Content type ${typeConfig.name} vytvořen a publikován`)
      } else {
        console.log(`Content type ${typeConfig.id} již existuje, přeskakuji`)
      }
    }

    console.log('Všechny content types vytvořeny nebo již existují')
  } catch (error) {
    console.error('Chyba při vytváření content types:', error)
    throw error
  }
}

async function createBasicEntries(environment) {
  console.log('Vytvářím základní entity...')

  try {
    // Vytvoření Studio Vision
    console.log('Vytvářím Studio Vision entry...')
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
                      'Studio Vision is a creative studio focused on delivering exceptional digital experiences. We combine design, technology, and strategy to create websites and applications that stand out.',
                    marks: [],
                    data: {},
                  },
                ],
              },
            ],
          },
        },
        phoneNumber: {
          'en-US': '+1 (555) 123-4567',
        },
        email: {
          'en-US': 'hello@studiovision.com',
        },
      },
    })
    await studioVision.publish()
    console.log(
      'Studio Vision entry vytvořen a publikován s ID:',
      studioVision.sys.id,
    )

    // Vytvoření footer links
    console.log('Vytvářím footer links...')
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
      console.log(
        `Link "${data.text}" vytvořen a publikován s ID:`,
        link.sys.id,
      )
    }

    // Vytvoření footer
    console.log('Vytvářím footer entry...')
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
    console.log('Footer entry vytvořen a publikován s ID:', footer.sys.id)

    // Vytvoření FAQ
    console.log('Vytvářím FAQ entries...')
    const faqs = []
    const faqData = [
      {
        title: 'What services do you offer?',
        content:
          'We offer web design, web development, UX/UI design, and digital strategy services.',
      },
      {
        title: 'How long does a typical project take?',
        content:
          'Project timelines vary depending on complexity, but most projects take 4-12 weeks.',
      },
      {
        title: 'Do you work with clients internationally?',
        content: 'Yes, we work with clients from all over the world.',
      },
    ]

    for (const data of faqData) {
      const faq = await environment.createEntry('faq', {
        fields: {
          title: { 'en-US': data.title },
          content: {
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
                      value: data.content,
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
      await faq.publish()
      faqs.push(faq)
      console.log(`FAQ "${data.title}" vytvořen a publikován s ID:`, faq.sys.id)
    }

    // Vytvoření contact
    console.log('Vytvářím contact entry...')
    const contact = await environment.createEntry('contact', {
      fields: {
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
                    value:
                      "Get in touch with us to discuss your project. We're always looking for new challenges.",
                    marks: [],
                    data: {},
                  },
                ],
              },
            ],
          },
        },
        form: {
          'en-US': 'contact-form',
        },
        faqsCollection: {
          'en-US': faqs.map((faq) => ({
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: faq.sys.id,
            },
          })),
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
                    value:
                      "Thank you for your message! We'll get back to you as soon as possible.",
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
    console.log('Contact entry vytvořen a publikován s ID:', contact.sys.id)

    // Vytvoření asset
    console.log('Vytvářím asset entry...')
    const asset = await environment.createEntry('asset', {
      fields: {
        imagesCollection: {
          'en-US': [],
        },
      },
    })
    await asset.publish()
    console.log('Asset entry vytvořen a publikován s ID:', asset.sys.id)

    // Vytvoření projektu
    console.log('Vytvářím project entry...')
    const project = await environment.createEntry('project', {
      fields: {
        name: { 'en-US': 'Sample Project' },
        industry: { 'en-US': 'Technology' },
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
                    value:
                      'This is a sample project to demonstrate the capabilities of Studio Vision. We created a modern, responsive website with a focus on user experience and performance.',
                    marks: [],
                    data: {},
                  },
                ],
              },
            ],
          },
        },
        testimonial: {
          'en-US':
            'Working with Studio Vision was a great experience. They delivered a high-quality product on time and within budget.',
        },
        assetsCollection: {
          'en-US': [
            {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: asset.sys.id,
              },
            },
          ],
        },
        services: {
          'en-US': ['Web Design', 'Web Development', 'UX/UI Design'],
        },
        stack: {
          'en-US': ['Next.js', 'React', 'SCSS', 'Contentful'],
        },
        link: {
          'en-US': 'https://example.com',
        },
      },
    })
    await project.publish()
    console.log('Project entry vytvořen a publikován s ID:', project.sys.id)

    // Vytvoření project list
    console.log('Vytvářím project list entry...')
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
    console.log(
      'Project list entry vytvořen a publikován s ID:',
      projectList.sys.id,
    )

    // Vytvoření souboru s ID entit
    const idsData = {
      studioVision: studioVision.sys.id,
      footer: footer.sys.id,
      contact: contact.sys.id,
      projectList: projectList.sys.id,
      customAppId: customAppId,
    }

    const fs = require('fs')
    fs.writeFileSync(
      path.join(__dirname, 'contentful-ids.json'),
      JSON.stringify(idsData, null, 2),
    )

    console.log('\nVšechny entity vytvořeny úspěšně!')
    console.log('\nID entit uložena do souboru contentful-ids.json')
    console.log('\nProsím aktualizujte GraphQL dotazy s těmito ID:')
    console.log(`studioVision: "${studioVision.sys.id}"`)
    console.log(`footer: "${footer.sys.id}"`)
    console.log(`contact: "${contact.sys.id}"`)
    console.log(`projectList: "${projectList.sys.id}"`)

    // Vytvoření skriptu pro aktualizaci GraphQL dotazů
    createUpdateGraphQLScript(idsData)
  } catch (error) {
    console.error('Chyba při vytváření entit:', error)
    throw error
  }
}

function createUpdateGraphQLScript(ids) {
  const updateScript = `
const fs = require('fs')
const path = require('path')

// ID entit z Contentful
const ids = ${JSON.stringify(ids, null, 2)}

// Cesta k GraphQL dotazu
const graphqlPath = path.join(__dirname, '../contentful/queries/home.graphql')

// Načtení obsahu souboru
let content = fs.readFileSync(graphqlPath, 'utf8')

// Aktualizace ID v dotazech
content = content.replace(
  /studioVision\\(id: "[^"]+"/g,
  \`studioVision(id: "\${ids.studioVision}"\`
)

content = content.replace(
  /footer\\(id: "[^"]+"/g,
  \`footer(id: "\${ids.footer}"\`
)

content = content.replace(
  /contact\\(id: "[^"]+"/g,
  \`contact(id: "\${ids.contact}"\`
)

content = content.replace(
  /projectList\\(id: "[^"]+"/g,
  \`projectList(id: "\${ids.projectList}"\`
)

// Uložení aktualizovaného obsahu
fs.writeFileSync(graphqlPath, content)

console.log('GraphQL dotazy aktualizovány s novými ID')
  `

  fs.writeFileSync(path.join(__dirname, 'update-graphql.js'), updateScript)

  console.log(
    'Vytvořen skript update-graphql.js pro aktualizaci GraphQL dotazů',
  )
}

// Spuštění hlavní funkce
setupContentful()
