import { getDb } from "../db/firebase.js";
import { Timestamp } from "firebase-admin/firestore";

class Order {
  static async create(orderData) {
    try {
      const ordersRef = getDb().collection("orders");
      const docRef = await ordersRef.add({
        ...orderData,
        createdAt: Timestamp.now(),
        status: orderData.status || "pending"
      });
      return { id: docRef.id, ...orderData };
    } catch (error) {
      console.error("Error creating order:", error.message);
      throw error;
    }
  }

  static async findByUserId(userId) {
    try {
      const ordersRef = getDb().collection("orders");
      const snapshot = await ordersRef.where("userId", "==", userId).get();
      if (snapshot.empty) {
        return [];
      }
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching orders:", error.message);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const doc = await getDb().collection("orders").doc(id).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching order by id:", error.message);
      throw error;
    }
  }

  static async getAll() {
    try {
      const snapshot = await getDb().collection("orders").get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching all orders:", error.message);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const orderRef = getDb().collection("orders").doc(id);
      await orderRef.update({
        ...data,
        updatedAt: Timestamp.now()
      });
      return this.findById(id);
    } catch (error) {
      console.error("Error updating order:", error.message);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await getDb().collection("orders").doc(id).delete();
      return { id };
    } catch (error) {
      console.error("Error deleting order:", error.message);
      throw error;
    }
  }
}

export { Order };
