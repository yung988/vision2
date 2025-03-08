module.exports = function (migration) {
  // Studio Vision
  const studioVision = migration.createContentType('studio-vision', {
    name: 'Studio Vision',
    description: 'Main information about Studio Vision',
    displayField: 'email',
  })

  studioVision.createField('principles', {
    name: 'Principles',
    type: 'Array',
    items: {
      type: 'Symbol',
    },
  })

  studioVision.createField('about', {
    name: 'About',
    type: 'RichText',
  })

  studioVision.createField('phoneNumber', {
    name: 'Phone Number',
    type: 'Symbol',
  })

  studioVision.createField('email', {
    name: 'Email',
    type: 'Symbol',
    validations: [
      {
        regexp: {
          pattern: '^\\w[\\w.-]*@([\\w-]+\\.)+[\\w-]+$',
          flags: '',
        },
        message: 'Please enter a valid email address',
      },
    ],
  })

  // Link
  const link = migration.createContentType('link', {
    name: 'Link',
    description: 'A link with text and URL',
    displayField: 'text',
  })

  link.createField('text', {
    name: 'Text',
    type: 'Symbol',
    required: true,
  })

  link.createField('url', {
    name: 'URL',
    type: 'Symbol',
    required: true,
    validations: [
      {
        regexp: {
          pattern:
            '^(ftp|http|https):\\/\\/(\\w+:{0,1}\\w*@)?(\\S+)(:[0-9]+)?(\\/|\\/([\\w#!:.?+=&%@!\\-\\/]))?$',
          flags: '',
        },
        message: 'Please enter a valid URL',
      },
    ],
  })

  // Footer
  const footer = migration.createContentType('footer', {
    name: 'Footer',
    description: 'Footer information',
  })

  footer.createField('linksCollection', {
    name: 'Links Collection',
    type: 'Array',
    items: {
      type: 'Link',
      linkType: 'Entry',
      validations: [
        {
          linkContentType: ['link'],
        },
      ],
    },
  })

  // FAQ
  const faq = migration.createContentType('faq', {
    name: 'FAQ',
    description: 'Frequently Asked Question',
    displayField: 'title',
  })

  faq.createField('title', {
    name: 'Title',
    type: 'Symbol',
    required: true,
  })

  faq.createField('content', {
    name: 'Content',
    type: 'RichText',
    required: true,
  })

  // Contact
  const contact = migration.createContentType('contact', {
    name: 'Contact',
    description: 'Contact information and form',
  })

  contact.createField('description', {
    name: 'Description',
    type: 'RichText',
  })

  contact.createField('form', {
    name: 'Form',
    type: 'Symbol',
  })

  contact.createField('faqsCollection', {
    name: 'FAQs Collection',
    type: 'Array',
    items: {
      type: 'Link',
      linkType: 'Entry',
      validations: [
        {
          linkContentType: ['faq'],
        },
      ],
    },
  })

  contact.createField('thankYouMessage', {
    name: 'Thank You Message',
    type: 'RichText',
  })

  // Asset
  const asset = migration.createContentType('asset', {
    name: 'Asset',
    description: 'An asset with images',
  })

  asset.createField('imagesCollection', {
    name: 'Images Collection',
    type: 'Array',
    items: {
      type: 'Link',
      linkType: 'Asset',
    },
  })

  // Project
  const project = migration.createContentType('project', {
    name: 'Project',
    description: 'A project',
    displayField: 'name',
  })

  project.createField('name', {
    name: 'Name',
    type: 'Symbol',
    required: true,
  })

  project.createField('industry', {
    name: 'Industry',
    type: 'Symbol',
  })

  project.createField('body', {
    name: 'Body',
    type: 'RichText',
  })

  project.createField('testimonial', {
    name: 'Testimonial',
    type: 'Symbol',
  })

  project.createField('assetsCollection', {
    name: 'Assets Collection',
    type: 'Array',
    items: {
      type: 'Link',
      linkType: 'Entry',
      validations: [
        {
          linkContentType: ['asset'],
        },
      ],
    },
  })

  project.createField('services', {
    name: 'Services',
    type: 'Array',
    items: {
      type: 'Symbol',
    },
  })

  project.createField('stack', {
    name: 'Stack',
    type: 'Array',
    items: {
      type: 'Symbol',
    },
  })

  project.createField('link', {
    name: 'Link',
    type: 'Symbol',
    validations: [
      {
        regexp: {
          pattern:
            '^(ftp|http|https):\\/\\/(\\w+:{0,1}\\w*@)?(\\S+)(:[0-9]+)?(\\/|\\/([\\w#!:.?+=&%@!\\-\\/]))?$',
          flags: '',
        },
        message: 'Please enter a valid URL',
      },
    ],
  })

  // Project List
  const projectList = migration.createContentType('projectList', {
    name: 'Project List',
    description: 'List of projects',
  })

  projectList.createField('listCollection', {
    name: 'List Collection',
    type: 'Array',
    items: {
      type: 'Link',
      linkType: 'Entry',
      validations: [
        {
          linkContentType: ['project'],
        },
      ],
    },
  })
}
