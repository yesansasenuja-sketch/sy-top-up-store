import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, Clock, AlertCircle, ExternalLink, Zap, User, Package, CreditCard, Image as ImageIcon, Calendar, RefreshCcw, CheckSquare, Square, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAppContext } from '../context/AppContext';
import { Order, OperationType } from '../types';

import { toast } from 'sonner';

const Admin = () => {
  const { completeOrder, updateOrderStatus, bulkUpdateOrderStatus, deleteOrder, bulkDeleteOrders, user, handleFirestoreError, isAuthReady, uploadProof } = useAppContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterPayment, setFilterPayment] = useState('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, orderId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(orderId);
    try {
      await uploadProof(orderId, file);
      toast.success('Proof uploaded and order moved to processing');
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(null);
    }
  };

  useEffect(() => {
    if (!isAuthReady) return;
    
    if (user?.role !== 'admin') {
      setIsLoading(false);
      return;
    }

    const ordersQuery = query(collection(db, 'orders'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const ordersList = snapshot.docs.map(doc => doc.data() as Order);
      setOrders(ordersList);
      setIsLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'orders');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthReady, user?.role]);

  if (!isAuthReady || isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 border-4 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-[0.3em] animate-pulse">Synchronizing Data...</p>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-display font-black text-slate-900">Access Denied</h1>
        <p className="text-slate-400 uppercase tracking-widest text-xs font-bold">You do not have administrative privileges.</p>
      </div>
    );
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.playerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.playerUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    const orderDateStr = order.date.split('T')[0];
    const matchesStartDate = !startDate || orderDateStr >= startDate;
    const matchesEndDate = !endDate || orderDateStr <= endDate;
    
    const matchesPayment = filterPayment === 'all' || order.paymentMethod.name === filterPayment;

    return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate && matchesPayment;
  });

  const paymentMethods = Array.from(new Set(orders.map(o => o.paymentMethod.name)));

  const stats = {
    total: filteredOrders.length,
    pending: filteredOrders.filter(o => o.status === 'pending').length,
    processing: filteredOrders.filter(o => o.status === 'processing').length,
    completed: filteredOrders.filter(o => o.status === 'completed').length,
    failed: filteredOrders.filter(o => o.status === 'failed').length,
    revenue: filteredOrders.reduce((acc, o) => acc + o.totalPrice, 0)
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrders(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkComplete = async () => {
    if (selectedOrders.length === 0) return;
    if (window.confirm(`Mark ${selectedOrders.length} orders as completed?`)) {
      await bulkUpdateOrderStatus(selectedOrders, 'completed');
      setSelectedOrders([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) return;
    if (window.confirm(`Delete ${selectedOrders.length} orders?`)) {
      await bulkDeleteOrders(selectedOrders);
      setSelectedOrders([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-display font-black uppercase tracking-tight mb-2 text-slate-900">Command Center</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.4em] font-black">Admin Operations & Logistics</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Total Orders', value: stats.total, color: 'text-slate-900' },
            { label: 'Processing', value: stats.processing, color: 'text-neon-cyan' },
            { label: 'Pending', value: stats.pending, color: 'text-yellow-500' },
            { label: 'Completed', value: stats.completed, color: 'text-green-500' },
            { label: 'Revenue', value: `$${stats.revenue.toFixed(2)}`, color: 'text-green-600' },
          ].map((stat, idx) => (
            <div key={idx} className="card-pro py-4 px-6 min-w-[140px]">
              <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-1">{stat.label}</p>
              <p className={`text-xl font-black tracking-tight ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card-pro">
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-neon-cyan transition-colors" />
            <input 
              type="text" 
              placeholder="Search by Order ID, Player ID, or Username..."
              value={searchTerm || ''}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 font-bold text-sm focus:outline-none focus:border-neon-cyan/50 focus:bg-white transition-all text-slate-900 placeholder:text-slate-300"
            />
          </div>
          
          <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-2xl overflow-x-auto">
            {(['all', 'pending', 'processing', 'completed', 'failed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilterStatus(status);
                  setSelectedOrders([]); // Clear selection when status filter changes
                }}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filterStatus === status 
                    ? 'bg-neon-cyan text-white shadow-[0_0_15px_rgba(0,242,255,0.3)]' 
                    : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-2 px-4">
            <div className="flex flex-col flex-1">
              <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-1">From</span>
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-neon-cyan" />
                <input 
                  type="date" 
                  value={startDate || ''}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setSelectedOrders([]);
                  }}
                  className="bg-transparent text-[10px] font-bold focus:outline-none text-slate-600 w-full"
                />
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="flex flex-col flex-1">
              <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-1">To</span>
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-neon-cyan" />
                <input 
                  type="date" 
                  value={endDate || ''}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setSelectedOrders([]);
                  }}
                  className="bg-transparent text-[10px] font-bold focus:outline-none text-slate-600 w-full"
                />
              </div>
            </div>
          </div>

          <div className="relative group">
            <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-neon-cyan transition-colors" />
            <select
              value={filterPayment || 'all'}
              onChange={(e) => {
                setFilterPayment(e.target.value);
                setSelectedOrders([]);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 font-bold text-sm focus:outline-none focus:border-neon-cyan/50 focus:bg-white transition-all appearance-none text-slate-600"
            >
              <option value="all">All Payment Methods</option>
              {paymentMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setStartDate('');
              setEndDate('');
              setFilterPayment('all');
              setSelectedOrders([]);
            }}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-slate-400 hover:text-slate-900 group"
          >
            <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            Clear All Filters
          </button>
        </div>

        <AnimatePresence>
          {selectedOrders.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-between p-4 mb-6 bg-slate-900 rounded-2xl shadow-2xl"
            >
              <div className="flex items-center gap-4 ml-4">
                <div className="w-8 h-8 rounded-lg bg-neon-cyan/20 flex items-center justify-center">
                  <CheckSquare className="w-4 h-4 text-neon-cyan" />
                </div>
                <p className="text-xs font-black text-white uppercase tracking-widest">
                  {selectedOrders.length} Orders Selected
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleBulkComplete}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all"
                >
                  <CheckCircle className="w-4 h-4" /> Mark Completed
                </button>
                <button 
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all"
                >
                  <Trash2 className="w-4 h-4" /> Delete Selected
                </button>
                <button 
                  onClick={() => setSelectedOrders([])}
                  className="px-4 py-2.5 rounded-xl bg-white/10 text-white/60 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-4">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                <th className="px-6 py-2 text-left w-10">
                  <button 
                    onClick={toggleSelectAll}
                    className="w-6 h-6 rounded-lg border-2 border-slate-200 flex items-center justify-center hover:border-neon-cyan transition-colors"
                  >
                    {selectedOrders.length === filteredOrders.length && filteredOrders.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-neon-cyan" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-200" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-2 text-left">Order Details</th>
                <th className="px-6 py-2 text-left">Player Info</th>
                <th className="px-6 py-2 text-left">Payment</th>
                <th className="px-6 py-2 text-left">Status</th>
                <th className="px-6 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Filter className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No matching orders found</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <motion.tr 
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`group ${selectedOrders.includes(order.id) ? 'selected' : ''}`}
                  >
                    <td className={`px-6 py-5 border-y border-l border-slate-200 rounded-l-3xl transition-all ${
                      selectedOrders.includes(order.id) ? 'bg-neon-cyan/5 border-neon-cyan/30' : 'bg-slate-50/50 group-hover:bg-slate-50'
                    }`}>
                      <button 
                        onClick={() => toggleSelectOrder(order.id)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          selectedOrders.includes(order.id) 
                            ? 'bg-neon-cyan border-neon-cyan text-white' 
                            : 'border-slate-200 hover:border-neon-cyan'
                        }`}
                      >
                        {selectedOrders.includes(order.id) && <CheckSquare className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className={`px-6 py-5 border-y border-slate-200 transition-all ${
                      selectedOrders.includes(order.id) ? 'bg-neon-cyan/5 border-neon-cyan/30' : 'bg-slate-50/50 group-hover:bg-slate-50'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 flex items-center justify-center">
                          <Package className="w-5 h-5 text-neon-cyan" />
                        </div>
                        <div>
                          <p className="font-black text-sm tracking-tight text-slate-900">{order.package.amount} Diamonds</p>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{order.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-5 border-y border-slate-200 transition-all ${
                      selectedOrders.includes(order.id) ? 'bg-neon-cyan/5 border-neon-cyan/30' : 'bg-slate-50/50 group-hover:bg-slate-50'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-black text-sm tracking-tight text-slate-900">{order.playerUsername}</p>
                          <p className="text-[9px] text-neon-cyan/60 font-black uppercase tracking-widest">UID: {order.playerId}</p>
                          {order.customerEmail && (
                            <p className="text-[8px] text-slate-400 font-bold mt-1">{order.customerEmail}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-5 border-y border-slate-200 transition-all ${
                      selectedOrders.includes(order.id) ? 'bg-neon-cyan/5 border-neon-cyan/30' : 'bg-slate-50/50 group-hover:bg-slate-50'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-black text-sm tracking-tight text-slate-900">${order.totalPrice.toFixed(2)}</p>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                            {order.isPartial ? `Deposit: $${order.amountPaid.toFixed(2)}` : 'Full Payment'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-5 border-y border-slate-200 transition-all ${
                      selectedOrders.includes(order.id) ? 'bg-neon-cyan/5 border-neon-cyan/30' : 'bg-slate-50/50 group-hover:bg-slate-50'
                    }`}>
                      <div className="flex items-center gap-2">
                        <AnimatePresence mode="wait">
                          <motion.div 
                            key={order.status}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: [0.8, 1.1, 1] }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3, times: [0, 0.6, 1] }}
                            className="flex items-center gap-2"
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              order.status === 'completed' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
                              order.status === 'pending' ? 'bg-yellow-500' : 
                              order.status === 'failed' ? 'bg-red-500' : 'bg-neon-cyan'
                            }`} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                              order.status === 'completed' ? 'text-green-500' : 
                              order.status === 'pending' ? 'text-yellow-500' : 
                              order.status === 'failed' ? 'text-red-500' : 'text-neon-cyan'
                            }`}>
                              {order.status}
                            </span>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </td>
                    <td className={`px-6 py-5 border-y border-r border-slate-200 rounded-r-3xl transition-all text-right ${
                      selectedOrders.includes(order.id) ? 'bg-neon-cyan/5 border-neon-cyan/30' : 'bg-slate-50/50 group-hover:bg-slate-50'
                    }`}>
                      <div className="flex items-center justify-end gap-2">
                        {order.status === 'pending' && (
                          <div className="relative">
                            <input 
                              type="file" 
                              id={`upload-${order.id}`}
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, order.id)}
                              disabled={isUploading === order.id}
                            />
                            <label 
                              htmlFor={`upload-${order.id}`}
                              className={`p-2.5 rounded-xl bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan hover:text-white transition-all shadow-lg shadow-neon-cyan/10 cursor-pointer flex items-center justify-center ${isUploading === order.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title="Upload Proof"
                            >
                              {isUploading === order.id ? (
                                <RefreshCcw className="w-5 h-5 animate-spin" />
                              ) : (
                                <ImageIcon className="w-5 h-5" />
                              )}
                            </label>
                          </div>
                        )}
                        {order.status !== 'completed' && (
                          <button 
                            onClick={() => completeOrder(order.id)}
                            className="p-2.5 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all shadow-lg shadow-green-500/10"
                            title="Mark as Delivered"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this order?')) {
                              deleteOrder(order.id);
                            }
                          }}
                          className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
                          title="Delete Order"
                        >
                          <Zap className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setSelectedOrderId(order.id)}
                          className="p-2.5 rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition-all"
                          title="View Details"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrderId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/90 backdrop-blur-md"
            onClick={() => setSelectedOrderId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-2xl w-full bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
              onClick={e => e.stopPropagation()}
            >
              {orders.find(o => o.id === selectedOrderId) && (
                <>
                  <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-display font-black uppercase tracking-widest text-slate-900">Order Logistics</h3>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">ID: {selectedOrderId}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedOrderId(null)}
                      className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-all"
                    >
                      <Zap className="w-5 h-5 text-slate-400 rotate-45" />
                    </button>
                  </div>
                  
                  <div className="p-8 space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Player ID (UID)</p>
                        <p className="text-xl font-black text-neon-cyan tracking-tight">{orders.find(o => o.id === selectedOrderId)?.playerId}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Player Username</p>
                        <p className="text-xl font-black text-slate-900 tracking-tight">{orders.find(o => o.id === selectedOrderId)?.playerUsername}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Customer Email</p>
                        <p className="text-xl font-black text-slate-900 tracking-tight">{orders.find(o => o.id === selectedOrderId)?.customerEmail || 'Anonymous'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Customer UID</p>
                        <p className="text-xl font-black text-slate-900 tracking-tight">{orders.find(o => o.id === selectedOrderId)?.uid || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Package</p>
                        <p className="text-xl font-black text-slate-900 tracking-tight">{orders.find(o => o.id === selectedOrderId)?.package.amount} Diamonds</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Status</p>
                        <AnimatePresence mode="wait">
                          <motion.p 
                            key={orders.find(o => o.id === selectedOrderId)?.status}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className={`text-xl font-black tracking-tight uppercase ${
                              orders.find(o => o.id === selectedOrderId)?.status === 'completed' ? 'text-green-500' : 
                              orders.find(o => o.id === selectedOrderId)?.status === 'pending' ? 'text-yellow-500' :
                              orders.find(o => o.id === selectedOrderId)?.status === 'failed' ? 'text-red-500' : 'text-neon-cyan'
                            }`}
                          >
                            {orders.find(o => o.id === selectedOrderId)?.status}
                          </motion.p>
                        </AnimatePresence>
                      </div>
                    </div>

                    {orders.find(o => o.id === selectedOrderId)?.proofUrl && (
                      <div className="space-y-4">
                        <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Delivery Proof</p>
                        <div className="aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative group">
                          <img src={orders.find(o => o.id === selectedOrderId)?.proofUrl} alt="Proof" className="w-full h-full object-contain" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-200/50 backdrop-blur-[2px]">
                            <a 
                              href={orders.find(o => o.id === selectedOrderId)?.proofUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-6 py-3 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all"
                            >
                              <ExternalLink className="w-4 h-4" /> Open Full Image
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4">
                      {orders.find(o => o.id === selectedOrderId)?.status !== 'completed' && (
                        <button 
                          onClick={() => {
                            completeOrder(selectedOrderId);
                            setSelectedOrderId(null);
                          }}
                          className="flex-1 min-w-[140px] py-4 rounded-2xl bg-green-500 text-white font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-green-500/20 flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" /> Mark Delivered
                        </button>
                      )}
                      
                      {orders.find(o => o.id === selectedOrderId)?.status !== 'processing' && (
                        <button 
                          onClick={() => {
                            updateOrderStatus(selectedOrderId, 'processing');
                            setSelectedOrderId(null);
                          }}
                          className="flex-1 min-w-[140px] py-4 rounded-2xl bg-neon-cyan text-white font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-neon-cyan/20 flex items-center justify-center gap-2"
                        >
                          <Clock className="w-4 h-4" /> Set Processing
                        </button>
                      )}

                      {orders.find(o => o.id === selectedOrderId)?.status !== 'failed' && (
                        <button 
                          onClick={() => {
                            updateOrderStatus(selectedOrderId, 'failed');
                            setSelectedOrderId(null);
                          }}
                          className="flex-1 min-w-[140px] py-4 rounded-2xl bg-red-500 text-white font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-red-500/20 flex items-center justify-center gap-2"
                        >
                          <AlertCircle className="w-4 h-4" /> Mark Failed
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;
