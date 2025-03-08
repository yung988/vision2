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

// Inicializace klienta
const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
})

async function createEntries() {
  try {
    const space = await client.getSpace(spaceId)
    const environment = await space.getEnvironment('master')

    // Vytvoření Studio Vision
    console.log('Creating Studio Vision entry...')
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
      'Studio Vision entry created and published with ID:',
      studioVision.sys.id,
    )

    // Vytvoření odkazů pro patičku
    console.log('Creating footer links...')
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
        `Link "${data.text}" created and published with ID:`,
        link.sys.id,
      )
    }

    // Vytvoření patičky
    console.log('Creating footer entry...')
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
    console.log('Footer entry created and published with ID:', footer.sys.id)

    // Vytvoření FAQ
    console.log('Creating FAQ entries...')
    const faqs = []
    const faqData = [
      {
        title: 'What services do you offer?',
        content:
          'We offer web design, web development, branding, UI/UX design, and digital strategy services.',
      },
      {
        title: 'How long does a typical project take?',
        content:
          'Project timelines vary depending on scope and complexity. A typical website project takes 6-12 weeks from start to finish.',
      },
      {
        title: 'Do you work with clients internationally?',
        content:
          'Yes, we work with clients from all over the world. Our team is distributed and we communicate effectively across time zones.',
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
      console.log(
        `FAQ "${data.title}" created and published with ID:`,
        faq.sys.id,
      )
    }

    // Vytvoření kontaktu
    console.log('Creating contact entry...')
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
                      "Get in touch with us to discuss your project. We'd love to hear from you!",
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
    console.log('Contact entry created and published with ID:', contact.sys.id)

    // Vytvoření projektu
    console.log('Creating project entry...')
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
    console.log('Project entry created and published with ID:', project.sys.id)

    // Vytvoření seznamu projektů
    console.log('Creating project list entry...')
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
      'Project list entry created and published with ID:',
      projectList.sys.id,
    )

    console.log('\nAll entries created successfully!')
    console.log('\nPlease update your GraphQL queries with these IDs:')
    console.log(`studioVision: "${studioVision.sys.id}"`)
    console.log(`footer: "${footer.sys.id}"`)
    console.log(`contact: "${contact.sys.id}"`)
    console.log(`projectList: "${projectList.sys.id}"`)
  } catch (error) {
    console.error('Error creating entries:', error)
  }
}

createEntries()
