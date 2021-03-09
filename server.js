const env = require('dotenv');
env.config();
const express = require('express');
//const bodyParser = require('body-parser');
//const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const jwt = require('jsonwebtoken');
//app.use(cors());

//Temp .env for time zone.
process.env.TZ = 'Europe/Rome';

// Replace process.env.DB_URL with your actual connection string
const connectionString = process.env.DB_URL;
MongoClient.connect(connectionString, { useUnifiedTopology: true }).then(client => {
  console.log('Connected to Database')
  const db = client.db('myDB')
  const usersCollection = db.collection('users');

  // ========================
  // Middlewares
  app.set('view engine', 'ejs');
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  //app.use(bodyParser.urlencoded({ extended: true }));
  //app.use(bodyParser.json());
  app.use(express.static('public'));


  // Routes
  app.get('/api', (req, res) => {
    usersCollection.find().toArray().then(users => {
      // res.render('index.ejs', { users: users })
      res.send(users);
    }).catch(error => console.error(error))
  })


  app.post('/api/utente/login', (req, res) => {
    //Richiamo la  funzinone processAuthorizationToken, con return ottengo dei dati
    
    let tokenUser = processAuthorizationToken(req);
    if (tokenUser == null) return res.sendStatus(401);

    let email = tokenUser[0];
    let pswTokenUser = tokenUser[1];       //jwt codifica utilizzando la mia chiave --jwt encode dell psw. DEfinire uina chiave di cifratura
    let pswJwt = jwt.sign(pswTokenUser,process.env.ACCESS_TOKEN_SECRET);
    usersCollection.findOne({ email: email, password: pswJwt }).then(result => {
    res.json(result);
    }).catch(error => console.error(error))
  })

  // API signup
  app.post('/api/utente/signup', (req, res) => {
    let utente = req.body;
    console.log(req.body);
    utente.createdAt = new Date();
    utente.role = 'utente';  // jtw encode la passeword jwt
    console.log(req.body);
    utente.password = jwt.sign(req.body.password ,process.env.ACCESS_TOKEN_SECRET);
    usersCollection.insertOne(utente).then(result => {
      //console.log(result);
     res.json('entity saved');
    }).catch(error => console.error(error))
  })

  function processAuthorizationToken(req) {
    // Veririficare authHeader != da null
    let tokenParts;
    const authHeader = req.header('Authorization');
    console.log('authHeader:' + authHeader);
    if (authHeader != null) {
      const tokenBase64 = authHeader && authHeader.split(' ')[1]; //"Basic " va via?
      if (tokenBase64 != null) {
        let token = Buffer.from(tokenBase64, 'base64').toString('ascii');
        if (token != null) {
          tokenParts = token.split(':');
          console.log(tokenParts[0]); //email
          console.log(tokenParts[1]); // psw       
        }
        
      }
      
    }

    return tokenParts;
  }


  // API per calenario prova
  app.get('/api/booking', (req, res) => {
    //Prova di date fittizie
      let bookings = [];
      bookings.push(new Date(2021, 03, 10, 09, 00));
      bookings.push(new Date(2021, 03, 10, 10, 00));
      bookings.push(new Date(2021, 03, 10, 11, 00));

      res.json(bookings);
  })


  // Listen
  const port = 3000;
  app.listen(port, function () {
    console.log('listening on ' + port)
  })

}).catch(console.error)
