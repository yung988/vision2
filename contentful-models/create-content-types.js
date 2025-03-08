const contentful = require('contentful-management')
const path = require('path')
const fs = require('fs')
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

// Funkce pro vytvoření content typu
async function createContentType(environment, contentTypeData) {
  try {
    console.log(`Creating content type: ${contentTypeData.name}`)

    const contentType = await environment.createContentTypeWithId(
      contentTypeData.id ||
        contentTypeData.name.toLowerCase().replace(/\s+/g, '-'),
      contentTypeData,
    )
    await contentType.publish()

    console.log(`Content type ${contentTypeData.name} created successfully`)
    return contentType
  } catch (error) {
    if (error.status === 409) {
      console.log(`Content type ${contentTypeData.name} already exists`)
      return null
    }
    console.error(
      `Error creating content type ${contentTypeData.name}:`,
      error.message,
    )
    return null
  }
}

// Hlavní funkce
async function createContentTypes() {
  try {
    console.log('Starting content types creation...')

    const space = await client.getSpace(spaceId)
    const environment = await space.getEnvironment('master')

    // Načtení všech JSON souborů v adresáři
    const files = fs.readdirSync(__dirname)
    const contentTypeFiles = files.filter(
      (file) => file.endsWith('.json') && file !== 'package.json',
    )

    console.log(`Found ${contentTypeFiles.length} content type definitions`)

    // Vytvoření content typů
    for (const file of contentTypeFiles) {
      const contentTypeData = JSON.parse(
        fs.readFileSync(path.join(__dirname, file), 'utf8'),
      )
      await createContentType(environment, contentTypeData)
    }

    console.log('\nVšechny content typy byly úspěšně vytvořeny!')
  } catch (error) {
    console.error('Error:', error.message)
    console.error(error.stack)
  }
}

// Spuštění skriptu
createContentTypes()
