const sql = require("./db.js");
const axios = require("axios");

// constructor
const Product = function (product) {
  this.name = product.name;
  this.price = product.price;
  this.description = product.description;
  this.isDeleted = product.isDeleted;
  this.productViewed = product.productViewed;
};

 Product.findById =   (id,currency,result) => {
  sql.query(`SELECT * FROM product WHERE id = ${id}`, async(err, res) => {
    if (err) {
      result(err, null);
      return;
    }

    if (res.length) {
      if (currency) {
        const source = "USD";
       const currencies = "CAD,USD";
        const rate = await exchangeRate(source,currencies);
        res[0].price = rate ?  res[0].price * rate[currency] : res[0].price ;
      }
      const viewCount = res[0].productViewed + 1;
      sql.query(
        "UPDATE product SET productViewed = ? WHERE id = ?",
        [viewCount, id],
      );
      result(null, res[0]);
      return;
    }

    // not found Product with the id
    result({ kind: "not_found" }, null);
  });
};

Product.findMostViewed = (limit,currency,result) => {
  sql.query(`SELECT * FROM product WHERE productViewed >= 1 ORDER BY productViewed DESC LIMIT ${limit ? limit : 5}`, async (err, res) => {
    if (err) {
      result(null, err);
      return;
    }

    if(currency){
      const source = "USD";
      const currencies = "CAD,USD";
      const rate = await exchangeRate(source,currencies);
      res.map((obj) => {
        obj.price = rate ?  obj.price * rate[currency] : obj.price ;
      })
    }
    result(null, res);
  });
};

// function to fetch exchange rate 
const exchangeRate = async(source,currencies) => {
  const urlConfig = {
      method: 'GET',
      url: `https://api.apilayer.com/currency_data/live?source=${source}&currencies=${currencies}`,
      headers: {"apikey": "uL2DI08jckCx366MKEt4wZunQZrS8VaD" }
  }
  const exchangeRate = await axios(urlConfig);
  return exchangeRate ? exchangeRate.data.quotes : null
}

module.exports = Product;
