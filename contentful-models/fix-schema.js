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

async function fixSchema() {
  try {
    console.log('Začínám opravu schématu...')

    // Získání prostoru a prostředí
    const space = await client.getSpace(spaceId)
    const environment = await space.getEnvironment('master')

    // Výpis všech content typů
    const contentTypes = await environment.getContentTypes()
    console.log('Nalezené content typy:')
    contentTypes.items.forEach((type) => {
      console.log(`- ${type.name} (${type.sys.id})`)
    })

    // Kontrola, zda existují oba problematické content typy
    const studioVisionCamelCase = contentTypes.items.find(
      (type) => type.sys.id === 'studioVision',
    )
    const studioVisionKebabCase = contentTypes.items.find(
      (type) => type.sys.id === 'studio-vision',
    )

    if (studioVisionCamelCase && studioVisionKebabCase) {
      console.log('Nalezeny oba konfliktní content typy:')
      console.log(
        `- ${studioVisionCamelCase.name} (${studioVisionCamelCase.sys.id})`,
      )
      console.log(
        `- ${studioVisionKebabCase.name} (${studioVisionKebabCase.sys.id})`,
      )

      // Zjistíme, který content type má záznamy
      const entriesCamelCase = await environment.getEntries({
        content_type: 'studioVision',
        limit: 1,
      })

      const entriesKebabCase = await environment.getEntries({
        content_type: 'studio-vision',
        limit: 1,
      })

      console.log(
        `Content type 'studioVision' má ${entriesCamelCase.total} záznamů`,
      )
      console.log(
        `Content type 'studio-vision' má ${entriesKebabCase.total} záznamů`,
      )

      // Rozhodneme, který content type odstranit
      if (entriesCamelCase.total === 0) {
        console.log("Odstraňuji content type 'studioVision'...")
        await studioVisionCamelCase.delete()
        console.log("Content type 'studioVision' byl úspěšně odstraněn")

        // Aktualizace GraphQL dotazů
        updateGraphQLQueries('studio-vision')
      } else if (entriesKebabCase.total === 0) {
        console.log("Odstraňuji content type 'studio-vision'...")
        await studioVisionKebabCase.delete()
        console.log("Content type 'studio-vision' byl úspěšně odstraněn")

        // Aktualizace GraphQL dotazů
        updateGraphQLQueries('studioVision')
      } else {
        console.log(
          'Oba content typy mají záznamy. Je potřeba ručně rozhodnout, který odstranit.',
        )
        console.log(
          'Doporučujeme exportovat záznamy z jednoho content typu, odstranit ho a importovat záznamy do druhého.',
        )
      }
    } else if (studioVisionCamelCase) {
      console.log(
        `Nalezen pouze content type '${studioVisionCamelCase.sys.id}'`,
      )
    } else if (studioVisionKebabCase) {
      console.log(
        `Nalezen pouze content type '${studioVisionKebabCase.sys.id}'`,
      )
    } else {
      console.log('Žádný z konfliktních content typů nebyl nalezen')
    }

    console.log('Oprava schématu dokončena')
  } catch (error) {
    console.error('Nastala chyba při opravě schématu:', error)
  }
}

function updateGraphQLQueries(contentTypeId) {
  try {
    const graphqlFilePath = path.join(
      __dirname,
      '../contentful/queries/home.graphql',
    )
    let content = fs.readFileSync(graphqlFilePath, 'utf8')

    // Aktualizace dotazu
    if (contentTypeId === 'studioVision') {
      // Pokud používáme camelCase, není třeba nic měnit
      console.log(
        'GraphQL dotazy jsou již správně nastaveny pro content type studioVision',
      )
    } else if (contentTypeId === 'studio-vision') {
      // Pokud používáme kebab-case, musíme upravit dotaz
      content = content.replace(
        /studioVisionData: studioVision/g,
        'studioVisionData: studio_vision',
      )
      fs.writeFileSync(graphqlFilePath, content)
      console.log(
        'GraphQL dotazy byly aktualizovány pro content type studio-vision',
      )
    }
  } catch (error) {
    console.error('Nastala chyba při aktualizaci GraphQL dotazů:', error)
  }
}

fixSchema()
