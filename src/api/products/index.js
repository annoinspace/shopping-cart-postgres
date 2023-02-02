import express from "express"
import createHttpError from "http-errors"
import { Op } from "sequelize"
import ProductsModel from "./model.js"
import ProductsCategoriesModel from "./productsCategoriesModel.js"

const productsRouter = express.Router()
productsRouter.post("/", async (req, res, next) => {
  try {
    const { productId } = await ProductsModel.create(req.body)
    res.status(201).send({ productId })
  } catch (error) {
    next(error)
  }
})

productsRouter.get("/", async (req, res, next) => {
  try {
    const query = {}
    if (req.query.product_name) query.product_name = { [Op.iLike]: `${req.query.product_name}%` }

    if (req.query.price) query.price = { [Op.gte]: `${req.query.price}` }
    const products = await ProductsModel.findAll({
      where: { ...query }
      // attributes: ["productId", "product_name", "brand", "price", "imageUrl"]
    }) // (SELECT) pass an array for the include list
    res.send(products)
  } catch (error) {
    next(error)
  }
})

productsRouter.get("/:productId", async (req, res, next) => {
  try {
    const product = await ProductsModel.findByPk(req.params.productId, {
      attributes: { exclude: ["createdAt", "updatedAt"] } // (SELECT) pass an object with exclude property for the omit list
    })
    if (product) {
      res.send(product)
    } else {
      next(createHttpError(404, `Product with id ${req.params.productId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

productsRouter.put("/:productId", async (req, res, next) => {
  try {
    const [numberOfUpdatedRows, updatedRecords] = await ProductsModel.update(req.body, {
      where: { productId: req.params.productId },
      returning: true
    })
    if (numberOfUpdatedRows === 1) {
      res.send(updatedRecords[0])
    } else {
      next(createHttpError(404, `Product with id ${req.params.productId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

productsRouter.put("/:productId/category", async (req, res, next) => {
  try {
    const { productId } = await ProductsCategoriesModel.create({
      productId: req.params.productId,
      categoryId: req.body.categoryId
    })
    res.status(201).send({ productId })
  } catch (error) {
    next(error)
  }
})

productsRouter.delete("/:productId", async (req, res, next) => {
  try {
    const numberOfDeletedRows = await ProductsModel.destroy({ where: { productId: req.params.productId } })
    if (numberOfDeletedRows === 1) {
      res.status(204).send()
    } else {
      next(createHttpError(404, `Product with id ${req.params.productId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

export default productsRouter
