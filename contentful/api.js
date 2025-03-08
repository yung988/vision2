import { GraphQLClient } from 'graphql-request'

export const fetchCmsQuery = async (query, variables) => {
  try {
    // Kontrola, zda jsou k dispozici potřebné proměnné prostředí
    if (!process.env.NEXT_CONTENTFUL_SPACE_ID) {
      console.error(
        'NEXT_CONTENTFUL_SPACE_ID není definováno v proměnných prostředí',
      )
      return null
    }

    if (!process.env.NEXT_CONTENTFUL_ACCESS_TOKEN) {
      console.error(
        'NEXT_CONTENTFUL_ACCESS_TOKEN není definováno v proměnných prostředí',
      )
      return null
    }

    if (variables.preview && !process.env.NEXT_CONTENTFUL_PREVIEW_TOKEN) {
      console.error(
        'NEXT_CONTENTFUL_PREVIEW_TOKEN není definováno v proměnných prostředí',
      )
      return null
    }

    const endpoint = `https://graphql.contentful.com/content/v1/spaces/${process.env.NEXT_CONTENTFUL_SPACE_ID}/environments/master`
    const graphQLClient = new GraphQLClient(endpoint, {
      headers: {
        authorization: `Bearer ${
          variables.preview
            ? process.env.NEXT_CONTENTFUL_PREVIEW_TOKEN
            : process.env.NEXT_CONTENTFUL_ACCESS_TOKEN
        }`,
      },
    })

    // Provedení dotazu
    const data = await graphQLClient.request(query, variables)

    // Kontrola, zda data existují
    if (!data) {
      console.error('Contentful vrátil prázdná data')
      return null
    }

    return data
  } catch (error) {
    console.error(
      `Nastala chyba při načítání dat z Contentful: ${error.message}`,
    )
    console.error(error)
    return null
  }
}
