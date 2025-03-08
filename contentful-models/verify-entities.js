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

// Získání management tokenu
const tokenMatch = envContent.match(/CONTENTFUL_MANAGEMENT_TOKEN=([^\s]+)/)
const managementToken = tokenMatch ? tokenMatch[1] : null

if (!managementToken) {
  console.error('Management token not found in .env.local file')
  process.exit(1)
}

// Inicializace klienta
const client = contentful.createClient({
  accessToken: managementToken,
})

// ID entit z GraphQL dotazů
const entitiesToCheck = [
  { type: 'studioVision', id: '1bMnROGNUxryoDKosyxegC' },
  { type: 'footer', id: '74I9DfQOxBdLImqhYKW35c' },
  { type: 'contact', id: '2SI0QrDSe8JsqLSzmLj8kM' },
  { type: 'projectList', id: '01IyifdnF9szHBFuCRtUnH' },
]

async function verifyEntities() {
  try {
    const space = await client.getSpace(spaceId)
    const environment = await space.getEnvironment('master')

    console.log('Ověřuji existenci entit v Contentful...')

    let allExist = true

    for (const entity of entitiesToCheck) {
      try {
        const entry = await environment.getEntry(entity.id)
        console.log(`✅ Entity ${entity.type} s ID ${entity.id} existuje`)

        // Kontrola content type
        if (entry.sys.contentType.sys.id !== entity.type) {
          console.warn(
            `⚠️ Entity s ID ${entity.id} má content type ${entry.sys.contentType.sys.id}, ale očekáván byl ${entity.type}`,
          )
        }
      } catch (error) {
        console.error(`❌ Entity ${entity.type} s ID ${entity.id} NEEXISTUJE`)
        allExist = false
      }
    }

    // Kontrola project list
    try {
      const projectList = await environment.getEntry('01IyifdnF9szHBFuCRtUnH')
      if (
        projectList.fields.listCollection &&
        projectList.fields.listCollection['en-US']
      ) {
        const projectCount = projectList.fields.listCollection['en-US'].length
        console.log(`✅ Project list obsahuje ${projectCount} projektů`)
      } else {
        console.warn('⚠️ Project list existuje, ale neobsahuje žádné projekty')
      }
    } catch (error) {
      console.error('❌ Project list NEEXISTUJE')
    }

    if (allExist) {
      console.log('✅ Všechny entity existují!')
    } else {
      console.error('❌ Některé entity neexistují!')

      // Vytvoření chybějících entit
      console.log('\nVytvářím chybějící entity...')

      // Načtení skriptu pro vytvoření entit
      const createEntriesPath = path.join(__dirname, 'create-entries.js')
      if (fs.existsSync(createEntriesPath)) {
        console.log('Spouštím skript create-entries.js...')
        require('./create-entries')
      } else {
        console.error('Skript create-entries.js nenalezen')
      }
    }
  } catch (error) {
    console.error('Chyba při ověřování entit:', error)
  }
}

verifyEntities()
