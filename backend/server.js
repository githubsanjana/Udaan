const express    = require('express')
const mongoose   = require('mongoose')
const cors       = require('cors')
const dotenv     = require('dotenv')

dotenv.config()

const { startScheduler } = require('./cron/scheduler')
const { verifyEmail }    = require('./services/emailService')

const app = express()

mongoose.set('strictQuery', true)



app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://udaan-flame-six.vercel.app',
  ],
  credentials: true,
}))

app.use(express.json())

app.use('/api/auth',         require('./routes/auth'))
app.use('/api/user',         require('./routes/user'))
app.use('/api/modules',      require('./routes/modules'))
app.use('/api/transactions', require('./routes/transactions'))

app.get('/', (req, res) => {
  res.json({ message: '✦ Udaan Backend Running!', status: 'ok' })
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected!')
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on http://localhost:${process.env.PORT || 5000}`)
      startScheduler()
      verifyEmail()
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)
  })