import express from "express"
import createHttpError from "http-errors"
import { Op } from "sequelize"

import UsersModel from "./model.js"
import ReviewsModel from "../reviews/model.js"

const usersRouter = express.Router()

usersRouter.post("/", async (req, res, next) => {
  try {
    const user = await UsersModel.create(req.body)
    res.status(201).send(user)
  } catch (error) {
    next(error)
  }
})

usersRouter.put("/:userId/reviews", async (req, res, next) => {
  try {
    const user = await UsersModel.findByPk(req.params.userId)

    if (!user) {
      return res.status(404).send({ message: "User not found" })
    }
    const review = await ReviewsModel.create({ ...req.body, userUserId: req.params.userId })
    res.status(201).send({ message: "Review associated with user successfully" })
  } catch (error) {
    console.log(error)
    next(error)
  }
})
// usersRouter.put("/:userId/reviews", async (req, res, next) => {
//   try {
//     const user = await UsersModel.findByPk(req.params.userId)
//     if (user) {
//       const review = await ReviewsModel.create(req.body)

//       if (review) {
//         const join = await UserReviewsModel.create({
//           userId: req.params.userId,
//           reviewId: review.reviewId
//         })
//       }
//     }
//     res.status(201).send(join)
//   } catch (error) {
//     next(error)
//   }
// })

usersRouter.get("/", async (req, res, next) => {
  try {
    const query = {}
    if (req.query.firstName) query.firstName = { [Op.iLike]: `${req.query.firstName}%` }
    const users = await UsersModel.findAll({
      where: { ...query }
    }) // (SELECT) pass an array for the include list
    res.send(users)
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const user = await UsersModel.findByPk(req.params.userId, {
      attributes: { exclude: ["createdAt", "updatedAt"] } // (SELECT) pass an object with exclude property for the omit list
    })
    if (user) {
      res.send(user)
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.put("/:userId", async (req, res, next) => {
  try {
    const [numberOfUpdatedRows, updatedRecords] = await UsersModel.update(req.body, {
      where: { id: req.params.userId },
      returning: true
    })
    if (numberOfUpdatedRows === 1) {
      res.send(updatedRecords[0])
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/:userId", async (req, res, next) => {
  try {
    const numberOfDeletedRows = await UsersModel.destroy({ where: { id: req.params.userId } })
    if (numberOfDeletedRows === 1) {
      res.status(204).send()
    } else {
      next(createHttpError(404, `User with id ${req.params.userId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/:userId/reviews", async (req, res, next) => {
  try {
    const user = await UsersModel.findByPk(req.params.userId, {
      include: {
        model: ReviewsModel
        // attributes: ["title"],
        // where: { title: { [Op.iLike]: "%react%" } },
      }
    })
    res.send(user)
  } catch (error) {
    next(error)
  }
})

export default usersRouter
