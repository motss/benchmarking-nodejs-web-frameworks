/** Import project dependencies */
import express from 'express';
import fastify from 'fastify';

/** Import other modules */
import genFirebasePushId from './helper/gen-firebase-push-id';

/** Setting up */

/** [START] Main code */
const PORT = 3000;
const PORT2 = 4000;
const isProd = process.env.NODE_ENV === 'production';
const isProdLabel = isProd ? 'Production' : 'Development';
const app = (req, res) => {
  const pushId = genFirebasePushId();
  const apiStarts = process.hrtime();

  const output = {
    status: 200,
    message: 'Hello, World!',
  };
  const getReq = (req.req || req);
  const getRes = (res.res || res);
  const d = {
    id: pushId,
    req: {
      method: getReq.method,
      url: getReq.originalUrl,
      headers: getReq.headers,
      params: getReq.params,
      remotePort: getReq.connection && getReq.connection.remotePort,
    },
    res: {
      statusCode: getRes.statusCode,
      headers: getRes.getHeaders(),
    },
  };

  getRes.on('error', (e) => {
    const apiEnds = process.hrtime(apiStarts);
    const responseTime = ((apiEnds[0] * 1e3) + (apiEnds[1] * 1e-6)).toFixed(3);

    return console.error(JSON.stringify({
      id: d.id,
      req: d.req,
      res: Object.assign({}, d.res, {
        error: e,
        responseTime,
      }),
    }));
  });
  getRes.on('finish', () => {
    const apiEnds = process.hrtime(apiStarts);
    const responseTime = ((apiEnds[0] * 1e3) + (apiEnds[1] * 1e-6)).toFixed(3);

    return console.log(JSON.stringify({
      id: d.id,
      req: d.req,
      res: Object.assign({}, d.res, {
        data: output,
        responseTime,
      }),
    }));
  });

  return res.send(output);
};
const schema = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'number' },
          message: { type: 'string' },
        },
      },
    },
  },
};

const server = express()
  .get('/', app)
  .listen(PORT, (e) => {
    if (e) throw e;
    console.log(`${isProdLabel} Express running at port ${PORT}...`);
  });

const server2 = fastify();
server2.get('/', schema, app);
server2.listen(PORT2, (e) => {
  if (e) throw e;
  console.log(`${isProdLabel} Fastify running at port ${PORT2}...`);
});

server.on('error', e => console.error('Server error', e));
/** [END] Main code */
