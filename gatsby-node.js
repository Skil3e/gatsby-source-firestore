const firebase = require('firebase-admin');
exports.sourceNodes = async ({actions, createNodeId, createContentDigest}, configOptions) => {
    const {createNode} = actions;
    delete configOptions.plugins;
    //Config variables
    const {collections, credential} = configOptions;
    //Firebase initialize
    try {
        if (firebase.apps || !firebase.apps.length) {
            const cfg = {credential: firebase.credential.cert(credential)}
            firebase.initializeApp(cfg);
        }
    } catch (e) {
        console.log(
            'Could not initialize Firebase. Please check `credential` property in gatsby-config.js'
        );
        console.log(e);
        return;
    }
    const db = firebase.firestore();
    const promises = collections.map(async ({type, name, map = node => node, subCollections}) => {
        //Get Collection
        const snapshot = await db.collection(name).get();
        let subCollectionNodes = {};
        let childrenIDs = [];
        for (let doc of snapshot.docs) {
            subCollections && subCollections.map(async ({type: subType, name: subName, map = node => node}) =>{
                const subSnapshot = await db.collection(`${name}/${doc.id}/${subName}`).get();
                for (let subDoc of subSnapshot.docs) {
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
                    createNode(subNode);
                }
            })
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
            createNode(node);
            await Promise.resolve();
        }
    })
    await Promise.all(promises);
}


