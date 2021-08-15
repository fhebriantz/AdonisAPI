'use strict'
const debug = require('debug')('controller:user')
const Database = use('Database')
const Env = use('Env')
const User = use('App/Models/User')
const Config = use('Config')
const Hash = use('Hash')
const moment = require('moment')
const { validate } = use('Validator')

class UserController {
  async register({ params, request, response }) {
    debug(params.ctxid, '-> register', request.originalUrl())

    let { username, email, password } = request.all()
    let user = username.toLowerCase()
    email = email.toLowerCase()
    const pass = await Hash.make(password)
    const now = new Date()
    const _now = moment(now).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')

    const rules = {
      username: 'required',
      email: 'required|email|unique:users,email',
      password: 'required'
    }

    const validation = await validate(request.all(), rules)

    if (validation.fails()) {
      response.status(400)
      return validation.messages()
    }

    try {
      await Database.raw(`insert into users(username,email,password,created_at) values ('${user}','${email}','${pass}','${_now}')`)

      return {
        message: 'Register Successfully',
        user: user,
        email: email
      }
    } catch (error) {
      console.log(error);
      if (error.code == '23505') {
        response.status(409)
        return {
          message: `Username '${user}' or Email '${email}' already exist`
        }
      } else {
        response.status(500)
      }
    }
  }

  async login({ auth, request, params, response }) {
    debug(params.ctxid, '-> login', request.originalUrl())

    const { username, email, password } = request.all()
    let userLogin = username || email
    userLogin = userLogin.toLowerCase()
    if (request.format() === 'json') {
      try {
        const checkuser = await Database.raw(`SELECT * FROM "users" where username = '${userLogin}' or email = '${userLogin}'`)
        if (checkuser.rowCount === 0) {
          response.status(400)
          return {
            message: "Email is doesn't exist"
          }
        }
        if (checkuser.rows[0].is_login === true) {
          response.status(400)
          return {
            message: "User already login, please logout from previous browser!"
          }
        }

        const result = await auth
          .authenticator('jwt')
          .attempt(userLogin, password, true)

        const uid = Config.get('auth')[Config.get('auth.authenticator')].uid
        result.user = await User.findBy(uid, userLogin)
        result.linkToken = Env.get('APP_KEY')

        await Database.raw(`UPDATE users SET is_login = true where email = '${userLogin}'`)
        return result
      } catch (e) {
        response.status(400)
        return {
          message: 'Email and password is not match'
        }
      }
    }

    try {
      await auth.attempt(username, password)
    } catch (e) {
      return e
    }
  }

  async logout({ auth, request, response }) {
    let { email } = request.all()
    try {
      await Database.raw(`UPDATE users SET is_login = false where email = '${email}'`)

      return response.redirect('/login')
    } catch (error) {
      response.status(500)
    }

  }
}

module.exports = UserController
