const parse = require("qs").parse
const axios = require("axios")
export default Factor => {
  return new (class {
    constructor() {
      Factor.$filters.add("before-app", () => {
        this.standardHeaders()
      })
    }
    util() {
      return axios
    }

    post(path, data, options = {}) {
      const { headers = {} } = options
      options.headers = { Authorization: this.bearerToken(), ...headers }

      return axios.post(path, data, options)
    }

    request() {
      return axios.request.apply(axios, arguments)
    }

    async process({ request, response, handler }) {
      const { query, body, headers } = request

      const meta = { request, response }
      const data = { ...body, ...parse(query) }

      const { authorization } = headers

      const responseJson = { result: "", error: "" }

      try {
        if (authorization && authorization.startsWith("Bearer ")) {
          const token = authorization.split("Bearer ")[1]

          meta.bearer = await Factor.$postServer.single({ token })
        }

        responseJson.result = await handler({ data, meta })
      } catch (error) {
        responseJson.error = error.message || 500
        Factor.$log.error(error)
      }

      response
        .status(200)
        .jsonp(responseJson)
        .end()

      return
    }

    bearerToken() {
      return Factor.$user.token() ? `Bearer ${Factor.$user.token()}` : ""
    }

    async standardHeaders() {
      if (Factor.$isNode) {
        const port = process.env.PORT || 3000

        //  axios.defaults.baseURL = `https://localhost:${port}`
        axios.defaults.proxy = {
          host: "0.0.0.0",
          port
        }
      } else {
        axios.defaults.headers.common["Authorization"] = this.bearerToken()
      }
    }
  })()
}
