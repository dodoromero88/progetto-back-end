const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient();
const app = express();

// ========================
var uri ="mongodb+srv://dbDodo:congo1988@cluster0.cffaf.mongodb.net/myDB?retryWrites=true&w=majority";
// ========================


// Replace process.env.DB_URL with your actual connection string
const connectionString = process.env.DB_URL

MongoClient.connect(connectionString, { useUnifiedTopology: true }).then(client => {
    console.log('Connected to Database')
    const db = client.db('myDB')
    const usersCollection = db.collection('users');

    // ========================
    // Middlewares
    // ========================
    app.set('view engine', 'ejs')
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    app.use(express.static('public'))

    // ========================
    // Routes
    // ========================
    app.get('/api', (req, res) => {
      db.collection('users').find().toArray().then(users => {
          res.render('index.ejs', { users: users })
        }).catch(error => console.error(error))
    })

    app.post('/api/user', (req, res) => {
      usersCollection.insertOne(req.body).then(result => {
          res.redirect('/')
        }).catch(error => console.error(error))
    })

    app.put('/api/user', (req, res) => {
      usersCollection.findOneAndUpdate(
        { name: 'Fausto' },
        {
          $set: {
            name: req.body.name,
            age: req.body.age
          }
        },
        {
		  // force creation of new record in case it does not exist
          upsert: true
        }
      ).then(result => res.json('Success')).catch(error => console.error(error))
    })

    app.delete('/api/user', (req, res) => {
      usersCollection.deleteOne(
        { name: req.body.name }
      ).then(result => {
          if (result.deletedCount === 0) {
            return res.json('No person to delete')
          }
          res.json('Deleted Someone')
        }).catch(error => console.error(error))
    })

    // ========================
    // Listen
    // ========================
    const port = 7500
    app.listen(port, function () {
      console.log('listening on ' + port)
    })
  }).catch(console.error)
