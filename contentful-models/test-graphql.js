const { GraphQLClient } = require('graphql-request')
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

const accessTokenMatch = envContent.match(
  /NEXT_CONTENTFUL_ACCESS_TOKEN=([^\s]+)/,
)
const accessToken = accessTokenMatch ? accessTokenMatch[1] : null

if (!accessToken) {
  console.error('Access token not found in .env.local file')
  process.exit(1)
}

// Načtení ID z contentful-ids.json
let ids = {}
try {
  const idsContent = fs.readFileSync(
    path.join(__dirname, 'contentful-ids.json'),
    'utf8',
  )
  ids = JSON.parse(idsContent)
  console.log('Načtena ID z contentful-ids.json:')
  console.log(ids)
} catch (error) {
  console.error('Chyba při načítání contentful-ids.json:', error)
  process.exit(1)
}

// GraphQL dotazy
const queries = {
  studioVision: `
    query {
      studioVision(id: "${ids.studioVision}") {
        sys {
          id
        }
        principles
        email
      }
    }
  `,
  footer: `
    query {
      footer(id: "${ids.footer}") {
        sys {
          id
        }
        linksCollectionCollection {
          items {
            sys {
              id
            }
            text
            url
          }
        }
      }
    }
  `,
  contact: `
    query {
      contact(id: "${ids.contact}") {
        sys {
          id
        }
        form
      }
    }
  `,
  projectList: `
    query {
      projectList(id: "${ids.projectList}") {
        sys {
          id
        }
        listCollectionCollection(limit: 1) {
          items {
            sys {
              id
            }
            name
          }
        }
      }
    }
  `,
}

async function testGraphQL() {
  try {
    const endpoint = `https://graphql.contentful.com/content/v1/spaces/${spaceId}/environments/master`
    const graphQLClient = new GraphQLClient(endpoint, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })

    console.log('Testování GraphQL dotazů...')

    for (const [name, query] of Object.entries(queries)) {
      try {
        console.log(`\nTestování dotazu: ${name}`)
        const data = await graphQLClient.request(query)
        console.log('✅ Dotaz úspěšný:')
        console.log(JSON.stringify(data, null, 2))
      } catch (error) {
        console.error(`❌ Chyba při dotazu ${name}:`)
        console.error(error.message)

        // Pokud je chyba související s kolizí typů, vypíšeme podrobnější informace
        if (error.message.includes('COLLIDING_TYPE_NAMES')) {
          console.error('\nDetekována kolize typů v GraphQL schématu!')
          console.error(
            'Toto je často způsobeno tím, že máte dva content types, které generují stejný GraphQL typ.',
          )
          console.error(
            'Například "studioVision" a "studio-vision" by oba generovaly typ "StudioVision".',
          )
          console.error('\nŘešení:')
          console.error(
            '1. Přejděte do Contentful a smažte jeden z kolidujících content types',
          )
          console.error(
            '2. Nebo upravte migration.js skript tak, aby používal pouze jeden formát (buď camelCase nebo kebab-case)',
          )
        }
      }
    }
  } catch (error) {
    console.error('Obecná chyba při testování GraphQL:', error)
  }
}

testGraphQL()
