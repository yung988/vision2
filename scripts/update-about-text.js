require('dotenv').config({ path: '.env.local' })
const { createClient } = require('contentful-management')

// Configuration
const SPACE_ID = process.env.NEXT_CONTENTFUL_SPACE_ID
const ENVIRONMENT_ID = 'master'
const ACCESS_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN
const STUDIO_VISION_ENTRY_ID = '37boRb32pD8w2VkF8BDSTR' // ID z GraphQL dotazu

// Nový text pro sekci About
const newAboutText = `Studio Vision is an independent creative studio crafting brands, digital experiences, and solutions that push missions to new heights.

Our clients view us as dedicated allies who match their passion step for step—though truth be told, we're probably a little more obsessed. Spanning diverse industries, our clients share one common drive: securing a lasting, meaningful connection with their audiences and users.`

// Inicializace Contentful Management klienta
const client = createClient({
  accessToken: ACCESS_TOKEN,
})

async function updateAboutText() {
  try {
    console.log('Začínám aktualizaci textu v sekci About...')

    // Získání prostoru a prostředí
    const space = await client.getSpace(SPACE_ID)
    const environment = await space.getEnvironment(ENVIRONMENT_ID)

    // Získání existujícího záznamu
    console.log(`Načítám záznam s ID: ${STUDIO_VISION_ENTRY_ID}`)
    const entry = await environment.getEntry(STUDIO_VISION_ENTRY_ID)

    // Aktualizace pole about
    entry.fields.about = {
      'en-US': {
        nodeType: 'document',
        data: {},
        content: newAboutText.split('\n\n').map((paragraph) => ({
          nodeType: 'paragraph',
          data: {},
          content: [
            {
              nodeType: 'text',
              value: paragraph,
              marks: [],
              data: {},
            },
          ],
        })),
      },
    }

    // Uložení změn
    console.log('Ukládám změny...')
    const updatedEntry = await entry.update()

    // Publikování změn
    console.log('Publikuji změny...')
    await updatedEntry.publish()

    console.log('Text v sekci About byl úspěšně aktualizován!')
  } catch (error) {
    console.error('Chyba při aktualizaci textu:', error)
  }
}

// Spuštění funkce
updateAboutText()
