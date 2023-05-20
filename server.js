import {app} from './app.js'
import {config} from 'dotenv'
import {connectDatabase} from './config/database.js'
config()

connectDatabase()


app.listen(process.env.PORT,()=>{
    console.log("Server running on "+process.env.PORT);
})