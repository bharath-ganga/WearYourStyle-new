import asyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.getAll();
  res.status(200).json({ success: true, data: orders });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const updatedOrder = await Order.update(id, { status });
  res.status(200).json({ success: true, data: updatedOrder });
});

const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Order.delete(id);
  res.status(200).json({ success: true, message: "Order deleted successfully" });
});

const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.getAll();
  res.status(200).json({ success: true, data: products });
});

const createProduct = asyncHandler(async (req, res) => {
  const productData = req.body;
  const newProduct = await Product.create(productData);
  res.status(201).json({ success: true, data: newProduct });
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const productData = req.body;
  const updatedProduct = await Product.update(id, productData);
  res.status(200).json({ success: true, data: updatedProduct });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Product.delete(id);
  res.status(200).json({ success: true, message: "Product deleted successfully" });
});

export {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
