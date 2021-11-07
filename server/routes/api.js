const express = require('express')
const router = express.Router()
const articles = require('../data/articles.js')

const bcrypt = require('bcrypt')
const {Client} = require('pg')

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    password: 'MUMS7091',
    database: 'projet'
})
client.connect()

// controler la présence de la table articles

const liste_tables = client.query({
    text: 'SELECT tablename FROM pg_tables WHERE tablename NOT LIKE \'pg_%\' '

})
console.log("liste des tables :")

liste_tables.then((value2) => {
    //console.log(value.rows)
    const res_table2 = value2.rows.find(a => a.tablename === "users")
    console.log(res_table2)

    if (typeof res_table2 === 'undefined') {
        console.log("Création de la table users car elle n'existe pas !!")
        // creation de la table
        const liste_tables = client.query({
            text: 'CREATE TABLE users (id SERIAL, email TEXT, password TEXT, proprio TEXT, nCarte TEXT, expDate TEXT, CVC INTEGER, street TEXT, codePost INTEGER, apart INTEGER, infPlus TEXT, PRIMARY KEY (id))'
        })
    }
})

liste_tables.then((value1) => {
    //console.log(value.rows)
    const res_table1 = value1.rows.find(a => a.tablename === "panier")
    console.log(res_table1)

    if (typeof res_table1 === 'undefined') {
        console.log("Création de la table car elle n'existe pas !!")
        // creation de la table
        const liste_tables = client.query({
            text: 'CREATE TABLE panier ("user" INTEGER, article INTEGER, quantity INTEGER)'
        })
    }
})

liste_tables.then((value) => {
    //console.log(value.rows)
    const res_table = value.rows.find(a => a.tablename === "articles")
    console.log(res_table)

    if (typeof res_table === 'undefined') {
        console.log("Création de la table car elle n'existe pas !!")
        // creation de la table
        const liste_tables =  client.query({
            text: 'CREATE TABLE articles (id INTEGER, infos JSON, PRIMARY KEY (id))'
        })
    }

//La table contient une colonne serial et un colonne infos de type json.

    for (let i of articles) {
        let json = {name: i.name, description: i.description, image: i.image, price: i.price}
        let strJson = JSON.stringify(json)
        /*
           La promesse sera toujours enregistrée en attente tant que ses résultats
           ne sont pas encore résolus. Vous devez faire appel .then à la promesse
           pour capturer les résultats quel que soit l'état de la promesse
        */
        const verif= checkArticle(i.id)
        verif.then((value) => {
            if (value===0)
                client.query('INSERT INTO articles(id, infos) VALUES ($1, $2)', [i.id, strJson])

        })
    }

})



async function checkArticle(id) {
    const result = await client.query({
        text: 'SELECT infos FROM articles WHERE id = $1',
        values:[id]
    })
    return (result.rows.length);
}

async function getArticle(id) {
    let promise = new Promise((resolve, reject) => {
        client.query('SELECT infos FROM articles WHERE id = $1', [id], (err, res) => {
            if (err) reject(err)
            else {
                if (res.rows.length > 0)
                    resolve(res.rows[0].infos)
                else
                    reject()
            }
            resolve()
        })
    })
    try {
        return await promise
    } catch {
        return undefined
    }
}

async function getArticleFromPanier(articleId, userId) {
    let promise = new Promise((resolve, reject) => {
        client.query('SELECT article FROM panier WHERE "user" = $1 AND article = $2', [userId, articleId], (err, res) => {
            if (err) reject(err)
            else {
                if (res.rows.length === 0) {
                    reject()
                } else {
                    resolve(res.rows.quantity)
                }
            }
        })
    })
    try {
        return await promise
    } catch {
        return 0
    }
}

async function getPanier(id) {
    let promise = new Promise((resolve, reject) => {
        client.query('SELECT * FROM panier WHERE "user" = $1', [id], (err, res) => {
            if (err) reject(err)
            else {
                if (res.rows.length === 0) {
                    reject()
                } else {
                    let tab = []
                    for (let i of res.rows) {
                        let json = {id: i.article, quantity: i.quantity}
                        tab.push(json)
                    }
                    console.log(tab)
                    resolve(tab)
                }
            }
        })
    })
    try {
        return await promise
    } catch {
        return undefined
    }
}

class User {
    constructor() {
        this.createdAt = new Date()
        this.updatedAt = new Date()
        this.data // undefined si l'utilisateur n'est pas connecté
        this.cache = [] // panier temporaire
    };
}

