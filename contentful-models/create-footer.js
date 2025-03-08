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

// Definice odkazů v patičce
const links = [
  {
    text: 'Instagram',
    url: 'https://www.instagram.com/studiovision.cz/',
  },
  {
    text: 'Facebook',
    url: 'https://www.facebook.com/studiovision.cz/',
  },
  {
    text: 'LinkedIn',
    url: 'https://www.linkedin.com/company/studiovision-cz/',
  },
]

// Funkce pro vytvoření odkazu
async function createLink(environment, linkData) {
  try {
    console.log(`Creating link: ${linkData.text}`)

    const entry = await environment.createEntry('link', {
      fields: {
        text: {
          'en-US': linkData.text,
        },
        url: {
          'en-US': linkData.url,
        },
      },
    })

    await entry.publish()
    console.log(`Link ${linkData.text} created successfully`)
    return entry
  } catch (error) {
    console.error(`Error creating link ${linkData.text}:`, error.message)
    return null
  }
}

// Funkce pro vytvoření patičky
async function createFooter(environment, createdLinks) {
  try {
    console.log('Creating footer...')

    const footer = await environment.createEntry('footer', {
      fields: {
        linksCollection: {
          'en-US': createdLinks.map((link) => ({
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
    console.log('Footer created successfully')
    return footer
  } catch (error) {
    console.error('Error creating footer:', error.message)
    return null
  }
}

// Hlavní funkce
async function createFooterContent() {
  try {
    console.log('Starting footer creation...')

    const space = await client.getSpace(spaceId)
    const environment = await space.getEnvironment('master')

    const createdLinks = []
    for (const link of links) {
      const createdLink = await createLink(environment, link)
      if (createdLink) {
        createdLinks.push(createdLink)
      }
    }

    if (createdLinks.length > 0) {
      const footer = await createFooter(environment, createdLinks)
      if (footer) {
        console.log(`\nVytvořeno ${createdLinks.length} odkazů`)
        console.log(`ID patičky: ${footer.sys.id}`)
      }
    }

    console.log('\nPatička byla úspěšně vytvořena!')
  } catch (error) {
    console.error('Error:', error.message)
    console.error(error.stack)
  }
}

// Spuštění skriptu
createFooterContent()
