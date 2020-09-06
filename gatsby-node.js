const firebase = require("firebase/app");
require("firebase/auth");
require("firebase/firestore");

exports.sourceNodes = async ({actions, createNodeId, createContentDigest}, configOptions) => {
    const {createNode} = actions;
    delete configOptions.plugins;
    //Config variables
    const {collections, firebaseConfig, login} = configOptions;

    //Firebase initialize
    const firebaseApp = firebase.initializeApp(firebaseConfig);
    const db = firebaseApp.firestore();
    const auth = firebaseApp.auth();

    auth.signInWithEmailAndPassword(login.email, login.password).then(() => {
        //Iterate Collections
        collections.forEach(({type, name, map = node => node, subCollections}) => {
            //Get Collection
            db.collection(name).get().then((res) => {
                //Manage Sub collections
                let subCollectionNodes = {};
                let childrenIDs = [];
                //Iterate Sub Collections
                subCollections && subCollections.forEach(({type: subType, name: subName, map = node => node, makeNode}) => {
                    let singleSubCollectionNode = []
                    res.forEach(doc => {

                        db.collection(`${name}/${doc.id}/${subName}`).get().then(subRes => {
                            subRes.forEach(subDoc => {
                                childrenIDs.push(subDoc.id);
                                const subNodeMeta = {
                                    id: subDoc.id,
                                    parent: doc.id,
                                    children: [],
                                    internal: {
                                        type: subType,
                                        mediaType: `text/html`,
                                        content: JSON.stringify(subDoc.data()),
                                        contentDigest: createContentDigest(subDoc.data()),
                                    },
                                }
                                const subNoteData = map ? map(subDoc.data()) : subDoc.data();
                                const subNode = Object.assign({}, subNoteData, subNodeMeta);
                                if (makeNode) {
                                    createNode(subNode);
                                } else {
                                    singleSubCollectionNode.push(subNode);
                                }
                            });
                        }).catch(e => console.log(e))
                        subCollectionNodes = {...subCollectionNodes, [subName]: singleSubCollectionNode}
                    });

                })

                //Make Collection Node
                res.forEach(doc => {

                    const nodeMeta = {
                        id: doc.id,
                        parent: null,
                        children: childrenIDs,
                        internal: {
                            type: type,
                            mediaType: `text/html`,
                            content: JSON.stringify(doc.data()),
                            contentDigest: createContentDigest(doc.data()),
                        },
                    }
                    const nodeData = map ? map(doc.data()) : doc.data()
                    const node = Object.assign({}, {...nodeData, ...subCollectionNodes}, nodeMeta)
                    createNode(node)

                })
            }).catch(e => console.log(e));
        })
    }).catch((error) => console.log("Firebase Error ", error));

    auth.signOut().catch((e) => console.log(e))
}
