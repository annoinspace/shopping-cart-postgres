import express from "express"
import cors from "cors"
import listEndpoints from "express-list-endpoints"
import { pgConnect, syncModels } from "./db.js"
import productsRouter from "./api/products/index.js"
import categoriesRouter from "./api/categories/index.js"
import usersRouter from "./api/users/index.js"
import {
  badRequestErrorHandler,
  forbiddenErrorHandler,
  genericErrorHandler,
  notFoundErrorHandler,
  unauthorizedErrorHandler
} from "./errorHandlers.js"

const server = express()
const port = process.env.PORT || 3001

// ********************************* MIDDLEWARE ***************************************
server.use(cors())
server.use(express.json())

// ********************************** ENDPOINTS ****************************************
server.use("/products", productsRouter)
server.use("/categories", categoriesRouter)
server.use("/users", usersRouter)

// ******************************* ERROR HANDLERS **************************************
server.use(badRequestErrorHandler)
server.use(notFoundErrorHandler)
server.use(unauthorizedErrorHandler)
server.use(forbiddenErrorHandler)
server.use(genericErrorHandler)

await pgConnect()
await syncModels()

server.listen(port, () => {
  console.table(listEndpoints(server))
  console.log(`Server is running on port ${port}`)
})
