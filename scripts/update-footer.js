require('dotenv').config({ path: '.env.local' })
const { createClient } = require('contentful-management')

// Configuration
const SPACE_ID = process.env.NEXT_CONTENTFUL_SPACE_ID
const ENVIRONMENT_ID = 'master'
const ACCESS_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN
const FOOTER_ENTRY_ID = '6ACr7DHC1BY7UNOysHjTdo' // ID z GraphQL dotazu

// Nové odkazy v patičce, včetně služeb
const newLinks = [
  { text: 'Brand Strategy', url: '#' },
  { text: 'Verbal Identity', url: '#' },
  { text: 'Visual Identity', url: '#' },
  { text: 'Web Design', url: '#' },
  { text: 'Development', url: '#' },
  { text: 'Creative Sprint', url: '#' },
  { text: 'Instagram', url: 'https://instagram.com/studiovision' },
  { text: 'LinkedIn', url: 'https://linkedin.com/company/studiovision' },
  { text: 'GitHub', url: 'https://github.com/studiovision' },
]

// Inicializace Contentful Management klienta
const client = createClient({
  accessToken: ACCESS_TOKEN,
})

async function updateFooter() {
  try {
    console.log('Začínám aktualizaci patičky...')

    // Získání prostoru a prostředí
    const space = await client.getSpace(SPACE_ID)
    const environment = await space.getEnvironment(ENVIRONMENT_ID)

    // Získání existujícího záznamu
    console.log(`Načítám záznam s ID: ${FOOTER_ENTRY_ID}`)
    const entry = await environment.getEntry(FOOTER_ENTRY_ID)

    // Vytvoření nových odkazů
    const linkEntries = []

    for (const link of newLinks) {
      // Vytvoření nového odkazu
      const linkEntry = await environment.createEntry('link', {
        fields: {
          text: { 'en-US': link.text },
          url: { 'en-US': link.url },
        },
      })

      // Publikování odkazu
      await linkEntry.publish()

      // Přidání odkazu do kolekce
      linkEntries.push({
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: linkEntry.sys.id,
        },
      })
    }

    // Aktualizace kolekce odkazů v patičce
    entry.fields.linksCollection = {
      'en-US': linkEntries,
    }

    // Uložení změn
    console.log('Ukládám změny...')
    const updatedEntry = await entry.update()

    // Publikování změn
    console.log('Publikuji změny...')
    await updatedEntry.publish()

    console.log('Patička byla úspěšně aktualizována!')
  } catch (error) {
    console.error('Chyba při aktualizaci patičky:', error)
  }
}

// Spuštění funkce
updateFooter()
