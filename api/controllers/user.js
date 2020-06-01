const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const saltRounds = 10

const User = require('../models/user')

exports.user_singup = (req, res, next) => {
    console.log(req.body);
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: 'Mail exisits'
                })
            } else {
                bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        })
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash,
                            organization: req.body.organization,
                            activationPeriod: req.body.activationPeriod || '0s',
                            role: req.body.role || 'user-3',
                            activatedOn: Date.now()
                        })
                        user.save()
                            .then(result => {
                                console.log(result)
                                res.status(201).json({
                                    message: 'User Created sucsessfully'
                                })
                            })
                            .catch(err => {
                                console.log(err)
                                res.status(500).json({
                                    error: err
                                })
                            })
                    }

                })
            }
        })
        .catch()
}

exports.user_login = (req, res, next) => {
    console.log(req.body)
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            console.log(user);
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Auth faild, no registered user under "' + req.body.email + '".'
                })
            } else {
                bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                    if (err) {
                        return res.status(401).json({
                            message: 'Auth faild, try again.'
                        })
                    }
                    if (result) {
                        const token = jwt.sign(
                            {
                                email: user[0].email,
                                userId: user[0]._id
                            },
                            "secret",//process.env.JWT_KEY,
                            {
                                expiresIn: '1h',
                            }

                        )
                        return res.status(200).json({
                            message: 'Auth successfull',
                            token: token,
                            activationPeriod: user[0].activationPeriod,
                            activatedOn: user[0].activatedOn,
                            role: user[0].role,
                            organization: user[0].organization
                        })
                    }
                    res.status(401).json({
                        message: 'Auth faild,  wrong password entered.'
                    })
                })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
}

exports.user_delete_user = (req, res, next) => {
    User.remove({ _id: req.params.userId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'user deleted'
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
}

exports.user_update_user = (req, res, next) => {
    const id = req.params.userId
    const updateOps = {}
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value
    }
    console.log(updateOps)
    Product.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            console.log(result)
            res.status(200).json(result)

        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
}