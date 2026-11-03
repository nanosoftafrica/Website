const swaggerJsdoc = require('swagger-jsdoc');

// Auto-generates an OpenAPI spec from `@openapi` JSDoc blocks placed above
// route handlers. Only newly-added routes are annotated — this documents
// the CMS Kit Pro-style additions (tags, comments, reactions, menu, pages)
// without retrofitting the whole API.
const spec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Nanosoft Website API',
      version: '1.0.0',
      description: 'Public + admin endpoints for the newer CMS features (tags, comments, reactions, menu, pages). See routes/*.js for source.',
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: ['./server/routes/*.js'],
});

module.exports = spec;
