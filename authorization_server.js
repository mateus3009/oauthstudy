/* Setup database */

import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

const db_storage = new JSONFile('./authorization_server_db.json')
const db = new Low(db_storage)

await db.read()

db.data ||= {
    clients: [
        {
            name: 'TEST',
            client_id: '3e4fd94c-0f82-47b5-8ecf-148b9ea31de6',
            client_secret: '63c72ae0-699e-402c-ad3f-6f10be47e4f7',
        }
    ]
}

/* Controller */

import express from 'express'
import helmet from 'helmet'
import { randomUUID } from 'crypto'

const app = express()

app.use(helmet())
app.use(express.json())

app.get('/', (req, res) => {
    res.json({ message: 'hello world' })
})

const clients = express.Router()

clients.post('/', async (req, res) => {
    const { name } = req.body
    if (!name)
        return res.status(400).json({ error: '"name" cannot be null' })
    const client = {
        name: name,
        client_id: randomUUID(),
        client_secret: randomUUID()
    }
    db.data.clients.push(client)
    db.write()
    return res.status(201).location(client.client_id).send(client)
})

clients.get('/', async (req, res) => {
    return res.json(db.data.clients)
})

clients.get('/:id', async (req, res) => {
    const client = db.data.clients.filter(client => req.params.id == client.client_id)
    if (client.length > 0)
        return res.json(client)
    return res.status(404).json({ error: 'not found' })
})

clients.put('/:id', async (req, res) => {
    const { name } = req.body
    if (!name)
        return res.status(400).json({ error: '"name" cannot be null' })
    let updated = null
    const result = db.data.clients.map(client => {
        if (req.params.id != client.client_id)
            return client
        updated = { ...client, name }
        return updated
    })
    db.data.clients = result
    db.write()
    if (updated)
        res.json(updated)
    return res.status(404).json({ error: 'not found' })
})

clients.delete('/:id', async (req, res) => {
    const result = db.data.clients.filter(client => req.params.id != client.client_id)
    db.data.clients = result
    return res.sendStatus(204)
})

app.use('/clients', clients)

app.listen(9090)
