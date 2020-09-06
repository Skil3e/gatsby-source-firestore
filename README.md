# gatsby-source-firestore
Gatsby source plugin for Firestore

## Usage
1. ```npm install @Skil3e/gatsby-source-firestore```
2. use .env.* or hardcode your login credentials and firebase config
3. Configure settings at ```gatsby-config.js```, for example:
```js
module.exports = {
    {
        resolve: `skil3e-source-firestore`,
        options: {
            login: {
                //your login credentials
                email: process.env.FIREBASE_AUTH_EMAIL,
                password: process.env.FIREBASE_AUTH_PASSWORD
            },
            firebaseConfig: {
                apiKey: process.env.FIREBASE_API_KEY,
                authDomain: process.env.FIREBASE_AUTH_DOMAIN,
                databaseURL: process.env.FIREBASE_DATABASE_URL,
                projectId: process.env.FIREBASE_PROJECT_ID,
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
                messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
                appId: process.env.FIREBASE_APP_ID,
                measurementId: process.env.FIREBASE_MEASUREMENT_ID
            },
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
if you use ```makeNode: false``` in ```subCollections```
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
}
```
if you use ```makeNode: true``` in ```subCollections```
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

  //will also make this
  allSubcollection{
    edges {
      node {
        value 
      }
    }
  }
}
