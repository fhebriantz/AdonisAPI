'use strict'

const UploadController = require('../app/Controllers/Http/UploadController')

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

// api prefix
const api = 'api/v1'

// accepted extesions
const exts = ['json', 'table', 'tablejson', 'jsontable']

Route.group(() => {
  Route.post('/user/register', 'UserController.register')
  Route.post('/user/login', 'UserController.login')
  Route.post('/user/logout', 'UserController.logout')
}).prefix(api).formats(exts)

Route.group(() => {
  Route.get('/user/test-user', 'UploadController.listUser')
}).prefix(api).formats(exts).middleware(['cache'])

Route.on('/').render('welcome')
