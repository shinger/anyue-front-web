import axios from "./axios";
import md5 from "js-md5";

const baseURL = {
  web: "/web-api",
  filesystem: "/file-api"
};

const request = {
  userRegister: (data) => {
    return axios.post(`${baseURL.web}/user/register`, {
      username: data.username,
      email: data.email,
      password: md5(data.password),
    })
  },
  userLogin: (data) => {
    return axios.post(`${baseURL.web}/user/login`, {
      email: data.email,
      password: md5(data.password),
    })
  },
  getRecommends: () => {
    return axios.get(`${baseURL.web}/recommend/common`);
  },
  getUserInfo: () => {
    return axios.get(`${baseURL.web}/user/info`);
  },
  uploadAvatar: () => {
    return axios.post(`${baseURL.filesystem}/user/avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  },
  getShelfBooks: () => {
    return axios.get(`${baseURL.web}/bookshelf/list`);
  },
  uploadReadingRecord: (data) => {
    return axios
    .post(`${baseURL.web}/reading/record/upload`, {
      bookId: data.bookId,
      lastReadCfi: data.lastReadCfi,
      readingProgress: data.readingProgress,
      readingDuration: data.readingDuration,
    })
  },
  getBookInfo: (id) => {
    return axios.get(`${baseURL.web}/book/${id}`);
  },
  getReadingRecord: (id) => {
    return axios.get(`${baseURL.web}/reading/record/${id}`);
  },
  getBookEpub: (id) => {
    return axios.get(`${baseURL.web}/bookshelf/${id}`);
  },
  getCategories: (id) => {
    return axios.get(`${baseURL.web}/categories/${id}`);
  },
  getCategoryBooks: (id) => {
    return axios.get(`${baseURL.web}/book/category/${id}`);
  },
  getIsInShelf: (id) => {
    return axios.get(`${baseURL.web}/bookshelf/inshelf/${id}`);
  },
  addToShelf: (id) => {
    return axios.post(`${baseURL.web}/bookshelf/add/${id}`);
  },
  removeFromShelf: (id) => {
    return axios.delete(`${baseURL.web}/bookshelf/remove/${id}`);
  },
  markFinished: (id) => {
    return axios.post(`${baseURL.web}/reading/record/finished/${id}`);
  },
};

export default request