router.use((req, res, next) => {
    // l'utilisateur n'est pas reconnu, lui attribuer un panier dans req.session
    if (typeof req.session.user === 'undefined') {
        req.session.user = new User()
    }
    next()
})

/** Routes relatives à la BDD **/

router.post('/register', async (req, res) => {
    const email = req.body.email
    const passwd = req.body.passwd
    // vérification de la validité des données d'entrée
    if (typeof email !== 'string' || email === '' ||
        typeof passwd !== 'string' || passwd === '') {
        res.status(400).json({message: 'bad request', code: 3})
        return
    }
    if (email.endsWith('--')) { // Si on a tenté une injection SQL (useless mais drôle)
        res.status(401).json({message: "Don't mess with me :angyy:", code: 1})
        return
    }

    // on revérifie les données du formulaire, au cas ou qqn utilise postman ou burp
    let validForm = !passwd.match(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{8,}$/) && !email.match(/.*@.*\..{2,}/);
    if (validForm) {
        res.status(401).json({message: "use the form :)", code: 2})
        return
    }


    //verification qu'un utilisateur existe deja ne fonctionne pas
    let query = new Promise((resolve, reject) => {
        client.query('SELECT * FROM users WHERE email = $1', [email], (err, res) => {
            if (err) reject(err)
            else {
                if (res.rows.length > 0) {
                    //res.status(401).json({message: "User already exist", code: 3})
                    reject("L'utilisateur existe déjà")
                    return
                } else resolve()
            }
        })
    })

        let passwd_hash = await bcrypt.hash(passwd, 10)
        console.log("on va faire l'insert")
        console.log(email,passwd)



        await client.query('INSERT INTO users(email, password) VALUES ($1,$2)', [email, passwd_hash])
        res.json({'status': 'success'})


    // on envoie l'article ajouté à l'utilisateur
})

router.post('/deliver', async (req, res) => {
    console.log("test")
})

router.post("/login", async (req, res) => {
    const passwd = req.body.passwd;
    const email = req.body.email;
    if (typeof email !== 'string' || email === '' ||
        typeof passwd !== 'string' || passwd === '') {
        res.status(400).json({message: 'bad request', code: 3})
        return
    }
    if (email.endsWith('--')) { // Si on a tenté une injection SQL (useless mais drôle)
        res.status(401).json({message: "Don't mess with me :angyy:", code: 1})
        return
    }
    let query = new Promise(async (resolve, reject) => {
        client.query('SELECT * FROM users WHERE email = $1', [email], async (err, res) => {
            if (err) reject(err)
            else {
                if (res.rows.length <= 0) {
                    reject()
                } else {
                    let data = res.rows[0];
                    let samePasswd = await bcrypt.compare(passwd, data.password);
                    if (samePasswd) {
                        resolve({id: data.id, email: data.email})
                    } else reject()
                }
            }
        })
    })
    try {
        let data = await query;
        req.session.user.data = data;
        let panier = await getPanier(data.id)
        for (let i of req.session.user.cache) {
            if (!panier || !panier.find(j => j.id === i.id)) //on ajoute pas les doublons
                await client.query('INSERT INTO panier("user", article, quantity) VALUES ($1,$2,$3)', [data.id, i.id, i.quantity], (err, res) => {
                        if (err) console.log(err)
                    }
                )
        }
        let response = {}
        response.data = data;
        response.panier = await getPanier(data.id)
        req.session.user.cache = []
        res.json(response)

    } catch (err) {
        res.status(401).json({message: err, code: 0})
    }
})

router.post('/logout', (req, res)=>{
    if(req.session.user.data){
        req.session.user.data = undefined
        res.send()
    }else{
        res.status(400).json({message:'Non authentifié'})
    }
})

router.get("/me", async (req, res) => {
    if (req.session.user.data) {
        res.json(req.session.user.data)
    } else res.status(204).json({message: 'Non connecté', code: 5})
})

/*
 * Cette route doit retourner le panier de l'utilisateur, grâce à req.session
 */
router.get('/panier', async (req, res) => {
    if (req.session.user.data) {
        let articles = await getPanier(req.session.user.data.id)
        res.json({articles: articles ? articles : []})
    } else {
        res.json({articles: req.session.user.cache})
    }
})

/*
 * Cette route doit ajouter un article au panier, puis retourner le panier modifié à l'utilisateur
 * Le body doit contenir l'id de l'article, ainsi que la quantité voulue
 */
