import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc, deleteDoc, collection, query, where, getDocFromServer } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase';
import { DiamondPackage, OrderState, UserProfile, Order, OperationType, FirestoreErrorInfo, CartItem, Package, Subscription } from '../types';
import { toast } from 'sonner';

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));

  let userFriendlyMessage = "Something went wrong with our database. Please try again.";
  if (errorMessage.includes('permission-denied') || errorMessage.includes('insufficient permissions')) {
    userFriendlyMessage = "Access denied. You don't have permission to perform this action.";
  } else if (errorMessage.includes('quota-exceeded')) {
    userFriendlyMessage = "Service quota exceeded. Please try again later.";
  } else if (errorMessage.includes('network-error')) {
    userFriendlyMessage = "Network error. Please check your connection.";
  }

  toast.error(userFriendlyMessage, {
    description: `Operation: ${operationType} on ${path || 'unknown path'}`,
    duration: 5000,
  });

  throw new Error(JSON.stringify(errInfo));
}

interface AppContextType {
  order: OrderState;
  setOrder: (order: OrderState) => void;
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  saveOrder: (newOrder: Order) => Promise<void>;
  completeOrder: (orderId: string, proofUrl?: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status'], proofUrl?: string) => Promise<void>;
  bulkUpdateOrderStatus: (orderIds: string[], status: Order['status']) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  bulkDeleteOrders: (orderIds: string[]) => Promise<void>;
  updateWalletBalance: (newBalance: number) => Promise<void>;
  cart: CartItem[];
  addToCart: (pkg: DiamondPackage, quantity: number, playerId: string, playerUsername: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartItemQuantity: (cartItemId: string, newQuantity: number) => void;
  clearCart: () => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (val: boolean) => void;
  handleLogout: () => void;
  isAuthReady: boolean;
  handleFirestoreError: (error: unknown, operationType: OperationType, path: string | null) => void;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  uploadProof: (orderId: string, file: File) => Promise<string>;
  finalizePartialPayment: (orderId: string, amount: number) => Promise<void>;
  packages: Package[];
  activeSubscription: Subscription | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [order, setOrder] = useState<OrderState>({
    selectedPackage: null,
    quantity: 1,
    playerId: '',
    playerUsername: '',
    paymentMethod: null,
    walletBalance: 0,
    isPartialPayment: false,
    partialAmount: 0,
    remainingBalance: 0,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);
  const [hasLoadedPackages, setHasLoadedPackages] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);
  const userUnsubscribeRef = useRef<(() => void) | null>(null);
  const ordersUnsubscribeRef = useRef<(() => void) | null>(null);
  const subUnsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    };
    testConnection();

    // Fetch Packages
    const packagesQuery = collection(db, 'packages');
    const unsubscribePackages = onSnapshot(packagesQuery, (snapshot) => {
      const pkgs = snapshot.docs.map(doc => doc.data() as Package);
      setPackages(pkgs);
      setHasLoadedPackages(true);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'packages'));

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // Clean up previous listeners
      if (userUnsubscribeRef.current) userUnsubscribeRef.current();
      if (ordersUnsubscribeRef.current) ordersUnsubscribeRef.current();
      if (subUnsubscribeRef.current) subUnsubscribeRef.current();
      userUnsubscribeRef.current = null;
      ordersUnsubscribeRef.current = null;
      subUnsubscribeRef.current = null;

      if (firebaseUser) {
        setIsAuthenticated(true);
        // User profile listener
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        userUnsubscribeRef.current = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data() as UserProfile & { walletBalance: number, role: string };
            const adminEmails = ['senujayesansa123@gmail.com', 'yesansasenuja@gmail.com'];
            
            // Auto-upgrade to admin if email matches
            if (adminEmails.includes(userData.email) && userData.role !== 'admin') {
              updateDoc(userDocRef, { role: 'admin' }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`));
            }
            
            setUser(userData);
            setOrder(prev => ({ ...prev, walletBalance: userData.walletBalance }));
          } else {
            // Create user profile if it doesn't exist
            const adminEmails = ['senujayesansa123@gmail.com', 'yesansasenuja@gmail.com'];
            const newUser: UserProfile & { walletBalance: number, role: string, uid: string, createdAt: string } = {
              uid: firebaseUser.uid,
              id: firebaseUser.uid,
              username: firebaseUser.displayName || 'Gamer',
              email: firebaseUser.email || '',
              avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
              walletBalance: 120, // Initial balance
              role: adminEmails.includes(firebaseUser.email || '') ? 'admin' : 'user',
              createdAt: new Date().toISOString()
            };
            setDoc(userDocRef, newUser).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}`));
          }
          setIsAuthReady(true);
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
          setIsAuthReady(true);
        });

        // Orders listener
        const ordersQuery = query(collection(db, 'orders'), where('uid', '==', firebaseUser.uid));
        ordersUnsubscribeRef.current = onSnapshot(ordersQuery, (snapshot) => {
          const ordersList = snapshot.docs.map(doc => doc.data() as Order);
          setOrders(ordersList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'orders'));

        // Subscription listener
        const subQuery = query(
          collection(db, 'subscriptions'), 
          where('uid', '==', firebaseUser.uid),
          where('status', '==', 'active')
        );
        subUnsubscribeRef.current = onSnapshot(subQuery, (snapshot) => {
          if (!snapshot.empty) {
            setActiveSubscription(snapshot.docs[0].data() as Subscription);
          } else {
            setActiveSubscription(null);
          }
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'subscriptions'));
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setOrders([]);
        setActiveSubscription(null);
        setOrder(prev => ({ ...prev, walletBalance: 0 }));
        setIsAuthReady(true);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribePackages();
      if (userUnsubscribeRef.current) userUnsubscribeRef.current();
      if (ordersUnsubscribeRef.current) ordersUnsubscribeRef.current();
      if (subUnsubscribeRef.current) subUnsubscribeRef.current();
    };
  }, []);

  useEffect(() => {
    if (isAuthReady && user?.role === 'admin' && hasLoadedPackages && packages.length === 0) {
      const defaultPackages: Package[] = [
        { id: 'pkg-basic', name: 'Basic Membership', price: 1000, days: 30 },
        { id: 'pkg-pro', name: 'Pro Membership', price: 2500, days: 90 },
        { id: 'pkg-elite', name: 'Elite Membership', price: 5000, days: 365 }
      ];
      defaultPackages.forEach(pkg => {
        setDoc(doc(db, 'packages', pkg.id), pkg).catch(err => console.error('Seed error:', err));
      });
    }
  }, [isAuthReady, user?.role, hasLoadedPackages, packages.length]);

  const saveOrder = async (newOrder: Order) => {
    if (!auth.currentUser) return;
    const orderWithUid = { 
      ...newOrder, 
      uid: auth.currentUser.uid,
      customerEmail: auth.currentUser.email || 'Anonymous'
    };
    try {
      await setDoc(doc(db, 'orders', newOrder.id), orderWithUid);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `orders/${newOrder.id}`);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status'], proofUrl?: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        ...(proofUrl && { proofUrl })
      });
      toast.success(`Order status updated to ${status}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      toast.success('Order deleted successfully');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `orders/${orderId}`);
    }
  };

  const bulkUpdateOrderStatus = async (orderIds: string[], status: Order['status']) => {
    const { writeBatch } = await import('firebase/firestore');
    const batch = writeBatch(db);
    orderIds.forEach(id => {
      batch.update(doc(db, 'orders', id), { status });
    });
    try {
      await batch.commit();
      toast.success(`Updated ${orderIds.length} orders to ${status}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'orders/bulk');
    }
  };

  const bulkDeleteOrders = async (orderIds: string[]) => {
    const { writeBatch } = await import('firebase/firestore');
    const batch = writeBatch(db);
    orderIds.forEach(id => {
      batch.delete(doc(db, 'orders', id));
    });
    try {
      await batch.commit();
      toast.success(`Deleted ${orderIds.length} orders`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'orders/bulk');
    }
  };

  const completeOrder = async (orderId: string, proofUrl?: string) => {
    const orderDoc = orders.find(o => o.id === orderId);
    const finalProofUrl = proofUrl || orderDoc?.proofUrl || 'https://picsum.photos/seed/proof/800/600';
    await updateOrderStatus(orderId, 'completed', finalProofUrl);
  };

  const updateWalletBalance = async (newBalance: number) => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        walletBalance: newBalance
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
    }
  };

  const addToCart = (pkg: DiamondPackage, quantity: number, playerId: string, playerUsername: string) => {
    const newItem: CartItem = {
      id: Math.random().toString(36).substring(2, 11),
      package: pkg,
      quantity,
      playerId,
      playerUsername
    };
    setCart(prev => [...prev, newItem]);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const updateCartItemQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart(prev => prev.map(item => 
      item.id === cartItemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
    }
  };

  const uploadProof = async (orderId: string, file: File): Promise<string> => {
    const storageRef = ref(storage, `proofs/${orderId}_${file.name}`);
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      await updateOrderStatus(orderId, 'processing', downloadURL);
      return downloadURL;
    } catch (err) {
      toast.error('Failed to upload proof image');
      throw err;
    }
  };

  const finalizePartialPayment = async (orderId: string, amount: number) => {
    try {
      const orderDoc = orders.find(o => o.id === orderId);
      if (!orderDoc) return;

      await updateDoc(doc(db, 'orders', orderId), {
        amountPaid: orderDoc.amountPaid + amount,
        remainingBalance: Math.max(0, orderDoc.remainingBalance - amount),
        isPartial: orderDoc.remainingBalance - amount > 0,
        status: orderDoc.remainingBalance - amount <= 0 ? 'processing' : 'pending'
      });
      toast.success('Balance payment successful!');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <AppContext.Provider value={{
      order, setOrder,
      orders, setOrders,
      saveOrder, completeOrder, updateOrderStatus, bulkUpdateOrderStatus, deleteOrder, bulkDeleteOrders,
      updateWalletBalance,
      cart,
      addToCart,
      removeFromCart,
      updateCartItemQuantity,
      clearCart,
      isAuthenticated, setIsAuthenticated,
      user, setUser,
      isMenuOpen, setIsMenuOpen,
      handleLogout,
      isAuthReady,
      handleFirestoreError,
      updateUserProfile,
      uploadProof,
      finalizePartialPayment,
      packages,
      activeSubscription
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
