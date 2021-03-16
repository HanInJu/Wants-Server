const { pool } = require("../../../config/database");

// 책추가
async function postbook(
  writer,
  publishDate,
  publishNumber,
  contents,
  imageURL,
  title,
  publisher
) {
  const connection = await pool.getConnection(async (conn) => conn);
  const postchallengeQuery = `
  insert into Book(writer, publishDate, publishNumber, contents, imageURL, title, publisher)
  value ('${writer}', '${publishDate}', '${publishNumber}', '${contents}', '${imageURL}', '${title}', '${publisher}')`;

  const [rows] = await connection.query(postchallengeQuery);
  connection.release();
  return rows;
}

module.exports = {
  postbook,
};
