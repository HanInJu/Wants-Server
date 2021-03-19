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
async function getbook(bookId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const postchallengeQuery = `
  select title, writer, publisher, imageURL, DATE_FORMAT(publishDate, '%Y-%m-%d') as publishDate, contents,
  count(Review.reviewId) as reviewSum, User.userId as userId, User.name as name, profilePictureURL,
  DATE_FORMAT(postAt, '%Y-%m-%d') as postAt,
  text, star, reviewId
from Book
inner join Review on Review.bookId = Book.bookId
inner join User on User.userId = Review.userId
where Book.bookId = '${bookId}'
order by Book.publishNumber DESC
limit 1`;

  const [rows] = await connection.query(postchallengeQuery);
  connection.release();
  return rows;
}
module.exports = {
  postbook,
  getbook,
};
