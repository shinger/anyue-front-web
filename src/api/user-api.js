import axios from "../utils/axios";
import md5 from "js-md5";

const baseURL = "/user-api";

// 用户注册
const userRegister = (data) => {
  return axios.post(`${baseURL}/user/register`, {
    username: data.username,
    email: data.email,
    password: md5(data.password),
  });
};

// 用户登录
const userLogin = (data) => {
  return axios.post(`${baseURL}/user/login`, {
    email: data.email,
    password: md5(data.password),
  });
};

// 获取推荐书单
const getRecommends = () => {
  return axios.get(`${baseURL}/book/recommend/common`);
};

// 获取用户信息
const getUserInfo = () => {
  return axios.get(`${baseURL}/user/info`);
};

// 上传用户头像
const uploadAvatar = (formData) => {
  return axios.post(`${baseURL}/user/avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 上传用户划线
const uploadUserAnnotation = (data) => {
  return axios.post(`${baseURL}/user/annotation/upload`, {
    userId: data.userId,
    bookId: data.bookId,
    epubCfiRange: data.cfiRange,
    type: data.type,
    lineColor: data.lineColor,
    lineContent: data.lineContent,
    ideaContent: data.ideaContent,
    tocParentIndex: data.tocParentIndex,
    tocChildIndex: data.tocChildIndex,
  });
};

// 获取用户划线
const getUserAnnotations = (bookId) => {
  return axios.get(`${baseURL}/user/annotation/${bookId}`);
}

export {
  userRegister,
  userLogin,
  getRecommends,
  getUserInfo,
  uploadAvatar,
  uploadUserAnnotation,
  getUserAnnotations,
};
