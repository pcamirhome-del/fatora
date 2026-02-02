import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push, onValue, remove, update } from "firebase/database";
import { Invoice } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyAYdWvZbTTkGlfI6vv02EFUMbw5eeF4UpU",
  authDomain: "sample-firebase-adddi-app.firebaseapp.com",
  databaseURL: "https://sample-firebase-adddi-app-default-rtdb.firebaseio.com",
  projectId: "sample-firebase-adddi-app",
  storageBucket: "sample-firebase-adddi-app.firebasestorage.app",
  messagingSenderId: "1013529485030",
  appId: "1:1013529485030:web:3dd9b79cd7d7ba41b42527"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export const saveInvoiceToCloud = async (invoice: Invoice) => {
  const invoiceRef = ref(db, 'invoices/' + invoice.id);
  return set(invoiceRef, invoice);
};

export const deleteInvoiceFromCloud = async (id: string) => {
  const invoiceRef = ref(db, 'invoices/' + id);
  return remove(invoiceRef);
};

export const subscribeToInvoices = (callback: (invoices: Invoice[]) => void) => {
  const invoicesRef = ref(db, 'invoices');
  onValue(invoicesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const list = Object.keys(data).map(key => data[key]);
      // Sort by date or id to keep consistent order
      callback(list.reverse());
    } else {
      callback([]);
    }
  });
};
