const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const https = require('https');
const cors = require('cors');
const { resolve } = require("path");

app.use(express.json());
app.options('*', cors());

var whitelist = ['https://webbi.co.nz', 'http://localhost:3000']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(cors(corsOptions));

app.post("/generate", async (req, res) => {
  //res.type('html').send(html)
  // console.log('req.body', req.body)
  var data = req.body;
  // console.log('data', data);
  var out = await generateInvoice(data.destinationEmail, data.invoiceItems)
  // console.log('out', out);
  res.status(200).send(out);
});

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

async function generateInvoice(destinationEmail, invoiceItems) {
    // var invoiceItems = res.body;
    // console.log("req.body", JSON.parse(req.body));
    // var destinationEmail = JSON.parse(req.body).destinationEmail;
    // var invoiceItems = JSON.parse(req.body).invoiceItems;
    // var lastUpdated = JSON.parse(req.body).lastUpdated;

    // console.log("destinationEmail", destinationEmail);
    // console.log('invoiceItems', invoiceItems);

    // return;
    const postData = JSON.stringify({
        from: `Webbi Digital Studio,
            https://www.webbi.co.nz
            hello@webbi.co.nz
            Richmond, Nelson, New Zealand, 7020
        `,
        to: "Whomsoever is concerned",
        logo: 'https://www.webbi.co.nz/logo_254.png', //ROOT_URL + APP_ICON,
        // number: 1,
        // date: "Feb 09 2023",
        // date: "March 09 2023",
        // payment_terms: 'NET 30',
        items: invoiceItems,
        tax_title: "GST",
        fields: {
            tax: "%",
            "discounts": "%",//true//false
            "shipping": false,
        },
        tax: 15,
        notes: `Currency is New Zealand Dollars (NZD). This price estimate was created through our pricing page and is an approximation of what your website would cost based on our past clients. For a personalized quote contact us with the specific project you have in mind.`,
        header: 'PRICE ESTIMATE (NZD)',
        to_title: 'Generated For',
        balance_title: 'Total',
        // discounts_title: `New Year's Discount (Limited offer)`,
        // discounts: 15,
    })

    var options = {
        hostname  : "invoice-generator.com",
        port      : 443,
        path      : "/",
        method    : "POST",
        headers   : {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postData)
        },
        body: JSON.stringify(postData),
    };

    var filename = 'webbi' + '/' + new Date().getTime() + '.pdf';
    // var file = fs.createWriteStream(filename);
    var pdf = '';
    var chunks = [];
    var obj;

    var p = new Promise((resolve, reject) => {
      const request = https.request(options, function(res) {
        res.on('data', function(chunk) {
            // console.log('chunk: ', chunk.toJSON().data);//.toString('base64'));
            // pdf += chunk.toJSON().data;//.toString('base64');
            console.log("received chunk");
            chunks.push(chunk);
            // file.write(chunk);
            
        })
        // .on('finish', () => {
        //   console.log('stream finished!!!')
        // })
        .on('end', function() {
            // file.end();
            
            console.log("finished writing file");
            // if (typeof success === 'function') {
            //     success();
            // }

            var base64PDF = Buffer.concat(chunks).toString('base64');

            // console.log("data: ", base64PDF);
            // sendPlainData(destinationEmail, base64PDF, filename, () => {
            //     // fs.unlink(fileName, (err) => {
            //     //     if (err) {
            //     //         throw err;
            //     //     }
                
            //     //     console.log("Delete File successfully.");
            //     // });
            // });
            console.log("send plain data, returning 200");

            // res.status(200).json({
            //   destinationEmail, base64PDF, filename
            // });
            resolve({destinationEmail, base64PDF, filename})
        })
      });
      request.write(postData);
      request.end();
    });

    // if (typeof error === 'function') {
    //     request.on('error', error);
    //     res.status(505).json({});
    // }

    // const response = await fetch('https://invoice-generator.com/', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         "Content-Length": Buffer.byteLength(postData)
    //     },
    //     body: postData
    // });
    // var data = await response.json();

    // res.status(200).json({});
    // var data = await response.json();
    // console.log('json', data)
    // console.log('obj: ', obj);
    var data = await p;
    // console.log('data', data)
    return data;
  }
  