const express = require('express');
const bodyParser = require('body-parser');
// const cors = require('cors');
const process = require('./environments');
const MongoClient = require('mongodb').MongoClient;
const app = express();

//app.use(cors()); prova temp comunicazione F-E e B-E
// ========================
//const uri ="**********++^^***";
// ========================

// Replace process.env.DB_URL with your actual connection string
const connectionString = process.env.DB_URL;

MongoClient.connect(connectionString, { useUnifiedTopology: true }).then(client => {
    console.log('Connected to Database')
    const db = client.db('myDB')
    const usersCollection = db.collection('users');

    // ========================
    // Middlewares
    app.set('view engine', 'ejs');
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(express.static('public'));

    
    // Routes
    app.get('/api', (req, res) => {
      usersCollection.find().toArray().then(users => {
         // res.render('index.ejs', { users: users })
         res.send(users);
        }).catch(error => console.error(error))
    })


    app.post('/api/utente/login', (req, res) => {
      //Richiamare funzinone processAuthorizationToken, con return ottengo, dichiaro variabili
      let email = tokenParts[0];
      let password = tokenParts[1];       //jwt codifica utilizzando la mia chiave --jwt encode dell psw. DEfinire uina chiave di cifratura
      usersCollection.find({ email: email , password: pswJwt} ).then(result => {
          //console.log("dato inserito"); //test effettuato con postman
          res.send(result);  
        }).catch(error => console.error(error))
    })

    // simili alla login
    app.post('/api/utente/signup', (req, res) => {
      let utente = req.body;
      utente.createdAt = new Date();
      utente.role = 'utente';  // jtw encode la passeword
      usersCollection.insertOne(utente).then(result => {
          //console.log("dato inserito"); //test effettuato con postman
          res.send(result);  
        }).catch(error => console.error(error))
    })

    function processAuthorizationToken(req) {
    // Veririficare authHeader != da null
      const authHeader = req.headers['Authorization'];
      //Veririficare tokenBase64 != da null
      const tokenBase64 = authHeader && authHeader.split(' ')[1]
      //Verificare token se è diverso null
      let token = Buffer.from(tokenBase64, 'base64').toString('ascii')
      let tokenParts = token.split(':')

      if (token == null) return res.sendStatus(401) // if there isn't any token
      return tokenParts;
    }


    app.post('/api/user', (req, res) => {
      usersCollection.insertOne(req.body).then(result => {
          //console.log("dato inserito"); //test effettuato con postman
          var risultato = result;  
          
        }).catch(error => console.error(error))
    })


    // Listen
    const port = 3000;
    app.listen(port, function () {
      console.log('listening on ' + port)
    })

  }).catch(console.error)
