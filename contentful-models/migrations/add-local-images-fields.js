module.exports = function (migration) {
  // Získání content modelu "project"
  const project = migration.editContentType('project')

  // Přidání pole "localImages" - pole řetězců pro lokální cesty k obrázkům
  project
    .createField('localImages')
    .name('Local Images')
    .type('Array')
    .items({
      type: 'Symbol',
      validations: [
        {
          regexp: {
            pattern: '^/images/.+\\.(webp|jpg|jpeg|png)$',
            flags: 'i',
          },
        },
      ],
    })
    .required(false)

  // Přidání pole "mainImage" - řetězec pro lokální cestu k hlavnímu obrázku
  project
    .createField('mainImage')
    .name('Main Image')
    .type('Symbol')
    .validations([
      {
        regexp: {
          pattern: '^/images/.+\\.(webp|jpg|jpeg|png)$',
          flags: 'i',
        },
      },
    ])
    .required(false)

  // Změna pořadí polí
  project.changeFieldControl('localImages', 'builtin', 'listInput')
  project.changeFieldControl('mainImage', 'builtin', 'singleLine')
}
