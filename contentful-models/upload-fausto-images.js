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

// Funkce pro nahrání obrázku
async function uploadImage(environment, filePath) {
  try {
    const fileName = path.basename(filePath)
    const fileBuffer = fs.readFileSync(filePath)

    // Vytvoření asset
    const asset = await environment.createAsset({
      fields: {
        title: {
          'en-US': fileName.replace('.webp', ''),
        },
        description: {
          'en-US': `Image for Fausto&Fillipa project`,
        },
        file: {
          'en-US': {
            contentType: 'image/webp',
            fileName: fileName,
            upload: fileBuffer.toString('base64'),
          },
        },
      },
    })

    // Zpracování a publikování asset
    const processedAsset = await asset.processForAllLocales()
    await processedAsset.publish()

    console.log(`Uploaded and published: ${fileName}`)
    return processedAsset
  } catch (error) {
    console.error(`Error uploading ${filePath}:`, error.message)
    return null
  }
}

// Hlavní funkce
async function uploadFaustoImages() {
  try {
    console.log('Starting Fausto&Fillipa images upload...')

    const space = await client.getSpace(spaceId)
    const environment = await space.getEnvironment('master')

    // Načtení obrázků
    const imagesDir = path.join(__dirname, '../public/images')
    const imageFiles = fs
      .readdirSync(imagesDir)
      .filter(
        (file) => file.startsWith('Fausto&Fillipa') && file.endsWith('.webp'),
      )

    console.log(`Found ${imageFiles.length} images to upload`)

    const uploadedAssets = []

    // Nahrání obrázků
    for (const imageFile of imageFiles) {
      const filePath = path.join(imagesDir, imageFile)
      const asset = await uploadImage(environment, filePath)
      if (asset) {
        uploadedAssets.push(asset)
      }
    }

    console.log('\nAll done!')
    console.log(`Successfully uploaded ${uploadedAssets.length} images`)

    // Výpis ID všech nahraných assetů
    console.log('\nAsset IDs:')
    uploadedAssets.forEach((asset) => {
      console.log(`${asset.fields.title['en-US']}: ${asset.sys.id}`)
    })
  } catch (error) {
    console.error('Error:', error.message)
    console.error(error.stack)
  }
}

// Spuštění skriptu
uploadFaustoImages()
