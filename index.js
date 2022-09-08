import express from 'express'
import { MongoClient } from 'mongodb';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient('mongodb://localhost:27017')

let db;
mongoClient.connect().then(() => {
    db = mongoClient.db('campi');
})

app.post('/sign-up', async (req, res) => {

    //vale fazer uma validação - joi
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
        return res.send(400);
    }

    const hashPassword = bcrypt.hashSync(password, 10);

    try {
        await db.collection('users').insert({
            email,
            name,
            password: hashPassword,
        });
        return res.send(201)
    } catch (error) {
     console.error(error);
     return res.send(500)   
    }
    
})


app.post('/sign-in', async (req, res) => {

    const { email, password } = req.body;

    if(!email || !password) {
        return res.send(400)
    }

    try {
        
        const user = await db.collection('users').findOne({ email, })
        console.log(user)
        const isValid = bcrypt.compareSync(password, user.password);
        
        if(!isValid) {
            return res.send(401);
        }
        
        const token = uuidv4();
        db.collection('sessions').insertOne({
            token,
            userId: user._id,
        })
         
        return res.send(token);

    } catch (error) {
        console.error(error)
        return res.send(500)
    }

})


//Rota privada - só usuários logados
app.get('/products', async (req, res) => {

    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.send(401)
    }

    try {
        
        const session = await db.collection('sessions').findOne({
           token,
        })

        if (!session) {
            return res.send(401)
        }
        //USERS
        const user = await db.collection('users').findOne({
            _id: session.userId,
        })
        //PRODUCTS
        const products = await db.collection('products').find({
            userId: user._id,
        }).toArray();

        
        return res.send(products);

    } catch (error) {
        console.error(error);
    }

    return res.send(200);
})



app.get('/status', (req, res) => {
    res.send('Its aliveeee!!!')
})








app.listen(5000, () => console.log('Magic happens on 5000'))