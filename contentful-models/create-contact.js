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

// Funkce pro vytvoření HubSpot formuláře
async function createHubSpotForm(environment) {
  try {
    console.log('Creating HubSpot form...')

    const form = await environment.createEntry('hubspotForm', {
      fields: {
        name: {
          'en-US': 'Kontaktní formulář',
        },
        portalId: {
          'en-US': process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID,
        },
        formId: {
          'en-US': process.env.NEXT_PUBLIC_HUBSPOT_FORM_ID,
        },
        region: {
          'en-US': 'na1',
        },
        submitButtonText: {
          'en-US': 'Odeslat',
        },
      },
    })

    await form.publish()
    console.log('HubSpot form created successfully')
    return form
  } catch (error) {
    console.error('Error creating HubSpot form:', error.message)
    return null
  }
}

// Funkce pro vytvoření kontaktního formuláře
async function createContact(environment, hubspotForm) {
  try {
    console.log('Creating contact form...')

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
                      'Máte zájem o spolupráci nebo chcete vědět více? Neváhejte nás kontaktovat.',
                    marks: [],
                    data: {},
                  },
                ],
              },
            ],
          },
        },
        form: {
          'en-US': {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: hubspotForm.sys.id,
            },
          },
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
                      'Děkujeme za vaši zprávu. Ozveme se vám co nejdříve.',
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
    console.log('Contact form created successfully')
    return contact
  } catch (error) {
    console.error('Error creating contact form:', error.message)
    return null
  }
}

// Hlavní funkce
async function createContactForm() {
  try {
    console.log('Starting contact form creation...')

    const space = await client.getSpace(spaceId)
    const environment = await space.getEnvironment('master')

    const hubspotForm = await createHubSpotForm(environment)
    if (hubspotForm) {
      console.log(`\nID HubSpot formuláře: ${hubspotForm.sys.id}`)

      const contact = await createContact(environment, hubspotForm)
      if (contact) {
        console.log(`\nID kontaktního formuláře: ${contact.sys.id}`)
      }
    }

    console.log('\nKontaktní formulář byl úspěšně vytvořen!')
  } catch (error) {
    console.error('Error:', error.message)
    console.error(error.stack)
  }
}

// Spuštění skriptu
createContactForm()
