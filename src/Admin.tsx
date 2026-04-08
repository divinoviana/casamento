import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from './firebase';
import { Trash2, Edit2, LogOut, Download, CheckCircle2, XCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type RSVP = {
  id: string;
  name: string;
  email?: string;
  whatsapp?: string;
  adults: number;
  children: number;
  status: 'confirmado' | 'recusado';
  createdAt: any;
};

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<RSVP>>({});
  const [loginError, setLoginError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Removido o orderBy('createdAt', 'desc') porque se houver documentos antigos sem esse campo,
    // o Firestore os oculta automaticamente da lista. Vamos ordenar no frontend.
    const q = query(collection(db, 'rsvps'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RSVP[];
      
      // Ordenação no frontend (mais recentes primeiro)
      data.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });

      setRsvps(data);
      setFetchError(null);
    }, (error) => {
      console.error("Error fetching RSVPs:", error);
      if (error.message.includes('permission-denied') || error.code === 'permission-denied') {
        setFetchError("Você não tem permissão para ver os dados. Verifique se fez login com o e-mail correto dos noivos.");
      } else {
        setFetchError("Erro ao carregar os dados: " + error.message);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setLoginError("E-mail ou senha incorretos.");
      } else {
        setLoginError("Erro ao fazer login: " + error.message);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      try {
        await deleteDoc(doc(db, 'rsvps', id));
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Erro ao excluir. Verifique suas permissões.");
      }
    }
  };

  const startEdit = (rsvp: RSVP) => {
    setEditingId(rsvp.id);
    setEditData(rsvp);
  };

  const saveEdit = async (id: string) => {
    try {
      const docRef = doc(db, 'rsvps', id);
      const updatePayload: any = {
        name: editData.name,
        status: editData.status,
        adults: Number(editData.adults) || 0,
        children: Number(editData.children) || 0,
      };
      if (editData.email !== undefined) updatePayload.email = editData.email;
      if (editData.whatsapp !== undefined) updatePayload.whatsapp = editData.whatsapp;

      await updateDoc(docRef, updatePayload);
      setEditingId(null);
    } catch (error) {
      console.error("Error updating document:", error);
      alert("Erro ao atualizar. Verifique suas permissões.");
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Lista de Convidados - Confirmações', 14, 22);
    
    const confirmed = rsvps.filter(r => r.status === 'confirmado');
    const totalAdults = confirmed.reduce((acc, curr) => acc + (curr.adults || 0), 0);
    const totalChildren = confirmed.reduce((acc, curr) => acc + (curr.children || 0), 0);
    
    doc.setFontSize(12);
    doc.text(`Total de Confirmados: ${confirmed.length} famílias`, 14, 32);
    doc.text(`Total de Adultos: ${totalAdults}`, 14, 38);
    doc.text(`Total de Crianças: ${totalChildren}`, 14, 44);

    const tableData = rsvps.map(rsvp => [
      rsvp.name,
      rsvp.status === 'confirmado' ? 'Sim' : 'Não',
      rsvp.adults || 0,
      rsvp.children || 0,
      rsvp.whatsapp || '-',
      rsvp.email || '-'
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Nome', 'Confirmado?', 'Adultos', 'Crianças', 'WhatsApp', 'E-mail']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [184, 151, 104] } // wedding-gold color
    });

    doc.save('lista-convidados-casamento.pdf');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-wedding-bg flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h1 className="font-serif text-3xl text-wedding-dark mb-6">Acesso dos Noivos</h1>
          <p className="text-gray-600 mb-8">Faça login para gerenciar a lista de convidados.</p>
          
          {loginError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm text-left">
              <p className="font-medium mb-1">{loginError}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="email" 
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-wedding-gold focus:ring-2 focus:ring-wedding-gold/20 outline-none transition-all text-left"
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-wedding-gold focus:ring-2 focus:ring-wedding-gold/20 outline-none transition-all text-left"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-wedding-gold hover:bg-wedding-gold/90 text-white font-medium py-3 px-4 rounded-lg transition-colors mt-2"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="font-serif text-3xl text-wedding-dark">Painel de Controle</h1>
            <p className="text-gray-600">Gerencie as confirmações de presença do seu casamento.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={exportPDF}
              className="flex items-center gap-2 bg-wedding-gold hover:bg-wedding-gold/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download size={18} />
              Exportar PDF
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>

        {fetchError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center">
            <p className="font-medium">{fetchError}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-medium text-gray-600">Nome</th>
                  <th className="p-4 font-medium text-gray-600">Status</th>
                  <th className="p-4 font-medium text-gray-600">Adultos</th>
                  <th className="p-4 font-medium text-gray-600">Crianças</th>
                  <th className="p-4 font-medium text-gray-600">Contato</th>
                  <th className="p-4 font-medium text-gray-600 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rsvps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      Nenhuma confirmação recebida ainda.
                    </td>
                  </tr>
                ) : (
                  rsvps.map((rsvp) => (
                    <tr key={rsvp.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        {editingId === rsvp.id ? (
                          <input 
                            type="text" 
                            value={editData.name || ''} 
                            onChange={e => setEditData({...editData, name: e.target.value})}
                            className="border rounded px-2 py-1 w-full"
                          />
                        ) : (
                          <span className="font-medium text-gray-800">{rsvp.name}</span>
                        )}
                      </td>
                      <td className="p-4">
                        {editingId === rsvp.id ? (
                          <select 
                            value={editData.status} 
                            onChange={e => setEditData({...editData, status: e.target.value as any})}
                            className="border rounded px-2 py-1"
                          >
                            <option value="confirmado">Confirmado</option>
                            <option value="recusado">Recusado</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm ${
                            rsvp.status === 'confirmado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {rsvp.status === 'confirmado' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                            {rsvp.status === 'confirmado' ? 'Confirmado' : 'Não vai'}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {editingId === rsvp.id ? (
                          <input 
                            type="number" 
                            min="0"
                            value={editData.adults || 0} 
                            onChange={e => setEditData({...editData, adults: parseInt(e.target.value)})}
                            className="border rounded px-2 py-1 w-16"
                          />
                        ) : (
                          rsvp.adults || 0
                        )}
                      </td>
                      <td className="p-4">
                        {editingId === rsvp.id ? (
                          <input 
                            type="number" 
                            min="0"
                            value={editData.children || 0} 
                            onChange={e => setEditData({...editData, children: parseInt(e.target.value)})}
                            className="border rounded px-2 py-1 w-16"
                          />
                        ) : (
                          rsvp.children || 0
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {editingId === rsvp.id ? (
                          <div className="flex flex-col gap-1">
                            <input 
                              type="text" 
                              placeholder="WhatsApp"
                              value={editData.whatsapp || ''} 
                              onChange={e => setEditData({...editData, whatsapp: e.target.value})}
                              className="border rounded px-2 py-1 text-sm"
                            />
                            <input 
                              type="email" 
                              placeholder="E-mail"
                              value={editData.email || ''} 
                              onChange={e => setEditData({...editData, email: e.target.value})}
                              className="border rounded px-2 py-1 text-sm"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            {rsvp.whatsapp && <span>WA: {rsvp.whatsapp}</span>}
                            {rsvp.email && <span>{rsvp.email}</span>}
                            {!rsvp.whatsapp && !rsvp.email && <span className="text-gray-400">-</span>}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {editingId === rsvp.id ? (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => saveEdit(rsvp.id)}
                              className="text-green-600 hover:text-green-800 font-medium text-sm"
                            >
                              Salvar
                            </button>
                            <button 
                              onClick={() => setEditingId(null)}
                              className="text-gray-500 hover:text-gray-700 font-medium text-sm"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-3">
                            <button 
                              onClick={() => startEdit(rsvp)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(rsvp.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