router.post('/panier', async (req, res) => {
    const id = req.body.id
    const quantity = req.body.quantity

    // vérification de la validité des données d'entrée
    if (isNaN(id) || id <= 0 ||
        isNaN(quantity) || quantity <= 0) {
        res.status(400).json({message: 'bad request'})
        return
    }
    let article = await getArticle(id)
    if (!article) {
        res.status(400).json({message: "L'article n'existe pas"})
        return
    }
    let panier = {}
    if (req.session.user.data) {
        if (await getArticleFromPanier(id, req.session.user.data.id) > 0) {
            res.status(400).json({message: "L'article existe déjà"})
            return
        }
        await client.query('INSERT INTO panier("user", article, quantity) VALUES ($1,$2,$3)', [req.session.user.data.id, id, 1])
        panier.articles = await getPanier(req.session.user.data.id)
    } else {
        if (req.session.user.cache.find(a => a.id === parseInt(id))) {
            res.status(400).json({message: "L'article existe déjà"})
            return
        }
        req.session.user.cache.push({id: parseInt(id), quantity: parseInt(quantity)})
        panier.articles = req.session.user.cache

    }
    res.json(panier)
})

/*
 * Cette route doit permettre de confirmer un panier, en recevant le nom et prénom de l'utilisateur
 * Le panier est ensuite supprimé grâce à req.session.destroy()
 */


// problème au niveau req.session.user.id, l'id ne se recup pas
/*
user {
  createdAt: '2021-10-31T16:50:07.144Z',
  updatedAt: '2021-10-31T16:50:07.144Z',
  cache: [],
  data: { id: 1, email: 'titi@gmail.com' }
}
 */
router.post('/panier/pay', async (req, res) => {
   console.log("req.session.user.data:"+req.session.user.data)
    if (req.session.user.data) {
        console.log("req.session.user.data.id:"+req.session.user.data.id)
        let panier = await getPanier(req.session.user.data.id)
        if (!panier) {
            res.status(400).json({message: "Votre panier est vide"})
            return
        }
        client.query('DELETE FROM panier WHERE "user" = $1', [req.session.user.data.id])
        res.json({message: `achat effectué`})
    } else
        res.status(403).json({message: 'Vous devez être connecté pour effectuer cet achat'})
})


router.put('/livraison', async (req, res) => {
    console.log("test2")
    const nCarte = req.body.nCarte
    const proprio = req.body.proprio
    const expDate = req.body.expDate
    const CVC = req.body.CVC
    const street = req.body.street
    const codePost = req.body.codePost
    const apart = req.body.apart
    const infPlus = req.body.infPlus




    // UPDATE users SET proprio = 'Patrick', nCarte= '0123456789123456', expDate = '21112021', CVC =123, street = 'place de la république', codePost= 75010, apart = 1, infPlus = 'toto' WHERE id = 1
    if (req.session.user.data) {
        client.query('UPDATE users SET proprio = $1, nCarte= $2, expDate = $3, CVC = $4, street = $5, codePost= $6, apart = $7, infPlus = $8 WHERE id = $9', [proprio, nCarte, expDate, CVC, street, codePost, apart, infPlus, req.session.user.data.id])
    } else {/*
        if (!req.session.user.cache.find(a => a.id === id)) {
            res.status(404).json({message: "Article not found"})
            return
        }
        req.session.user.cache.find(a => a.id === id).quantity = quantity*/
    }
    res.json({message: "Success"})


})

/*
 * Cette route doit permettre de changer la quantité d'un article dans le panier
 * Le body doit contenir la quantité voulue
 */
router.put('/panier/:articleId', async (req, res) => {
    let id = req.params.articleId
    let quantity = req.body.quantity
    if (isNaN(id) || id <= 0
        || isNaN(quantity) || quantity <= 0) {
        res.status(400).json({message: "bad request"})
        return
    }
    id = parseInt(id)
    quantity = parseInt(quantity)
    if (req.session.user.data) {
        if (await getArticleFromPanier(id, req.session.user.data.id) === 0) {
            res.status(404).json({message: "Article not found"})
            return
        }
        client.query('UPDATE panier SET quantity = $1 WHERE article = $2 AND "user" = $3', [quantity, id, req.session.user.data.id])
    } else {
        if (!req.session.user.cache.find(a => a.id === id)) {
            res.status(404).json({message: "Article not found"})
            return
        }
        req.session.user.cache.find(a => a.id === id).quantity = quantity
    }
    res.json({message: "Success"})

})

/*
 * Cette route doit supprimer un article dans le panier
 */
