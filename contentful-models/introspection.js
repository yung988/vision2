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
const accessTokenMatch = envContent.match(
  /NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN=([^\s]+)/,
)

const spaceId = spaceIdMatch ? spaceIdMatch[1] : null
const accessToken = accessTokenMatch ? accessTokenMatch[1] : null

if (!spaceId || !accessToken) {
  console.error('Space ID nebo Access Token nebyly nalezeny v .env.local')
  process.exit(1)
}

const endpoint = `https://graphql.contentful.com/content/v1/spaces/${spaceId}/environments/master`

const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${accessToken}`,
  },
})

const introspectionQuery = `
  query {
    __schema {
      types {
        name
        kind
        fields {
          name
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
      }
    }
  }
`

async function runIntrospection() {
  try {
    const data = await graphQLClient.request(introspectionQuery)

    // Filtrování typů, které nás zajímají
    const relevantTypes = data.__schema.types.filter((type) =>
      [
        'StudioVision',
        'Footer',
        'Contact',
        'ProjectList',
        'Project',
        'Asset',
        'Link',
      ].includes(type.name),
    )

    console.log('Nalezené typy:')
    relevantTypes.forEach((type) => {
      console.log(`\nTyp: ${type.name}`)
      if (type.fields) {
        console.log('  Pole:')
        type.fields.forEach((field) => {
          console.log(
            `    - ${field.name}: ${
              field.type.name || field.type.ofType?.name || field.type.kind
            }`,
          )
        })
      } else {
        console.log('  Žádná pole nebyla nalezena')
      }
    })

    // Uložení výsledků do souboru
    fs.writeFileSync(
      path.join(__dirname, 'introspection-result.json'),
      JSON.stringify(data, null, 2),
    )
    console.log(
      '\nVýsledky introspekce byly uloženy do souboru introspection-result.json',
    )
  } catch (error) {
    console.error('Chyba při introspekci GraphQL API:', error)
  }
}

runIntrospection()
