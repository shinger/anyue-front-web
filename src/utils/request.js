import axios from "./axios";
import md5 from "js-md5";

const baseURL = {
  user: "/user-api",
  filesystem: "/file-api"
};

const request = {
  userRegister: (data) => {
    return axios.post(`${baseURL.user}/user/register`, {
      username: data.username,
      email: data.email,
      password: md5(data.password),
    })
  },
  userLogin: (data) => {
    return axios.post(`${baseURL.user}/user/login`, {
      email: data.email,
      password: md5(data.password),
    })
  },
  getRecommends: () => {
    return axios.get(`${baseURL.user}/recommend/common`);
  },
  getUserInfo: () => {
    return axios.get(`${baseURL.user}/user/info`);
  },
  uploadAvatar: (formData) => {
    return axios.post(`${baseURL.user}/user/avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  },
  getShelfBooks: () => {
    return axios.get(`${baseURL.user}/bookshelf/list`);
  },
  uploadReadingRecord: (data) => {
    return axios
    .post(`${baseURL.user}/reading/record/upload`, {
      bookId: data.bookId,
      lastReadCfi: data.lastReadCfi,
      readingProgress: data.readingProgress,
      readingDuration: data.readingDuration,
    })
  },
  getBookInfo: (id) => {
    return axios.get(`${baseURL.user}/book/${id}`);
  },
  getReadingRecord: (id) => {
    return axios.get(`${baseURL.user}/reading/record/${id}`);
  },
  getBookEpub: (id) => {
    return axios.get(`${baseURL.user}/bookshelf/${id}`);
  },
  getCategories: (id) => {
    return axios.get(`${baseURL.user}/categories/${id}`);
  },
  getCategoryBooks: (id) => {
    return axios.get(`${baseURL.user}/book/category/${id}`);
  },
  getIsInShelf: (id) => {
    return axios.get(`${baseURL.user}/bookshelf/inshelf/${id}`);
  },
  addToShelf: (id) => {
    return axios.post(`${baseURL.user}/bookshelf/add/${id}`);
  },
  removeFromShelf: (id) => {
    return axios.delete(`${baseURL.user}/bookshelf/remove/${id}`);
  },
  markFinished: (id) => {
    return axios.post(`${baseURL.user}/reading/record/finished/${id}`);
  },
};

export default request
