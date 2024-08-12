import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { persist } from 'zustand/middleware';

export const useAppStore = create((set) => ({
  isLogin: true,
  user: null,
  isReload: false,
  link: "home",
  printFontSize: 14,
  setUser: (user) => set({ user }),
  setPrintFontSize: (printFontSize) => set({ printFontSize }),
  setLink: (link) => set({ link }),
  setIsReload: (isReload) => set({ isReload }),
  setIsLogin: (isLogin) => set({ isLogin }),
}));

export const useHomeStore = create((set) => ({
  isModal: false,
  isResultsModal: false,
  isToday: true,
  testType: null,
  querySearch: "",
  id: null,
  uID: nanoid(),
  createdAt: null,
  tests: [],
  discount: null,
  status: "PENDING",
  //patient info
  patientID: null,
  name: "",
  birth: "",
  phone: "",
  email: "",
  gender: null,
  record: null,
  setPatientID: (patientID) => set({ patientID }),
  setIsToday: (isToday) => set({ isToday }),
  setRecord: (record) => set({ record }),
  setUID: (uID) => set({ uID }),
  setName: (name) => set({ name }),
  setBirth: (birth) => set({ birth }),
  setPhone: (phone) => set({ phone }),
  setEmail: (email) => set({ email }),
  setGender: (gender) => set({ gender }),
  setTests: (tests) => set({ tests }),
  setDiscount: (discount) => set({ discount }),
  setCreatedAt: (createdAt) => set({ createdAt }),
  setTestType: (testType) => set({ testType }),
  setId: (id) => set({ id }),
  setIsModal: (isModal) => set({ isModal }),
  setIsResultsModal: (isResultsModal) => set({ isResultsModal }),
  setStatus: (status) => set({ status }),
  setQuerySearch: (querySearch) => set({ querySearch }),
  setReset: () =>
    set({
      id: null,
      patientID: null,
      testType: null,
      createdAt: null,
      tests: [],
      discount: null,
      status: "PENDING",
      name: "",
      birth: "",
      phone: "",
      email: "",
      gender: null,
      record: null,
    }),
}));

export const useTestStore = create((set) => ({
  isModal: false,
  querySearch: "",
  testType: null,
  id: null,
  name: "",
  normal: null,
  price: "",
  createdAt: null,
  isSelecte: false,
  options: ["positive", "negative"],
  setId: (id) => set({ id }),
  setName: (name) => set({ name }),
  setNormal: (normal) => set({ normal }),
  setPrice: (price) => set({ price }),
  setIsModal: (isModal) => set({ isModal }),
  setCreatedAt: (createdAt) => set({ createdAt }),
  setQuerySearch: (querySearch) => set({ querySearch }),
  setIsSelecte: (isSelecte) => set({ isSelecte }),
  setOptions: (options) => set({ options }),
  setReset: () =>
    set({
      id: null,
      name: "",
      normal: null,
      price: "",
      createdAt: null,
      isSelecte: false,
      options: ["positive", "negative"],
    }),
}));

export const usePatientStore = create((set) => ({
  querySearch: "",
  isModal: false,
  name: "",
  birth: "",
  phone: "",
  email: "",
  gender: null,
  createdAt: null,
  isHistory: false,
  id: null,
  uID: nanoid(),
  setIsHistory: (isHistory) => set({ isHistory }),
  setId: (id) => set({ id }),
  setUID: (uID) => set({ uID }),
  setName: (name) => set({ name }),
  setBirth: (birth) => set({ birth }),
  setPhone: (phone) => set({ phone }),
  setEmail: (email) => set({ email }),
  setGender: (gender) => set({ gender }),
  setIsModal: (isModal) => set({ isModal }),
  setCreatedAt: (createdAt) => set({ createdAt }),
  setQuerySearch: (querySearch) => set({ querySearch }),
  setReset: () =>
    set({
      id: null,
      createdAt: null,
      name: "",
      birth: "",
      phone: "",
      email: "",
      gender: null,
      uID: nanoid(),
    }),
}));

export const useGroupStore = create((set) => ({
  isModal: false,
  title: "",
  id: null,
  tests: [],
  customePrice: null,
  createdAt: null,
  querySearch: "",
  setIsModal: (isModal) => set({ isModal }),
  setId: (id) => set({ id }),
  setCreatedAt: (createdAt) => set({ createdAt }),
  setQuerySearch: (querySearch) => set({ querySearch }),
  setTitle: (title) => set({ title }),
  setTests: (tests) => set({ tests }),
  setCustomePrice: (customePrice) => set({ customePrice }),
  setReset: () =>
    set({
      id: null,
      title: "",
      customePrice: null,
      tests: [],
      createdAt: null,
    }),
}));

export const useReportsStore = create((set) => ({
  filterDate: [dayjs(), dayjs()],
  data: null,
  loading: false,
  records: [],
  setRecords: (records) => set({ records }),
  setLoading: (loading) => set({ loading }),
  setFilterDate: (date) => set({ filterDate: date }),
  setData: (data) => set({ data }),
}));


export const useLanguage = create(
  persist(
    (set) => ({
      lang: 'en',
      setLang: (lang) => set({ lang }),
    }),
    {
      name: 'lang',
    }
  )
);