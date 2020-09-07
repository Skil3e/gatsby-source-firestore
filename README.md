# gatsby-source-firestore
Gatsby source plugin for Firestore

## Usage
1. ```npm install @Skil3e/gatsby-source-firestore```
2. Generate credentials from Firebase > Settings > Service accounts > "Generate new private key".
3. Configure settings at ```gatsby-config.js```, for example:
```js
module.exports = {
    {
        resolve: `skil3e-source-firestore`,
        options: {
            credential: require(`./credentials.json`),
            collections: [
                {
                    type: "Collection", // Graphql name
                    name: "collection", // Firebase name (can also be a path for a specific subcollection  eg: "collection/documentID/subCollection")
                    // Use map if you want to rename data or load only partial data
                    map?: doc => {
                            value: doc.value
                        }
                    subCollections?: [
                        {
                            type: "Subcollection", // Graphql name
                            name: "subcollection", // Firebase name
                            makeNode?: false // if true will create top level node
                        }
                    ]
                }
            ]
        },
    }
}
```

```graphql
{
  allCollection {
    edges {
      node {
        value
        childrenSubcollection  {
          value
        }
      }
    }
  }

  """ Will also make this """
  allSubcollection {
    edges {
      node {
        value 
      }
    }
  }
}

## Acknowledgement

- [ryanflorence/gatsby-source-firebase](https://github.com/ryanflorence/gatsby-source-firebase)
- [taessina/gatsby-source-firestore](https://github.com/taessina/gatsby-source-firestore)

