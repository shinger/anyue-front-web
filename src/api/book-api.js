import axios from "../utils/axios";

const baseURL = "/book-api";

const getShelfBooks = (pageNum) => {
  return axios.get(`${baseURL}/bookshelf/list?t=${Date.now()}`, {
    params: { pageNum: pageNum },
  }); // 防缓存
};

const uploadReadingRecord = (data) => {
  return axios.post(`${baseURL}/reading/record/upload`, {
    bookId: data.bookId,
    lastReadCfi: data.lastReadCfi,
    readingProgress: data.readingProgress,
    readingDuration: data.readingDuration,
  });
};
const getBookInfo = (id) => {
  return axios.get(`${baseURL}/book/${id}`);
};
const getReadingRecord = (id) => {
  return axios.get(`${baseURL}/reading/record/${id}`);
};
const getBookEpub = (id) => {
  return axios.get(`${baseURL}/book/epub/${id}`);
};
const getCategories = (id) => {
  return axios.get(`${baseURL}/categories/${id}`);
};
const getCategoryBooks = (id) => {
  return axios.get(`${baseURL}/book/category/${id}`);
};
const getIsInShelf = (id) => {
  return axios.get(`${baseURL}/bookshelf/inshelf/${id}`);
};
const addToShelf = (id) => {
  return axios.post(`${baseURL}/bookshelf/join/${id}`);
};
const removeFromShelf = (id) => {
  return axios.delete(`${baseURL}/bookshelf/remove/${id}`);
};
const markFinished = (id) => {
  return axios.post(`${baseURL}/reading/record/finished/${id}`);
};
const getFonts = () => {
  return axios.get(`${baseURL}/font`);
};
const searchBooks = (keyword) => {
  return axios.get(`${baseURL}/book/search`, {
    params: {
      keyword: keyword,
      t: Date.now(), // 防缓存
    }
  });
};
const postComment = (data) => {
  return axios.post(`${baseURL}/book_comment/post`, {
    bookId: data.bookId,
    score: data.score,
    comment: data.comment,
    public: data.public,
  });
};

export {
  getShelfBooks,
  uploadReadingRecord,
  getBookInfo,
  getReadingRecord,
  getBookEpub,
  getCategories,
  getCategoryBooks,
  getIsInShelf,
  addToShelf,
  removeFromShelf,
  markFinished,
  getFonts,
  searchBooks,
  postComment,
};
