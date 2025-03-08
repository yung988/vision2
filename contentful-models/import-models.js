#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Získání Space ID z .env.local
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

// Seznam modelů k importu
const models = [
  'studio-vision',
  'footer',
  'link',
  'contact',
  'faq',
  'project-list',
  'project',
  'asset',
]

// Vytvoření content typů
models.forEach((model) => {
  const modelPath = path.join(__dirname, `${model}.json`)
  const modelContent = JSON.parse(fs.readFileSync(modelPath, 'utf8'))

  // Vytvoření dočasného souboru pro content type
  const tempFilePath = path.join(__dirname, `${model}-temp.json`)

  // Přidání contentTypeId
  const contentTypeId = model.replace(/-/g, '')
  const contentType = {
    contentTypeId,
    ...modelContent,
  }

  fs.writeFileSync(tempFilePath, JSON.stringify(contentType, null, 2))

  try {
    console.log(`Importing model: ${model}`)
    execSync(
      `contentful space content-type create --space-id ${spaceId} --content-type-id ${contentTypeId} --management-token ${process.env.CONTENTFUL_MANAGEMENT_TOKEN} --from ${tempFilePath}`,
      { stdio: 'inherit' },
    )
    console.log(`Successfully imported model: ${model}`)
  } catch (error) {
    console.error(`Error importing model ${model}:`, error.message)
  } finally {
    // Odstranění dočasného souboru
    fs.unlinkSync(tempFilePath)
  }
})

console.log('All models imported successfully!')
