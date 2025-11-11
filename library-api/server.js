const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();


server.use(middlewares);


server.get('/echo', (req, res) => {
  res.jsonp(req.query);
});


server.use((req, res, next) => {
  setTimeout(next, 100);
});

router.render = (req, res) => {
  const data = res.locals.data;
  const originalUrl = req.originalUrl;
  

  if (req.method === 'GET' && Array.isArray(data)) {
    const page = parseInt(req.query._page) || 1;
    const limit = parseInt(req.query._limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const response = {
      data: data,
      pagination: {
        page: page,
        limit: limit,
        total: data.length,
        totalPages: Math.ceil(data.length / limit)
      },
      info: {
        version: "1.0",
        description: "Library API with authors, books and libraries"
      }
    };
    
    res.jsonp(response);
  } else {
    res.jsonp({
      data: data,
      info: {
        version: "1.0",
        description: "Library API with authors, books and libraries"
      }
    });
  }
}

server.use(router);

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`
🚀 JSON Server is running!
📍 Local: http://localhost:${PORT}
📚 Available endpoints:
   📖 GET    /books
   👤 GET    /authors  
   🏛️ GET    /libraries
   👥 GET    /users
   🔍 Filter: /books?genre=Роман
   🔗 Expand: /books?_expand=author
   📄 Paginate: /books?_page=1&_limit=5
  `);
});