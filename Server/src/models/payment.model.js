import { getDb } from "../db/firebase.js";
import { Timestamp } from "firebase-admin/firestore";

class Payment {
  static async create(paymentData) {
    try {
      const paymentsRef = getDb().collection("payments");
      const docRef = await paymentsRef.add({
        ...paymentData,
        createdAt: Timestamp.now()
      });
      return { id: docRef.id, ...paymentData };
    } catch (error) {
      console.error("Error creating payment record:", error.message);
      throw error;
    }
  }

  static async findByOrderId(orderId) {
    try {
      const paymentsRef = getDb().collection("payments");
      const snapshot = await paymentsRef.where("orderId", "==", orderId).get();
      if (snapshot.empty) {
        return null;
      }
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (error) {
      console.error("Error fetching payment by orderId:", error.message);
      throw error;
    }
  }

  static async getAll() {
    try {
      const snapshot = await getDb().collection("payments").get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching all payments:", error.message);
      throw error;
    }
  }
}

export { Payment };
