import express from 'express'
import helmet from 'helmet'

const app = express()

app.use(helmet())
app.use(express.json())

app.get('/', (req, res) => {
    res.json({'message': 'hello world'})
})

app.listen(9090)
