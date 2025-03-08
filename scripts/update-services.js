require('dotenv').config({ path: '.env.local' })
const { createClient } = require('contentful-management')

// Configuration
const SPACE_ID = process.env.NEXT_CONTENTFUL_SPACE_ID
const ENVIRONMENT_ID = 'master'
const ACCESS_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN
const STUDIO_VISION_ENTRY_ID = '37boRb32pD8w2VkF8BDSTR' // ID z GraphQL dotazu

// Nový seznam služeb
const newServices = [
  'Brand Strategy',
  'Verbal Identity',
  'Visual Identity',
  'Web Design',
  'Development',
  'Creative Sprint',
]

// Inicializace Contentful Management klienta
const client = createClient({
  accessToken: ACCESS_TOKEN,
})

async function updateServices() {
  try {
    console.log('Začínám aktualizaci seznamu služeb...')

    // Získání prostoru a prostředí
    const space = await client.getSpace(SPACE_ID)
    const environment = await space.getEnvironment(ENVIRONMENT_ID)

    // Získání existujícího záznamu
    console.log(`Načítám záznam s ID: ${STUDIO_VISION_ENTRY_ID}`)
    const entry = await environment.getEntry(STUDIO_VISION_ENTRY_ID)

    // Aktualizace pole services
    if (entry.fields.services) {
      entry.fields.services['en-US'] = newServices
    } else {
      console.log('Pole services neexistuje, vytvářím nové pole...')
      entry.fields.services = {
        'en-US': newServices,
      }
    }

    // Uložení změn
    console.log('Ukládám změny...')
    const updatedEntry = await entry.update()

    // Publikování změn
    console.log('Publikuji změny...')
    await updatedEntry.publish()

    console.log('Seznam služeb byl úspěšně aktualizován!')
  } catch (error) {
    console.error('Chyba při aktualizaci seznamu služeb:', error)
  }
}

// Spuštění funkce
updateServices()
