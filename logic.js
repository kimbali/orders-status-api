const logic = {
  reduceListByTrakingNum: (data, email) => {
    return data.reduce((acc, current) => {
      const order = acc.find(
        (item) => item.tracking_number === current.tracking_number
      );
      if (!order && current.email === email) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
  },
  basicOrderProps: (orders) =>
    orders.map((prop) => {
      const { tracking_number, orderNo, street, zip_code, city } = prop;
      return {
        tracking_number,
        orderNo,
        street,
        zip_code,
        city,
        articles: null,
      };
    }),
  articlesOrderProps: (orders) =>
    orders.map((order) => {
      const { articleNo, articleImageUrl, quantity, product_name } = order;
      return { articleNo, articleImageUrl, quantity, product_name };
    }),
  byNewstTime: (a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
};

module.exports = { logic };
