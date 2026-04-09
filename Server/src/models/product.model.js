import { getDb } from "../db/firebase.js";

const productsCollection = () => getDb().collection("products");

const findById = async (id) => {
  const doc = await productsCollection().doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

const getAllProducts = async () => {
  const snapshot = await productsCollection().get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const createProduct = async (productData) => {
  const now = new Date().toISOString();
  const newProduct = {
    ...productData,
    createdAt: now,
    updatedAt: now,
  };
  const docRef = await productsCollection().add(newProduct);
  return { id: docRef.id, ...newProduct };
};

const updateProduct = async (id, fields) => {
  const updateData = { ...fields, updatedAt: new Date().toISOString() };
  await productsCollection().doc(id).update(updateData);
  return findById(id);
};

const deleteProduct = async (id) => {
  await productsCollection().doc(id).delete();
  return { id };
};

export const Product = {
  findById,
  getAll: getAllProducts,
  create: createProduct,
  update: updateProduct,
  delete: deleteProduct,
};