router.delete('/panier/:articleId', async (req, res) => {
    let id = req.params.articleId
    if (isNaN(id) || id <= 0) {
        res.status(400).json({message: "bad request"})
        return
    }
    id = parseInt(id)
    let panier = {}
    if (req.session.user.data) {
        if (await getArticleFromPanier(id, req.session.user.data.id) === 0) {
            res.status(404).json({message: "article not found"})
            return
        }
        client.query('DELETE FROM panier WHERE article = $1 AND "user" = $2', [id, req.session.user.data.id])
        panier.articles = await getPanier(req.session.user.data.id)
        panier.articles = panier.articles ? panier.articles : []
    } else {
        if (req.session.user.cache.find(a => a.id === id) === undefined) {
            res.status(404).json({message: "article not found"})
            return
        }
        req.session.user.cache.splice(req.session.user.cache.indexOf(req.session.user.cache.find(a => a.id === id)), 1)
        panier.articles = req.session.user.cache
    }
    res.json(panier)

})


/**
 * Cette route envoie l'intégralité des articles du site
 */
router.get('/articles', async (req, res) => {
    let promise = new Promise((resolve, reject) => {
        client.query('SELECT * FROM articles', [], (err, res) => {
            if (err) reject(err)
            else {
                if (res.rows.length === 0) {
                    reject({message: 'aucun article dans la bdd', code: 1})
                } else {
                    let tab = [];
                    for (let i of res.rows) {
                        let json = i.infos;
                        json.id = i.id
                        tab.push(json)
                    }
                    resolve(tab)
                }
            }
        })
    })
    try {
        let articles = await promise;
        res.json(articles)
    } catch (err) {
        res.status(404).json(err)
    }
})

/**
 * Cette route crée un article.
 * WARNING: dans un vrai site, elle devrait être authentifiée et valider que l'utilisateur est bien autorisé
 * NOTE: lorsqu'on redémarre le serveur, l'article ajouté disparait
 *   Si on voulait persister l'information, on utiliserait une BDD (mysql, etc.)
 */
router.post('/article', (req, res) => {
    const name = req.body.name
    const description = req.body.description
    const image = req.body.image
    const price = parseInt(req.body.price)

    // vérification de la validité des données d'entrée
    if (typeof name !== 'string' || name === '' ||
        typeof description !== 'string' || description === '' ||
        typeof image !== 'string' || image === '' ||
        isNaN(price) || price <= 0) {
        res.status(400).json({message: 'bad request'})
        return
    }

    const article = {
        name: name,
        description: description,
        image: image,
        price: price
    }
    client.query('INSERT INTO articles(infos) VALUES($1)', [JSON.stringify(article)])
    // on envoie l'article ajouté à l'utilisateur
    res.json(article)
})

/**
 * Cette fonction fait en sorte de valider que l'article demandé par l'utilisateur
 * est valide. Elle est appliquée aux routes:
 * - GET /article/:articleId
 * - PUT /article/:articleId
 * - DELETE /article/:articleId
 * Comme ces trois routes ont un comportement similaire, on regroupe leurs fonctionnalités communes dans un middleware
 */
async function parseArticle(req, res, next) {
    const articleId = parseInt(req.params.articleId)

    // si articleId n'est pas un nombre (NaN = Not A Number), alors on s'arrête
    if (isNaN(articleId)) {
        res.status(400).json({message: 'articleId should be a number'})
        return
    }
    // on affecte req.articleId pour l'exploiter dans toutes les routes qui en ont besoin
    req.articleId = articleId
    let article = await getArticle(articleId);
    if (!article) {
        res.status(404).json({message: 'article ' + articleId + ' does not exist'})
        return
    }
    // on affecte req.article pour l'exploiter dans toutes les routes qui en ont besoin
    req.article = article
    next()
}

router.route('/article/:articleId')
    /**
     * Cette route envoie un article particulier
     */
    .get(parseArticle, (req, res) => {
        // req.article existe grâce au middleware parseArticle
        res.json(req.article)
    })

    /**
     * Cette route modifie un article.
     * WARNING: dans un vrai site, elle devrait être authentifiée et valider que l'utilisateur est bien autorisé
     * NOTE: lorsqu'on redémarre le serveur, la modification de l'article disparait
     *   Si on voulait persister l'information, on utiliserait une BDD (mysql, etc.)
     */
    .put(parseArticle, (req, res) => {
        let json = {};
        json.name = req.body.name
        json.description = req.body.description
        json.image = req.body.image
        json.price = parseInt(req.body.price)
        client.query('UPDATE articles SET infos = $1 WHERE id = $2', [JSON.stringify(json), req.params.articleId])
        res.send()
    })

    .delete(parseArticle, (req, res) => {
        client.query('DELETE FROM articles WHERE id = $1', [req.params.articleId])
        res.send()
    })


module.exports = router
